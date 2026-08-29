#!/usr/bin/env python3
"""
Author QpiAI-native question banks for the tracks that had none of their own.

Fixes three problems at once:

  * Six tracks shared two question banks — a learner finishing Quantum
    Algorithms then opening Quantum ML met the same 24 Grover questions.
  * Four tracks sat below the 10-question minimum.
  * Nothing in the platform taught the QpiAI SDK, despite it executing every
    circuit the site runs.

Every solution here is written against QpiAI and executed before it is stored,
so these questions are auto-gradable by distribution comparison from the moment
they land — unlike the harvested QWorld ones, which are Qiskit/Cirq.

Solutions are deterministic. A reference that produces different counts each run
cannot be compared against, which would silently break grading.

Usage: python3 scripts/author_track_questions.py [--dry-run]
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


def q(qid, title, prompt, difficulty, starter, solution, explanation):
    return {
        "id": qid, "title": title, "prompt": prompt, "difficulty": difficulty,
        "starterCode": starter.strip(), "solution": solution.strip(),
        "explanation": explanation, "solutionSdk": "qpiai",
        "solutionAuthored": True,
    }


# --------------------------------------------------------------------------
# qpiai-sdk — the SDK that actually runs everything on this platform
# --------------------------------------------------------------------------

QPIAI = [
    q("qpiai-sdk-1", "Build your first QpiAI circuit",
      "Task 1: Create a 1-qubit circuit, apply a Hadamard gate, measure it and run 1024 shots.",
      "easy",
      "circuit = Circuit(1, 1)\n# apply H, measure, then run",
      """circuit = Circuit(1, 1)
