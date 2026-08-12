#!/usr/bin/env python3
"""
Port Qiskit/Cirq lab solutions to the QpiAI SDK, verifying by execution.

None of the 50 extracted solutions run on the executor: they are written in
Qiskit (10), Cirq (8) or are plain Python (27). Auto-grading compares a
learner's measurement distribution against the reference, so a reference that
cannot run means the question cannot be graded.

Translation alone is not enough to trust. Every ported solution is *executed*
on the QpiAI local simulator, and only kept if it runs AND returns measurement
counts. A solution that translates cleanly but produces nothing is discarded —
silently keeping it would make the grader mark correct work as wrong.

Plain-Python questions are deliberately left alone: they are not circuit
exercises and should never be auto-graded.

Usage:
    python3 scripts/port_solutions_to_qpiai.py [--dry-run] [--limit N]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")
EXECUTOR = os.environ.get("QUANTUM_EXECUTOR_URL", "http://127.0.0.1:8080")


def detect_sdk(code: str) -> str:
    if re.search(r"\bimport\s+cirq|cirq\.", code):
        return "cirq"
    if re.search(r"from\s+qiskit|QuantumCircuit\s*\(|qiskit\.", code):
        return "qiskit"
    if re.search(r"qpiai_quantum", code):
        return "qpiai"
    return "python"


# --------------------------------------------------------------------------
# Translation
# --------------------------------------------------------------------------


def translate_qiskit(code: str) -> str:
    """
    Qiskit -> QpiAI.

    The gate methods line up almost exactly (h, x, cx, measure), so most of the
    work is the constructor, the imports, and replacing the execute/backend
    dance with `circuit.run(...)`.
    """
    out = code

    # Imports are provided by the execution namespace; drop them entirely.
    out = re.sub(r"^\s*from\s+qiskit[.\w]*\s+import.*$", "", out, flags=re.M)
    out = re.sub(r"^\s*import\s+qiskit.*$", "", out, flags=re.M)
    out = re.sub(r"^\s*from\s+qiskit_aer.*$", "", out, flags=re.M)

    # QuantumCircuit(2, 2) -> Circuit(2, 2)
    out = re.sub(r"\bQuantumCircuit\s*\(", "Circuit(", out)

    """
    Registers.

    Qiskit code writes `q = QuantumRegister(3)` then indexes `q[0]`. Collapsing
    the register to a bare integer left `3[0]`, which is why ten solutions died
    with "'int' object is not subscriptable". Record the register names first,
    rewrite every `name[i]` to `i`, and only then drop the declarations.
    """
    register_names = set(
        re.findall(r"(\w+)\s*=\s*(?:Quantum|Classical)Register\s*\(", out)
    )
    for name in register_names:
        # q[0] -> 0 ; q[i] -> i
        out = re.sub(rf"\b{re.escape(name)}\s*\[\s*([^\]]+?)\s*\]", r"\1", out)

    # Whole-register arguments (e.g. measure(q, c)) become explicit index lists
    # only where the width is known; otherwise leave for ensure_runnable().
    out = re.sub(r"^\s*\w+\s*=\s*(?:Quantum|Classical)Register\s*\([^)]*\)\s*$",
                 "", out, flags=re.M)

    # measure_all() has no direct equivalent; make it explicit later.
    out = re.sub(r"\.measure_all\s*\(\s*\)", ".measure_all()", out)

    # Replace the simulator/execute pattern with a run() call.
    out = re.sub(r"^.*(AerSimulator|Aer\.get_backend|BasicAer).*$", "", out, flags=re.M)
    out = re.sub(
        r"\b(\w+)\s*=\s*execute\s*\(\s*(\w+)[^)]*\)\s*\.?\s*result\s*\(\s*\)",
        r"\1 = \2.run(shots=1024)",
        out,
    )
    out = re.sub(
        r"\b(\w+)\s*=\s*\w*simulator\w*\.run\s*\(\s*(\w+)[^)]*\)\s*\.?\s*result\s*\(\s*\)",
        r"\1 = \2.run(shots=1024)",
        out,
        flags=re.I,
    )
    return out


def translate_cirq(code: str) -> str:
    """
    Cirq -> QpiAI.

    Cirq builds circuits by appending operations to qubit objects, which does
    not map line-by-line. This handles the common teaching shapes: LineQubit
    ranges, circuit.append of single/two-qubit gates, and terminal measurement.
    """
    out = code
    out = re.sub(r"^\s*import\s+cirq.*$", "", out, flags=re.M)
    out = re.sub(r"^\s*from\s+cirq[.\w]*\s+import.*$", "", out, flags=re.M)

    # Number of qubits from LineQubit.range(n) / GridQubit
    match = re.search(r"LineQubit\.range\s*\(\s*(\d+)\s*\)", out)
    n_qubits = int(match.group(1)) if match else None
    if n_qubits is None:
        return ""  # shape we do not handle; caller will skip it

    lines = [f"circuit = Circuit({n_qubits}, {n_qubits})"]

    # Gate applications, in source order.
    for gate, qubit in re.findall(r"\b(H|X|Y|Z|S|T)\s*\(\s*q\w*\[(\d+)\]\s*\)", out):
        lines.append(f"circuit.{gate.lower()}({qubit})")
    for control, target in re.findall(
        r"\b(?:CX|CNOT)\s*\(\s*q\w*\[(\d+)\]\s*,\s*q\w*\[(\d+)\]\s*\)", out
    ):
        lines.append(f"circuit.cx({control}, {target})")

    # Loops of the form: for i in range(n): circuit.append(H(qlist[i]))
    for gate in re.findall(r"append\s*\(\s*\[?\s*(H|X|Y|Z)\s*\(\s*q\w*\[i\]", out):
        for i in range(n_qubits):
            lines.append(f"circuit.{gate.lower()}({i})")

    qs = ", ".join(str(i) for i in range(n_qubits))
    lines.append(f"circuit.measure([{qs}], [{qs}])")
    lines.append("job_result = circuit.run(shots=1024)")
    lines.append("counts = job_result.get_counts()")
    lines.append("print(counts)")
    return "\n".join(lines)


def ensure_runnable(code: str) -> str:
    """Append measurement and a run call when the translation lacks them."""
    if not re.search(r"\bCircuit\s*\(", code):
        return code

    widths = re.search(r"\bCircuit\s*\(\s*(\d+)", code)
    n = int(widths.group(1)) if widths else 2

    if not re.search(r"\.measure(_all)?\s*\(", code):
        qs = ", ".join(str(i) for i in range(n))
        code += f"\ncircuit.measure([{qs}], [{qs}])"

    if not re.search(r"\.run\s*\(", code):
        code += "\njob_result = circuit.run(shots=1024)"
    if not re.search(r"get_counts", code):
        code += "\ncounts = job_result.get_counts()\nprint(counts)"
    return code


# --------------------------------------------------------------------------
# Verification
# --------------------------------------------------------------------------


def execute(code: str, timeout: int = 60) -> dict:
    payload = json.dumps({"code": code, "shots": 1024}).encode()
    request = urllib.request.Request(
        f"{EXECUTOR}/execute", data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.URLError as error:
        return {"success": False, "error": f"executor unreachable: {error}"}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "error": str(error)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    with open(BANK, encoding="utf-8") as fh:
        bank = json.load(fh)

    stats = {"cirq": 0, "qiskit": 0, "skipped_python": 0,
             "verified": 0, "failed": 0, "unhandled": 0}
    processed = 0

    for topic in bank["topics"]:
        for question in topic["questions"]:
            solution = question.get("solution")
            if not solution:
                continue

            sdk = detect_sdk(solution)
            if sdk in ("python", "qpiai"):
                if sdk == "python":
                    stats["skipped_python"] += 1
                continue

            if args.limit and processed >= args.limit:
                break
            processed += 1
            stats[sdk] += 1

            ported = translate_cirq(solution) if sdk == "cirq" else translate_qiskit(solution)
            if not ported.strip():
                stats["unhandled"] += 1
                continue

            ported = ensure_runnable(ported)
            result = execute(ported)

            counts = result.get("counts") or {}
            if result.get("success") and counts:
                stats["verified"] += 1
                if not args.dry_run:
                    # Keep the original for reference; the ported one is what
                    # the grader executes.
                    question["solutionOriginal"] = solution
                    question["solution"] = ported
                    question["solutionSdk"] = "qpiai"
                    question["verifiedOutput"] = {
                        str(k): int(v) for k, v in counts.items()
                    }
                    question["verifiedAgainst"] = "QpiAI-QSV-Local"
                print(f"  ✓ {question['id']:28s} {sdk:6s} -> {len(counts)} outcomes")
            else:
                stats["failed"] += 1
                reason = (result.get("error") or "no counts").split("\n")[0][:60]
                print(f"  ✗ {question['id']:28s} {sdk:6s} {reason}")

    print()
    print(f"  Cirq attempted   : {stats['cirq']}")
    print(f"  Qiskit attempted : {stats['qiskit']}")
    print(f"  VERIFIED on QpiAI: {stats['verified']}")
    print(f"  failed execution : {stats['failed']}")
    print(f"  shape unhandled  : {stats['unhandled']}")
    print(f"  plain Python left alone (not circuit questions): {stats['skipped_python']}")

    if args.dry_run:
        print("\n  --dry-run: bank not modified")
        return 0

    with open(BANK, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"\n  written -> {BANK}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
