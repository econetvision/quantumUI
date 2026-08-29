/**
 * Pure state-vector simulator for the Track 0 lessons.
 *
 * Every interactive on the entry track runs here rather than on the executor:
 * a child dragging a slider must see the Bloch vector move at 60fps, and a
 * round trip to Railway per frame cannot do that. The backend stays the source
 * of truth for "run this for real" — this is what makes the page *feel* alive
 * between runs, and what keeps a lesson working when the executor is down.
 *
 * No dependencies, no classes over the wire: plain arrays of {re, im} so a
 * state can be JSON-serialised into a lesson fixture or a test snapshot.
 *
 * Convention: qubit 0 is the LEFTMOST character of a basis label, so |01>
 * means qubit 0 in |0> and qubit 1 in |1>. This is stated because the SDK the
 * rest of the platform talks to is not self-consistent about it (Grover
 * reverses, Bernstein-Vazirani does not), and a teaching simulator that
 * silently picked the other convention would contradict the lessons.
 */

export interface Complex {
  re: number;
  im: number;
}

export const c = (re: number, im = 0): Complex => ({ re, im });

export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
export const cAbs2 = (a: Complex): number => a.re * a.re + a.im * a.im;
export const cAbs = (a: Complex): number => Math.sqrt(cAbs2(a));

/** A pure state of `qubits` qubits: 2^n amplitudes, index = basis label read as binary. */
export interface State {
  qubits: number;
  amplitudes: Complex[];
}

export function zeroState(qubits: number): State {
  if (qubits < 1 || qubits > 12) {
    // 12 is 4096 amplitudes — past that the doubling lesson is making a point
    // about intractability, and the browser should not try to prove it.
    throw new RangeError(`qubits must be between 1 and 12, got ${qubits}`);
  }
  const amplitudes = Array.from({ length: 1 << qubits }, () => c(0));
  amplitudes[0] = c(1);
  return { qubits, amplitudes };
}

/** Probability of each basis outcome, indexed the same way as amplitudes. */
export function probabilities(state: State): number[] {
  return state.amplitudes.map(cAbs2);
}

/** Basis label for an index, qubit 0 leftmost. */
export function basisLabel(index: number, qubits: number): string {
  return index.toString(2).padStart(qubits, '0');
}

export function probabilityMap(state: State): Record<string, number> {
  const out: Record<string, number> = {};
  probabilities(state).forEach((p, i) => {
    if (p > 1e-12) out[basisLabel(i, state.qubits)] = p;
  });
  return out;
}

/* -------------------------------------------------------------------------
   Single-qubit gates, as 2x2 matrices in row-major order.
   ------------------------------------------------------------------------- */

export type Matrix2 = [Complex, Complex, Complex, Complex];

const INV_SQRT2 = 1 / Math.SQRT2;

export const GATES: Record<string, Matrix2> = {
  I: [c(1), c(0), c(0), c(1)],
  X: [c(0), c(1), c(1), c(0)],
  Y: [c(0), c(0, -1), c(0, 1), c(0)],
  Z: [c(1), c(0), c(0), c(-1)],
  H: [c(INV_SQRT2), c(INV_SQRT2), c(INV_SQRT2), c(-INV_SQRT2)],
  S: [c(1), c(0), c(0), c(0, 1)],
  T: [c(1), c(0), c(0), c(Math.SQRT1_2, Math.SQRT1_2)],
};

export function rx(theta: number): Matrix2 {
  const a = Math.cos(theta / 2);
  const b = -Math.sin(theta / 2);
  return [c(a), c(0, b), c(0, b), c(a)];
}

export function ry(theta: number): Matrix2 {
  const a = Math.cos(theta / 2);
  const b = Math.sin(theta / 2);
  return [c(a), c(-b), c(b), c(a)];
}

export function rz(theta: number): Matrix2 {
  return [
    c(Math.cos(-theta / 2), Math.sin(-theta / 2)),
    c(0),
    c(0),
    c(Math.cos(theta / 2), Math.sin(theta / 2)),
  ];
}

/** Apply a 2x2 gate to one qubit, leaving the rest untouched. */
export function applyGate(state: State, gate: Matrix2, target: number): State {
  assertQubit(state, target);
  const n = state.qubits;
  const out = state.amplitudes.slice();
  // Bit position of `target` when qubit 0 is the leftmost character.
  const bit = 1 << (n - 1 - target);

  for (let i = 0; i < out.length; i += 1) {
    if (i & bit) continue; // handled as the partner of i
    const j = i | bit;
    const a0 = state.amplitudes[i];
    const a1 = state.amplitudes[j];
    out[i] = cAdd(cMul(gate[0], a0), cMul(gate[1], a1));
    out[j] = cAdd(cMul(gate[2], a0), cMul(gate[3], a1));
  }
  return { qubits: n, amplitudes: out };
}

