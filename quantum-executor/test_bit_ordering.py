"""
Guard tests for canonical bit ordering.

The platform's convention is textbook big-endian: qubit 0 is the LEFTMOST
character of a label, matching the syllabus tables (|10> -> |11>) and
quantum-sim.ts in the browser. The SDK's native order is the reverse.

Every case here is ASYMMETRIC on purpose. The Bell state -- the circuit these
lessons use most -- reads identically under both conventions, so it cannot
detect an ordering bug at all. That is exactly why the wrong order survived
unnoticed until an X on a single qubit was checked.

Run: python test_bit_ordering.py   (or: pytest test_bit_ordering.py -q)
"""
from __future__ import annotations

import os
import sys

import qpiai_bridge

SKIP = qpiai_bridge.sdk_module() is None


def _counts(build, shots=512, **run_kwargs):
    Circuit = qpiai_bridge.get_circuit_class()
    c = Circuit(2, 2)
    build(c)
    c.measure([0, 1], [0, 1])
    return dict(c.run(shots=shots, **run_kwargs).get_counts())


def test_x_on_qubit0_labels_leftmost():
    """X on qubit 0 of |00> must read '10', not '01'."""
    counts = _counts(lambda c: c.x(0))
    assert set(counts) == {"10"}, f"expected 10, got {counts}"


def test_x_on_qubit1_labels_rightmost():
    counts = _counts(lambda c: c.x(1))
    assert set(counts) == {"01"}, f"expected 01, got {counts}"


def test_cnot_maps_10_to_11():
    counts = _counts(lambda c: (c.x(0), c.cx(0, 1)))
    assert set(counts) == {"11"}, f"expected 11, got {counts}"


def test_cnot_leaves_01_alone():
    """Control is qubit 0, which is |0> here, so nothing should flip."""
    counts = _counts(lambda c: (c.x(1), c.cx(0, 1)))
    assert set(counts) == {"01"}, f"expected 01, got {counts}"


def test_bell_state_cannot_detect_ordering():
    """
    Documents why the other tests exist rather than asserting correctness:
    the Bell state is symmetric, so it passes under either convention.
    """
    counts = _counts(lambda c: (c.h(0), c.cx(0, 1)))
    assert set(counts) <= {"00", "11"}, f"not a Bell state: {counts}"


def test_raw_sdk_order_is_still_reachable():
    """An explicit reverse_bits=False must still give the SDK's own order."""
    counts = _counts(lambda c: c.x(0), reverse_bits=False)
    assert set(counts) == {"01"}, f"expected raw 01, got {counts}"


TESTS = [v for k, v in sorted(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    if SKIP:
        print("qpiai-quantum not installed - skipping (CI installs it)")
        sys.exit(0)
    failures = 0
    for fn in TESTS:
        try:
            fn()
            print(f"  ok    {fn.__name__}")
        except AssertionError as exc:
            failures += 1
            print(f"  FAIL  {fn.__name__}: {exc}")
    print(f"\n{len(TESTS) - failures}/{len(TESTS)} bit-ordering guards passed.")
    sys.exit(1 if failures else 0)
