#!/usr/bin/env python3
"""
Import the 16 individually-generated concept figures and map them to tracks.

They previously lived as a single 384x384 animated grid
(`quantum-master-grid.gif`) shown once on /tracks — sixteen concepts at roughly
96px each, too small to read and attached to no particular track. Each is now a
full-resolution figure filed under the track that teaches it.

Source: gpai-visual-gen/output/concepts16, generated from
prompts/concepts-16.txt (order is significant and defines the mapping below).

Usage: python3 scripts/import_concept_figures.py [--src DIR] [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.expanduser("~/Documents/GitHub/gpai-visual-gen/output/concepts16")
DEST_ROOT = os.path.join(APP_ROOT, "public", "images", "lesson-images")
MANIFEST = os.path.join(APP_ROOT, "src", "data", "concept-figures.json")

# index -> (track slug, destination filename, alt text, caption)
MAPPING = [
    (1,  "quantum-fundamentals", "bit-vs-qubit.png",
     "A classical bit showing only 0 or 1 beside a qubit on a Bloch sphere holding both at once",
     "A bit is one of two values. A qubit is a combination of both until measured."),
    (2,  "quantum-fundamentals", "spinning-coin-superposition.png",
     "A spinning coin shown mid-spin as both heads and tails, then collapsed to one face after landing",
     "The spinning coin: genuinely both, not secretly one. Landing is the measurement."),
    (3,  "quantum-fundamentals", "wave-interference.png",
     "Two waves approaching, adding constructively, then cancelling destructively",
     "Amplitudes add and cancel. Interference is what separates quantum from merely random."),
    (4,  "quantum-fundamentals", "amplitude-to-probability.png",
     "A probability amplitude being squared to give a measurement probability, with bar charts",
     "Born's rule: probability is the square of the amplitude — which is why amplitudes may be negative."),
    (5,  "quantum-fundamentals", "destructive-interference.png",
     "Two quantum amplitudes cancelling exactly to zero and the resulting flat distribution",
     "Perfect cancellation. No classical probability can do this."),
    (6,  "quantum-gates", "pauli-x-bloch.png",
     "The Pauli X gate as a 180 degree rotation about the X axis of the Bloch sphere",
     "Pauli-X is a half turn about X — the quantum NOT."),
    (7,  "quantum-gates", "pauli-yz-bloch.png",
     "Pauli Y and Z gates shown as 180 degree rotations about the Y and Z axes",
     "Y and Z rotate about their own axes; Z changes phase without changing probabilities."),
    (8,  "quantum-gates", "hadamard-bloch.png",
     "The Hadamard gate mapping ket zero to the plus state on the Bloch sphere",
     "Hadamard moves |0⟩ to the equator, creating an even superposition."),
    (9,  "quantum-gates", "bloch-axes-states.png",
     "A Bloch sphere with X, Y and Z axes labelled and the six cardinal states marked",
     "The six cardinal states. Every pure single-qubit state lives on this surface."),
    (10, "quantum-entanglement", "cnot-entanglement.png",
     "A CNOT circuit with control and target, producing a Bell state from a superposed control",
     "CNOT applied to a superposed control does not pick a branch — it correlates both."),
    (11, "quantum-entanglement", "epr-paradox.png",
     "Two entangled particles separated by distance showing correlated measurement outcomes",
     "The EPR setup: correlated outcomes regardless of separation."),
    (12, "quantum-entanglement", "bell-states-circuits.png",
     "The four Bell states in Dirac notation with the circuit preparing each",
     "All four Bell states are one Hadamard and one CNOT, differing only in the input."),
    (13, "quantum-entanglement", "correlation-table.png",
     "A correlation table of measurement outcomes for two entangled qubits",
     "Neither qubit has a definite value; only their relationship does."),
    (14, "quantum-entanglement", "ghz-vs-w-robustness.png",
     "GHZ and W states compared, showing GHZ entanglement destroyed by qubit loss while W survives",
     "Lose one qubit: GHZ shatters, W keeps its entanglement. That tradeoff decides the protocol."),
    (15, "quantum-cryptography-qkd", "chsh-bell-test.png",
     "A CHSH chart showing the classical limit of 2 and the quantum value 2√2 ≈ 2.83",
     "Quantum correlations exceed any local hidden-variable theory. Nobel Prize, 2022."),
    (16, "quantum-gates", "toffoli-gate.png",
     "A Toffoli CCX circuit with two controls and one target, with its truth table",
     "Toffoli needs both controls set — it makes reversible quantum logic universal."),
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", default=DEFAULT_SRC)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not os.path.isdir(args.src):
        print(f"Source not found: {args.src}", file=sys.stderr)
        return 1

    # Generated files are prefixed with their 1-based index (01-, 02-, ...).
    by_index: dict[int, str] = {}
    for name in sorted(os.listdir(args.src)):
        if name.startswith("_") or not name.lower().endswith((".png", ".svg", ".jpg")):
            continue
        try:
            by_index[int(name.split("-", 1)[0])] = os.path.join(args.src, name)
        except ValueError:
            continue

    manifest: dict[str, list] = {}
    imported = missing = rejected = 0

    # A generated figure that is nearly blank still saves as a valid PNG. One
    # came through at 3 KB against 92-154 KB for its siblings — technically a
    # file, visually empty. Reject below this rather than publish it.
    MIN_BYTES = 20_000

    for index, slug, filename, alt, caption in MAPPING:
        source = by_index.get(index)
        if not source:
            print(f"  ✗ {index:02d} {slug:26s} no generated file")
            missing += 1
            continue

        size = os.path.getsize(source)
        if size < MIN_BYTES and not source.lower().endswith(".svg"):
            print(f"  ! {index:02d} {slug:26s} REJECTED — {size // 1024} KB, likely blank")
            rejected += 1
            continue

        dest_dir = os.path.join(DEST_ROOT, slug)
        dest = os.path.join(dest_dir, filename)

        if not args.dry_run:
            os.makedirs(dest_dir, exist_ok=True)
            shutil.copy2(source, dest)

        size_kb = os.path.getsize(source) // 1024
        manifest.setdefault(slug, []).append({
            "src": f"/images/lesson-images/{slug}/{filename}",
            "alt": alt,
            "caption": caption,
        })
        print(f"  ✓ {index:02d} {slug:26s} {filename:32s} {size_kb:5d} KB")
        imported += 1

    if not args.dry_run:
        with open(MANIFEST, "w", encoding="utf-8") as fh:
            json.dump({"generatedBy": "GPAI", "tracks": manifest}, fh, indent=2, ensure_ascii=False)

    print(f"\n  imported: {imported}   missing: {missing}   rejected as blank: {rejected}")
    print(f"  tracks covered: {', '.join(sorted(manifest))}")
    if args.dry_run:
        print("  --dry-run: nothing written")
    else:
        print(f"  manifest -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
