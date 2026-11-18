import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 01 — Mathematical Foundations.
 *
 * Three readings per topic, written separately. The kid tier uses no symbols
 * and one concrete picture; the student tier is the sixth-form treatment with
 * the identities actually used later; the professional tier says where the
 * idea does work in quantum computing and where it bites in practice.
 */
export const MODULE_01: FoundationLesson[] = [
  {
    topic: '01.01',
    minutes: 6,
    figure: { animation: 'decimal-shift', params: { value: '0.0000042', places: 6 } },
    kid: {
      intro:
        'Some numbers are too big or too small to write out — the number of atoms in a drop of water, or how wide one atom is. Scientific notation is a trick for writing them short: a small number times a power of ten.',
      points: [
        '10³ means 10 × 10 × 10 = 1000. The little number counts the zeros.',
        '10⁻³ means one thousandth, 0.001. A minus sign means “divide by ten that many times”.',
        'To write 0.0000042, slide the point until one digit sits in front: 4.2. You moved it six places, so it is 4.2 × 10⁻⁶.',
        'Order of magnitude just means “which power of ten”. An atom is about 10⁻¹⁰ m across; you are about 10⁰ m. That is ten powers of ten apart.',
      ],
    },
    student: {
      intro:
        'Scientific notation writes every quantity as a mantissa between 1 and 10 times an integer power of ten. It is the only sane way to handle the 10⁻³⁴ of Planck’s constant next to the 10⁸ of the speed of light.',
      points: [
        'Multiply: multiply the mantissas, add the exponents. Divide: divide the mantissas, subtract the exponents.',
        'Keep the mantissa in [1, 10): 42 × 10⁻⁶ is the same number as 4.2 × 10⁻⁵, but only the second is standard form.',
        'The order of magnitude is the exponent after rounding the mantissa: 6.6 × 10⁻³⁴ is of order 10⁻³³, since 6.6 rounds up past √10 ≈ 3.2.',
        'Significant figures live in the mantissa; the exponent carries no precision. 3.00 × 10⁸ claims three figures, 3 × 10⁸ claims one.',
      ],
      math: [
        '(6 \\times 10^{8}) \\div (3 \\times 10^{2}) = \\frac{6}{3} \\times 10^{8-2} = 2 \\times 10^{6}',
        '0.0000042 = 4.2 \\times 10^{-6}',
      ],
    },
    professional: {
      intro:
        'Every number in this course spans sixty orders of magnitude, from ħ ≈ 10⁻³⁴ J s to the 10²⁶ m of the observable universe. Fluency with exponents is what lets you sanity-check a result before trusting a calculator.',
      points: [
        'Estimate first: a visible photon is hc/λ ≈ (2 × 10⁻²⁵ J m)/(5 × 10⁻⁷ m) ≈ 4 × 10⁻¹⁹ J ≈ 2.5 eV. If your code prints 10⁻¹⁵ J, the bug is upstream.',
        'Choose units that bring exponents near zero: hc = 1240 eV nm turns a four-exponent calculation into a one-line division — which is why the question bank uses it.',
        'Floating point stores mantissa and exponent separately (IEEE 754 doubles: 53-bit mantissa, 11-bit exponent). Cancellation, not range, is what bites: 1.0000001 − 1.0 throws away seven of your sixteen digits.',
        'Qubit error rates are quoted as orders of magnitude for the same reason: a two-qubit gate at 10⁻³ against a fault-tolerance threshold near 10⁻² is the whole story, and the mantissa is a detail.',
      ],
      math: ['\\frac{hc}{\\lambda} = \\frac{1240\\ \\text{eV nm}}{500\\ \\text{nm}} = 2.48\\ \\text{eV}'],
    },
  },
  {
    topic: '01.02',
    minutes: 7,
    figure: { animation: 'power-law', params: { k: 2, from: 1, to: 2 } },
    kid: {
      intro:
        'If you double the side of a square, you do not double the area — you get four times as much. That is what “proportional to the square” means, and it shows up everywhere in physics.',
      points: [
        'y ∝ x means: double x, double y. Like buying twice as many apples for twice the money.',
        'y ∝ x² means: double x, get four times y. Twice the side, four times the tiles.',
        'y ∝ 1/x means: double x, get half of y. Twice the people sharing a pizza, half a pizza each.',
        'A square root undoes a square. √16 = 4 because 4 × 4 = 16. Make x nine times bigger and √x only grows three times.',
      ],
    },
    student: {
      intro:
        'A proportionality y ∝ xⁿ fixes how y scales when x changes, without needing the constant in front. Ratios do the work: y₂/y₁ = (x₂/x₁)ⁿ.',
      points: [
        'Doubling x under y ∝ x² multiplies y by 2² = 4; under y ∝ √x by 2^½ ≈ 1.41; under y ∝ 1/x by 2⁻¹ = ½.',
        'Roots are fractional powers: √x = x^{1/2}, ∛x = x^{1/3}. The same exponent rules apply, so √(ab) = √a √b.',
        'Inverse-square laws — gravity, Coulomb, light intensity — are y ∝ 1/x²: three times the distance, one ninth the effect.',
        'Rearranging keeps the proportionality in view: E = hc/λ means E and λ are inversely proportional, so halving λ doubles E.',
      ],
      math: [
        '\\frac{y_2}{y_1} = \\left(\\frac{x_2}{x_1}\\right)^{n}',
        'y \\propto \\sqrt{x}: \\quad \\frac{x_2}{x_1} = \\frac{9\\times10^{-6}}{4\\times10^{-6}} = 2.25 \\ \\Rightarrow\\ \\frac{y_2}{y_1} = \\sqrt{2.25} = 1.5',
      ],
    },
    professional: {
      intro:
        'Scaling laws are how you reason about a system before you can compute it. Which exponent governs a quantity is usually more decision-relevant than its value.',
      points: [
        'Resource scaling in quantum computing is all exponents: a statevector of n qubits has 2ⁿ amplitudes, Grover’s speed-up is √N against N, Shor’s advantage is polynomial against sub-exponential. Knowing the exponent is knowing the headline.',
        'The de Broglie wavelength λ = h/p ∝ 1/p is why electron microscopes beat optical ones: raise the momentum, shrink the wavelength, resolve finer.',
        'Error budgets multiply: a circuit of depth d at per-gate fidelity f succeeds with probability ≈ f^d. At f = 0.999 and d = 1000 that is 0.37 — an exponential you cannot wish away.',
        'Dimensional analysis is the free sanity check: an expression for energy must reduce to kg m² s⁻², and an exponent that breaks that is wrong before any arithmetic.',
      ],
      math: ['\\text{amplitudes} = 2^{n}, \\qquad P_{\\text{success}} \\approx f^{\\,d}'],
    },
  },
  {
    topic: '01.03',
    minutes: 6,
    figure: { animation: 'tangent-slope', params: { curve: 'throw' } },
    kid: {
      intro:
        'A graph is a picture of how one thing changes with another — your height against your age, or where a ball is against time. How steep the line is tells you how fast things are changing.',
      points: [
        'Going up steeply means changing fast; flat means not changing at all.',
        'On a “where is the ball” graph, the steepness is the ball’s speed. A ball thrown up slows, stops at the top (flat!), then falls.',
        'A straight line has one steepness everywhere. A curve has a different one at every point — you read it from the tangent, the straight line that just kisses the curve.',
        'Sloping down means going the other way: the ball coming back.',
      ],
    },
    student: {
      intro:
        'The slope of a graph of y against x is Δy/Δx, the rate at which y changes per unit x. For a curve, the slope at a point is the gradient of the tangent there.',
      points: [
        'Position–time graph: slope = velocity. Velocity–time graph: slope = acceleration; area under it = displacement.',
        'Where the tangent is horizontal the rate of change is zero — the top of a throw, the turning point of any curve. Velocity passes through zero and reverses sign.',
        'Units of a slope are the y unit per x unit: m/s, J/K, V/A. Reading them off tells you what the slope means physically.',
        'Intercepts carry information too: the Kₘₐₓ–frequency line of the photoelectric effect crosses the ν axis at the threshold frequency and has slope h.',
      ],
      math: [
        '\\text{slope} = \\frac{\\Delta y}{\\Delta x}, \\qquad v = \\frac{\\Delta x}{\\Delta t}',
        'K_{\\max} = h\\nu - \\phi: \\quad \\text{slope } h, \\quad \\text{intercept } \\nu_0 = \\phi/h',
      ],
    },
    professional: {
      intro:
        'Most physical laws are statements about rates of change, and most experimental physics is extracting a slope from noisy data. Both skills matter more than any single formula.',
      points: [
        'Fitting a line to Kₘₐₓ against ν was how Millikan measured h to within a percent in 1916 — the slope was the constant, the intercept was the metal.',
        'In a quantum processor, the slope of Rabi frequency against drive amplitude calibrates a gate; the slope of a decay curve’s logarithm is −1/T₁. Log-transform first and a straight line falls out.',
        'Finite differences approximate derivatives: Δy/Δx over a small step is first order; the symmetric form [y(x+h) − y(x−h)]/2h is second order and is what you should use numerically.',
        'A horizontal tangent is a stationary point, and variational methods (VQE, QAOA) search for exactly that in a cost landscape — zero gradient is the optimiser’s halting condition, and barren plateaus are landscapes where it is zero almost everywhere.',
      ],
      math: ["f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h} + O(h^{2})"],
    },
  },
  {
    topic: '01.04',
    minutes: 8,
    figure: { animation: 'unit-circle', params: { deg: 90 } },
    kid: {
      intro:
        'Draw a circle, put a dot on its edge, and spin it round. The height of the dot goes up and down smoothly — that curve is a sine wave, and it is the shape of every wave, from a swing to light.',
      points: [
        'sin of an angle is just how high the dot is when the circle has radius 1. Straight up (90°) is height 1; flat (0°) is height 0; straight down (270°) is −1.',
        'Spin the dot at a steady speed and plot the height against time: you get the wave.',
        'Two dots on the same circle a quarter turn apart make two waves that are “out of phase”. When one is at the top, the other is passing through the middle.',
        'Half a turn apart (180°) and they are opposites: one up when the other is down. Add them and they cancel to nothing.',
      ],
    },
    student: {
      intro:
        'sin θ and cos θ are the vertical and horizontal coordinates of a point on the unit circle at angle θ. A wave is the sine of an angle that grows with time or distance: y = A sin(ωt + φ).',
      points: [
        'Period and frequency: ω = 2πf, and one full cycle is 2π radians. Degrees are for drawing; radians are for calculating.',
        'Phase φ shifts the wave along. A phase difference of π/2 (90°) is a quarter cycle; π is half a cycle — crest against trough.',
        'Two points a distance d apart on a wave of wavelength λ differ in phase by Δφ = 2πd/λ. A quarter wavelength is π/2.',
        'Identities you will actually use: sin² + cos² = 1 (which is why unit-circle coordinates make a normalised pair), and cos θ = sin(θ + π/2).',
      ],
      math: [
        'y(t) = A\\sin(\\omega t + \\varphi), \\qquad \\omega = 2\\pi f',
        '\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}, \\qquad \\sin^{2}\\theta + \\cos^{2}\\theta = 1',
      ],
    },
    professional: {
      intro:
        'Phase is the quantity quantum mechanics is built on. The unit circle is not a picture of a wave; it is the picture of a complex amplitude, and sine and cosine are its two components.',
      points: [
        'e^{iθ} = cos θ + i sin θ puts the unit circle in the complex plane. A qubit amplitude’s phase is a point on that circle, and relative phase between two amplitudes is what produces interference.',
        'A single-qubit state cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ is two angles — the Bloch sphere is trigonometry made geometric. Rotation gates Rx, Ry, Rz advance those angles.',
        'Phase differences of π/2 and π are not abstractions: an S gate is a π/2 phase, a Z gate is π. Phase kickback in Deutsch’s algorithm is a sign (π) landing on the control.',
        'Numerically, keep phases in radians and reduce modulo 2π before comparing; a “small” error of 10⁻³ rad per gate accumulates to a full radian in a thousand gates.',
      ],
      math: [
        'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
        '\\ket{\\psi} = \\cos\\tfrac{\\theta}{2}\\ket{0} + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\ket{1}',
      ],
    },
  },
  {
    topic: '01.05',
    minutes: 7,
    figure: { animation: 'probability-bars', params: { values: [0.1, 0.25, 0.4, 0.25], stack: true } },
    kid: {
      intro:
        'Probability is a way of saying how likely something is, as a number between 0 (never) and 1 (certain). A fair coin lands heads with probability ½.',
      points: [
        'If you list every possible outcome, their probabilities must add up to exactly 1 — something always happens.',
        'A bar chart of outcomes with their probabilities is a distribution. The tallest bar is the most likely outcome, not a guarantee.',
        'Probability ½ does not mean “every other time”. Ten flips can be seven heads. It means that over thousands of flips you get close to half.',
        'Quantum computers answer in probabilities: you run the same circuit many times and count how often each answer appears.',
      ],
    },
    student: {
      intro:
        'A probability distribution assigns to each outcome of a random experiment a number P ≥ 0 such that the probabilities of all outcomes sum to 1. Everything else — expectation, variance, independence — is built on that.',
      points: [
        'Mutually exclusive outcomes: P(A or B) = P(A) + P(B). Independent events: P(A and B) = P(A)·P(B).',
        'If three outcomes have 0.12, 0.28 and 0.35, the only remaining one has 1 − 0.75 = 0.25. Normalisation fixes the last number.',
        'The expectation value is the probability-weighted average: ⟨x⟩ = Σ x P(x). It need not be a possible outcome — the average of a die is 3.5.',
        'Measurement statistics are estimates: with N shots a probability p is known to about √(p(1−p)/N). A thousand shots give ±1.6% on p = ½.',
      ],
      math: [
        '\\sum_{i} P_i = 1, \\qquad \\langle x \\rangle = \\sum_i x_i P_i',
        '\\sigma_p \\approx \\sqrt{\\frac{p(1-p)}{N}}',
      ],
    },
    professional: {
      intro:
        'Quantum theory is a probability theory with a different rule for combining alternatives. Everything you know about classical probability still holds for the outcomes; what changes is where the probabilities come from.',
      points: [
        'Classically, probabilities add over alternatives: P = P₁ + P₂. Quantum mechanically, amplitudes add and are then squared: P = |ψ₁ + ψ₂|², which contains an interference term 2Re(ψ₁*ψ₂) that can be negative.',
        'A distribution over 2ⁿ bitstrings is what a circuit produces. Sampling it with S shots gives counts; comparing them to the ideal distribution (total variation distance, cross-entropy) is how a device is benchmarked.',
        'Shot noise sets the cost of an estimate: to know an expectation value to precision ε takes O(1/ε²) shots. Variational algorithms spend most of their budget here.',
        'Distributions of outcomes for incompatible observables cannot both be sharp — the uncertainty principle is a statement about the widths of two distributions.',
      ],
      math: ['P = |\\psi_1 + \\psi_2|^{2} = |\\psi_1|^{2} + |\\psi_2|^{2} + 2\\,\\mathrm{Re}(\\psi_1^{*}\\psi_2)'],
    },
  },
  {
    topic: '01.06',
    minutes: 7,
    figure: { animation: 'complex-magnitude', params: { re: 3, im: 4 } },
    kid: {
      intro:
        'Imagine a number line that goes left and right. Now add a second one going up and down. A complex number is a point on that flat map: three steps right and four steps up is written 3 + 4i.',
      points: [
        'The “i” just means “in the up direction”. It is no scarier than a map grid.',
        'How far is the point from the middle? Use the triangle trick: 3 across and 4 up makes 5 along the diagonal. That distance is the size of the number.',
        'Multiplying by i turns the point a quarter turn anticlockwise. Do it twice and you have turned halfway round — which is why i × i = −1.',
        'Quantum computers keep their secret numbers as points on this map; the direction of the point is called the phase.',
      ],
    },
    student: {
      intro:
        'A complex number z = a + bi has real part a, imaginary part b, modulus |z| = √(a² + b²) and argument (phase) θ = atan2(b, a). In polar form z = |z| e^{iθ}.',
      points: [
        'i² = −1 by definition. Multiplication by i rotates by 90°: 1 → i → −1 → −i → 1.',
        'Adding complex numbers adds the components, like vectors. Multiplying multiplies the moduli and adds the arguments — rotation and scaling in one operation.',
        'The conjugate z* = a − bi flips the sign of the imaginary part; z z* = |z|² is always real and non-negative, which is why the Born rule uses it.',
        '|3 + 4i| = 5, |0.6i| = 0.6, |e^{iθ}| = 1 for every θ — a phase factor has unit modulus and changes nothing about the size.',
      ],
      math: [
        '|a + bi| = \\sqrt{a^{2} + b^{2}}, \\qquad z = |z|\\,e^{i\\theta}',
        'z z^{*} = |z|^{2}, \\qquad e^{i\\theta}e^{i\\phi} = e^{i(\\theta+\\phi)}',
      ],
    },
    professional: {
      intro:
        'Quantum amplitudes are complex because the theory needs two real numbers per basis state — a weight and a phase — and needs them to combine by rotation. No real-valued theory reproduces interference with the correct signs.',
      points: [
        'Global phase e^{iα}|ψ⟩ is unobservable: every probability |⟨x|ψ⟩|² is unchanged. Relative phase between components is the entire physical content of a superposition beyond its probabilities.',
        'Gates are unitary matrices over ℂ; their eigenvalues lie on the unit circle, e^{iλ}, and phase estimation reads λ out. Hermitian observables have real eigenvalues — the measurement outcomes.',
        'Implementation: a complex multiply is four real multiplies and two adds; statevector simulators are memory-bound at 16 bytes per amplitude, so 30 qubits is 16 GB before you touch the arithmetic.',
        'The modulus–argument split is the split between what measurement sees (modulus) and what only interference can reveal (argument). Tomography needs both; a computational-basis measurement gives neither phase.',
      ],
      math: ['\\ket{\\psi} \\sim e^{i\\alpha}\\ket{\\psi}, \\qquad U^{\\dagger}U = I, \\quad U\\ket{u} = e^{i\\lambda}\\ket{u}'],
    },
  },
  {
    topic: '01.07',
    minutes: 8,
    figure: { animation: 'normalisation', params: { known: [0.8], amplitudes: true } },
    kid: {
      intro:
        'An arrow has a length and a direction. Two arrows at right angles are “orthogonal” — they point along completely separate directions, like north and east. A “normalised” arrow has length exactly 1.',
      points: [
        'You can describe any point in a room with three numbers: how far north, how far east, how far up. Those three directions are orthogonal.',
        'If an arrow’s parts are 0.6 across and 0.8 up, its length is 1 (the 3-4-5 triangle again). That arrow is normalised.',
        'If you know one part is 0.8 and the whole must be length 1, the other part has to be 0.6. There is no choice.',
        'A qubit’s state is an arrow of length 1. The squares of its parts are the probabilities of each answer — and because the length is 1, they add to 1.',
      ],
    },
    student: {
      intro:
        'A vector is a list of components; its norm is the square root of the sum of their squares; two vectors are orthogonal when their inner product is zero. Normalised, orthogonal vectors — an orthonormal basis — are the coordinate axes of quantum mechanics.',
      points: [
        'Inner product of real vectors: a·b = Σ aᵢbᵢ. For complex vectors conjugate the first: ⟨a|b⟩ = Σ aᵢ*bᵢ, so that ⟨a|a⟩ = Σ|aᵢ|² is real.',
        'Normalisation: Σ|aᵢ|² = 1. For a qubit [a, b], |a|² + |b|² = 1. Given b = 0.8, a² = 1 − 0.64 = 0.36 and a = 0.6. Given b = i/√2, |b|² = ½ and a = 1/√2.',
        'Orthogonal states are perfectly distinguishable: ⟨0|1⟩ = 0. [1/√2, 1/√2] and [1/√2, −1/√2] are orthogonal too — a second valid basis for the same qubit.',
        'The components of a vector in an orthonormal basis are its inner products with the basis vectors: aᵢ = ⟨eᵢ|a⟩. That is how “probability of outcome i” becomes |⟨eᵢ|ψ⟩|².',
      ],
      math: [
        '\\|a\\|^{2} = \\sum_i |a_i|^{2} = 1, \\qquad \\braket{a}{b} = \\sum_i a_i^{*} b_i',
        '\\braket{0}{1} = 0, \\qquad \\braket{+}{-} = \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} - \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} = 0',
      ],
    },
    professional: {
      intro:
        'State space is a complex inner-product space; everything operational — probabilities, distinguishability, which measurements exist — is phrased in inner products. If you can compute ⟨a|b⟩ you can compute the theory.',
      points: [
        'Orthogonality is distinguishability: two states can be told apart with certainty by one measurement if and only if their inner product is zero. Non-orthogonal states cannot be cloned or perfectly discriminated — no-cloning is a corollary.',
        'Normalisation is preserved by unitaries (⟨Uψ|Uψ⟩ = ⟨ψ|ψ⟩) and broken by nothing physical except measurement, after which you renormalise the post-measurement state by hand.',
        'Numerically, check Σ|aᵢ|² = 1 to 10⁻¹² after every operation in a simulator; drift here is the first symptom of a broken gate matrix.',
        'Gram–Schmidt turns any independent set into an orthonormal basis; measurement bases (computational, Hadamard, circular) are all orthonormal and related by unitaries, which is what “measuring along a different axis” means.',
      ],
      math: ['\\braket{U\\psi}{U\\psi} = \\bra{\\psi}U^{\\dagger}U\\ket{\\psi} = \\braket{\\psi}{\\psi}'],
    },
  },
  {
    topic: '01.08',
    minutes: 8,
    figure: { animation: 'matrix-action', params: { matrix: 'X', vector: [1, 0] } },
    kid: {
      intro:
        'A matrix is a little grid of numbers that acts like a machine: feed it an arrow, and it hands back a new arrow. Some machines swap, some flip, some turn. Quantum gates are exactly these machines.',
      points: [
        'The grid [[0, 1], [1, 0]] is the swap machine: feed it [1, 0] and you get [0, 1]. Feed that back in and you are home again.',
        'Each number in the answer comes from one row of the grid: multiply across the row, add up.',
        'A 2-by-2 grid acting on a 2-number arrow always gives a 2-number arrow — the shape never changes, only the contents.',
        'Doing two machines one after another is like one bigger machine. Order matters: swap-then-flip is not flip-then-swap.',
      ],
    },
    student: {
      intro:
        'A matrix multiplies a column vector by taking the dot product of each row with the vector; an m × n matrix maps n-component vectors to m-component ones. Matrix–matrix products compose the maps, and they do not commute in general.',
      points: [
        '[[0,1],[1,0]]·[1,0]ᵀ = [0·1 + 1·0, 1·1 + 0·0]ᵀ = [0,1]ᵀ. This matrix is the Pauli-X gate; it swaps |0⟩ and |1⟩.',
        '[[1,0],[0,−1]] leaves the first component and negates the second: Pauli-Z. On [1/√2, 1/√2] it gives [1/√2, −1/√2].',
        'X applied twice is the identity: X² = I. Every Pauli squares to I; the Hadamard does too, which is why H H|0⟩ = |0⟩.',
        'Non-commuting: XZ ≠ ZX (in fact XZ = −ZX). Gate order in a circuit reads left to right but the matrices multiply right to left.',
      ],
      math: [
        '\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix} = \\begin{pmatrix}0\\\\1\\end{pmatrix}, \\qquad X^{2} = I',
        '\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}\\begin{pmatrix}1/\\sqrt2\\\\1/\\sqrt2\\end{pmatrix} = \\begin{pmatrix}1/\\sqrt2\\\\-1/\\sqrt2\\end{pmatrix}',
      ],
    },
    professional: {
      intro:
        'Every reversible operation on a quantum register is a unitary matrix; every observable is a Hermitian one. The linear algebra of 2ⁿ × 2ⁿ matrices is the computational model — and the reason classical simulation is hard.',
      points: [
        'Unitary: U†U = I, so lengths and inner products are preserved. Hermitian: A = A†, so eigenvalues are real. The Paulis are both, which is why they serve as gates and as observables.',
        'Multi-qubit gates are tensor (Kronecker) products of single-qubit ones; an n-qubit gate is a 2ⁿ × 2ⁿ matrix. A CNOT is 4 × 4 and is not a tensor product of two 2 × 2 matrices — that is what makes it entangling.',
        'Cost: multiplying a dense 2ⁿ × 2ⁿ matrix into a statevector is O(4ⁿ); applying a single-qubit gate in place is O(2ⁿ). Simulators never form the full matrix.',
        'Commutators measure incompatibility: [X, Z] = XZ − ZX = −2iY ≠ 0, so X and Z cannot be measured together — the uncertainty principle in two-by-two form.',
      ],
      math: [
        'XZ = -ZX, \\qquad [X,Z] = -2iY',
        '(A \\otimes B)(\\ket{a}\\otimes\\ket{b}) = A\\ket{a}\\otimes B\\ket{b}',
      ],
    },
  },
  {
    topic: '01.09',
    minutes: 8,
    figure: { animation: 'tangent-slope', params: { curve: 'quadratic', at: 2 } },
    kid: {
      intro:
        'A derivative answers “how fast is this changing right now?”. If you know where a car is at every moment, its derivative tells you its speed at every moment — even when the speed keeps changing.',
      points: [
        'On a graph, the derivative is the steepness of the tangent — the straight line that just touches the curve at that point.',
        'If the distance grows like t², the speed grows like 2t: twice as far along, twice as fast. That rule is the whole trick for powers.',
        'When the curve is flat for an instant — a ball at the top of its throw — the derivative is zero. The ball is still for exactly one moment.',
        'Derivatives can be negative (coming back down), and you can take the derivative of a derivative: speed’s derivative is acceleration.',
      ],
    },
    student: {
      intro:
        'The derivative dy/dx is the limit of Δy/Δx as the step shrinks to zero — the instantaneous rate of change, equal to the gradient of the tangent. Power rule: d(xⁿ)/dx = n xⁿ⁻¹.',
      points: [
        'x(t) = 3t² gives v = dx/dt = 6t, so v(2) = 12 m s⁻¹; a = dv/dt = 6 m s⁻² is constant.',
        'Stationary points: f′(x) = 0 — maxima, minima and inflections. The top of a throw x = 4t − t² is at t = 2, where 4 − 2t = 0.',
        'Sine and cosine chase each other: d(sin ωt)/dt = ω cos ωt, d(cos ωt)/dt = −ω sin ωt. Differentiating twice brings back −ω² times the original — the signature of simple harmonic motion.',
        'Chain rule for composed functions: d/dt f(g(t)) = f′(g)·g′(t). It is how a phase ωt + φ inside a sine produces the ω in front.',
      ],
      math: [
        '\\frac{dy}{dx} = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}, \\qquad \\frac{d}{dx}x^{n} = n x^{n-1}',
        'x = 3t^{2} \\ \\Rightarrow\\ v = 6t, \\quad v(2) = 12\\ \\text{m s}^{-1}',
      ],
    },
    professional: {
      intro:
        'Quantum dynamics is a differential equation: iħ d|ψ⟩/dt = H|ψ⟩. Every statement about how a state evolves, decays or responds to a control pulse is a statement about derivatives.',
      points: [
        'The Schrödinger equation is first order in time, so the state at t determines the state at t + dt: evolution is deterministic and, for time-independent H, |ψ(t)⟩ = e^{−iHt/ħ}|ψ(0)⟩. Measurement is the only non-differential step.',
        'Gates are exponentials of generators: Rz(θ) = e^{−iθZ/2}. The derivative with respect to θ is −(i/2)Z·Rz(θ) — which is exactly what the parameter-shift rule used by variational optimisers evaluates.',
        'Rates in hardware are derivatives: T₁ is −1/(d ln P₁/dt); a Ramsey fringe’s frequency is dφ/dt, and detuning is read from it.',
        'Prefer analytic derivatives (parameter shift) over finite differences on a quantum device: finite differences divide shot noise by a small h and amplify it.',
      ],
      math: [
        'i\\hbar\\frac{d}{dt}\\ket{\\psi} = H\\ket{\\psi}, \\qquad \\ket{\\psi(t)} = e^{-iHt/\\hbar}\\ket{\\psi(0)}',
        '\\frac{\\partial}{\\partial\\theta}\\langle A\\rangle = \\tfrac{1}{2}\\big[\\langle A\\rangle_{\\theta+\\pi/2} - \\langle A\\rangle_{\\theta-\\pi/2}\\big]',
      ],
    },
  },
];
