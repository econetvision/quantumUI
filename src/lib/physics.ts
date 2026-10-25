/**
 * The physics the quiz animations are drawn from.
 *
 * Every curve in src/components/physics-quiz is plotted from these functions
 * rather than sketched to look right. That is the same rule quantum-sim.ts
 * follows for Track 0, and it exists for the same reason: a learner who checks
 * a number against the figure has to find them agreeing, and an answer key that
 * says "1.33 × 10⁻¹⁹ J" beside a hand-drawn graph teaches that figures are
 * decoration.
 *
 * It also means a wrong answer key is caught by a test rather than by a reader.
 */

/** CODATA values, rounded as the question paper rounds them. */
export const PLANCK = 6.63e-34; // J s
export const LIGHT_SPEED = 3.0e8; // m s⁻¹
export const BOLTZMANN = 1.381e-23; // J K⁻¹
export const ELECTRON_VOLT = 1.602e-19; // J

// ---------------------------------------------------------------------------
// Waves and oscillation — Q27, Q28, Q33, Q34, Q35
// ---------------------------------------------------------------------------

/** Frequency from period. f = 1/T. */
export const frequency = (periodSeconds: number): number => 1 / periodSeconds;

/**
 * Sum of two equal waves a phase difference apart, sampled across one period.
 *
 * Returns the two waves and their sum so a figure can show cancellation
 * happening rather than asserting it: at φ = π the sum is flat because the
 * arithmetic makes it flat.
 */
export function interfere(
  phaseDifference: number,
  samples = 160,
): { x: number; a: number; b: number; sum: number }[] {
  return Array.from({ length: samples }, (_, i) => {
    const x = (i / (samples - 1)) * 2 * Math.PI;
    const a = Math.sin(x);
    const b = Math.sin(x + phaseDifference);
    return { x, a, b, sum: a + b };
  });
}

/**
 * Simple harmonic motion: a = −ω²x.
 *
 * Acceleration is returned alongside position so the figure can draw the
 * restoring arrow from the same number that defines the motion — the sign is
 * the whole of Q33.
 */
export function shm(omega: number, amplitude: number, t: number) {
  const x = amplitude * Math.cos(omega * t);
  return {
    x,
    velocity: -amplitude * omega * Math.sin(omega * t),
    acceleration: -(omega ** 2) * x,
  };
}

// ---------------------------------------------------------------------------
// Blackbody radiation — Q36, Q37
// ---------------------------------------------------------------------------

/**
 * Planck spectral radiance at a wavelength, in SI units.
 *
 * The point of plotting the real function for Q36 is that both claims in the
 * correct option fall out of it without being asserted: the whole curve rises
 * with temperature, and the peak moves to shorter wavelength.
 */
export function planckRadiance(wavelengthMetres: number, temperatureKelvin: number): number {
  const l = wavelengthMetres;
  const numerator = 2 * Math.PI * 6.626e-34 * LIGHT_SPEED ** 2;
  const exponent = (6.626e-34 * LIGHT_SPEED) / (l * BOLTZMANN * temperatureKelvin);
  return numerator / (l ** 5 * (Math.exp(exponent) - 1));
}

/** Wien's displacement law: the wavelength of peak emission. */
export const wienPeak = (temperatureKelvin: number): number => 2.898e-3 / temperatureKelvin;

// ---------------------------------------------------------------------------
// Photons and the photoelectric effect — Q38, Q40, Q41, Q42, Q45
// ---------------------------------------------------------------------------

/** E = hν. */
export const photonEnergy = (frequencyHz: number): number => PLANCK * frequencyHz;

/** p = h/λ. */
export const photonMomentum = (wavelengthMetres: number): number => PLANCK / wavelengthMetres;

/** λ = h/p — de Broglie. */
export const deBroglieWavelength = (momentum: number): number => PLANCK / momentum;

/**
 * Maximum photoelectron kinetic energy, Kmax = hν − Φ.
 *
 * Clamped at zero because below threshold no electron is emitted at all — the
 * negative number the formula produces is not a slower electron, it is no
 * electron, which is exactly what Q38 tests.
 */
export function maxKineticEnergy(frequencyHz: number, thresholdHz: number) {
  const raw = PLANCK * (frequencyHz - thresholdHz);
  return { emits: raw > 0, kMax: Math.max(0, raw), workFunction: PLANCK * thresholdHz };
}

// ---------------------------------------------------------------------------
// Atomic structure — Q43, Q44, Q49
// ---------------------------------------------------------------------------

/** Bohr level energy for hydrogen, in eV. */
export const bohrLevel = (n: number): number => -13.6 / n ** 2;

/** Photon energy of a transition, in eV. Positive for emission. */
export const transitionEnergy = (nUpper: number, nLower: number): number =>
  bohrLevel(nUpper) - bohrLevel(nLower);

/**
 * Whether a set of quantum numbers is allowed, and which rule fails if not.
 *
 * Returns the failing rule rather than a bare boolean so Q49's figure can point
 * at the specific violation instead of showing a red cross.
 */
export function checkQuantumNumbers(n: number, l: number, ml: number, ms: number) {
  const rules = [
    { rule: 'n ≥ 1', ok: Number.isInteger(n) && n >= 1 },
    { rule: '0 ≤ ℓ ≤ n − 1', ok: Number.isInteger(l) && l >= 0 && l <= n - 1 },
    { rule: '−ℓ ≤ mℓ ≤ +ℓ', ok: Number.isInteger(ml) && Math.abs(ml) <= l },
    { rule: 'ms = ±½', ok: Math.abs(ms) === 0.5 },
  ];
  return { allowed: rules.every((r) => r.ok), rules };
}

// ---------------------------------------------------------------------------
// Amplitudes and probability — Q29, Q30, Q47, Q48
// ---------------------------------------------------------------------------

/** |amplitude|² — the Born rule, for a complex amplitude re + im·i. */
export const bornProbability = (re: number, im: number): number => re * re + im * im;

/** Whether squared magnitudes sum to 1, within tolerance. */
export function isNormalised(amplitudes: number[], tolerance = 1e-9) {
  const total = amplitudes.reduce((s, a) => s + a * a, 0);
  return { total, normalised: Math.abs(total - 1) < tolerance };
}

/** Multiplying by i is a 90° rotation; this returns the angle after k turns. */
export const iPowerAngle = (k: number): number => (k * Math.PI) / 2;

// ---------------------------------------------------------------------------
// Matrices — Q31
// ---------------------------------------------------------------------------

/** 2×2 matrix times a 2-vector. Q31's matrix is Pauli-X. */
export function apply2x2(m: [number, number, number, number], v: [number, number]): [number, number] {
  return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
}

// ---------------------------------------------------------------------------
// Semiconductors — Q50
// ---------------------------------------------------------------------------

/**
 * In an intrinsic semiconductor every excitation makes one electron and one
 * hole, so n = p = nᵢ. Modelled as pair creation rather than two independent
 * counts, because the pairing is the answer.
 */
export function intrinsicCarriers(excitations: number) {
  return { electrons: excitations, holes: excitations, equal: true };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** "1.33 × 10⁻¹⁹" — matches how the question paper writes numbers. */
export function sci(value: number, figures = 2): string {
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exp;
  const sup = '⁻⁰¹²³⁴⁵⁶⁷⁸⁹';
  const digits = String(Math.abs(exp))
    .split('')
    .map((d) => sup[Number(d) + 1])
    .join('');
  return `${mantissa.toFixed(figures)} × 10${exp < 0 ? sup[0] : ''}${digits}`;
}
