/**
 * Quantum Physics Foundations — the mixed MCQ bank.
 *
 * Questions are data, not markup, for the same reason the Track 0 lessons are:
 * the set can then be checked mechanically. physics-mcq.test.ts asserts that
 * every answer indexes a real option, every question names an animation that
 * exists, and that the questions whose wording depends on a figure actually
 * declare one.
 *
 * `reason` is the walkthrough shown after answering. It is deliberately the
 * paper's own explanation rather than a paraphrase — it names the distractors
 * and says why each is wrong, which is the part that teaches.
 */

export type AnimationId =
  | 'exponent-division'
  | 'inverse-proportion'
  | 'phase-difference'
  | 'probability-bars'
  | 'complex-rotation'
  | 'matrix-swap'
  | 'tangent-slope'
  | 'shm-restoring'
  | 'period-frequency'
  | 'wave-cancellation'
  | 'blackbody-curves'
  | 'planck-quanta'
  | 'photoelectric-threshold'
  | 'photocurrent-intensity'
  | 'kmax-vs-frequency'
  | 'photon-arithmetic'
  | 'bohr-stability'
  | 'energy-levels'
  | 'de-broglie-ratio'
  | 'which-path'
  | 'born-rule'
  | 'normalisation'
  | 'quantum-numbers'
  | 'electron-hole-pairs';

export interface PhysicsMCQ {
  /** Question number as printed on the paper. */
  id: number;
  level: number;
  /** Module from the topic hierarchy this belongs to. */
  topic: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** The walkthrough, shown once an answer is chosen. */
  reason: string;
  animation: AnimationId;
  /**
   * Set when the question cannot be answered without seeing the figure —
   * "the two curves shown", "the displayed distribution". For these the
   * animation is the question, not an illustration of it, so it must render
   * before the options are readable.
   */
  figureIsLoadBearing?: boolean;
}

