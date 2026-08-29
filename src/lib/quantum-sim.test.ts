import { describe, expect, it } from 'vitest';
import {
  applyGate, basisLabel, blochVector, c, cAbs, cAbs2, cAdd, cConj, cMul, cnot,
  collapse, GATES, isNormalised, measure, probabilities, probabilityMap, rx, ry,
  rz, stateFromAngles, swap, toffoli, zeroState, type State,
} from './quantum-sim';

/** Deterministic RNG so statistical assertions cannot flake in CI. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(tol);

describe('single-qubit gates match the lesson truth tables', () => {
  it('X flips |0> to |1>', () => {
    const s = applyGate(zeroState(1), GATES.X, 0);
    expect(probabilityMap(s)).toEqual({ '1': 1 });
  });

  it('X maps a|0>+b|1> to b|0>+a|1>', () => {
    const start: State = { qubits: 1, amplitudes: [{ re: 0.6, im: 0 }, { re: 0.8, im: 0 }] };
    const out = applyGate(start, GATES.X, 0);
    close(out.amplitudes[0].re, 0.8);
    close(out.amplitudes[1].re, 0.6);
  });

  it('Y|0> = i|1>', () => {
    const out = applyGate(zeroState(1), GATES.Y, 0);
    close(out.amplitudes[1].re, 0);
    close(out.amplitudes[1].im, 1);
  });

  it('Z leaves |0> and negates |1>', () => {
    close(applyGate(zeroState(1), GATES.Z, 0).amplitudes[0].re, 1);
    const one = applyGate(zeroState(1), GATES.X, 0);
    close(applyGate(one, GATES.Z, 0).amplitudes[1].re, -1);
  });

  it('H|0> is an equal superposition', () => {
    const s = applyGate(zeroState(1), GATES.H, 0);
    close(cAbs2(s.amplitudes[0]), 0.5);
    close(cAbs2(s.amplitudes[1]), 0.5);
  });

  it('H is its own inverse', () => {
    const s = applyGate(applyGate(zeroState(1), GATES.H, 0), GATES.H, 0);
    close(cAbs2(s.amplitudes[0]), 1);
  });

  it('S applies a quarter turn to |1> only', () => {
    const one = applyGate(zeroState(1), GATES.X, 0);
    const out = applyGate(one, GATES.S, 0);
    close(out.amplitudes[1].im, 1);
  });

  it('T applied twice equals S', () => {
    const one = applyGate(zeroState(1), GATES.X, 0);
    const tt = applyGate(applyGate(one, GATES.T, 0), GATES.T, 0);
    const s = applyGate(one, GATES.S, 0);
    close(tt.amplitudes[1].re, s.amplitudes[1].re);
    close(tt.amplitudes[1].im, s.amplitudes[1].im);
  });
});

describe('CNOT follows the mapping in the lesson', () => {
  const basis = (bits: string): State => {
    let s = zeroState(bits.length);
    [...bits].forEach((b, i) => {
      if (b === '1') s = applyGate(s, GATES.X, i);
    });
    return s;
  };

  it.each([
    ['00', '00'],
    ['01', '01'],
    ['10', '11'],
    ['11', '10'],
  ])('|%s> -> |%s>', (input, expected) => {
    expect(probabilityMap(cnot(basis(input), 0, 1))).toEqual({ [expected]: 1 });
  });

  it('refuses a control equal to its target', () => {
    expect(() => cnot(zeroState(2), 0, 0)).toThrow(RangeError);
  });
});

describe('Bell state', () => {
  const bell = () => cnot(applyGate(zeroState(2), GATES.H, 0), 0, 1);

  it('is (|00>+|11>)/sqrt(2) — never 01 or 10', () => {
    const p = probabilityMap(bell());
    expect(Object.keys(p).sort()).toEqual(['00', '11']);
    close(p['00'], 0.5);
    close(p['11'], 0.5);
  });

  it('measures only 00 and 11 over many shots', () => {
    const counts = measure(bell(), 2000, seeded(42));
    expect(Object.keys(counts).sort()).toEqual(['00', '11']);
    // Both outcomes appear, roughly evenly — the statistic the lesson claims.
    expect(counts['00']).toBeGreaterThan(800);
    expect(counts['11']).toBeGreaterThan(800);
    expect(counts['00'] + counts['11']).toBe(2000);
  });

  it('collapses to a single correlated outcome', () => {
    const { state, outcome } = collapse(bell(), seeded(7));
    expect(['00', '11']).toContain(outcome);
    expect(isNormalised(state)).toBe(true);
  });
});

describe('multi-qubit gates', () => {
  it('SWAP exchanges two qubits', () => {
    const s = applyGate(zeroState(2), GATES.X, 0); // |10>
    expect(probabilityMap(swap(s, 0, 1))).toEqual({ '01': 1 });
  });

  it('Toffoli flips the target only when both controls are 1', () => {
    let both = zeroState(3);
    both = applyGate(both, GATES.X, 0);
    both = applyGate(both, GATES.X, 1);
    expect(probabilityMap(toffoli(both, 0, 1, 2))).toEqual({ '111': 1 });

    const one = applyGate(zeroState(3), GATES.X, 0);
    expect(probabilityMap(toffoli(one, 0, 1, 2))).toEqual({ '100': 1 });
  });
});

describe('measurement statistics', () => {
  it('reproduces the worked example |psi> = 0.6|0> + 0.8|1>', () => {
    const s: State = { qubits: 1, amplitudes: [{ re: 0.6, im: 0 }, { re: 0.8, im: 0 }] };
    const p = probabilityMap(s);
    close(p['0'], 0.36);
    close(p['1'], 0.64);

    const counts = measure(s, 5000, seeded(99));
    // Within 3 percentage points of theory — loose enough not to flake,
    // tight enough to catch a genuinely wrong distribution.
    expect(Math.abs(counts['0'] / 5000 - 0.36)).toBeLessThan(0.03);
  });

  it('always returns exactly `shots` results', () => {
    const counts = measure(applyGate(zeroState(3), GATES.H, 0), 777, seeded(5));
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(777);
  });
});

describe('Bloch sphere', () => {
  it('|0> sits at the north pole', () => {
    const b = blochVector(zeroState(1));
    close(b.z, 1);
    close(b.theta, 0);
  });

  it('|1> sits at the south pole', () => {
    const b = blochVector(applyGate(zeroState(1), GATES.X, 0));
    close(b.z, -1);
    close(b.theta, Math.PI);
  });

  it('H|0> lands on the equator at +X', () => {
    const b = blochVector(applyGate(zeroState(1), GATES.H, 0));
    close(b.x, 1);
    close(b.z, 0);
  });

  it('reproduces the lesson worked example: theta=pi/3 gives P0 = 0.75', () => {
    const s = stateFromAngles(Math.PI / 3, 0);
    const p = probabilityMap(s);
    close(p['0'], 0.75, 1e-9);
    close(p['1'], 0.25, 1e-9);
    close(blochVector(s).theta, Math.PI / 3);
  });

  it('round-trips angles through the state', () => {
    const theta = 1.1;
    const phi = 2.3;
    const b = blochVector(stateFromAngles(theta, phi));
    close(b.theta, theta, 1e-6);
    close(b.phi, phi, 1e-6);
  });

  it('refuses a multi-qubit state', () => {
    expect(() => blochVector(zeroState(2))).toThrow(RangeError);
  });
});

describe('invariants', () => {
  it('every gate preserves normalisation', () => {
    let s = zeroState(3);
    s = applyGate(s, GATES.H, 0);
    s = cnot(s, 0, 1);
    s = applyGate(s, ry(0.7), 2);
    s = toffoli(s, 0, 1, 2);
    s = swap(s, 0, 2);
    expect(isNormalised(s)).toBe(true);
  });

  it('rejects out-of-range qubits and sizes', () => {
    expect(() => applyGate(zeroState(2), GATES.X, 5)).toThrow(RangeError);
    expect(() => zeroState(0)).toThrow(RangeError);
    expect(() => zeroState(13)).toThrow(RangeError);
  });

  it('labels qubit 0 as the leftmost character', () => {
    expect(basisLabel(1, 2)).toBe('01');
    expect(probabilityMap(applyGate(zeroState(2), GATES.X, 0))).toEqual({ '10': 1 });
  });
});


describe('complex arithmetic', () => {
  it('adds and multiplies', () => {
    expect(cAdd(c(1, 2), c(3, -1))).toEqual({ re: 4, im: 1 });
    // (2+i)(3-2i) = 6 -4i +3i -2i^2 = 8 - i
    expect(cMul(c(2, 1), c(3, -2))).toEqual({ re: 8, im: -1 });
  });

  it('conjugates and takes magnitude', () => {
    expect(cConj(c(3, 4))).toEqual({ re: 3, im: -4 });
    close(cAbs(c(3, 4)), 5);
    close(cAbs2(c(3, 4)), 25);
  });
});

describe('rotation gates', () => {
  it('rx(pi) maps |0> to |1> up to phase', () => {
    const out = applyGate(zeroState(1), rx(Math.PI), 0);
    close(cAbs2(out.amplitudes[1]), 1);
  });

  it('ry(pi) maps |0> to |1>', () => {
    expect(probabilityMap(applyGate(zeroState(1), ry(Math.PI), 0))).toEqual({ '1': 1 });
  });

  it('ry(pi/2) is an equal superposition, matching the Bloch worked example', () => {
    const out = applyGate(zeroState(1), ry(Math.PI / 2), 0);
    close(cAbs2(out.amplitudes[0]), 0.5);
    close(blochVector(out).theta, Math.PI / 2);
  });

  it('rz changes phase but never the measured probabilities', () => {
    const sup = applyGate(zeroState(1), GATES.H, 0);
    const before = probabilities(sup);
    const after = probabilities(applyGate(sup, rz(Math.PI / 3), 0));
    before.forEach((p, i) => close(p, after[i]));
  });

  it('rz(0) is the identity', () => {
    const out = applyGate(zeroState(1), rz(0), 0);
    close(out.amplitudes[0].re, 1);
  });
});
