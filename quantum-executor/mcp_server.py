#!/usr/bin/env python3
"""
Quantum MCP server — exposes the QpiAI SDK to Claude as callable tools.

Speaks the Model Context Protocol over stdio, so Claude (or any MCP client) can
build circuits, run the algorithm catalogue and inspect statevectors directly
instead of being told about results second-hand.

It reuses `qpiai_bridge` and `catalog`, the same modules the web API uses, so
there is exactly one implementation of backend resolution, result extraction and
the Bell/Grover corrections. A tool call here and a click in the UI run the same
code path.

Register with Claude Code:

    claude mcp add quantum -- \\
      /path/to/quantum-executor/venv/bin/python /path/to/quantum-executor/mcp_server.py

Tools:
    run_circuit          execute QpiAI circuit code, returns counts + statevector
    run_algorithm        run a catalogue algorithm (grover, shor, bell, ...)
    list_algorithms      the catalogue with parameter schemas
    list_backends        available devices and whether each is usable
    analyse_state        Bloch vectors and probabilities for a circuit
"""

from __future__ import annotations

import asyncio
import io
import json
import sys
import traceback
from typing import Any

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))

import catalog          # noqa: E402
import qpiai_bridge     # noqa: E402

PROTOCOL_VERSION = "2024-11-05"

TOOLS: list[dict[str, Any]] = [
    {
        "name": "run_circuit",
        "description": (
            "Execute quantum circuit code on the QpiAI SDK and return measurement "
            "counts, the statevector, and per-qubit Bloch vectors. `Circuit` is "
            "pre-bound — do not import it. Example: "
            "circuit = Circuit(2,2); circuit.h(0); circuit.cx(0,1); "
            "circuit.measure([0,1],[0,1]); job_result = circuit.run(shots=1024)"
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python using the pre-bound Circuit class"},
                "shots": {"type": "integer", "default": 1024, "minimum": 1, "maximum": 100000},
                "backend": {"type": "string", "description": "Optional device; defaults to the local simulator"},
            },
            "required": ["code"],
        },
    },
    {
        "name": "run_algorithm",
        "description": (
            "Run an algorithm from the catalogue (grover, shor, qft, qpe, "
            "deutsch-jozsa, bernstein-vazirani, simon, bell, ghz, w, cluster, qrng). "
            "Returns counts, statevector, Bloch vectors and an algorithm-specific "
            "insight such as the factors found or the string recovered."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "algorithm": {"type": "string", "description": "Catalogue id, e.g. 'grover'"},
                "params": {"type": "object", "description": "Parameters per the algorithm's schema"},
                "shots": {"type": "integer", "default": 1024},
            },
            "required": ["algorithm"],
        },
    },
    {
        "name": "list_algorithms",
        "description": "List catalogue algorithms with their parameter schemas and descriptions.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "list_backends",
        "description": "List execution backends and whether each is currently usable (cloud devices need an API key).",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "analyse_state",
        "description": (
            "Build a circuit and report its statevector, outcome probabilities and "
            "per-qubit Bloch vectors WITHOUT measuring. Use this to inspect "
            "entanglement: a Bloch vector length of 0 means that qubit is maximally "
            "entangled with the rest of the register."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Circuit-building code; measurement is not required"},
            },
            "required": ["code"],
        },
    },
]


def _execute(code: str, shots: int, backend: str | None) -> dict[str, Any]:
    """Run user code in the same sandbox the HTTP API uses."""
    from main import execute_user_code, sanitize_code  # local import: heavy module

    sanitize_code(code)
    device, notice = qpiai_bridge.resolve_device(backend)
    result = execute_user_code(code, shots, device)

    payload = result.model_dump() if hasattr(result, "model_dump") else dict(result)
    if notice:
        payload["notice"] = notice
    return payload


def call_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    if name == "list_algorithms":
        return {"algorithms": catalog.list_algorithms()}

    if name == "list_backends":
        return {
            "backends": qpiai_bridge.available_backends(),
            "default": qpiai_bridge.LOCAL_DEVICE,
            "mode": qpiai_bridge.execution_mode(),
        }

    if name == "run_circuit":
        return _execute(
            arguments["code"],
            int(arguments.get("shots", 1024)),
            arguments.get("backend"),
        )

    if name == "run_algorithm":
        return catalog.run_algorithm(
            arguments["algorithm"],
            arguments.get("params", {}),
            shots=int(arguments.get("shots", 1024)),
        )

    if name == "analyse_state":
        # Append a statevector-producing run when the snippet has none, so the
        # caller does not have to remember the incantation.
        code = arguments["code"]
        if ".run(" not in code:
            code += "\njob_result = circuit.run(shots=1, need_statevector=True)"
        return _execute(code, 1, None)

    raise ValueError(f"Unknown tool: {name}")


def handle(request: dict[str, Any]) -> dict[str, Any] | None:
    method = request.get("method")
    request_id = request.get("id")

    # Notifications carry no id and must not be answered.
    if request_id is None and method and method.startswith("notifications/"):
        return None

    def ok(result: Any) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id, "result": result}

    def err(code: int, message: str) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id,
                "error": {"code": code, "message": message}}

    if method == "initialize":
        return ok({
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "quantum", "version": "1.0.0"},
        })

    if method == "tools/list":
        return ok({"tools": TOOLS})

    if method == "tools/call":
        params = request.get("params", {})
        name = params.get("name", "")
        arguments = params.get("arguments", {}) or {}
        try:
            result = call_tool(name, arguments)
            return ok({
                "content": [{"type": "text",
                             "text": json.dumps(result, indent=2, default=str)}],
            })
        except Exception as exc:  # noqa: BLE001
            # Report failures as tool errors, not protocol errors, so the model
            # can read the message and correct its next call.
            return ok({
                "content": [{"type": "text",
                             "text": f"{type(exc).__name__}: {exc}\n\n{traceback.format_exc()[:1200]}"}],
                "isError": True,
            })

    if method == "ping":
        return ok({})

    return err(-32601, f"Method not found: {method}")


async def main() -> None:
    reader = asyncio.StreamReader()
    await asyncio.get_running_loop().connect_read_pipe(
        lambda: asyncio.StreamReaderProtocol(reader), sys.stdin,
    )

    while True:
        line = await reader.readline()
        if not line:
            break
        text = line.decode().strip()
        if not text:
            continue

        try:
            request = json.loads(text)
        except json.JSONDecodeError:
            continue

        response = handle(request)
        if response is not None:
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, BrokenPipeError):
        pass