/** Controlled single-qubit gate. CNOT is `controlled(GATES.X, …)`. */
export function controlled(state: State, gate: Matrix2, control: number, target: number): State {
  assertQubit(state, control);
  assertQubit(state, target);
  if (control === target) throw new RangeError('control and target must differ');
  const n = state.qubits;
  const out = state.amplitudes.slice();
  const cBit = 1 << (n - 1 - control);
  const tBit = 1 << (n - 1 - target);

  for (let i = 0; i < out.length; i += 1) {
    if (!(i & cBit)) continue; // control is |0>: leave alone
    if (i & tBit) continue; // handled as the partner
    const j = i | tBit;
    const a0 = state.amplitudes[i];
    const a1 = state.amplitudes[j];
    out[i] = cAdd(cMul(gate[0], a0), cMul(gate[1], a1));
    out[j] = cAdd(cMul(gate[2], a0), cMul(gate[3], a1));
  }
  return { qubits: n, amplitudes: out };
}

export const cnot = (s: State, control: number, target: number) =>
  controlled(s, GATES.X, control, target);

export function swap(state: State, a: number, b: number): State {
  return cnot(cnot(cnot(state, a, b), b, a), a, b);
}

/** Toffoli: flips `target` only when BOTH controls are |1>. */
export function toffoli(state: State, c1: number, c2: number, target: number): State {
  assertQubit(state, c1);
  assertQubit(state, c2);
  assertQubit(state, target);
  const n = state.qubits;
  const out = state.amplitudes.slice();
  const b1 = 1 << (n - 1 - c1);
  const b2 = 1 << (n - 1 - c2);
  const bt = 1 << (n - 1 - target);
  for (let i = 0; i < out.length; i += 1) {
    if ((i & b1) && (i & b2) && !(i & bt)) {
      const j = i | bt;
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
  }
  return { qubits: n, amplitudes: out };
}

/* -------------------------------------------------------------------------
   Measurement
   ------------------------------------------------------------------------- */

/**
 * Sample `shots` measurements.
 *
 * `rng` is injectable so tests are deterministic — a statistics assertion that
 * depends on Math.random is a flake waiting to happen in CI.
 */
export function measure(
  state: State,
  shots = 1024,
  rng: () => number = Math.random,
): Record<string, number> {
  const probs = probabilities(state);
  const counts: Record<string, number> = {};
  // Cumulative table once, then one binary-search-free walk per shot: shots is
  // ~1024 and 2^n is small here, so clarity beats an index structure.
  const cumulative: number[] = [];
  let running = 0;
  for (const p of probs) {
    running += p;
    cumulative.push(running);
  }
  for (let s = 0; s < shots; s += 1) {
    const r = rng() * running;
    let idx = cumulative.findIndex((cp) => r <= cp);
    if (idx === -1) idx = probs.length - 1;
    const label = basisLabel(idx, state.qubits);
    counts[label] = (counts[label] ?? 0) + 1;
  }
  return counts;
}

/** Collapse to one outcome, as measuring a real qubit would. */
export function collapse(state: State, rng: () => number = Math.random): { state: State; outcome: string } {
  const probs = probabilities(state);
  const r = rng();
  let acc = 0;
  let idx = probs.length - 1;
  for (let i = 0; i < probs.length; i += 1) {
    acc += probs[i];
    if (r <= acc) {
      idx = i;
      break;
    }
  }
  const amplitudes = probs.map(() => c(0));
  amplitudes[idx] = c(1);
  return { state: { qubits: state.qubits, amplitudes }, outcome: basisLabel(idx, state.qubits) };
}

/* -------------------------------------------------------------------------
   Bloch vector — what the globe lesson draws
   ------------------------------------------------------------------------- */

export interface Bloch {
  x: number;
  y: number;
  z: number;
  /** Polar angle from +Z, radians. */
  theta: number;
  /** Azimuth from +X, radians. */
  phi: number;
}

/** Bloch vector of a single-qubit state. Only defined for one qubit. */
export function blochVector(state: State): Bloch {
  if (state.qubits !== 1) {
    throw new RangeError('blochVector is defined for a single qubit; trace out the rest first');
  }
  const [a, b] = state.amplitudes;
  const x = 2 * (a.re * b.re + a.im * b.im);
  const y = 2 * (a.re * b.im - a.im * b.re);
  const z = cAbs2(a) - cAbs2(b);
  return { x, y, z, theta: Math.acos(Math.min(1, Math.max(-1, z))), phi: Math.atan2(y, x) };
}

/** |psi> = cos(theta/2)|0> + e^{i phi} sin(theta/2)|1> */
export function stateFromAngles(theta: number, phi: number): State {
  const a = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return {
    qubits: 1,
    amplitudes: [c(a), c(s * Math.cos(phi), s * Math.sin(phi))],
  };
}

/* ------------------------------------------------------------------------- */

export function isNormalised(state: State, tolerance = 1e-9): boolean {
  const total = probabilities(state).reduce((sum, p) => sum + p, 0);
  return Math.abs(total - 1) < tolerance;
}

function assertQubit(state: State, q: number) {
  if (!Number.isInteger(q) || q < 0 || q >= state.qubits) {
    throw new RangeError(`qubit ${q} is out of range for a ${state.qubits}-qubit state`);
  }
}