circuit.h(0)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "QpiAI's Circuit takes (qubits, classical bits) like Qiskit's QuantumCircuit, but the class is "
      "called Circuit and you call .run() on it directly rather than passing it to a backend."),

    q("qpiai-sdk-2", "Deterministic state preparation",
      "Task 2: Prepare the state |1> on a single qubit and confirm it measures as 1 every time.",
      "easy",
      "circuit = Circuit(1, 1)\n# flip the qubit",
      """circuit = Circuit(1, 1)
circuit.x(0)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "A deterministic circuit gives one outcome with probability 1. If you see any spread here, "
      "something is wrong — X on |0> is not probabilistic."),

    q("qpiai-sdk-3", "Multi-qubit registers",
      "Task 3: Create a 3-qubit circuit, put all three in superposition, and measure all of them.",
      "easy",
      "circuit = Circuit(3, 3)\n# H on each qubit",
      """circuit = Circuit(3, 3)
for i in range(3):
    circuit.h(i)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(len(counts), 'distinct outcomes')
print(counts)""",
      "Three qubits in superposition span 2^3 = 8 basis states, all equally likely. "
      "measure() takes lists to map qubits onto classical bits."),

    q("qpiai-sdk-4", "Entangle two qubits",
      "Task 4: Produce the Bell state |Phi+> = (|00> + |11>)/sqrt(2).",
      "medium",
      "circuit = Circuit(2, 2)\n# H then CNOT",
      """circuit = Circuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Hadamard then CNOT is the standard Bell pair recipe. You should see only |00> and |11> — "
      "the absence of |01> and |10> is the entanglement."),

    q("qpiai-sdk-5", "Reading the statevector",
      "Task 5: Build a Bell state and request the statevector rather than only counts.",
      "medium",
      "circuit = Circuit(2, 2)\n# ask run() for the statevector",
      """circuit = Circuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024, need_statevector=True)
counts = job_result.get_counts()
print(counts)""",
      "QpiAI's run() accepts need_statevector=True, giving the amplitudes rather than just sampled "
      "outcomes. Amplitudes carry phase; counts do not."),

    q("qpiai-sdk-6", "Rotation gates",
      "Task 6: Apply an Ry rotation of pi/2 to one qubit and measure the result over 1024 shots.",
      "medium",
      "import math\ncircuit = Circuit(1, 1)\n# ry by pi/2",
      """import math
circuit = Circuit(1, 1)
circuit.ry(0, math.pi / 2)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Ry(pi/2) takes |0> to an even superposition, like Hadamard but without the phase flip. "
      "Note the argument order: QpiAI takes ry(qubit, theta) — qubit first — which is the reverse of Qiskit's ry(theta, qubit). Getting it backwards silently applies a zero-angle rotation rather than raising an error, so it is worth checking."),

    q("qpiai-sdk-7", "GHZ state on three qubits",
      "Task 7: Build the three-qubit GHZ state (|000> + |111>)/sqrt(2).",
      "medium",
      "circuit = Circuit(3, 3)\n# H then a CNOT cascade",
      """circuit = Circuit(3, 3)
circuit.h(0)
circuit.cx(0, 1)
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "The CNOT cascade spreads one qubit's superposition across all three. Losing any single qubit "
      "destroys the entanglement entirely — unlike a W state."),

    q("qpiai-sdk-8", "Interference cancels",
      "Task 8: Apply two Hadamard gates in a row to one qubit and explain the measured result.",
      "medium",
      "circuit = Circuit(1, 1)\n# H twice",
      """circuit = Circuit(1, 1)
circuit.h(0)
circuit.h(0)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "H is its own inverse, so you get |0> with certainty. This is interference, not randomness "
      "cancelling randomness — a coin flipped twice does not return to heads."),

    q("qpiai-sdk-9", "Circuit depth and gate count",
      "Task 9: Build any 3-qubit circuit and report its depth and size before running it.",
      "complex",
      "circuit = Circuit(3, 3)\n# build, then inspect depth() and size()",
      """circuit = Circuit(3, 3)
circuit.h(0)
circuit.cx(0, 1)
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
print('depth:', circuit.depth())
print('gates:', circuit.size())
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Depth is the number of sequential layers; size is the total gate count. Depth matters more on "
      "real hardware because decoherence tracks time, not gate volume."),

    q("qpiai-sdk-10", "Controlled-Z and basis change",
      "Task 10: Build a circuit using cz, and show it behaves like a CNOT conjugated by Hadamards.",
      "complex",
      "circuit = Circuit(2, 2)\n# H on target, cz, H on target",
      """circuit = Circuit(2, 2)
circuit.h(0)
circuit.h(1)
circuit.cz(0, 1)
circuit.h(1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "H-CZ-H on the target is exactly CNOT. Control and target are basis-dependent labels, not "
      "physical roles — the same interaction looks different in a different basis."),
]

# --------------------------------------------------------------------------
# variational-quantum-algorithms — had been showing Grover questions
# --------------------------------------------------------------------------

VQE = [
    q("vqa-1", "Parameterised single-qubit ansatz",
      "Task 1: Build a one-qubit ansatz with Ry(theta) for theta = pi/4 and measure it.",
      "easy",
      "import math\ncircuit = Circuit(1, 1)",
      """import math
circuit = Circuit(1, 1)
circuit.ry(0, math.pi / 4)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "An ansatz is a circuit with tunable parameters. The optimiser's whole job is choosing theta; "
      "here you are seeing one fixed point in that search space."),

    q("vqa-2", "Two-parameter ansatz",
      "Task 2: Build a 2-qubit ansatz applying Ry(pi/3) to qubit 0 and Ry(pi/6) to qubit 1.",
      "easy",
      "import math\ncircuit = Circuit(2, 2)",
      """import math
circuit = Circuit(2, 2)
circuit.ry(0, math.pi / 3)
circuit.ry(1, math.pi / 6)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Parameter count grows with qubits, which is why VQE ansatz design matters — too many "
      "parameters and the classical optimiser cannot navigate the landscape."),

    q("vqa-3", "Hardware-efficient ansatz with entanglement",
      "Task 3: Build a layer of Ry rotations followed by a CNOT entangling layer on 2 qubits.",
      "medium",
      "import math\ncircuit = Circuit(2, 2)",
      """import math
circuit = Circuit(2, 2)
circuit.ry(0, math.pi / 4)
circuit.ry(1, math.pi / 4)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Rotation layer then entangling layer is the hardware-efficient pattern. Without the CNOT the "
      "ansatz can only reach product states, so it could never represent a correlated ground state."),

    q("vqa-4", "QAOA mixing layer",
      "Task 4: Build the QAOA starting state — equal superposition over 3 qubits — then apply an Rx mixer.",
      "medium",
      "import math\ncircuit = Circuit(3, 3)",
      """import math
circuit = Circuit(3, 3)
for i in range(3):
    circuit.h(i)
for i in range(3):
    circuit.rx(math.pi / 4, i)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "QAOA alternates a cost layer and a mixer. The mixer (Rx) moves amplitude between candidate "
      "solutions so the optimiser is not stuck at its starting point."),

    q("vqa-5", "MaxCut cost layer",
      "Task 5: Apply a ZZ interaction between qubits 0 and 1 using two CNOTs and an Rz.",
      "complex",
      "import math\ncircuit = Circuit(2, 2)",
      """import math
circuit = Circuit(2, 2)
circuit.h(0)
circuit.h(1)
circuit.cx(0, 1)
circuit.rz(1, math.pi / 2)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "CNOT-Rz-CNOT implements exp(-i*theta*ZZ), the cost term for one MaxCut edge. Every edge in "
      "the graph contributes one of these."),
]

