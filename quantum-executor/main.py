"""
QpiAI Quantum Executor Service

FastAPI backend that runs quantum circuits for the QuantumUI LMS. SDK-specific
behaviour lives in `qpiai_bridge`; the algorithm catalogue lives in `catalog`.
This module is routing, validation and sandboxing only.
"""

from __future__ import annotations

import ast
import io
import logging
import os
import re
import sys
import time
import traceback
from typing import Any, Dict, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import catalog
import guards
import qpiai_bridge
import sandbox
from mock_circuit import MockCircuit

# Headless matplotlib: circuit.show() must never open a blocking GUI window
os.environ.setdefault("MPLBACKEND", "Agg")

app = FastAPI(
    title="QpiAI Quantum Executor",
    description="Executes quantum circuits and SDK algorithms for QuantumUI",
    version="2.0.0",
)

# Origins are configurable so the service can sit behind a deployed frontend.
_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_CODE_LENGTH = sandbox.MAX_CODE_LENGTH

# Wall-clock budget for a single run. Kept under the frontend's 60s fetch
# timeout so a stuck run surfaces as a clean error, not a dead socket.
EXECUTION_TIMEOUT = float(os.environ.get("EXECUTION_TIMEOUT_SECONDS", "15"))

# Tracebacks expose absolute paths and module layout. On by default only
# outside production, where the log is the right place for them.
INCLUDE_TRACEBACKS = os.environ.get("INCLUDE_TRACEBACKS", "").lower() == "true"

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("executor")

# In-memory REPL sessions: session_id -> exec namespace
REPL_SESSIONS: Dict[str, Dict[str, Any]] = {}
MAX_REPL_SESSIONS = 50


# ---------------------------------------------------------------------------
# Sandboxing
# ---------------------------------------------------------------------------

# The real checks live in sandbox.py: an AST allowlist, a restricted builtins
# mapping and a wall-clock deadline. The regex denylist that used to sit here
# was bypassable with `from os import system` — it only ever matched the
# `import os` form.


def sanitize_code(code: str) -> ast.Module:
    """Validate learner code, returning the parsed tree. Raises ValueError."""
    try:
        return sandbox.validate_code(code)
    except sandbox.SandboxError as exc:
        raise ValueError(str(exc)) from exc


def strip_sdk_imports(code: str) -> str:
    """
    Remove qpiai_quantum / qiskit import lines.

    The execution namespace already binds `Circuit` (pinned to the chosen
    backend) and a `QuantumCircuit` alias for qiskit-style lab code, so user
    imports must not rebind them or fail on a package that isn't installed.
    """
    code = re.sub(
        r"^\s*from\s+qpiai_quantum[.\w]*\s+import.*$", "", code, flags=re.MULTILINE
    )
    code = re.sub(r"^\s*import\s+qpiai_quantum.*$", "", code, flags=re.MULTILINE)
    code = re.sub(
        r"^\s*(from\s+qiskit[.\w]*\s+import.*|import\s+qiskit.*)$",
        "",
        code,
        flags=re.MULTILINE,
    )
    return code


def build_namespace(device: str, force_mock: bool = False) -> Dict[str, Any]:
    """Execution namespace with Circuit pinned to the resolved backend."""
    circuit_cls = MockCircuit if force_mock else qpiai_bridge.get_circuit_class(device)
    namespace: Dict[str, Any] = {
        "__builtins__": sandbox.safe_builtins(),
        "Circuit": circuit_cls,
        "QuantumCircuit": circuit_cls,  # qiskit-style alias for QWorld lab code
    }

    if not force_mock and qpiai_bridge.sdk_module() is not None:
        mod = qpiai_bridge.sdk_module()
        # Expose the read-only analysis helpers; they need no auth.
        for name in ("Statevector", "DensityMatrix", "QuantumRegister", "ClassicalRegister"):
            if hasattr(mod, name):
                namespace[name] = getattr(mod, name)

    return namespace


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class CodeExecutionRequest(BaseModel):
    code: str
    shots: int = Field(default=1024, ge=1, le=100_000)
    backend: Optional[str] = None


class ExecutionResult(BaseModel):
    success: bool
    output: str
    counts: Optional[Dict[str, int]] = None
    probabilities: Optional[Dict[str, float]] = None
    circuit_diagram: Optional[str] = None
    statevector: Optional[list] = None
    bloch_vectors: Optional[list] = None
    circuit: Optional[Dict[str, Any]] = None
    backend: Optional[str] = None
    mode: Optional[str] = None
    notice: Optional[str] = None
    error: Optional[str] = None
    execution_time_ms: Optional[float] = None


