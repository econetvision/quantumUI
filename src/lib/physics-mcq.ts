/**
 * Quantum Physics Foundations — the mixed MCQ bank, all four levels (Q1–Q100).
 *
 * Questions are data, not markup, for the same reason the Track 0 lessons are:
 * the set can then be checked mechanically. physics-mcq.test.ts asserts that
 * every answer indexes a real option, every question names an animation that
 * exists, and that the questions whose wording depends on a figure actually
 * declare one.
 *
 * `reason` is the walkthrough shown after answering. For Level 2 it is the
 * paper's own explanation; Levels 1, 3 and 4 shipped without a key, so theirs
 * were written to the same pattern — name the distractors, say why each is
 * wrong — from answers derived and tested in physics-levels.test.ts.
 */

export type AnimationId =
  // worked arithmetic (formula → substitution → result), see physics-steps.ts
  | 'arithmetic'
  | 'decimal-shift'
  | 'power-law'
  | 'inverse-proportion'
  | 'unit-circle'
  | 'complex-magnitude'
  | 'complex-rotation'
  | 'matrix-action'
  | 'tangent-slope'
  | 'shm-restoring'
  | 'period-frequency'
  | 'wave-speed'
  | 'phase-difference'
  | 'phase-separation'
  | 'wave-cancellation'
  | 'displacement-sum'
  | 'probability-bars'
  | 'blackbody-curves'
  | 'planck-quanta'
  | 'photoelectric-threshold'
  | 'photocurrent-intensity'
  | 'kmax-vs-frequency'
  | 'energy-ledger'
  | 'bohr-stability'
  | 'energy-levels'
  | 'de-broglie-ratio'
  | 'which-path'
  | 'born-rule'
  | 'normalisation'
  | 'amplitude-sum'
  | 'quantum-numbers'
  | 'shell-counting'
  | 'electron-hole-pairs'
  // Module 02 lesson figures (no question in the bank uses these yet)
  | 'newton-cart'
  | 'energy-conservation'
  | 'electric-field'
  | 'induction'
  | 'em-spectrum'
  | 'scale-ladder'
  // Modules 03–06
  | 'compton'
  | 'electron-diffraction'
  | 'bloch-sphere'
  | 'measurement-collapse'
  | 'wave-in-box'
  | 'tunnelling'
  | 'uncertainty'
  | 'incompatible-observables'
  | 'operator-action'
  | 'time-evolution'
  | 'hydrogen-orbital'
  // Module 07
  | 'stern-gerlach'
  | 'two-qubit'
  | 'bell-test'
  | 'cloning-attempt'
  // Modules 08–09
  | 'circuit'
  | 'classical-gates'
  | 'period-finding'
  | 'grover-scaling'
  | 'hardware'
  | 'decoherence'
  | 'repetition-code';

/**
 * Per-question inputs to a figure: which wavelength, which matrix, which
 * phase. Kept to primitives and flat number lists so the bank stays plain
 * data; anything structured is encoded as a string the figure parses.
 */
export type FigureParams = Record<string, number | string | boolean | number[]>;

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
  /** Inputs for the figure. Omitted when the figure's defaults are the question's numbers. */
  params?: FigureParams;
  /**
   * Set when the question cannot be answered without seeing the figure —
   * "the two curves shown", "the displayed distribution". For these the
   * animation is the question, not an illustration of it, so it must render
   * before the options are readable.
   */
  figureIsLoadBearing?: boolean;
}

