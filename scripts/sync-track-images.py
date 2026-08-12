#!/usr/bin/env python3
"""
Copy concept diagrams from the vendored QWorld content into public/images.

Every entry below was checked by opening the image and confirming it depicts
what the destination track teaches — filenames alone are not trusted.

Licensing (see content/qworld/SOURCES.md):
  * qbook101, qkd, silver-qcourse511, adequate-qbook1 -> CC-BY 4.0.
    Reusable with attribution, which `public/images/ATTRIBUTION.md` provides.
  * qec -> CC-BY-NC-ND 4.0 (NonCommercial + NoDerivatives).
  * qnickel-qcourse511-2 -> no licence statement found.

Only CC-BY sources are copied. That is why `quantum-error-correction` gets no
diagrams here: the only error-correction imagery in the vendored content lives
in the NC-ND repo, and this project advertises paid tiers.

Usage:  python3 scripts/sync-track-images.py [--check]
        --check  report what would change without writing (for CI)
"""

import argparse
import os
import shutil
import sys

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.environ.get(
    "QWORLD_CONTENT_ROOT", os.path.join(APP_ROOT, "content", "qworld")
)
DEST_ROOT = os.path.join(APP_ROOT, "public", "images", "lesson-images")

QBOOK = "qbook101/qbook101/images"
QKD = "qkd/images"

# track slug -> list of (source path relative to content root, destination name)
# Destination names follow the kebab-case convention already used by the
# hand-made images for the first three tracks.
MAPPING: dict[str, list[tuple[str, str]]] = {
    "quantum-algorithms": [
        (f"{QBOOK}/ch4/grover.png", "grover-circuit.png"),
        (f"{QBOOK}/ch4/grover_diffusion_operator.png", "grover-diffusion-operator.png"),
        (f"{QBOOK}/ch4/finalgrover1.png", "grover-full-circuit.png"),
        (f"{QBOOK}/ch2/grover_first_reflection.jpg", "grover-first-reflection.jpg"),
        (f"{QBOOK}/ch2/grover_second_reflection.jpg", "grover-second-reflection.jpg"),
        (f"{QBOOK}/ch4/deutsch.png", "deutsch-algorithm.png"),
        (f"{QBOOK}/ch4/deutschjozsa.png", "deutsch-jozsa-circuit.png"),
        (f"{QBOOK}/ch4/simon_circuit.png", "simon-circuit.png"),
        (f"{QBOOK}/ch4/simon_function.png", "simon-function.png"),
        (f"{QBOOK}/ch4/phase_kickback.png", "phase-kickback.png"),
    ],
    "quantum-teleportation-protocols": [
        (f"{QBOOK}/ch2/quantum_teleportation_qubits.png", "teleportation-qubit-roles.png"),
        (f"{QBOOK}/ch2/superdense-coding.jpg", "superdense-coding.jpg"),
    ],
    "quantum-cryptography-qkd": [
        (f"{QKD}/BB84.jpg", "bb84-protocol.jpg"),
        (f"{QKD}/BB84_sifting.png", "bb84-sifting.png"),
        (f"{QKD}/BB84_noise.jpg", "bb84-with-noise.jpg"),
        (f"{QKD}/E91.jpg", "e91-protocol.jpg"),
        (f"{QKD}/bases.jpg", "measurement-bases.jpg"),
        (f"{QKD}/bell_state.png", "bell-state-qkd.png"),
    ],
    # QAOA is taught through MaxCut / graph colouring, which is what these show.
    "variational-quantum-algorithms": [
        (f"{QBOOK}/ch4/graphnocolor.png", "maxcut-graph.png"),
        (f"{QBOOK}/ch4/graphcolor1.png", "maxcut-solution-1.png"),
        (f"{QBOOK}/ch4/graphcolor2.png", "maxcut-solution-2.png"),
        (f"{QBOOK}/ch4/tsp.png", "travelling-salesman.png"),
    ],
    "advanced-qiskit-topics": [
        (f"{QBOOK}/ch4/fredkin.png", "fredkin-gate.png"),
        (f"{QBOOK}/ch4/halfadder_large.png", "quantum-half-adder.png"),
        (f"{QBOOK}/ch4/foperator.png", "oracle-operator.png"),
        (f"{QBOOK}/ch4/fcircuit.png", "function-circuit.png"),
    ],
}

# Tracks intentionally left without diagrams, and why. Surfaced in the report so
# the gaps stay visible instead of looking like an oversight.
DELIBERATE_GAPS = {
    "quantum-error-correction":
        "only source imagery is in qec/, which is CC-BY-NC-ND (no commercial use, no derivatives)",
    "qiskit-sdk-deep-dive":
        "no SDK/transpiler diagrams exist in the vendored content",
    "quantum-machine-learning":
        "no QML diagrams exist in the vendored content",
    "ibm-cert-exam-prep":
        "revision track — carries no concept diagrams of its own",
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="report only, write nothing")
    args = parser.parse_args()

    if not os.path.isdir(CONTENT):
        print(f"QWorld content not found at {CONTENT}", file=sys.stderr)
        return 1

    copied = skipped = missing = 0

    for slug, entries in MAPPING.items():
        dest_dir = os.path.join(DEST_ROOT, slug)
        present = []

        for rel_src, dest_name in entries:
            src = os.path.join(CONTENT, rel_src)
            dest = os.path.join(dest_dir, dest_name)

            if not os.path.exists(src):
                print(f"  MISSING SOURCE  {slug}/{dest_name}  <- {rel_src}")
                missing += 1
                continue

            present.append(dest_name)

            if os.path.exists(dest) and os.path.getsize(dest) == os.path.getsize(src):
                skipped += 1
                continue

            if not args.check:
                os.makedirs(dest_dir, exist_ok=True)
                shutil.copy2(src, dest)
            copied += 1

        print(f"  {slug:38s} {len(present)} diagrams")

    print()
    for slug, reason in DELIBERATE_GAPS.items():
        print(f"  {slug:38s} no diagrams — {reason}")

    verb = "would copy" if args.check else "copied"
    print(f"\n  {verb}: {copied}   already current: {skipped}   missing sources: {missing}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
