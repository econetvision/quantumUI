"""
Bridge between the executor service and the QpiAI Quantum SDK.

Everything that touches `qpiai_quantum` lives here so the FastAPI layer stays
thin and the SDK's quirks are handled in exactly one place. The important ones:

* `Circuit.run()` defaults to `device_name="QpiAI-QSV-Simulator"`, which is a
  *cloud* backend. Without an API key that call fails or hangs on the network,
  so every run is normalised through `resolve_device()`.
* The algorithm classes default to `QpiAI-QSV-Local` and to
  `need_statevector=True`, so they work offline out of the box.
* Results come back as `QasmSimulatorResult`, whose accessors vary by backend;
  `extract_result()` probes defensively rather than assuming a shape.
"""

from __future__ import annotations

import json
import math
import os
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Backend catalogue
# ---------------------------------------------------------------------------

#: device_name -> descriptor. Mirrors `qpiai_quantum.Backend` but adds the
#: metadata the UI needs (auth requirement, qubit ceiling, human copy).
BACKENDS: dict[str, dict[str, Any]] = {
    "QpiAI-QSV-Local": {
        "id": "QpiAI-QSV-Local",
        "label": "Local Statevector",
        "kind": "simulator",
        "requires_auth": False,
        "max_qubits": 20,
        "supports_statevector": True,
        "supports_density_matrix": False,
        "description": "Runs in-process. No API key, no network — the default for learning.",
    },
    "QpiAI-QSV-Simulator": {
        "id": "QpiAI-QSV-Simulator",
        "label": "QCloud Statevector",
        "kind": "simulator",
        "requires_auth": True,
        "max_qubits": 32,
        "supports_statevector": True,
        "supports_density_matrix": False,
        "description": "Hosted statevector simulator on QpiAI QCloud.",
    },
    "QpiAI-QDM-Simulator": {
        "id": "QpiAI-QDM-Simulator",
        "label": "QCloud Density Matrix",
        "kind": "simulator",
        "requires_auth": True,
        "max_qubits": 14,
        "supports_statevector": False,
        "supports_density_matrix": True,
        "description": "Density-matrix simulator — models mixed states and noise.",
    },
    "QpiAI-QTN-Simulator": {
        "id": "QpiAI-QTN-Simulator",
        "label": "QCloud Tensor Network",
        "kind": "simulator",
        "requires_auth": True,
        "max_qubits": 100,
        "supports_statevector": False,
        "supports_density_matrix": False,
        "description": "Tensor-network simulator for wide, shallow circuits.",
    },
    "QpiAI-Indus-1": {
        "id": "QpiAI-Indus-1",
        "label": "Indus-1 QPU",
        "kind": "qpu",
        "requires_auth": True,
        "max_qubits": 25,
        "supports_statevector": False,
        "supports_density_matrix": False,
        "description": "Physical superconducting QPU. Jobs queue before running.",
    },
}

LOCAL_DEVICE = "QpiAI-QSV-Local"


# ---------------------------------------------------------------------------
# SDK availability and auth
# ---------------------------------------------------------------------------


def sdk_module():
    """Return the imported SDK module, or None when it isn't installed."""
    try:
        import qpiai_quantum

        return qpiai_quantum
    except ImportError:
        return None


def sdk_version() -> Optional[str]:
    mod = sdk_module()
    if mod is None:
        return None
    return getattr(mod, "__version__", "unknown")


def cloud_auth_available() -> bool:
    """
    Cloud execution needs an API key. Without one `circuit.run()` against a
    cloud device either raises or blocks on a network call, so we check upfront
    and fall back to the local simulator.
    """
    if os.environ.get("QPIAI_API_KEY") or os.environ.get("API_KEY"):
        return True
    candidates = (
        "qcloud.env",
        os.path.join(os.path.dirname(__file__), "qcloud.env"),
    )
    return any(os.path.exists(path) for path in candidates)


def execution_mode() -> str:
    """One of `live` (cloud reachable), `local-sdk`, or `mock` (no SDK)."""
    if sdk_module() is None:
        return "mock"
    return "live" if cloud_auth_available() else "local-sdk"


def resolve_device(requested: Optional[str]) -> tuple[str, Optional[str]]:
    """
    Map a requested backend onto one we can actually run.

    Returns `(device_name, notice)` where `notice` is user-facing copy set
    whenever the request was downgraded, so the UI can explain the substitution
    instead of silently lying about where the circuit ran.
    """
    if not requested or requested not in BACKENDS:
        return LOCAL_DEVICE, None

    backend = BACKENDS[requested]
    if backend["requires_auth"] and not cloud_auth_available():
        return (
            LOCAL_DEVICE,
            f"{backend['label']} needs a QpiAI API key — ran on the local "
            f"statevector simulator instead.",
        )
    return requested, None