class AlgorithmRunRequest(BaseModel):
    params: Dict[str, Any] = Field(default_factory=dict)
    shots: int = Field(default=1024, ge=1, le=100_000)
    backend: Optional[str] = None


class ReplRequest(BaseModel):
    session_id: str
    code: str
    reset: bool = False
    backend: Optional[str] = None


class ReplResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    execution_time_ms: Optional[float] = None


class AuthVerifyRequest(BaseModel):
    api_key: str


# ---------------------------------------------------------------------------
# Code execution
# ---------------------------------------------------------------------------


def execute_user_code(
    code: str, shots: int, device: str, force_mock: bool = False
) -> ExecutionResult:
    """Run user code and harvest whatever quantum results it produced."""
    started = time.time()
    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()

    try:
        # Validate the *stripped* source: strip_sdk_imports removes the
        # qpiai/qiskit import lines the namespace already provides, and those
        # modules are deliberately absent from the sandbox allowlist.
        stripped = strip_sdk_imports(code)
        tree = sanitize_code(stripped)
        namespace = build_namespace(device, force_mock=force_mock)
        compiled = compile(tree, "<lab>", "exec")
        with guards.execution_slot():
            sandbox.run_with_timeout(
                lambda: exec(compiled, namespace), EXECUTION_TIMEOUT
            )

        payload: Dict[str, Any] = {}

        # Harvest results from whichever variable the learner used. Lesson code
        # conventionally names these `job_result`, `result` or `counts`.
        for var in ("job_result", "result", "job"):
            candidate = namespace.get(var)
            if candidate is not None and hasattr(candidate, "get_counts"):
                payload = qpiai_bridge.extract_result(candidate)
                break

        if not payload.get("counts") and isinstance(namespace.get("counts"), dict):
            payload["counts"] = {
                str(k): int(v) for k, v in namespace["counts"].items()
            }

        circuit = namespace.get("circuit") or namespace.get("qc")
        diagram = None
        circuit_meta = None
        if circuit is not None:
            diagram = qpiai_bridge.circuit_text_diagram(circuit)
            circuit_meta = qpiai_bridge.circuit_metadata(circuit)

        output = captured.getvalue() or "Execution completed successfully."

        return ExecutionResult(
            success=True,
            output=output,
            counts=payload.get("counts"),
            probabilities=payload.get("probabilities"),
            statevector=payload.get("statevector"),
            bloch_vectors=payload.get("bloch_vectors"),
            circuit_diagram=diagram,
            circuit=circuit_meta,
            backend=device,
            execution_time_ms=round((time.time() - started) * 1000, 2),
        )

    except Exception as exc:
        # Learners need the message; nobody outside needs our file paths and
        # frame layout. The full traceback goes to the container log instead.
        #
        # But not every failure here is ours. A rejected import, a NameError, a
        # SyntaxError — those are someone learning, and the request still
        # returns 200. Logging them at ERROR with a full traceback buried the
        # real faults: a single verification sweep filled the Railway log with
        # tracebacks for code that was simply wrong, which is the normal case
        # for a teaching tool. Those are now one INFO line. ERROR is kept for
        # faults the operator can actually act on.
        if isinstance(exc, (ValueError, SyntaxError, NameError, TypeError,
                            AttributeError, IndexError, KeyError,
                            ZeroDivisionError)):
            log.info("lab code failed: %s: %s", type(exc).__name__, exc)
        else:
            log.exception("execution failed")
        detail = f"{type(exc).__name__}: {exc}"
        if INCLUDE_TRACEBACKS:
            detail = f"{detail}\n{traceback.format_exc()}"
        return ExecutionResult(
            success=False,
            output=captured.getvalue(),
            error=detail,
            backend=device,
        )
    finally:
        sys.stdout = old_stdout


# ---------------------------------------------------------------------------
# Routes — service
# ---------------------------------------------------------------------------


