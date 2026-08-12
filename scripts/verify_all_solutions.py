#!/usr/bin/env python3
"""
Execute every solution and store what it actually produces.

Auto-grading by distribution comparison only works for circuit questions — 58
of the bank are plain Python (probability, matrices, complex numbers) and can
never be graded that way. But they can still be *verified*: run the reference
solution, capture its real output, and store it. A learner then has a concrete,
computed answer to compare against instead of "check it yourself".

Two execution paths:
  * circuits      -> the QpiAI executor, which returns measurement counts
  * plain Python  -> a local subprocess, sandboxed and time-limited

Anything that fails to run is recorded as unverified rather than quietly
skipped, so the gap stays visible.

Usage: python3 scripts/verify_all_solutions.py [--dry-run] [--limit N]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")
EXECUTOR = os.environ.get("QUANTUM_EXECUTOR_URL", "http://127.0.0.1:8080")

# Refuse anything that touches the filesystem, network or process table. These
# are QWorld's own teaching snippets, but they are still third-party code being
# run unattended.
BLOCKED = re.compile(
    r"\b(import\s+(os|sys|subprocess|shutil|socket|requests|urllib)"
    r"|__import__|eval\s*\(|exec\s*\(|open\s*\(|input\s*\()",
    re.I,
)


def is_circuit(code: str) -> bool:
    return bool(re.search(r"\b(Circuit|QuantumCircuit)\s*\(|cirq\.|qiskit", code))


def run_circuit(code: str) -> dict:
    payload = json.dumps({"code": code, "shots": 1024}).encode()
    request = urllib.request.Request(
        f"{EXECUTOR}/execute", data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.load(response)
    except Exception as error:  # noqa: BLE001
        return {"success": False, "error": str(error)}


def run_python(code: str) -> dict:
    """Run a plain-Python solution in a subprocess with a hard timeout."""
    if BLOCKED.search(code):
        return {"success": False, "error": "blocked: touches filesystem/network"}

    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as handle:
        # numpy is the only import these snippets legitimately need beyond the
        # standard library; `random` is used heavily by the probability tasks.
        handle.write("import random\nfrom random import randrange, random as _r\n")
        handle.write("try:\n    import numpy as np\nexcept Exception:\n    pass\n\n")
        handle.write(code)
        path = handle.name

    try:
        result = subprocess.run(
            [sys.executable, path],
            capture_output=True, text=True, timeout=20,
        )
        if result.returncode != 0:
            return {"success": False, "error": (result.stderr or "").strip()[:300]}
        return {"success": True, "output": (result.stdout or "").strip()[:4000]}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "timed out after 20s"}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "error": str(error)}
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    with open(BANK, encoding="utf-8") as fh:
        bank = json.load(fh)

    stats = {"circuit_ok": 0, "python_ok": 0, "failed": 0,
             "no_solution": 0, "already": 0}
    processed = 0

    for topic in bank["topics"]:
        for question in topic["questions"]:
            solution = question.get("solution")
            if not solution:
                stats["no_solution"] += 1
                continue
            if question.get("verifiedOutput") or question.get("expectedOutput"):
                stats["already"] += 1
                continue
            if args.limit and processed >= args.limit:
                break
            processed += 1

            if is_circuit(solution):
                result = run_circuit(solution)
                counts = result.get("counts") or {}
                if result.get("success") and counts:
                    stats["circuit_ok"] += 1
                    if not args.dry_run:
                        question["verifiedOutput"] = {str(k): int(v) for k, v in counts.items()}
                        question["verifiedAgainst"] = "QpiAI-QSV-Local"
                    continue
                stats["failed"] += 1
                if not args.dry_run:
                    question["verificationError"] = (result.get("error") or "no counts").split("\n")[0][:200]
                continue

            result = run_python(solution)
            if result.get("success") and result.get("output"):
                stats["python_ok"] += 1
                if not args.dry_run:
                    question["expectedOutput"] = result["output"]
                    question["verifiedAgainst"] = "python3"
            else:
                stats["failed"] += 1
                if not args.dry_run:
                    question["verificationError"] = (result.get("error") or "no output")[:200]

    total = sum(len(t["questions"]) for t in bank["topics"])
    verified = sum(
        1 for t in bank["topics"] for q in t["questions"]
        if q.get("verifiedOutput") or q.get("expectedOutput")
    )

    print(f"  circuits verified on QpiAI : {stats['circuit_ok']}")
    print(f"  python solutions executed  : {stats['python_ok']}")
    print(f"  failed to run              : {stats['failed']}")
    print(f"  had no solution            : {stats['no_solution']}")
    print(f"  already verified           : {stats['already']}")
    print()
    print(f"  QUESTIONS WITH A VERIFIED ANSWER: {verified}/{total}")

    if args.dry_run:
        print("\n  --dry-run: bank not modified")
        return 0

    with open(BANK, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"\n  written -> {BANK}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