def available_backends() -> list[dict[str, Any]]:
    """Backend descriptors annotated with whether they're usable right now."""
    authed = cloud_auth_available()
    out = []
    for backend in BACKENDS.values():
        entry = dict(backend)
        entry["available"] = (not backend["requires_auth"]) or authed
        out.append(entry)
    return out


def verify_api_key(api_key: str) -> dict[str, Any]:
    """Validate a key against QpiAI QCloud without persisting it."""
    mod = sdk_module()
    if mod is None:
        return {"valid": False, "error": "QpiAI SDK is not installed."}
    try:
        mod.QpiAIQuantumAuth.login(api_key)
        identity = None
        try:
            identity = mod.QpiAIQuantumAuth.me()
        except Exception:
            pass
        return {"valid": True, "identity": _jsonable(identity)}
    except Exception as exc:
        return {"valid": False, "error": f"{type(exc).__name__}: {exc}"}


# ---------------------------------------------------------------------------
# Circuit class selection
# ---------------------------------------------------------------------------


def get_circuit_class(device: str = LOCAL_DEVICE):
    """
    Return a Circuit class whose `run()` is pinned to `device`.

    User code calls `circuit.run(...)` without a device argument most of the
    time; pinning here means the backend picked in the UI is honoured, and that
    a cloud device is never reached by accident.
    """
    mod = sdk_module()
    if mod is None:
        from mock_circuit import MockCircuit

        return MockCircuit

    base = mod.Circuit

    class PinnedCircuit(base):  # type: ignore[misc, valid-type]
        """Circuit with `device_name` forced to the resolved backend."""

        def run(self, *args, **kwargs):
            kwargs["device_name"] = device
            kwargs.setdefault("need_statevector", True)
            # Canonical bit ordering: qubit 0 is the LEFTMOST character of a
            # label, which is what the syllabus tables say (|10> -> |11>) and
            # what quantum-sim.ts implements in the browser.
            #
            # The SDK's native order is the reverse, so an X on qubit 0 of |00>
            # came back labelled "01". The Bell state hides this completely --
            # 00 and 11 read the same either way -- which is why it survived
            # unnoticed while every asymmetric circuit taught the wrong order.
            #
            # Set here rather than by rewriting strings afterwards, so the
            # learner's own `print(counts)` is canonical too and not just the
            # structured payload. A caller that genuinely wants raw SDK order
            # can still pass reverse_bits=False explicitly.
            kwargs.setdefault("reverse_bits", True)
            return super().run(*args, **kwargs)

    return PinnedCircuit


# ---------------------------------------------------------------------------
# Result extraction
# ---------------------------------------------------------------------------


def _jsonable(value: Any) -> Any:
    """Coerce SDK/numpy values into something `json` can serialise."""
    if value is None or isinstance(value, (bool, int, str)):
        return value
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, complex):
        return {"re": value.real, "im": value.imag}
    if isinstance(value, dict):
        return {str(k): _jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(v) for v in value]
    if hasattr(value, "tolist"):
        return _jsonable(value.tolist())
    if hasattr(value, "item"):
        try:
            return _jsonable(value.item())
        except Exception:
            pass
    return str(value)


def _call(obj: Any, name: str) -> Any:
    """Call `obj.name()` defensively — accessors differ across backends."""
    method = getattr(obj, name, None)
    if method is None:
        return None
    try:
        return method() if callable(method) else method
    except Exception:
        return None


def extract_statevector(result: Any) -> Optional[list[dict[str, float]]]:
    """Statevector amplitudes as `[{re, im}, ...]`, or None if unavailable."""
    raw = _call(result, "get_statevector")
    if raw is None:
        raw = getattr(result, "statevector", None)
    if raw is None:
        return None
    if hasattr(raw, "tolist"):
        raw = raw.tolist()
    if not isinstance(raw, (list, tuple)):
        return None

    amplitudes = []
    for amp in raw:
        if isinstance(amp, complex):
            amplitudes.append({"re": amp.real, "im": amp.imag})
        elif isinstance(amp, (int, float)):
            amplitudes.append({"re": float(amp), "im": 0.0})
        else:
            return None
    return amplitudes