@app.get("/")
async def root():
    return {
        "service": "QpiAI Quantum Executor",
        "version": "2.0.0",
        "mode": qpiai_bridge.execution_mode(),
        "endpoints": {
            "GET /health": "Service and SDK status",
            "GET /backends": "Available execution backends",
            "GET /algorithms": "SDK algorithm catalogue",
            "POST /algorithms/{id}/run": "Run a catalogue algorithm",
            "POST /execute": "Execute quantum code",
            "POST /repl": "Stateful REPL execution",
            "POST /auth/verify": "Validate a QpiAI API key",
            "GET /examples": "Example circuits",
        },
    }


@app.get("/health")
async def health_check():
    mode = qpiai_bridge.execution_mode()
    return {
        **guards.public_config(),
        "status": "healthy",
        "sdk_available": qpiai_bridge.sdk_module() is not None,
        "sdk_version": qpiai_bridge.sdk_version(),
        # live = cloud/QPU with API key, local-sdk = local statevector sim, mock = demo
        "mode": mode,
        "cloud_authenticated": qpiai_bridge.cloud_auth_available(),
        "algorithm_count": len(catalog.CATALOG),
    }


@app.get("/backends")
async def list_backends():
    return {
        "backends": qpiai_bridge.available_backends(),
        "default": qpiai_bridge.LOCAL_DEVICE,
        "cloud_authenticated": qpiai_bridge.cloud_auth_available(),
    }


@app.post("/auth/verify")
async def verify_auth(request: AuthVerifyRequest):
    """Validate an API key. The key is checked, never persisted here."""
    return qpiai_bridge.verify_api_key(request.api_key)


# ---------------------------------------------------------------------------
# Routes — algorithm catalogue
# ---------------------------------------------------------------------------


@app.get("/algorithms")
async def list_algorithms():
    algorithms = catalog.list_algorithms()
    categories: list[str] = []
    for algorithm in algorithms:
        if algorithm["category"] not in categories:
            categories.append(algorithm["category"])
    return {
        "algorithms": algorithms,
        "categories": categories,
        "sdk_available": qpiai_bridge.sdk_module() is not None,
    }


@app.post("/algorithms/{algorithm_id}/run")
async def run_algorithm(
    algorithm_id: str, request: AlgorithmRunRequest,
    caller: str = Depends(guards.require_execution_auth),
):
    if algorithm_id not in catalog.CATALOG:
        raise HTTPException(status_code=404, detail=f"Unknown algorithm: {algorithm_id}")

    try:
        return catalog.run_algorithm(
            algorithm_id,
            request.params,
            shots=request.shots,
            backend=request.backend,
        )
    except ValueError as exc:  # invalid parameters
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:  # SDK unavailable
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"{type(exc).__name__}: {exc}"
        )


# ---------------------------------------------------------------------------
# Routes — execution
# ---------------------------------------------------------------------------


@app.post("/execute", response_model=ExecutionResult)
async def execute_code(
    request: CodeExecutionRequest,
    caller: str = Depends(guards.require_execution_auth),
):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="No code provided")
    if len(request.code) > MAX_CODE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Code too long (max {MAX_CODE_LENGTH} characters)",
        )

    mode = qpiai_bridge.execution_mode()
    device, notice = qpiai_bridge.resolve_device(request.backend)

    result = execute_user_code(
        request.code, request.shots, device, force_mock=(mode == "mock")
    )

    # Safety net: if a run still trips an auth error, retry on the demo simulator
    # rather than surfacing a credentials stacktrace to a learner.
    if not result.success and result.error and "API_KEY" in result.error:
        mode = "mock"
        result = execute_user_code(
            request.code, request.shots, qpiai_bridge.LOCAL_DEVICE, force_mock=True
        )

    result.mode = mode
    result.notice = notice

    if result.success and mode != "live":
        note = (
            f"[Executed on {device} — add a QpiAI API key to reach cloud simulators and the Indus-1 QPU]"
            if mode == "local-sdk"
            else "[Demo simulation — QpiAI SDK not installed, results are illustrative only]"
        )
        result.output = f"{result.output}\n{note}"

    return result


