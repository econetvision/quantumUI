#!/usr/bin/env python3
"""
Hand-authored QpiAI solutions for the BB84 / quantum-cryptography questions
that mechanical translation could not safely port.

Why these were written by hand rather than pattern-translated: the originals
are multi-part protocol programs (random key generation, XOR encryption loops,
`.data` introspection), not circuit snippets. A regex translation of those
produces code that runs but computes something subtly different — and a grader
comparing against a subtly-wrong reference marks correct student work as wrong.

Two rules followed throughout:

  * Deterministic. Every key and basis choice is fixed, never random. A random
    reference would give different counts on each run, so distribution
    comparison — the whole basis of auto-grading — would be meaningless.
  * Within device limits. The local simulator is capped at 20 qubits, so the
    24-bit tasks encode a representative register and report the protocol
    statistics in the printed output rather than allocating 24 qubits.

Each solution is executed before being stored; only those that run and return
counts are written.

Usage: python3 scripts/author_crypto_solutions.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")
EXECUTOR = os.environ.get("QUANTUM_EXECUTOR_URL", "http://127.0.0.1:8080")


# --------------------------------------------------------------------------
# Authored solutions, keyed by question id
# --------------------------------------------------------------------------

SOLUTIONS: dict[str, str] = {

    # Task 1 — decryption in the standard basis.
    "quantum-cryptography-8": '''
# Decryption in the standard basis {|0>, |1>}.
# Fixed message and key so the result is reproducible.
message = "10110010"
key     = "01101001"

# Asja encrypts by XOR, then encodes each cipher bit as |0> or |1>.
cipher = "".join(str(int(m) ^ int(k)) for m, k in zip(message, key))
print("message :", message)
print("key     :", key)
print("cipher  :", cipher)

circuit = Circuit(8, 8)
for i, bit in enumerate(cipher):
    if bit == "1":
        circuit.x(i)          # |1> encodes cipher bit 1

circuit.measure(list(range(8)), list(range(8)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print("\\nmeasured cipher:", counts)

# Balvis decrypts with the same key: XOR is its own inverse.
measured = max(counts, key=counts.get)
recovered = "".join(str(int(c) ^ int(k)) for c, k in zip(measured, key))
print("recovered:", recovered)
''',

    # Task 2 — 16-bit message, standard basis.
    "quantum-cryptography-9": '''
# 16-bit one-time-pad in the standard basis.
message = "1001000110001100"
key      = "1100101001011010"

cipher = "".join(str(int(m) ^ int(k)) for m, k in zip(message, key))
print("message:", message)
print("key    :", key)
print("cipher :", cipher)

# The local simulator is capped at 20 qubits, so encode the full 16 here.
circuit = Circuit(16, 16)
for i, bit in enumerate(cipher):
    if bit == "1":
        circuit.x(i)

circuit.measure(list(range(16)), list(range(16)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print("\\nmeasured:", counts)
print("XOR twice with the same key returns the message — that is why a one-time pad works.")
''',

    # Hadamard basis variant.
    "quantum-cryptography-10": '''
# Same message, but encoded in the Hadamard basis {|+>, |->}.
message = "10110010"
key     = "01101001"
cipher = "".join(str(int(m) ^ int(k)) for m, k in zip(message, key))
print("cipher:", cipher)

circuit = Circuit(8, 8)
for i, bit in enumerate(cipher):
    if bit == "1":
        circuit.x(i)      # |1>
    circuit.h(i)          # rotate into the Hadamard basis: |0>->|+>, |1>->|->

# Balvis measures in the same basis, so he applies H again before measuring.
for i in range(8):
    circuit.h(i)

circuit.measure(list(range(8)), list(range(8)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print("measured:", counts)
print("Matching bases recover the cipher exactly; mismatched bases would randomise it.")
''',

    # Task 1 — build a reproducible bit string.
    "quantum-cryptography-11": '''
# A quantum random string, made reproducible by measuring a fixed circuit.
# Each Hadamard puts one qubit into an even superposition.
n = 8
circuit = Circuit(n, n)
for i in range(n):
    circuit.h(i)

circuit.measure(list(range(n)), list(range(n)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()

print("distinct outcomes:", len(counts))
print("Each of the 2^n strings is equally likely — this is true randomness,")
print("not a seeded pseudo-random sequence.")
print(counts)
''',

    # Task 3 — repeat for 4 qubits.
    "quantum-cryptography-13": '''
# The same encoding repeated for 4 qubits.
bits = "1011"
circuit = Circuit(4, 4)
for i, bit in enumerate(bits):
    if bit == "1":
        circuit.x(i)

circuit.measure(list(range(4)), list(range(4)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print("encoded bits:", bits)
print("measured    :", counts)
''',

    # Task 1 — measuring in the wrong basis.
    "quantum-cryptography-14": '''
# Measuring in the WRONG basis destroys the information.
# Asja encodes 8 bits in the X basis; Balvis measures in the Z basis.
bits = "10110010"

circuit = Circuit(8, 8)
for i, bit in enumerate(bits):
    if bit == "1":
        circuit.x(i)
    circuit.h(i)          # X-basis encoding

# Balvis measures directly in Z — no H first, i.e. the wrong basis.
circuit.measure(list(range(8)), list(range(8)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()

print("bits sent in X basis :", bits)
print("distinct outcomes    :", len(counts))
print("Measuring in the wrong basis gives a random result for every qubit,")
print("which is exactly what makes eavesdropping detectable.")
''',

    # Task 2 — run the protocol for 16 bits.
    "quantum-cryptography-15": '''
# BB84 over 16 bits with fixed choices, so the run is reproducible.
bits  = "1001000110001100"
bases = "ZZXXZXZXXZZXXZZX"   # Asja's encoding bases
meas  = "ZXXZZXZZXZXXZZXZ"   # Balvis's measurement bases

circuit = Circuit(16, 16)
for i, (bit, basis) in enumerate(zip(bits, bases)):
    if bit == "1":
        circuit.x(i)
    if basis == "X":
        circuit.h(i)

for i, basis in enumerate(meas):
    if basis == "X":
        circuit.h(i)          # rotate back before measuring

circuit.measure(list(range(16)), list(range(16)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()

matching = [i for i in range(16) if bases[i] == meas[i]]
print("bases matched on", len(matching), "of 16 positions")
print("only those positions survive sifting; on average half do")
print("measured:", counts)
''',

    # Task 1 — sifting and QBER.
    "quantum-cryptography-16": '''
# Sifting and QBER. The register is capped at 16 qubits (device limit is 20),
# and the 24-bit statistics are reported from the fixed basis choices.
bits  = "100100011000110010110010"     # 24 bits
bases = "ZZXXZXZXXZZXXZZXZXZXZXZX"
meas  = "ZXXZZXZZXZXXZZXZZXXZZXZX"

# Encode the first 16 on hardware; the rest is protocol bookkeeping.
circuit = Circuit(16, 16)
for i in range(16):
    if bits[i] == "1":
        circuit.x(i)
    if bases[i] == "X":
        circuit.h(i)
for i in range(16):
    if meas[i] == "X":
        circuit.h(i)

circuit.measure(list(range(16)), list(range(16)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()

sifted = [i for i in range(24) if bases[i] == meas[i]]
print("total bits   :", len(bits))
print("sifted bits  :", len(sifted), "(bases agreed)")
print("discard rate : {:.0f}%".format(100 * (1 - len(sifted) / len(bits))))
print("QBER on a noiseless channel with no eavesdropper is 0%.")
print("A QBER above ~11% means the key must be thrown away.")
print("measured:", counts)
''',

    # Task 1 — full protocol including privacy amplification.
    "quantum-cryptography-17": '''
# Full BB84: encoding, sifting, QBER, then privacy amplification.
bits  = "100100011000110010110010"
bases = "ZZXXZXZXXZZXXZZXZXZXZXZX"
meas  = "ZXXZZXZZXZXXZZXZZXXZZXZX"

circuit = Circuit(16, 16)
for i in range(16):
    if bits[i] == "1":
        circuit.x(i)
    if bases[i] == "X":
        circuit.h(i)
for i in range(16):
    if meas[i] == "X":
        circuit.h(i)

circuit.measure(list(range(16)), list(range(16)))
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()

sifted = [i for i in range(24) if bases[i] == meas[i]]
key = "".join(bits[i] for i in sifted)
print("raw bits      :", len(bits))
print("after sifting :", len(key))

# Privacy amplification: compress the key so any partial knowledge an
# eavesdropper holds is diluted below usefulness.
amplified = "".join(
    str(int(key[i]) ^ int(key[i + 1])) for i in range(0, len(key) - 1, 2)
)
print("after privacy amplification:", len(amplified), "bits")
print("shortening the key is the price of guaranteeing secrecy.")
print("measured:", counts)
''',

    # Bell-state task with an empty prompt in the source notebook.
    "quantum-entanglement-3": '''
# Prepare and measure the Bell state |Phi+> = (|00> + |11>)/sqrt(2).
circuit = Circuit(2, 2)
circuit.h(0)          # superposition on the first qubit
circuit.cx(0, 1)      # entangle it with the second

circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print("counts:", counts)
print("Only |00> and |11> appear — never |01> or |10>.")
print("The qubits are perfectly correlated, though each alone is random.")
''',
}


def execute(code: str) -> dict:
    payload = json.dumps({"code": code, "shots": 1024}).encode()
    request = urllib.request.Request(
        f"{EXECUTOR}/execute", data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return json.load(response)
    except Exception as error:  # noqa: BLE001
        return {"success": False, "error": str(error)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with open(BANK, encoding="utf-8") as fh:
        bank = json.load(fh)

    index = {q["id"]: q for topic in bank["topics"] for q in topic["questions"]}
    verified = failed = 0

    for qid, solution in SOLUTIONS.items():
        question = index.get(qid)
        if question is None:
            print(f"  ? {qid:30s} not found in bank")
            continue

        code = solution.strip()
        result = execute(code)
        counts = result.get("counts") or {}

        if result.get("success") and counts:
            verified += 1
            print(f"  ✓ {qid:30s} {len(counts):4d} outcomes")
            if not args.dry_run:
                question.setdefault("solutionOriginal", question.get("solution"))
                question["solution"] = code
                question["solutionSdk"] = "qpiai"
                question["solutionAuthored"] = True
                question["verifiedOutput"] = {str(k): int(v) for k, v in counts.items()}
                question["verifiedAgainst"] = "QpiAI-QSV-Local"
        else:
            failed += 1
            reason = (result.get("error") or "no counts").split("\n")[0][:70]
            print(f"  ✗ {qid:30s} {reason}")

    print(f"\n  verified: {verified}   failed: {failed}")

    if args.dry_run:
        print("  --dry-run: bank not modified")
        return 0

    with open(BANK, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"  written -> {BANK}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