def bloch_vectors(amplitudes: list[dict[str, float]]) -> list[dict[str, float]]:
    """
    Per-qubit Bloch coordinates from a full statevector.

    Each qubit's reduced density matrix is obtained by tracing out the others;
    the Bloch vector is then (2·Re ρ01, −2·Im ρ01, ρ00 − ρ11). Pure single-qubit
    states land on the sphere surface, entangled ones fall inside it — which is
    exactly the intuition the visualiser should convey.
    """
    dim = len(amplitudes)
    if dim < 2 or dim & (dim - 1) != 0:
        return []
    n_qubits = dim.bit_length() - 1
    if n_qubits > 12:  # keep the trace cheap; the UI never plots this many
        return []

    vectors = []
    for qubit in range(n_qubits):
        # Reduced density matrix entries for this qubit.
        rho00 = rho11 = 0.0
        rho01_re = rho01_im = 0.0
        bit = 1 << qubit

        for index in range(dim):
            amp = amplitudes[index]
            if index & bit:
                rho11 += amp["re"] ** 2 + amp["im"] ** 2
            else:
                rho00 += amp["re"] ** 2 + amp["im"] ** 2
                # Pair |...0...> with the matching |...1...> basis state.
                partner = amplitudes[index | bit]
                # rho01 = sum a_{...0...} * conj(a_{...1...})
                rho01_re += amp["re"] * partner["re"] + amp["im"] * partner["im"]
                rho01_im += amp["im"] * partner["re"] - amp["re"] * partner["im"]

        vectors.append(
            {
                "qubit": qubit,
                "x": 2.0 * rho01_re,
                "y": -2.0 * rho01_im,
                "z": rho00 - rho11,
                # Bloch vector length: 1 = pure state on the sphere surface,
                # 0 = maximally mixed at the centre (i.e. maximally entangled
                # with the rest of the register).
                "length": min(
                    1.0,
                    math.sqrt(
                        max(
                            0.0,
                            (2.0 * rho01_re) ** 2
                            + (2.0 * rho01_im) ** 2
                            + (rho00 - rho11) ** 2,
                        )
                    ),
                ),
            }
        )
    return vectors


def extract_result(result: Any) -> dict[str, Any]:
    """Normalise an SDK result object into the executor's wire format."""
    payload: dict[str, Any] = {}

    counts = _call(result, "get_counts")
    if counts:
        payload["counts"] = {str(k): int(v) for k, v in dict(counts).items()}

    probabilities = _call(result, "get_probabilities")
    if probabilities:
        payload["probabilities"] = {
            str(k): float(v) for k, v in dict(probabilities).items()
        }

    amplitudes = extract_statevector(result)
    if amplitudes:
        payload["statevector"] = amplitudes
        payload["bloch_vectors"] = bloch_vectors(amplitudes)

    for attr, key in (
        ("execution_time", "execution_time_ms"),
        ("shots", "shots"),
        ("n_qubits", "num_qubits"),
        ("n_cbits", "num_clbits"),
        ("job_id", "job_id"),
        ("job_status", "job_status"),
        ("method", "method"),
        ("credits_used", "credits_used"),
    ):
        value = getattr(result, attr, None)
        if value is not None:
            payload[key] = _jsonable(value)

    return payload


def circuit_metadata(circuit: Any) -> dict[str, Any]:
    """Depth, width and QASM for a built circuit — all best-effort."""
    meta: dict[str, Any] = {}
    for name, key in (("depth", "depth"), ("size", "size")):
        value = _call(circuit, name)
        if value is not None:
            meta[key] = _jsonable(value)
    for attr in ("num_qubits", "num_clbits"):
        value = getattr(circuit, attr, None)
        if value is not None:
            meta[attr] = _jsonable(value() if callable(value) else value)
    qasm = _call(circuit, "to_qasm")
    if isinstance(qasm, str):
        meta["qasm"] = qasm
    return meta


def circuit_text_diagram(circuit: Any) -> Optional[str]:
    """
    ASCII circuit diagram reconstructed from the SDK's ICR JSON.

    The SDK only ships matplotlib/latex/plotly visualisers, none of which work
    in a headless API response, so we render text ourselves.
    """
    render = getattr(circuit, "_ascii_diagram", None)
    if callable(render):  # MockCircuit renders itself
        return render()

    try:
        raw = circuit.icr.to_json()
        data = json.loads(raw) if isinstance(raw, str) else raw
        n_qubits = data["num_qubits"]
        n_clbits = data.get("num_clbits", 0)
        lines = [f"q_{q}: ─" for q in range(n_qubits)]

        for op in data.get("evolve", []):
            gate = op.get("gate_name", "?")
            qubits = op.get("qubits", [])
            for q in range(n_qubits):
                if q not in qubits:
                    cell = "─────"
                elif gate == "Measure":
                    cell = "─[M]─"
                elif len(qubits) > 1 and q == qubits[0]:
                    cell = "──●──"  # control qubit
                else:
                    label = gate[:2]
                    cell = f"─[{label}]─" if len(label) == 1 else f"─[{label}]"
                lines[q] += cell

        lines = [line + "─" for line in lines]
        if n_clbits:
            lines.append(f"c: {n_clbits}/" + "═" * 10)
        return "\n".join(lines)
    except Exception:
        return None