@app.post("/repl", response_model=ReplResult)
async def repl_execute(
    request: ReplRequest,
    caller: str = Depends(guards.require_execution_auth),
):
    """
    Stateful REPL for the in-browser Lab Shell.

    Variables persist across calls within a `session_id`, and a trailing
    expression is echoed the way a Python shell would.
    """
    if request.reset:
        REPL_SESSIONS.pop(request.session_id, None)
        return ReplResult(success=True, output="Session reset.")

    if not request.code.strip():
        return ReplResult(success=True, output="")
    if len(request.code) > MAX_CODE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Code too long (max {MAX_CODE_LENGTH} characters)",
        )

    if request.session_id not in REPL_SESSIONS:
        if len(REPL_SESSIONS) >= MAX_REPL_SESSIONS:
            REPL_SESSIONS.pop(next(iter(REPL_SESSIONS)))  # evict oldest
        device, _ = qpiai_bridge.resolve_device(request.backend)
        REPL_SESSIONS[request.session_id] = build_namespace(
            device, force_mock=(qpiai_bridge.execution_mode() == "mock")
        )

    namespace = REPL_SESSIONS[request.session_id]

    started = time.time()
    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()

    try:
        tree = sanitize_code(strip_sdk_imports(request.code))

        # Echo the value of a trailing expression, like a Python shell.
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body[-1].value)
            tree.body = tree.body[:-1]
            body = compile(tree, "<repl>", "exec")
            tail = compile(last, "<repl>", "eval")

            def _run():
                exec(body, namespace)
                return eval(tail, namespace)

            value = sandbox.run_with_timeout(_run, EXECUTION_TIMEOUT)
            if value is not None:
                print(repr(value))
        else:
            body = compile(tree, "<repl>", "exec")
            sandbox.run_with_timeout(lambda: exec(body, namespace), EXECUTION_TIMEOUT)

        return ReplResult(
            success=True,
            output=captured.getvalue(),
            execution_time_ms=round((time.time() - started) * 1000, 2),
        )
    except Exception as exc:
        return ReplResult(
            success=False,
            output=captured.getvalue(),
            error=f"{type(exc).__name__}: {exc}",
        )
    finally:
        sys.stdout = old_stdout


# ---------------------------------------------------------------------------
# Routes — examples
# ---------------------------------------------------------------------------

_EXAMPLE_HEADER = "from qpiai_quantum import Circuit\n\n"

EXAMPLES = [
    {
        "name": "Bell State",
        "description": "Entangle two qubits into |Φ+⟩ = (|00⟩ + |11⟩)/√2",
        "code": _EXAMPLE_HEADER
        + """# Two qubits, two classical bits
circuit = Circuit(2, 2)

circuit.h(0)          # superposition on the first qubit
circuit.cx(0, 1)      # entangle it with the second
circuit.measure([0, 1], [0, 1])
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Bell State")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
print("Expect ~50% |00> and ~50% |11> — and never |01> or |10>.")
""",
    },
    {
        "name": "Superposition",
        "description": "A single Hadamard puts one qubit in an even superposition",
        "code": _EXAMPLE_HEADER
        + """circuit = Circuit(1, 1)

circuit.h(0)          # |0> -> (|0> + |1>)/sqrt(2)
circuit.measure(0, 0)
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Superposition")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
print("Expect roughly 50/50 between |0> and |1>.")
""",
    },
    {
        "name": "GHZ State",
        "description": "Three-qubit maximal entanglement",
        "code": _EXAMPLE_HEADER
        + """circuit = Circuit(3, 3)

circuit.h(0)
circuit.cx(0, 1)      # cascade the entanglement
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="GHZ State")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
print("Expect ~50% |000> and ~50% |111>.")
""",
    },
    {
        "name": "Quantum Interference",
        "description": "Two Hadamards cancel — interference, not randomness",
        "code": _EXAMPLE_HEADER
        + """circuit = Circuit(1, 1)

circuit.h(0)          # into superposition
circuit.h(0)          # and back out again
circuit.measure(0, 0)
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Interference")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
print("Expect 100% |0>. Amplitudes cancelled — this is why superposition")
print("is not the same as 'the qubit is secretly 0 or 1'.")
""",
    },
    {
        "name": "Phase Kickback",
        "description": "A controlled gate imprints phase onto the control qubit",
        "code": _EXAMPLE_HEADER
        + """circuit = Circuit(2, 2)

circuit.h(0)
circuit.x(1)
circuit.h(1)          # target into |->
circuit.cx(0, 1)      # phase kicks back onto the control
circuit.h(0)
circuit.measure([0, 1], [0, 1])
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Phase Kickback")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
print("The control flipped to |1> — the mechanism behind Deutsch-Jozsa.")
""",
    },
]


@app.get("/examples")
async def get_examples():
    return {"examples": EXAMPLES}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