export const PHYSICS_MCQS: PhysicsMCQ[] = [
  {
    id: 26,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'The value (6 × 10⁸)/(3 × 10²) is',
    options: ['2 × 10⁵', '18 × 10⁶', '2 × 10⁶', '2 × 10¹⁰'],
    answer: 2,
    reason:
      'Divide the coefficients (6 ÷ 3 = 2) and subtract the exponents (8 − 2 = 6). Dividing powers of ten never multiplies the exponents.',
    animation: 'exponent-division',
  },
  {
    id: 27,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'If a quantity is inversely proportional to wavelength, halving the wavelength makes the quantity',
    options: ['half as large', 'four times as large', 'unchanged', 'twice as large'],
    answer: 3,
    reason:
      'Inverse proportion means quantity × λ stays constant. Cut λ to half and the quantity must double to keep the product the same.',
    animation: 'inverse-proportion',
  },
  {
    id: 28,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'The two curves shown have the same amplitude and frequency. Their phase difference is',
    options: ['0°', '180°', '90°', '360°'],
    answer: 1,
    reason:
      'Wherever one curve is at a crest the other is at a trough. A mirror-image pair like this is exactly half a cycle apart, which is 180° (π rad).',
    animation: 'phase-difference',
    figureIsLoadBearing: true,
  },
  {
    id: 29,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'For the displayed probability distribution, the most likely outcome is',
    options: ['1', '3', '2', '4'],
    answer: 1,
    reason:
      'The most likely outcome is simply the one with the largest probability. Outcome 3 carries 0.40, more than any other bar.',
    animation: 'probability-bars',
    figureIsLoadBearing: true,
  },
  {
    id: 30,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'The product i × i equals',
    options: ['−1', '+1', 'i', '−i'],
    answer: 0,
    reason:
      'By definition i² = −1. Geometrically, multiplying by i rotates a number 90° on the complex plane; doing it twice turns 1 through 180° and lands on −1.',
    animation: 'complex-rotation',
  },
  {
    id: 31,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'The matrix [[0, 1], [1, 0]] acting on the column vector [1, 0] gives',
    options: ['[1, 0]', '[0, 1]', '[1, 1]', '[0, 0]'],
    answer: 1,
    reason:
      'Multiply each row by the column: top row gives 0·1 + 1·0 = 0, bottom row gives 1·1 + 0·0 = 1. This matrix swaps the two components. In quantum computing it is the Pauli-X (NOT) gate.',
    animation: 'matrix-swap',
  },
  {
    id: 32,
    level: 2,
    topic: 'Classical Physics Foundations',
    prompt: 'At a point where a position–time graph has a horizontal tangent, the instantaneous velocity is',
    options: ['maximum and positive', 'maximum and negative', 'undefined', 'zero'],
    answer: 3,
    reason:
      'Instantaneous velocity is the slope of the position–time graph. A horizontal tangent has zero slope, so the velocity at that instant is zero, as at the turning point of a thrown ball.',
    animation: 'tangent-slope',
  },
  {
    id: 33,
    level: 2,
    topic: 'Classical Physics Foundations',
    prompt: 'For simple harmonic motion, the acceleration is always directed',
    options: [
      'toward the equilibrium position',
      'away from equilibrium',
      'along the velocity at every instant',
      'in a fixed direction independent of position',
    ],
    answer: 0,
    reason:
      'SHM is defined by a = −ω²x. The minus sign means the acceleration always points back toward x = 0, whichever side the mass is on. It is a restoring acceleration, which is what keeps the motion oscillating.',
    animation: 'shm-restoring',
  },
  {
    id: 34,
    level: 2,
    topic: 'Classical Physics Foundations',
    prompt: 'A wave takes 0.020 s for one complete oscillation. Its frequency is',
    options: ['0.020 Hz', '20 Hz', '500 Hz', '50 Hz'],
    answer: 3,
    reason:
      'Frequency is the reciprocal of period: f = 1/T = 1/0.020 s = 50 Hz. A period of a fiftieth of a second means fifty cycles every second.',
    animation: 'period-frequency',
  },
  {
    id: 35,
    level: 2,
    topic: 'Classical Physics Foundations',
    prompt: 'Two equal waves produce maximum destructive interference when their phase difference is',
    options: ['2kπ', '(2k + 1)π, where k is an integer', 'π/2 only', '4kπ + π/2'],
    answer: 1,
    reason:
      'Cancellation needs crest on trough, i.e. the waves half a cycle apart: π, 3π, 5π… Any odd multiple of π, written (2k + 1)π. Even multiples (2kπ) give constructive interference instead.',
    animation: 'wave-cancellation',
  },
  {
    id: 36,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Compared with the lower-temperature curve, the higher-temperature blackbody curve shown has',
    options: [
      'a lower peak at a longer wavelength',
      'the same peak and wavelength',
      'a higher peak at a shorter wavelength',
      'zero intensity at short wavelengths',
    ],
    answer: 2,
    reason:
      'Hotter bodies radiate more at every wavelength (Stefan–Boltzmann), so the whole curve rises, and the peak moves to shorter wavelength (Wien’s law, λₘₐₓ ∝ 1/T). A heating iron bar goes from dull red to white for exactly this reason.',
    animation: 'blackbody-curves',
    figureIsLoadBearing: true,
  },
  {
    id: 37,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Planck’s hypothesis avoided the ultraviolet catastrophe by making energy exchange',
    options: [
      'independent of frequency',
      'possible only at zero temperature',
      'discrete rather than continuous',
      'unlimited at high frequency',
    ],
    answer: 2,
    reason:
      'Planck let each oscillator trade energy only in whole packets of hν. At high frequency a single packet is large and rarely affordable from thermal energy, so the high-frequency modes stay nearly empty instead of soaking up infinite energy.',
    animation: 'planck-quanta',
  },
  {
    id: 38,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Light below threshold frequency falls on a metal. Increasing only its intensity will',
    options: [
      'eventually increase Kₘₐₓ',
      'still produce no one-photon photoemission',
      'reduce the work function to zero',
      'always produce electrons after a delay',
    ],
    answer: 1,
    reason:
      'Emission is a one-photon, one-electron event. More intensity means more photons, but each still carries hν below the work function Φ, so none can free an electron. Frequency decides whether emission happens; intensity only decides how many once it does.',
    animation: 'photoelectric-threshold',
  },
  {
    id: 39,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Curves A and B are for the same frequency and metal. Curve B most reasonably represents',
    options: [
      'greater stopping potential',
      'a larger work function',
      'greater incident intensity',
      'a smaller electron charge',
    ],
    answer: 2,
    reason:
      'Both curves cut the axis at the same stopping potential, so Kₘₐₓ is unchanged (same ν, same metal). What differs is the plateau: B saturates at a higher current, meaning more electrons per second, which is what more intensity gives.',
    animation: 'photocurrent-intensity',
    figureIsLoadBearing: true,
  },
  {
    id: 40,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'In a graph of Kₘₐₓ against frequency, the slope is',
    options: ['electron charge', 'work function', 'Planck’s constant', 'speed of light'],
    answer: 2,
    reason:
      'Einstein’s equation Kₘₐₓ = hν − Φ is a straight line in ν with gradient h and intercept −Φ. Millikan measured this slope and obtained Planck’s constant to within 0.5 %.',
    animation: 'kmax-vs-frequency',
  },
  {
    id: 41,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'For a surface with threshold frequency 5.0 × 10¹⁴ Hz, light of 7.0 × 10¹⁴ Hz gives Kₘₐₓ closest to',
    options: ['1.33 × 10⁻¹⁹ J', '3.32 × 10⁻¹⁹ J', '4.64 × 10⁻¹⁹ J', '8.00 × 10⁻⁵ J'],
    answer: 0,
    reason:
      'Kₘₐₓ = hν − hν₀ = h(ν − ν₀) = 6.63 × 10⁻³⁴ × (7.0 − 5.0) × 10¹⁴ = 1.33 × 10⁻¹⁹ J. Option B is the work function and C is the full photon energy; only the excess goes to the electron.',
    animation: 'photon-arithmetic',
  },
  {
    id: 42,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'A photon has wavelength 500 nm. Its momentum is closest to',
    options: [
      '3.32 × 10⁻¹⁹ kg m s⁻¹',
      '2.50 × 10⁻⁴⁰ kg m s⁻¹',
      '6.63 × 10⁻³⁴ kg m s⁻¹',
      '1.33 × 10⁻²⁷ kg m s⁻¹',
    ],
    answer: 3,
    reason:
      'Photon momentum is p = h/λ = 6.63 × 10⁻³⁴ / 5.0 × 10⁻⁷ = 1.33 × 10⁻²⁷ kg m s⁻¹. Option A is the photon’s energy in joules, not its momentum; C is just h.',
    animation: 'photon-arithmetic',
  },
  {
    id: 43,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'The main purpose of Bohr’s stationary states was to explain why an electron in an allowed state',
    options: [
      'does not continuously radiate energy',
      'has no momentum',
      'has no electric charge',
      'can possess any energy',
    ],
    answer: 0,
    reason:
      'Classically an orbiting (accelerating) charge radiates, loses energy and spirals into the nucleus within nanoseconds. Bohr postulated certain orbits in which the electron simply does not radiate, making stable atoms possible and giving discrete energy levels.',
    animation: 'bohr-stability',
  },
  {
    id: 44,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'For the levels shown, the photon emitted in the transition from −1.51 eV to −13.6 eV has energy',
    options: ['10.20 eV', '12.09 eV', '15.11 eV', '1.51 eV'],
    answer: 1,
    reason:
      'Photon energy equals the gap between the levels: E = E_upper − E_lower = (−1.51) − (−13.6) = 12.09 eV. Watch the double negative; the result is a positive energy carried off by the photon (a Lyman-β line, 102.6 nm).',
    animation: 'energy-levels',
    figureIsLoadBearing: true,
  },
  {
    id: 45,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Two particles have momenta p and 2p. Their de Broglie wavelengths are in the ratio',
    options: ['1 : 2', '1 : 1', '2 : 1', '4 : 1'],
    answer: 2,
    reason:
      'λ = h/p, so wavelength is inversely proportional to momentum. The particle with momentum p has wavelength h/p; the one with 2p has h/2p, half as long. Ratio λ₁ : λ₂ = 2 : 1.',
    animation: 'de-broglie-ratio',
  },
  {
    id: 46,
    level: 2,
    topic: 'Birth of Quantum Physics',
    prompt: 'Obtaining reliable which-path information in a double-slit experiment causes the interference pattern to',
    options: [
      'become twice as bright everywhere',
      'disappear',
      'remain unchanged',
      'shift without changing contrast',
    ],
    answer: 1,
    reason:
      'Interference arises from adding amplitudes of indistinguishable paths. Once a detector can tell which slit was used, the paths are distinguishable, probabilities add instead of amplitudes, and the screen shows two overlapping single-slit blobs with no fringes.',
    animation: 'which-path',
  },
  {
    id: 47,
    level: 2,
    topic: 'Core Quantum Principles',
    prompt: 'An amplitude at one outcome is 0.6i. The probability for that outcome is',
    options: ['0.36', '0.60', '−0.36', '0.60i'],
    answer: 0,
    reason:
      'Probability is the modulus squared of the amplitude. |0.6i| = 0.6, so P = 0.6² = 0.36. Squaring the modulus (not the number itself) is what removes the i and guarantees a real, non-negative probability.',
    animation: 'born-rule',
  },
  {
    id: 48,
    level: 2,
    topic: 'Core Quantum Principles',
    prompt: 'Which pair of real amplitudes is normalized for a two-outcome state?',
    options: ['0.5 and 0.5', '0.6 and 0.8', '0.7 and 0.7', '0.8 and 0.8'],
    answer: 1,
    reason:
      'Normalization requires the probabilities to sum to 1: a² + b² = 1. Only 0.6² + 0.8² = 0.36 + 0.64 = 1 works. Note 0.7 and 0.7 is close (0.98) but not exact; the normalized version would be 1/√2 ≈ 0.707.',
    animation: 'normalisation',
  },
  {
    id: 49,
    level: 2,
    topic: 'Simple Quantum Systems',
    prompt: 'Which set (n, ℓ, mℓ, ms) is allowed?',
    options: ['(2, 2, 0, +1/2)', '(3, 1, 2, −1/2)', '(3, 2, −1, +1/2)', '(1, 0, 0, +1)'],
    answer: 2,
    reason:
      'Rules: ℓ runs from 0 to n − 1; mℓ runs from −ℓ to +ℓ; ms is ±½. A fails (ℓ = n), B fails (mℓ > ℓ), D fails (ms = +1). C passes every check: a 3d electron.',
    animation: 'quantum-numbers',
  },
  {
    id: 50,
    level: 2,
    topic: 'Real Quantum Computers',
    prompt: 'In a pure intrinsic semiconductor, the number of conduction electrons is',
    options: [
      'always zero',
      'equal to the number of holes',
      'greater than the number of holes',
      'unrelated to the number of holes',
    ],
    answer: 1,
    reason:
      'With no dopants, the only way to get a conduction electron is thermal excitation across the gap, and each such jump leaves exactly one hole in the valence band. Electrons and holes are created in pairs, so n = p = nᵢ.',
    animation: 'electron-hole-pairs',
  },
];

/** Constants footnote, as printed on the paper. */
export const CONSTANTS_NOTE =
  'h = 6.63 × 10⁻³⁴ J s, c = 3.0 × 10⁸ m s⁻¹, hc ≈ 1240 eV nm.';

export const getQuestion = (id: number): PhysicsMCQ | undefined =>
  PHYSICS_MCQS.find((q) => q.id === id);

export const questionsForLevel = (level: number): PhysicsMCQ[] =>
  PHYSICS_MCQS.filter((q) => q.level === level).sort((a, b) => a.id - b.id);