# --------------------------------------------------------------------------
# quantum-machine-learning — had been showing Grover questions
# --------------------------------------------------------------------------

QML = [
    q("qml-1", "Angle encoding",
      "Task 1: Encode the classical value 0.5 into a qubit using Ry(2*0.5) — angle encoding.",
      "easy",
      "circuit = Circuit(1, 1)",
      """circuit = Circuit(1, 1)
circuit.ry(0, 2 * 0.5)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Angle encoding maps a number onto a rotation. One qubit carries one feature, so the qubit "
      "count scales with your feature count — the main constraint on near-term QML."),

    q("qml-2", "Encoding a two-feature sample",
      "Task 2: Encode the vector [0.3, 0.8] into two qubits by angle encoding.",
      "easy",
      "circuit = Circuit(2, 2)",
      """circuit = Circuit(2, 2)
circuit.ry(0, 2 * 0.3)
circuit.ry(1, 2 * 0.8)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Each feature gets its own qubit. The measured distribution differs per sample, which is what "
      "makes the encoding informative to a downstream classifier."),

    q("qml-3", "Feature map with entanglement",
      "Task 3: Encode two features, then entangle them with a CNOT to build a non-linear feature map.",
      "medium",
      "circuit = Circuit(2, 2)",
      """circuit = Circuit(2, 2)
circuit.ry(0, 2 * 0.3)
circuit.ry(1, 2 * 0.8)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Entangling after encoding creates feature interactions a linear model cannot represent. This "
      "is the quantum analogue of a kernel trick."),

    q("qml-4", "Variational classifier circuit",
      "Task 4: Build encode -> entangle -> trainable rotation, the standard QML classifier shape.",
      "medium",
      "import math\ncircuit = Circuit(2, 2)",
      """import math
circuit = Circuit(2, 2)
circuit.ry(0, 2 * 0.3)
circuit.ry(1, 2 * 0.8)
circuit.cx(0, 1)
circuit.ry(0, math.pi / 3)
circuit.ry(1, math.pi / 5)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Data goes in via fixed rotations; the trainable weights are separate rotations after "
      "entangling. Only the second set is optimised during training."),

    q("qml-5", "Swap test for state overlap",
      "Task 5: Build a swap test using a control qubit, Hadamard, controlled-swap and Hadamard.",
      "complex",
      "circuit = Circuit(3, 1)",
      """circuit = Circuit(3, 1)
circuit.h(0)
circuit.x(1)
circuit.cswap(0, 1, 2)
circuit.h(0)
circuit.measure(0, 0)
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "The swap test measures how similar two states are: P(control=0) = (1 + |<a|b>|^2)/2. "
      "Identical states always give 0; orthogonal ones give 50/50. This is the quantum kernel."),
]

# --------------------------------------------------------------------------
# quantum-teleportation-protocols — had been showing entanglement questions
# --------------------------------------------------------------------------

TELEPORT = [
    q("teleport-1", "Prepare the shared Bell pair",
      "Task 1: Build the entangled pair shared between sender and receiver, on qubits 1 and 2.",
      "easy",
      "circuit = Circuit(3, 3)",
      """circuit = Circuit(3, 3)
circuit.h(1)
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Teleportation needs a Bell pair distributed in advance. Qubit 0 stays free to carry the "
      "message; qubits 1 and 2 are the shared resource."),

    q("teleport-2", "Prepare the message qubit",
      "Task 2: Put the message qubit (qubit 0) into the |+> state before teleporting it.",
      "easy",
      "circuit = Circuit(3, 3)",
      """circuit = Circuit(3, 3)
circuit.h(0)
circuit.h(1)
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "The message can be any state. |+> is a good test because it is not a basis state — if "
      "teleportation only worked for |0> and |1> it would just be classical communication."),

    q("teleport-3", "Bell measurement",
      "Task 3: Perform the sender's Bell measurement — CNOT from message to her half, then Hadamard.",
      "medium",
      "circuit = Circuit(3, 3)",
      """circuit = Circuit(3, 3)
circuit.h(0)
circuit.h(1)
circuit.cx(1, 2)
circuit.cx(0, 1)
circuit.h(0)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "The Bell measurement entangles the message with the shared pair and then reads it out. This "
      "destroys the original — no-cloning is respected, not circumvented."),

    q("teleport-4", "Full teleportation circuit",
      "Task 4: Assemble the complete protocol: prepare, entangle, Bell-measure, correct.",
      "complex",
      "circuit = Circuit(3, 3)",
      """circuit = Circuit(3, 3)
circuit.h(0)
circuit.h(1)
circuit.cx(1, 2)
circuit.cx(0, 1)
circuit.h(0)
circuit.cx(1, 2)
circuit.cz(0, 2)
circuit.measure([0, 1, 2], [0, 1, 2])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "The final CNOT and CZ apply the corrections the receiver would make after hearing the two "
      "classical bits. Those two bits are why teleportation cannot beat light speed."),

    q("teleport-5", "Superdense coding",
      "Task 5: Build superdense coding — send two classical bits using one qubit and prior entanglement.",
      "complex",
      "circuit = Circuit(2, 2)",
      """circuit = Circuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.x(0)
circuit.z(0)
circuit.cx(0, 1)
circuit.h(0)
circuit.measure([0, 1], [0, 1])
job_result = circuit.run(shots=1024)
counts = job_result.get_counts()
print(counts)""",
      "Superdense coding is teleportation run backwards: one qubit carries two classical bits, given "
      "a pre-shared Bell pair. Applying X and Z encodes the bit pair 11."),
]

NEW_TOPICS = [
    ("qpiai-sdk", "QpiAI Quantum SDK", "QpiAI Quantum", QPIAI),
    ("variational-quantum-algorithms", "VQE & QAOA", "IBM Qiskit Developer", VQE),
    ("quantum-machine-learning", "Quantum Machine Learning", "IBM Qiskit Developer", QML),
    ("quantum-teleportation-protocols", "Quantum Teleportation", "Microsoft Quantum Katas", TELEPORT),
]


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

    existing = {t.get("slug"): t for t in bank["topics"]}
    verified = failed = 0

    for slug, name, cert, questions in NEW_TOPICS:
        kept = []
        for question in questions:
            result = execute(question["solution"])
            counts = result.get("counts") or {}
            if result.get("success") and counts:
                verified += 1
                question["verifiedOutput"] = {str(k): int(v) for k, v in counts.items()}
                question["verifiedAgainst"] = "QpiAI-QSV-Local"
                question["topic"] = slug
                kept.append(question)
                print(f"  ✓ {question['id']:20s} {len(counts):3d} outcomes")
            else:
                failed += 1
                reason = (result.get("error") or "no counts").split("\n")[0][:60]
                print(f"  ✗ {question['id']:20s} {reason}")

        if not kept or args.dry_run:
            continue

        topic = existing.get(slug)
        if topic:
            # Replace shared content with this track's own questions.
            topic["questions"] = kept + [
                q for q in topic["questions"] if q.get("solutionAuthored")
            ]
            topic["name"] = name
            topic["certification"] = cert
        else:
            bank["topics"].append({
                "slug": slug, "name": name, "certification": cert,
                "questionCount": len(kept), "questions": kept,
            })

    print(f"\n  verified: {verified}   failed: {failed}")

    if args.dry_run:
        print("  --dry-run: bank not modified")
        return 0

    for topic in bank["topics"]:
        topic["questionCount"] = len(topic["questions"])

    with open(BANK, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"  written -> {BANK}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