export const PHYSICS_MCQS: PhysicsMCQ[] = [
  // ---------------------------------------------------------------------------
  // Level 1 — Q1 to Q25. No answer key was supplied; every answer below is
  // derived in physics-levels.test.ts from the functions the figures use.
  // ---------------------------------------------------------------------------
  {
    id: 1,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'Which is the correct scientific notation for 0.0000042?',
    options: ['4.2 × 10⁻⁵', '42 × 10⁻⁶', '0.42 × 10⁻⁶', '4.2 × 10⁻⁶'],
    answer: 3,
    reason:
      'Scientific notation puts exactly one non-zero digit before the point. Moving the point six places to the right turns 0.0000042 into 4.2, so the exponent is −6. Option A moves it only five places; B and C have the right power of ten but 42 and 0.42 are not between 1 and 10.',
    animation: 'decimal-shift',
    params: { value: '0.0000042', places: 6 },
  },
  {
    id: 2,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'If y is proportional to x², what happens to y when x is doubled?',
    options: ['It doubles', 'It becomes half', 'It becomes four times', 'It becomes eight times'],
    answer: 2,
    reason:
      'y ∝ x² means y = kx². Replace x by 2x and y becomes k(2x)² = 4kx²: four times. Doubling (A) would be the answer for y ∝ x, eight times (D) for y ∝ x³, and halving (B) needs an inverse relation.',
    animation: 'power-law',
    params: { k: 2, from: 1, to: 2 },
  },
  {
    id: 3,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'At an angle of 90°, the value of sin θ is',
    options: ['0', '1', '−1', '1/2'],
    answer: 1,
    reason:
      'On the unit circle sin θ is the height of the point at angle θ. At 90° the point sits straight up at (0, 1), so sin 90° = 1. It is 0 at 0° and 180°, −1 at 270°, and ½ at 30° — each distractor is a different angle’s value.',
    animation: 'unit-circle',
    params: { deg: 90 },
  },
  {
    id: 4,
    level: 1,
    topic: 'Classical Physics Foundations',
    prompt: 'Two equal sine waves differ in phase by 180°. At every instant, their resultant displacement is',
    options: ['twice either amplitude', 'equal to one amplitude', 'zero', 'four times either amplitude'],
    answer: 2,
    reason:
      'A phase difference of 180° puts one wave at a crest exactly when the other is at a trough. Their displacements are equal and opposite at every instant, so the algebraic sum is zero everywhere: complete destructive interference. Twice the amplitude (A) is the in-phase case; four times (D) confuses amplitude with intensity, which goes as the square.',
    animation: 'wave-cancellation',
    params: { holdDeg: 180 },
  },
  {
    id: 5,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'Four mutually exclusive outcomes have probabilities 0.10, 0.25, 0.40 and 0.25. Their total probability is',
    options: ['0.40', '1.00', '0.75', '1.25'],
    answer: 1,
    reason:
      'Mutually exclusive outcomes that cover every possibility must have probabilities summing to exactly 1: 0.10 + 0.25 + 0.40 + 0.25 = 1.00. Option A is the single largest value, not the total; 0.75 drops one of the 0.25s; 1.25 double-counts it. A total other than 1 would mean the list was incomplete or overlapping.',
    animation: 'probability-bars',
    params: { values: [0.1, 0.25, 0.4, 0.25], stack: true },
  },
  {
    id: 6,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'The magnitude of the complex number 3 + 4i is',
    options: ['3', '4', '5', '7'],
    answer: 2,
    reason:
      'The magnitude of a + bi is √(a² + b²), the length of the arrow from the origin to the point (3, 4). That is √(9 + 16) = √25 = 5 — the 3-4-5 triangle. Options A and B are the two components on their own, and 7 is their plain sum, which would only be right if the arrow ran along a single axis.',
    animation: 'complex-magnitude',
    params: { re: 3, im: 4 },
  },
  {
    id: 7,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'A 2 × 2 matrix multiplied by a two-component column vector produces',
    options: ['a single number only', 'a 2 × 2 matrix', 'a two-component column vector', 'a three-component vector'],
    answer: 2,
    reason:
      'Each row of the 2 × 2 matrix is dotted with the column vector to give one number, and there are two rows, so the result is two numbers stacked: another two-component column vector. A single number (A) is what an inner product of two vectors gives; a 2 × 2 matrix (B) comes from multiplying two matrices; nothing in a 2 × 2 setup can produce a third component (D). This is exactly how a gate acts on a qubit state.',
    animation: 'matrix-action',
    params: { matrix: 'X', vector: [1, 0], emphasis: 'shape' },
  },
  {
    id: 8,
    level: 1,
    topic: 'Mathematical Foundations',
    prompt: 'On a position–time graph, the derivative dx/dt represents',
    options: ['instantaneous velocity', 'instantaneous acceleration', 'displacement only', 'time period'],
    answer: 0,
    reason:
      'The derivative dx/dt is the slope of the position–time graph, and the slope of position against time is the velocity at that instant. Acceleration (B) is the slope of the velocity–time graph, d²x/dt²; displacement (C) is the height of the graph, not its slope; the period (D) is a property of repeating motion, not a derivative.',
    animation: 'tangent-slope',
  },
  {
    id: 9,
    level: 1,
    topic: 'Classical Physics Foundations',
    prompt: 'An oscillator completes 5 cycles in 2.0 s. Its frequency is',
    options: ['2.5 Hz', '0.40 Hz', '5.0 Hz', '10 Hz'],
    answer: 0,
    reason:
      'Frequency is cycles per second: 5 cycles ÷ 2.0 s = 2.5 Hz. Option B (0.40) is the period in seconds, the seconds per cycle, which is the reciprocal; 5.0 Hz forgets to divide by the time; 10 Hz multiplies instead of dividing.',
    animation: 'period-frequency',
    params: { cycles: 5, seconds: 2, ask: 'frequency' },
  },
  {
    id: 10,
    level: 1,
    topic: 'Classical Physics Foundations',
    prompt: 'A wave has frequency 20 Hz and wavelength 0.50 m. Its speed is',
    options: ['0.025 m s⁻¹', '20 m s⁻¹', '40 m s⁻¹', '10 m s⁻¹'],
    answer: 3,
    reason:
      'A wave advances one wavelength every period, so its speed is v = fλ = 20 Hz × 0.50 m = 10 m s⁻¹. Dividing instead of multiplying gives 40 (C) or 0.025 (A); 20 m s⁻¹ (B) just repeats the frequency with different units.',
    animation: 'wave-speed',
    params: { f: 20, lambda: 0.5, ask: 'v' },
  },
  {
    id: 11,
    level: 1,
    topic: 'Classical Physics Foundations',
    prompt: 'When two waves overlap, the resultant displacement at a point equals',
    options: ['the product of their amplitudes', 'the algebraic sum of their displacements', 'the larger displacement only', 'the average frequency'],
    answer: 1,
    reason:
      'This is the principle of superposition: where two waves overlap, the displacement of the medium is the algebraic sum of the two individual displacements, sign included. That one rule produces both constructive and destructive interference. Amplitudes are not multiplied (A), the larger one does not win (C), and frequency is not what is being added (D).',
    animation: 'wave-cancellation',
  },
  {
    id: 12,
    level: 1,
    topic: 'Classical Physics Foundations',
    prompt: 'Two equal waves arrive in phase. The amplitude of the resultant is',
    options: ['zero', 'the same as either wave', 'four times the amplitude of either wave', 'twice the amplitude of either wave'],
    answer: 3,
    reason:
      'In phase means crest meets crest and trough meets trough. The displacements add at every point, so the resultant has twice the amplitude of either wave. Zero (A) is the 180° case; four times (C) is what happens to the intensity, since intensity ∝ amplitude², not to the amplitude itself.',
    animation: 'wave-cancellation',
    params: { holdDeg: 0 },
  },
  {
    id: 13,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'Planck’s proposal for an oscillator of frequency ν was that its energy changes in steps of',
    options: ['hc', 'h/ν', 'ν/h', 'hν'],
    answer: 3,
    reason:
      'Planck’s hypothesis was that an oscillator of frequency ν can only gain or lose energy in whole packets of size hν. That is why the energy is proportional to frequency: high-frequency packets are expensive, which tames the ultraviolet catastrophe. h/ν and ν/h have the wrong dependence, and hc is not even an energy without a wavelength underneath it.',
    animation: 'planck-quanta',
  },
  {
    id: 14,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'The ultraviolet catastrophe refers to the classical prediction that a hot body emits',
    options: ['no energy at short wavelengths', 'only one wavelength', 'unbounded energy at very short wavelengths', 'the same energy at all wavelengths'],
    answer: 2,
    reason:
      'Classical equipartition gives every mode of the cavity the same average energy kT. There are ever more modes at shorter wavelength, so the predicted intensity climbs without limit toward the ultraviolet — the “catastrophe”, because a hot body would radiate infinite power. Real curves turn over and fall to zero at short λ, which is what Planck’s packets explain.',
    animation: 'blackbody-curves',
    params: { classical: true },
  },
  {
    id: 15,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'For the same metal, photoemission first becomes possible when incident light reaches the',
    options: ['threshold frequency', 'saturation current', 'stopping potential', 'electron spin'],
    answer: 0,
    reason:
      'Emission begins the moment a single photon carries at least the work function, hν ≥ Φ. The frequency at which that first happens, ν₀ = Φ/h, is the threshold frequency. Saturation current (B) and stopping potential (C) are measured after emission is already happening; spin (D) is irrelevant here.',
    animation: 'photoelectric-threshold',
    params: { sweep: true },
  },
  {
    id: 16,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'The work function of a surface is the minimum energy needed to',
    options: ['remove an electron from the surface', 'stop all incident photons', 'create a proton', 'double the electron charge'],
    answer: 0,
    reason:
      'The work function Φ is the minimum energy that must be supplied to free an electron from the surface. A photon with energy hν spends Φ getting the electron out and the rest, hν − Φ, becomes the electron’s kinetic energy. It does not stop photons, make protons or change the electron’s charge.',
    animation: 'energy-ledger',
    params: { photonNm: 400, phiEv: 2.0, define: true },
  },
  {
    id: 17,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'At fixed frequency above threshold, increasing light intensity mainly increases the',
    options: ['stopping potential', 'maximum electron energy', 'saturation current', 'work function'],
    answer: 2,
    reason:
      'Above threshold, intensity is the number of photons arriving per second. More photons free more electrons per second, so the saturation current rises. Each photon still carries the same hν, so the maximum electron energy (B) and hence the stopping potential (A) do not change; the work function (D) is a property of the metal.',
    animation: 'photocurrent-intensity',
    params: { ratio: 2 },
  },
  {
    id: 18,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'A photon of frequency 6.0 × 10¹⁴ Hz has energy closest to',
    options: ['1.11 × 10⁻⁴⁸ J', '3.98 × 10⁻¹⁹ J', '1.99 × 10⁻²⁵ J', '9.95 × 10⁻⁴¹ J'],
    answer: 1,
    reason:
      'E = hν = 6.63 × 10⁻³⁴ J s × 6.0 × 10¹⁴ s⁻¹ = 3.98 × 10⁻¹⁹ J, about 2.5 eV — a visible photon. Option A divides instead of multiplying; C and D come from mis-adding the exponents (−34 + 14 = −20, and the 39.8 then carries it to −19).',
    animation: 'arithmetic',
    params: { op: 'photon-energy-hz', a: 6.0e14 },
  },
  {
    id: 19,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'Discrete atomic line spectra indicate that atoms have',
    options: ['only continuous energies', 'no internal structure', 'identical energies for all states', 'discrete allowed energy differences'],
    answer: 3,
    reason:
      'A line spectrum means the atom emits only particular wavelengths. Each line is a photon whose energy equals the gap between two allowed levels, so sharp lines mean sharp, discrete energy differences. Continuous energies (A) would give a continuous spectrum; identical energies (C) would give no light at all.',
    animation: 'energy-levels',
    params: { spectrum: true },
  },
  {
    id: 20,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'In the Bohr model, light is emitted when an electron',
    options: ['remains in one stationary level', 'moves from lower to higher without absorbing energy', 'moves from a higher allowed level to a lower one', 'loses its charge'],
    answer: 2,
    reason:
      'In Bohr’s model an electron in a stationary state does not radiate. Light is emitted only when it jumps from a higher allowed level to a lower one, carrying away the energy difference as a photon of energy hν = E_upper − E_lower. Moving upward (B) requires absorbing energy, not emitting it.',
    animation: 'energy-levels',
    params: { from: 3, to: 1 },
  },
  {
    id: 21,
    level: 1,
    topic: 'Birth of Quantum Physics',
    prompt: 'If a particle’s momentum increases, its de Broglie wavelength',
    options: ['increases', 'decreases', 'remains unchanged', 'becomes equal to its charge'],
    answer: 1,
    reason:
      'λ = h/p: wavelength and momentum are inversely proportional. Increase the momentum and the wavelength shrinks — which is why fast electrons resolve finer detail in a microscope than slow ones. It does not stay constant, and charge never enters the de Broglie relation.',
    animation: 'de-broglie-ratio',
    params: { ratio: 2 },
  },
  {
    id: 22,
    level: 1,
    topic: 'Core Quantum Principles',
    prompt: 'In a single-particle double-slit experiment, many detections gradually build',
    options: ['only two bright points', 'a uniform screen', 'an interference pattern', 'a single permanent point'],
    answer: 2,
    reason:
      'Each particle arrives at one point, but where it lands is governed by the interference of the amplitudes through the two slits. As detections accumulate, the dots fill in the fringe pattern — bright bands where the amplitudes add, dark where they cancel. Two bright points (A) would need classical bullets; a uniform screen (B) would need no interference at all.',
    animation: 'which-path',
    params: { mode: 'build' },
  },
  {
    id: 23,
    level: 1,
    topic: 'Core Quantum Principles',
    prompt: 'If a wavefunction has amplitude ψ at a position, the probability density there is',
    options: ['ψ/2', '2ψ', '|ψ|²', '1/ψ'],
    answer: 2,
    reason:
      'The Born rule: the probability density is the squared modulus |ψ|², never ψ itself. Squaring is what turns a complex amplitude, phase and all, into a real non-negative probability. ψ/2, 2ψ and 1/ψ are all still amplitudes, and none of them is guaranteed to be real or positive.',
    animation: 'born-rule',
    params: { rotate: true },
  },
  {
    id: 24,
    level: 1,
    topic: 'Core Quantum Principles',
    prompt: 'For a normalized state with only two possible outcomes, probabilities 0.36 and P give',
    options: ['P = 0.36', 'P = 1.36', 'P = 0.80', 'P = 0.64'],
    answer: 3,
    reason:
      'Normalised means the probabilities of all outcomes sum to 1. With only two outcomes, P = 1 − 0.36 = 0.64. Option A repeats the given value, B adds instead of subtracting, and 0.80 is the amplitude whose square is 0.64, not the probability itself.',
    animation: 'normalisation',
    params: { known: [0.36], solve: true },
  },
  {
    id: 25,
    level: 1,
    topic: 'Simple Quantum Systems',
    prompt: 'For an electron with n = 3, which value of ℓ is allowed?',
    options: ['3', '2', '−1', '4'],
    answer: 1,
    reason:
      'ℓ runs from 0 up to n − 1, so for n = 3 the allowed values are 0, 1 and 2 (the 3s, 3p and 3d subshells). ℓ = 3 and ℓ = 4 are too large for this shell, and ℓ can never be negative. Only option B is on the list.',
    animation: 'quantum-numbers',
    params: { sets: '3,3,0,0.5;3,2,0,0.5;3,-1,0,0.5;3,4,0,0.5' },
  },
  // ---------------------------------------------------------------------------
  // Level 2 — Q26 to Q50, with the paper's own walkthroughs.
  // ---------------------------------------------------------------------------
  {
    id: 26,
    level: 2,
    topic: 'Mathematical Foundations',
    prompt: 'The value (6 × 10⁸)/(3 × 10²) is',
    options: ['2 × 10⁵', '18 × 10⁶', '2 × 10⁶', '2 × 10¹⁰'],
    answer: 2,
    reason:
      'Divide the coefficients (6 ÷ 3 = 2) and subtract the exponents (8 − 2 = 6). Dividing powers of ten never multiplies the exponents.',
    animation: 'arithmetic',
    params: { op: 'divide-sci', a: 6e8, b: 3e2 },
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
    params: { values: [0.1, 0.25, 0.4, 0.25] },
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
    animation: 'matrix-action',
    params: { matrix: 'X', vector: [1, 0] },
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
    animation: 'arithmetic',
    params: { op: 'kmax-hz', a: 7.0e14, b: 5.0e14 },
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
    animation: 'arithmetic',
    params: { op: 'photon-momentum-nm', a: 500 },
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
  // ---------------------------------------------------------------------------
  // Level 3 — Q51 to Q75. Answers derived in physics-levels.test.ts.
  // ---------------------------------------------------------------------------
  {
    id: 51,
    level: 3,
    topic: 'Mathematical Foundations',
    prompt: 'A length changes from 3.0 × 10⁻⁹ m to 1.2 × 10⁻⁸ m. It has increased by a factor of',
    options: ['0.25', '4', '3', '40'],
    answer: 1,
    reason:
      'Divide the coefficients and subtract the exponents: 1.2 ÷ 3.0 = 0.4, and 10⁻⁸ ÷ 10⁻⁹ = 10¹, giving 0.4 × 10 = 4. Option A (0.25) is the ratio the wrong way round; 3 and 40 come from mishandling the powers of ten.',
    animation: 'arithmetic',
    params: { op: 'divide-sci', a: 1.2e-8, b: 3.0e-9 },
  },
  {
    id: 52,
    level: 3,
    topic: 'Mathematical Foundations',
    prompt: 'For x(t) = 3t², with x in metres and t in seconds, the velocity at t = 2 s is',
    options: ['12 m s⁻¹', '6 m s⁻¹', '9 m s⁻¹', '18 m s⁻¹'],
    answer: 0,
    reason:
      'Velocity is the derivative of position: v = dx/dt = 6t. At t = 2 s, v = 12 m s⁻¹. Six (B) is the coefficient alone, or 6t at t = 1; 9 and 18 come from substituting into 3t² or 3t³ instead of differentiating.',
    animation: 'tangent-slope',
    params: { curve: 'quadratic', at: 2 },
  },
  {
    id: 53,
    level: 3,
    topic: 'Classical Physics Foundations',
    prompt: 'An oscillator has frequency 4.0 Hz. During 2.5 s it completes',
    options: ['10 cycles', '1.6 cycles', '6.5 cycles', '16 cycles'],
    answer: 0,
    reason:
      'Frequency is cycles per second, so cycles = f × t = 4.0 Hz × 2.5 s = 10 cycles. Dividing instead (1.6, option B) inverts the definition; 6.5 adds the two numbers; 16 squares the frequency.',
    animation: 'period-frequency',
    params: { cycles: 10, seconds: 2.5, ask: 'cycles' },
  },
  {
    id: 54,
    level: 3,
    topic: 'Classical Physics Foundations',
    prompt: 'A wave travels at 240 m s⁻¹ and has frequency 80 Hz. Its wavelength is',
    options: ['0.33 m', '160 m', '3.0 m', '19 200 m'],
    answer: 2,
    reason:
      'v = fλ, so λ = v/f = 240 ÷ 80 = 3.0 m. Option A is f/v, B subtracts, and 19 200 m multiplies — the wavelength has to be a distance that fits 80 times into the 240 m travelled each second.',
    animation: 'wave-speed',
    params: { v: 240, f: 80, ask: 'lambda' },
  },
  {
    id: 55,
    level: 3,
    topic: 'Classical Physics Foundations',
    prompt: 'Two equal waves each have amplitude 3.0 cm. At one instant their displacements are +2.0 cm and −1.5 cm. The resultant displacement is',
    options: ['+3.5 cm', '−0.5 cm', '+6.0 cm', '+0.5 cm'],
    answer: 3,
    reason:
      'Superposition adds displacements algebraically, signs included: (+2.0) + (−1.5) = +0.5 cm. The amplitudes (3.0 cm each) are not what you add; +3.5 ignores the minus sign; +6.0 is the sum of the amplitudes; −0.5 has the sign wrong.',
    animation: 'displacement-sum',
    params: { a: 2.0, b: -1.5, amplitude: 3.0 },
  },
  {
    id: 56,
    level: 3,
    topic: 'Classical Physics Foundations',
    prompt: 'Two points on a sinusoidal wave are separated by one-quarter wavelength. Their phase difference is',
    options: ['π/2 rad', 'π/4 rad', 'π rad', '2π rad'],
    answer: 0,
    reason:
      'One full wavelength corresponds to a phase change of 2π. A quarter of a wavelength is therefore a quarter of 2π: Δφ = 2π × (λ/4)/λ = π/2 rad. π would be half a wavelength and 2π a whole one; π/4 would be an eighth.',
    animation: 'phase-separation',
    params: { d: 0.25, lambda: 1 },
  },
  {
    id: 57,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A 450 nm photon has energy closest to',
    options: ['1.82 eV', '2.76 eV', '4.50 eV', '5.51 eV'],
    answer: 1,
    reason:
      'With hc ≈ 1240 eV nm, E = 1240/450 = 2.76 eV — blue light. 1.82 eV would be a 680 nm red photon; 4.50 just repeats the wavelength digits; 5.51 is roughly double.',
    animation: 'arithmetic',
    params: { op: 'photon-energy-nm', a: 450 },
  },
  {
    id: 58,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A metal has work function 2.0 eV and is illuminated by 400 nm light. The stopping potential is closest to',
    options: ['2.00 V', '3.10 V', '0.40 V', '1.10 V'],
    answer: 3,
    reason:
      'The photon energy is 1240/400 = 3.10 eV. Subtract the work function: Kₘₐₓ = 3.10 − 2.0 = 1.10 eV, and the stopping potential in volts equals Kₘₐₓ in electronvolts, so V₀ = 1.10 V. Option B is the whole photon energy, A the work function, and 0.40 V is a subtraction slip.',
    animation: 'energy-ledger',
    params: { photonNm: 400, phiEv: 2.0 },
  },
  {
    id: 59,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A metal has work function 2.5 eV. Its threshold wavelength is closest to',
    options: ['496 nm', '310 nm', '620 nm', '1240 nm'],
    answer: 0,
    reason:
      'At threshold the photon energy just equals the work function: hc/λ₀ = Φ, so λ₀ = 1240/2.5 = 496 nm. Light of longer wavelength than this cannot eject electrons no matter how bright. 310 nm is 1240/4, 620 nm is 1240/2, and 1240 nm is 1240/1.',
    animation: 'arithmetic',
    params: { op: 'threshold-nm', a: 2.5 },
  },
  {
    id: 60,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'At fixed frequency above threshold, the light intensity is tripled. Ideally, the saturation current becomes',
    options: ['three times as large', 'nine times as large', 'one-third as large', 'unchanged'],
    answer: 0,
    reason:
      'At fixed frequency, tripling the intensity triples the number of photons per second, so three times as many electrons are freed per second: the saturation current becomes three times as large. Nine times (B) would need a square-law relation that is not there; the stopping potential, by contrast, would not move at all.',
    animation: 'photocurrent-intensity',
    params: { ratio: 3 },
  },
  {
    id: 61,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A stopping potential of 1.8 V corresponds to a maximum kinetic energy of',
    options: ['1.13 × 10⁻¹⁹ J', '1.80 × 10⁻¹⁹ J', '4.61 × 10⁻¹⁹ J', '2.88 × 10⁻¹⁹ J'],
    answer: 3,
    reason:
      'A stopping potential of 1.8 V means the fastest electrons have 1.8 eV of kinetic energy. In joules, 1.8 × 1.60 × 10⁻¹⁹ = 2.88 × 10⁻¹⁹ J. Option B just writes 1.8 with a ×10⁻¹⁹; A divides by 1.6; C multiplies by 1.6 twice.',
    animation: 'arithmetic',
    params: { op: 'ev-to-joule', a: 1.8 },
  },
  {
    id: 62,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A photon of wavelength 600 nm has momentum closest to',
    options: ['3.68 × 10⁻⁴⁰ kg m s⁻¹', '3.32 × 10⁻¹⁹ kg m s⁻¹', '1.11 × 10⁻²⁷ kg m s⁻¹', '6.00 × 10⁻²⁷ kg m s⁻¹'],
    answer: 2,
    reason:
      'p = h/λ = 6.63 × 10⁻³⁴ ÷ 6.00 × 10⁻⁷ = 1.105 × 10⁻²⁷ ≈ 1.11 × 10⁻²⁷ kg m s⁻¹. Option A multiplies instead of dividing; B is an energy in joules, not a momentum; D keeps the 6.00 from the wavelength as if it were the answer.',
    animation: 'arithmetic',
    params: { op: 'photon-momentum-nm', a: 600 },
  },
  {
    id: 63,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'An atom has levels at −13.6 eV and −3.4 eV. The wavelength emitted in a transition between them is closest to',
    options: ['122 nm', '91 nm', '365 nm', '1020 nm'],
    answer: 0,
    reason:
      'The gap is 13.6 − 3.4 = 10.2 eV, so λ = 1240/10.2 ≈ 122 nm — the Lyman-α line, in the ultraviolet. 91 nm is the series limit (13.6 eV), 365 nm the Balmer limit, and 1020 nm is 1240/1.2, a slip in the subtraction.',
    animation: 'energy-levels',
    params: { from: 2, to: 1, wavelength: true },
  },
  {
    id: 64,
    level: 3,
    topic: 'Birth of Quantum Physics',
    prompt: 'A particle has momentum 3.0 × 10⁻²⁴ kg m s⁻¹. Its de Broglie wavelength is closest to',
    options: ['2.21 × 10⁻¹⁰ m', '4.52 × 10⁹ m', '1.99 × 10⁻⁵⁷ m', '9.05 × 10⁻³ m'],
    answer: 0,
    reason:
      'λ = h/p = 6.63 × 10⁻³⁴ ÷ 3.0 × 10⁻²⁴ = 2.21 × 10⁻¹⁰ m, about 0.2 nm — comparable to atomic spacings, which is why electrons of this momentum diffract from crystals. Options B and D have the exponent sign wrong, and C multiplies h by p instead of dividing.',
    animation: 'arithmetic',
    params: { op: 'de-broglie', a: 3.0e-24 },
  },
  {
    id: 65,
    level: 3,
    topic: 'Core Quantum Principles',
    prompt: 'A normalized state has real amplitudes a and 0.8, with a positive. The value of a is',
    options: ['0.2', '0.6', '0.36', '1.8'],
    answer: 1,
    reason:
      'Normalisation applies to the squares of the amplitudes: a² + 0.8² = 1, so a² = 1 − 0.64 = 0.36 and a = 0.6 (taking the positive root). Option C (0.36) stops at the probability without taking the root; 0.2 is 1 − 0.8, treating amplitudes as if they add to 1; 1.8 adds them.',
    animation: 'normalisation',
    params: { known: [0.8], amplitudes: true },
  },
  {
    id: 66,
    level: 3,
    topic: 'Core Quantum Principles',
    prompt: 'Two alternatives have amplitudes 1/2 and i/2. If they lead to distinguishable outcomes, the total probability of either outcome is',
    options: ['1/2', '0', '1/4', '1'],
    answer: 0,
    reason:
      'If the two alternatives can be told apart, their probabilities add: |½|² + |i/2|² = ¼ + ¼ = ½. There is no interference term, because distinguishable paths do not share an amplitude. (Adding the amplitudes first would also give ½ here, |½ + i/2|² = ¼ + ¼, but only because these two happen to be at right angles — the rule that applies is the sum of squares.)',
    animation: 'amplitude-sum',
    params: { a: [0.5, 0], b: [0, 0.5], mode: 'distinguishable' },
  },
  {
    id: 67,
    level: 3,
    topic: 'Core Quantum Principles',
    prompt: 'The matrix [[1, 0], [0, −1]] acts on the column vector [1/√2, 1/√2]. The result is',
    options: ['[−1/√2, 1/√2]', '[1/2, −1/2]', '[1/√2, 1/√2]', '[1/√2, −1/√2]'],
    answer: 3,
    reason:
      'The matrix [[1, 0], [0, −1]] is the Pauli-Z gate. It leaves the first component alone and flips the sign of the second: [1/√2, 1/√2] becomes [1/√2, −1/√2] — the state |+⟩ turns into |−⟩. The lengths are unchanged (ruling out B), the order is not swapped (that would be X), and only the second sign changes (ruling out A and C).',
    animation: 'matrix-action',
    params: { matrix: 'Z', vector: [0.7071, 0.7071], labels: '1/√2,1/√2' },
  },
  {
    id: 68,
    level: 3,
    topic: 'Simple Quantum Systems',
    prompt: 'A shell with n = 4 contains how many subshells?',
    options: ['3', '8', '4', '16'],
    answer: 2,
    reason:
      'For a given n the azimuthal number ℓ takes every integer from 0 to n − 1, so n = 4 has ℓ = 0, 1, 2, 3: four subshells (4s, 4p, 4d, 4f). Eight (B) is the number of electrons in n = 2, sixteen (D) the number of orbitals in n = 4, and three stops one short.',
    animation: 'shell-counting',
    params: { n: 4, highlight: 'subshells' },
  },
  {
    id: 69,
    level: 3,
    topic: 'Simple Quantum Systems',
    prompt: 'How many orbitals are present in an ℓ = 2 subshell?',
    options: ['5', '2', '3', '10'],
    answer: 0,
    reason:
      'An ℓ = 2 (d) subshell has mℓ = −2, −1, 0, +1, +2: five orbitals. Ten (D) is the number of electrons those five orbitals hold once spin is counted; three is the count for ℓ = 1, and two is the number of spin states.',
    animation: 'shell-counting',
    params: { n: 3, l: 2, highlight: 'orbitals' },
  },
  {
    id: 70,
    level: 3,
    topic: 'Simple Quantum Systems',
    prompt: 'The maximum number of electrons in an n = 3 shell is',
    options: ['6', '18', '9', '32'],
    answer: 1,
    reason:
      'The n = 3 shell has n² = 9 orbitals (one 3s, three 3p, five 3d), each holding two electrons of opposite spin: 2n² = 18. Nine (C) forgets spin, six (A) is just the 3p subshell, and 32 is the capacity of n = 4.',
    animation: 'shell-counting',
    params: { n: 3, highlight: 'electrons' },
  },
  {
    id: 71,
    level: 3,
    topic: 'Simple Quantum Systems',
    prompt: 'For n = 3 and ℓ = 1, how many distinct allowed combinations of mℓ and ms exist?',
    options: ['3', '6', '4', '9'],
    answer: 1,
    reason:
      'ℓ = 1 gives three values of mℓ (−1, 0, +1) and each pairs with two values of ms (±½): 3 × 2 = 6 combinations, the six electrons of a full 3p subshell. Three (A) counts orbitals only; four and nine do not factor as (2ℓ + 1) × 2.',
    animation: 'shell-counting',
    params: { n: 3, l: 1, highlight: 'electrons' },
  },
  {
    id: 72,
    level: 3,
    topic: 'Simple Quantum Systems',
    prompt: 'Two electrons in the same orbital must differ in',
    options: ['principal quantum number', 'azimuthal quantum number', 'magnetic quantum number', 'spin quantum number'],
    answer: 3,
    reason:
      'Two electrons in the same orbital already share n, ℓ and mℓ — that is what “same orbital” means. The Pauli exclusion principle forbids identical sets of all four quantum numbers, so the only one left to differ is the spin quantum number ms: one is +½, the other −½.',
    animation: 'shell-counting',
    params: { n: 2, l: 1, ml: 0, highlight: 'pairing' },
  },
  {
    id: 73,
    level: 3,
    topic: 'Core Quantum Principles',
    prompt: 'Which description best distinguishes a quantum superposition from an ordinary mixture?',
    options: [
      'A mixture always has complex probabilities',
      'A superposition includes relative phase that can affect later probabilities',
      'A superposition assigns probabilities larger than one',
      'A mixture necessarily produces interference',
    ],
    answer: 1,
    reason:
      'A mixture is classical ignorance: the system is in one state or the other with some probabilities, and those probabilities simply add. A superposition carries a relative phase between its amplitudes, and that phase changes the probabilities of later outcomes — it can produce interference. Mixtures have ordinary real probabilities (not A), no state assigns a probability above one (not C), and interference is exactly what a mixture cannot do (not D).',
    animation: 'amplitude-sum',
    params: { mode: 'sweep' },
  },
  {
    id: 74,
    level: 3,
    topic: 'Core Quantum Principles',
    prompt: 'A double-slit pattern changes from fringes to two broad single-slit contributions when path detectors are switched on. The evidence indicates that',
    options: [
      'available path information destroys the relevant interference',
      'photons have stopped arriving',
      'the wavelength has become zero',
      'probabilities no longer sum to one',
    ],
    answer: 0,
    reason:
      'Switching on path detectors makes the two routes distinguishable, so the rule changes from adding amplitudes to adding probabilities and the interference term vanishes; what remains is the sum of two single-slit patterns. Photons still arrive (not B), the wavelength is unchanged (not C), and probabilities still sum to one (not D) — it is specifically the available which-path information that removes the fringes.',
    animation: 'which-path',
  },
  {
    id: 75,
    level: 3,
    topic: 'Real Quantum Computers',
    prompt: 'Heating an intrinsic semiconductor generally increases its conductivity because',
    options: [
      'its energy gap becomes infinite',
      'all electrons stop moving',
      'electron charge increases',
      'more electrons gain access to the conduction band, leaving holes',
    ],
    answer: 3,
    reason:
      'In an intrinsic semiconductor the only carriers are electrons thermally excited across the band gap and the holes they leave behind. Heating raises the number of such excitations, so there are more electrons in the conduction band and more holes in the valence band, and conductivity rises. The gap does not change (not A), electrons do not stop (not B), and charge is fixed (not C).',
    animation: 'electron-hole-pairs',
  },
  // ---------------------------------------------------------------------------
  // Level 4 — Q76 to Q100. Answers derived in physics-levels.test.ts.
  // ---------------------------------------------------------------------------
  {
    id: 76,
    level: 4,
    topic: 'Mathematical Foundations',
    prompt: 'A quantity y is proportional to √x. If x changes from 4.0 × 10⁻⁶ to 9.0 × 10⁻⁶, y changes by a factor of',
    options: ['2.25', '1.5', '0.67', '3.0'],
    answer: 1,
    reason:
      'y ∝ √x, so the factor is √(9.0 × 10⁻⁶ ÷ 4.0 × 10⁻⁶) = √2.25 = 1.5. Option A (2.25) is the ratio of x itself, forgetting the square root; 0.67 is the inverse of 1.5; 3.0 is √9 without the √4 underneath.',
    animation: 'power-law',
    params: { k: 0.5, from: 4e-6, to: 9e-6 },
  },
  {
    id: 77,
    level: 4,
    topic: 'Classical Physics Foundations',
    prompt: 'Two waves of equal amplitude have a phase difference of π/2. At an instant when the first displacement is at its positive maximum, the second displacement is',
    options: ['at its positive maximum', 'at its negative maximum', 'twice the amplitude', 'zero'],
    answer: 3,
    reason:
      'A phase difference of π/2 is a quarter cycle. When the first wave is at its positive maximum (phase 90°), the second is at 90° ± 90° — either 0° or 180° — where a sine is zero. So the second displacement is zero at that instant. Positive maximum (A) would need 0° difference, negative maximum (B) 180°, and twice the amplitude is a resultant, not a single wave’s displacement.',
    animation: 'phase-difference',
    params: { deg: 90 },
  },
  {
    id: 78,
    level: 4,
    topic: 'Classical Physics Foundations',
    prompt: 'A 50 Hz oscillator produces waves of speed 20 m s⁻¹. Two points separated by 0.10 m have phase difference',
    options: ['π/4 rad', 'π rad', 'π/2 rad', '2π rad'],
    answer: 2,
    reason:
      'First get the wavelength: λ = v/f = 20/50 = 0.40 m. Then 0.10 m is a quarter of a wavelength, and a quarter wavelength is a quarter of 2π: Δφ = 2π × 0.10/0.40 = π/2 rad. π/4 would be an eighth of a wavelength, π a half, 2π a whole one.',
    animation: 'phase-separation',
    params: { d: 0.1, lambda: 0.4, v: 20, f: 50 },
  },
  {
    id: 79,
    level: 4,
    topic: 'Mathematical Foundations',
    prompt: 'A probability distribution assigns 0.12, 0.28 and 0.35 to three outcomes. The probability of the only remaining outcome is',
    options: ['0.25', '0.15', '0.35', '0.75'],
    answer: 0,
    reason:
      'The probabilities of a complete set of outcomes sum to 1: 0.12 + 0.28 + 0.35 = 0.75, so the remaining outcome has 1 − 0.75 = 0.25. Option D is the sum of the three given, C repeats the largest of them, and 0.15 is a subtraction slip.',
    animation: 'normalisation',
    params: { known: [0.12, 0.28, 0.35], solve: true },
  },
  {
    id: 80,
    level: 4,
    topic: 'Core Quantum Principles',
    prompt: 'Two complex amplitudes for the same indistinguishable result are 1/2 and −1/2. The probability of that result is',
    options: ['1/4', '0', '1/2', '1'],
    answer: 1,
    reason:
      'For an indistinguishable result the amplitudes add first and the sum is squared: (½) + (−½) = 0, and 0² = 0. The two routes cancel completely. Adding probabilities instead — ¼ + ¼ = ½ (option C) — is the rule for distinguishable alternatives, which these are not.',
    animation: 'amplitude-sum',
    params: { a: [0.5, 0], b: [-0.5, 0], mode: 'indistinguishable' },
  },
  {
    id: 81,
    level: 4,
    topic: 'Core Quantum Principles',
    prompt: 'A state column [a, b] is normalized and b = i/√2. If a is real and positive, a equals',
    options: ['1/√2', '1/2', 'i/√2', '1'],
    answer: 0,
    reason:
      'Normalisation uses squared moduli: |a|² + |i/√2|² = 1, and |i/√2|² = ½, so |a|² = ½ and a = 1/√2 for a real positive. Option B (½) is the probability rather than the amplitude; C is b itself; 1 would make the total 1.5.',
    animation: 'normalisation',
    params: { known: [0.7071], amplitudes: true, knownLabel: 'i/√2' },
  },
  {
    id: 82,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'The hotter blackbody curve shifts toward shorter wavelengths and rises. Which interpretation is consistent with Planck’s idea?',
    options: [
      'Higher-frequency energy exchanges occur in packets hν and become more populated at higher temperature',
      'All frequencies carry identical packet energy',
      'Energy is continuous and independent of frequency',
      'Shorter wavelengths require smaller energy packets',
    ],
    answer: 0,
    reason:
      'In Planck’s picture energy is exchanged in packets hν. At higher temperature the thermal energy kT can afford larger packets, so high-frequency (short-wavelength) modes become populated and the peak moves to shorter λ while the whole curve rises. Packets are not identical for all frequencies (B), energy is not continuous (C), and shorter wavelengths need larger packets, not smaller (D).',
    animation: 'blackbody-curves',
  },
  {
    id: 83,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A metal has threshold wavelength 620 nm. It is illuminated first by 500 nm light and then by 400 nm light. The stopping potential increases by',
    options: ['0.48 V', '1.24 V', '3.10 V', '0.62 V'],
    answer: 3,
    reason:
      'Threshold 620 nm means Φ = 1240/620 = 2.0 eV. At 500 nm the photon is 2.48 eV, giving V₀ = 0.48 V; at 400 nm it is 3.10 eV, giving V₀ = 1.10 V. The increase is 1.10 − 0.48 = 0.62 V. Option A is the first stopping potential alone, C the second photon’s energy, and 1.24 V is double the right answer.',
    animation: 'energy-ledger',
    params: { phiEv: 2.0, photonNm: 400, compareNm: 500 },
  },
  {
    id: 84,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'Two metals produce parallel Kₘₐₓ–ν lines. Metal A has the larger threshold frequency. At the same frequency above both thresholds, metal A has',
    options: ['the larger Kₘₐₓ', 'the same Kₘₐₓ', 'the smaller Kₘₐₓ', 'a different value of h'],
    answer: 2,
    reason:
      'Both lines have slope h, so they are parallel; metal A’s line starts further right because its threshold ν₀ is larger. At any frequency above both thresholds, Kₘₐₓ = h(ν − ν₀) is therefore smaller for A — its larger work function eats more of each photon. The slope h is universal, which rules out D.',
    animation: 'kmax-vs-frequency',
    params: { secondThreshold: 6.5e14 },
  },
  {
    id: 85,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A 3.5 eV photon strikes a surface with work function 2.0 eV. If the incident intensity doubles without changing frequency, which pair is correct?',
    options: [
      'Kₘₐₓ = 3.0 eV; saturation current is unchanged',
      'Kₘₐₓ = 1.5 eV; stopping potential doubles',
      'Kₘₐₓ = 1.5 eV; saturation current approximately doubles',
      'Kₘₐₓ = 5.5 eV; saturation current approximately doubles',
    ],
    answer: 2,
    reason:
      'Kₘₐₓ = hν − Φ = 3.5 − 2.0 = 1.5 eV, and doubling the intensity at the same frequency does not change it, so the stopping potential stays put. What doubles is the photon arrival rate, hence the number of emitted electrons per second: the saturation current approximately doubles. Option A has the wrong Kₘₐₓ, B has the stopping potential changing, and D adds the two energies.',
    animation: 'energy-ledger',
    params: { photonEv: 3.5, phiEv: 2.0, intensity: 2 },
  },
  {
    id: 86,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A light source emits equal numbers of 400 nm and 800 nm photons. The total energy carried by the 400 nm photons is',
    options: [
      'half that carried by the 800 nm photons',
      'the same as that carried by the 800 nm photons',
      'four times that carried by the 800 nm photons',
      'twice that carried by the 800 nm photons',
    ],
    answer: 3,
    reason:
      'Photon energy is hc/λ, so a 400 nm photon carries exactly twice the energy of an 800 nm photon (3.10 eV against 1.55 eV). With equal numbers of each, the 400 nm photons carry twice the total energy. Half (A) has the proportion inverted; four times (C) would need an inverse-square law.',
    animation: 'arithmetic',
    params: { op: 'energy-ratio-nm', a: 400, b: 800 },
  },
  {
    id: 87,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A photon’s wavelength is reduced by 20%. Its momentum becomes',
    options: ['0.80 times as large', '1.20 times as large', '1.44 times as large', '1.25 times as large'],
    answer: 3,
    reason:
      'p = h/λ, so momentum is inversely proportional to wavelength. Reducing λ to 0.80 of its value raises p to 1/0.80 = 1.25 times. Option A applies the 0.80 directly, B adds 20% instead of dividing, and 1.44 is 1.2², a square that has no place here.',
    animation: 'inverse-proportion',
    params: { from: 1, to: 0.8, quantity: 'p' },
  },
  {
    id: 88,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'An atom absorbs 10.2 eV and reaches the −3.4 eV level from −13.6 eV. If it later emits two photons through an intermediate level at −5.0 eV, their energies are',
    options: ['10.2 eV and 5.0 eV', '8.6 eV and 1.6 eV', '6.8 eV and 3.4 eV', '13.6 eV and 3.4 eV'],
    answer: 1,
    reason:
      'Going down in two steps: from −3.4 eV to −5.0 eV releases 1.6 eV, then from −5.0 eV to −13.6 eV releases 8.6 eV. The two photon energies add back to the 10.2 eV that was absorbed, as they must. Option A reuses the 10.2 eV for one photon; C splits it arbitrarily in half; D uses the level values themselves rather than the gaps.',
    animation: 'energy-levels',
    params: { levels: [-13.6, -5.0, -3.4], path: [2, 1, 0] },
  },
  {
    id: 89,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A particle’s kinetic situation changes so that its momentum becomes three times larger. Its de Broglie wavelength and frequency of a wave of fixed speed would respectively become',
    options: ['three times and one-third', 'one-third and unchanged', 'unchanged and three times', 'one-third and three times'],
    answer: 3,
    reason:
      'λ = h/p, so tripling the momentum cuts the wavelength to one-third. For a wave of fixed speed v = fλ, a third of the wavelength means three times the frequency. Option B forgets that f must change if v is fixed; A and C have the two effects the wrong way round.',
    animation: 'de-broglie-ratio',
    params: { ratio: 3, frequency: true },
  },
  {
    id: 90,
    level: 4,
    topic: 'Core Quantum Principles',
    prompt: 'Single particles pass through two open slits and build fringes. When path information becomes available, the correct probability rule changes from',
    options: [
      'adding probabilities to multiplying probabilities',
      'squaring probabilities to adding amplitudes',
      'normalizing to allowing totals above one',
      'adding amplitudes before squaring to adding separate probabilities',
    ],
    answer: 3,
    reason:
      'With both slits open and no path information, the amplitudes for the two routes are added and then squared, |ψ₁ + ψ₂|², and the cross term makes the fringes. Once which-path information exists the alternatives are distinguishable and the rule becomes |ψ₁|² + |ψ₂|²: separate probabilities, no cross term, no fringes. That is option D; A, B and C each describe a change the physics does not make.',
    animation: 'which-path',
  },
  {
    id: 91,
    level: 4,
    topic: 'Core Quantum Principles',
    prompt: 'Two alternatives have amplitudes 1/√2 and e^{iπ}/√2 for the same final result. Their combined probability is',
    options: ['1/2', '0', '1', '2'],
    answer: 1,
    reason:
      'e^{iπ} = −1, so the second amplitude is −1/√2. Same final result means the amplitudes add before squaring: 1/√2 + (−1/√2) = 0, so the probability is 0 — perfect destructive interference. Adding the squares (½ + ½ = 1, option C) is the rule for distinguishable outcomes; 2 would be the square of the sum of magnitudes.',
    animation: 'amplitude-sum',
    params: { a: [0.7071, 0], b: [-0.7071, 0], mode: 'indistinguishable', labelA: '1/√2', labelB: 'e^{iπ}/√2' },
  },
  {
    id: 92,
    level: 4,
    topic: 'Core Quantum Principles',
    prompt: 'Applying [[0, 1], [1, 0]] twice to any two-component state returns',
    options: ['the original state', 'the zero vector', 'a state with exchanged components', 'a state with both signs reversed'],
    answer: 0,
    reason:
      '[[0, 1], [1, 0]] swaps the two components. Doing it twice swaps them back, so X² = I and any state returns to itself — the gate is its own inverse. Option C describes a single application; B and D would need a matrix with zeros or −1 on the diagonal.',
    animation: 'matrix-action',
    params: { matrix: 'X', vector: [0.6, 0.8], repeat: 2 },
  },
  {
    id: 93,
    level: 4,
    topic: 'Simple Quantum Systems',
    prompt: 'Which set gives all possible mℓ values for ℓ = 2?',
    options: ['−2, 0, +2', '0, 1, 2', '−1/2, +1/2', '−2, −1, 0, +1, +2'],
    answer: 3,
    reason:
      'mℓ runs in integer steps from −ℓ to +ℓ, so for ℓ = 2 it takes the five values −2, −1, 0, +1, +2 — one for each d orbital. Option A skips the odd values, B misses the negatives, and ±½ are spin values, not magnetic quantum numbers.',
    animation: 'shell-counting',
    params: { n: 3, l: 2, highlight: 'ml' },
  },
  {
    id: 94,
    level: 4,
    topic: 'Simple Quantum Systems',
    prompt: 'How many electrons can have n = 4 and ℓ = 3 in one atom?',
    options: ['14', '7', '8', '18'],
    answer: 0,
    reason:
      'n = 4, ℓ = 3 is the 4f subshell: 2ℓ + 1 = 7 orbitals, each holding two electrons of opposite spin, so 14 electrons. Seven (B) forgets spin, eight (C) is a full n = 2 shell, and 18 is a full n = 3 shell.',
    animation: 'shell-counting',
    params: { n: 4, l: 3, highlight: 'electrons' },
  },
  {
    id: 95,
    level: 4,
    topic: 'Simple Quantum Systems',
    prompt: 'How many electrons in one atom can share n = 3, ℓ = 2 and mℓ = −1?',
    options: ['1', '5', '10', '2'],
    answer: 3,
    reason:
      'Fixing n, ℓ and mℓ picks out one orbital (the 3d orbital with mℓ = −1). The only quantum number still free is ms = ±½, so at most two electrons can share those three values. Five (B) and ten (C) are the counts for the whole 3d subshell without and with spin; one (A) forgets the second spin state.',
    animation: 'shell-counting',
    params: { n: 3, l: 2, ml: -1, highlight: 'pairing' },
  },
  {
    id: 96,
    level: 4,
    topic: 'Simple Quantum Systems',
    prompt: 'Which proposed electron is forbidden solely because of its magnetic quantum number?',
    options: ['(4, 3, −3, −1/2)', '(n, ℓ, mℓ, ms) = (4, 2, 3, +1/2)', '(4, 0, 0, +1/2)', '(4, 2, −2, −1/2)'],
    answer: 1,
    reason:
      'Check each set against −ℓ ≤ mℓ ≤ +ℓ. For (4, 2, 3, +½), ℓ = 2 allows mℓ only from −2 to +2, so mℓ = 3 is forbidden — and n, ℓ and ms are all fine, so the magnetic quantum number is the sole problem. The other three sets pass every rule: (4, 3, −3), (4, 0, 0) and (4, 2, −2) all have |mℓ| ≤ ℓ.',
    animation: 'quantum-numbers',
    params: { sets: '4,3,-3,-0.5;4,2,3,0.5;4,0,0,0.5;4,2,-2,-0.5' },
  },
  {
    id: 97,
    level: 4,
    topic: 'Simple Quantum Systems',
    prompt: 'An n = 2 shell is completely filled. The number of occupied orbitals and electrons are respectively',
    options: ['4 and 8', '2 and 4', '4 and 4', '8 and 8'],
    answer: 0,
    reason:
      'The n = 2 shell contains one 2s orbital and three 2p orbitals: n² = 4 orbitals in total. Each holds two electrons when full, so 2n² = 8 electrons. Option B describes only the 2s plus one 2p; C forgets spin; D doubles the orbital count.',
    animation: 'shell-counting',
    params: { n: 2, highlight: 'electrons' },
  },
  {
    id: 98,
    level: 4,
    topic: 'Real Quantum Computers',
    prompt: 'A pure semiconductor is cooled substantially. With fewer thermally generated charge carriers, its conductivity generally',
    options: ['increases without limit', 'stays exactly constant', 'decreases', 'changes sign'],
    answer: 2,
    reason:
      'A pure semiconductor’s carriers all come from thermal excitation across the gap. Cool it and fewer electrons have the energy to cross, so there are fewer electrons in the conduction band and fewer holes below: conductivity decreases — the opposite of a metal, whose conductivity rises on cooling. It does not change sign and it is certainly not constant.',
    animation: 'electron-hole-pairs',
    params: { cooling: true },
  },
  {
    id: 99,
    level: 4,
    topic: 'Classical Physics Foundations',
    prompt: 'A displacement is x = A cos(ωt). At t = 0, its instantaneous velocity is zero. A quarter period later, the displacement is',
    options: ['+A', '−A', 'zero', '+A/2'],
    answer: 2,
    reason:
      'x = A cos ωt starts at x = +A with zero velocity — the release point. A quarter period later ωt = π/2 and cos(π/2) = 0, so the displacement is zero: the mass is passing through equilibrium at maximum speed. It reaches −A only after half a period (B), and +A/2 is not a quarter-period value of a cosine.',
    animation: 'shm-restoring',
    params: { trace: true },
  },
  {
    id: 100,
    level: 4,
    topic: 'Birth of Quantum Physics',
    prompt: 'A student claims that a quanta-based explanation is needed only for photoelectric emission, not blackbody radiation. The best evaluation is',
    options: [
      'correct: blackbody radiation is fully explained by classical equipartition',
      'correct: Planck assumed continuous energy exchange',
      'incorrect only because atoms have no discrete energies',
      'incorrect: energy quantisation was introduced to explain the blackbody spectrum and also supports the photon account',
    ],
    answer: 3,
    reason:
      'The claim is backwards, historically and physically. Planck introduced energy quantisation in 1900 precisely to fix the blackbody spectrum, which classical equipartition got catastrophically wrong at short wavelengths; Einstein’s 1905 photon explanation of the photoelectric effect then took the same quanta seriously as light itself. Both phenomena need the quanta, so the only correct evaluation is D. A and B misstate what classical physics and Planck respectively assumed, and C gives the wrong reason.',
    animation: 'blackbody-curves',
    params: { classical: true },
  },
];

/** Constants footnote, as printed on the paper. */
export const CONSTANTS_NOTE =
  'h = 6.63 × 10⁻³⁴ J s, c = 3.0 × 10⁸ m s⁻¹, hc ≈ 1240 eV nm.';

export const getQuestion = (id: number): PhysicsMCQ | undefined =>
  PHYSICS_MCQS.find((q) => q.id === id);

export const questionsForLevel = (level: number): PhysicsMCQ[] =>
  PHYSICS_MCQS.filter((q) => q.level === level).sort((a, b) => a.id - b.id);
