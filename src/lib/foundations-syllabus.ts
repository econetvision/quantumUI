import type { AnimationId, FigureParams } from '@/lib/physics-mcq';

/**
 * The Quantum Physics topic hierarchy, adopted as printed.
 *
 * Nine modules, 106 topics, numbered exactly as the six-page syllabus numbers
 * them, so "04.07" in a conversation, a URL and a test all mean the same row.
 * Titles are verbatim: the syllabus is the contract, and a paraphrase here
 * would be the first step toward the site and the document drifting apart.
 *
 * Lessons (foundations-lessons.ts) and the MCQ bank (physics-mcq.ts) hang off
 * these ids. A topic with neither still has a page, so every row of the
 * syllabus is reachable from day one and the gaps are visible rather than
 * hidden.
 */
export interface SyllabusTopic {
  /** "01.01" — module and topic numbers as printed. */
  id: string;
  n: number;
  title: string;
  slug: string;
}

export interface SyllabusModule {
  /** "01" … "09". */
  id: string;
  n: number;
  title: string;
  slug: string;
  /** The page heading the module sits under in the syllabus. */
  part: string;
  partBlurb: string;
  topics: SyllabusTopic[];
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function module(
  n: number,
  title: string,
  slug: string,
  part: string,
  partBlurb: string,
  titles: string[],
): SyllabusModule {
  const id = String(n).padStart(2, '0');
  return {
    id,
    n,
    title,
    slug,
    part,
    partBlurb,
    topics: titles.map((t, i) => ({
      id: `${id}.${String(i + 1).padStart(2, '0')}`,
      n: i + 1,
      title: t,
      slug: slugify(t),
    })),
  };
}

const FOUNDATION = ['Foundation', 'The language and physical intuition required before quantum mechanics.'] as const;
const REVOLUTION = ['The Quantum Revolution', 'The experiments and principles that changed our picture of nature.'] as const;
const FRAMEWORK = ['The Formal Framework', 'The mathematical structure and first solvable systems.'] as const;
const SPIN = ['Spin & Entanglement', 'The bridge from two-level quantum systems to qubits.'] as const;
const COMPUTING = ['Quantum Computing', 'Information encoded, transformed and read through quantum circuits.'] as const;
const MACHINES = ['Real Quantum Machines', 'Hardware, noise and the frontier between theory and engineering.'] as const;

export const SYLLABUS: SyllabusModule[] = [
  module(1, 'Mathematical Foundations', 'mathematical-foundations', ...FOUNDATION, [
    'Scientific notation and orders of magnitude',
    'Algebra, powers, roots and proportionality',
    'Graphs, slope and rate of change',
    'Trigonometry, sine waves and phase',
    'Probability and probability distributions',
    'Complex numbers and the complex plane',
    'Vectors, normalization and orthogonality',
    'Matrices and matrix multiplication',
    'Basic differentiation and derivatives',
  ]),
  module(2, 'Classical Physics Foundations', 'classical-physics-foundations', ...FOUNDATION, [
    'Motion: position, velocity and acceleration',
    'Momentum, force and Newton’s laws',
    'Work, energy and conservation laws',
    'Electric charge, field and potential',
    'Magnetic fields and electromagnetic induction',
    'Oscillations and simple harmonic motion',
    'Wave quantities: amplitude, wavelength and frequency',
    'Superposition and interference',
    'Electromagnetic waves and spectrum',
    'Atoms, nuclei and microscopic scales',
  ]),
  module(3, 'Birth of Quantum Physics', 'birth-of-quantum-physics', ...REVOLUTION, [
    'Limits of classical physics',
    'Blackbody radiation',
    'Planck’s quantum hypothesis',
    'Photoelectric effect',
    'Photon energy and momentum',
    'Atomic stability and line spectra',
    'Bohr atomic model and its limitations',
    'Compton effect',
    'de Broglie matter waves',
    'Electron diffraction',
    'Single-particle double-slit experiment',
  ]),
  module(4, 'Core Quantum Principles', 'core-quantum-principles', ...REVOLUTION, [
    'Quantum state and state preparation',
    'Wavefunction and probability amplitude',
    'Born probability rule',
    'Normalization',
    'Superposition',
    'Global phase and relative phase',
    'Interference of probability amplitudes',
    'Measurement and state update',
    'Observables and measurement bases',
    'Heisenberg uncertainty principle',
    'Compatible and incompatible observables',
  ]),
  module(5, 'Quantum Mechanics Framework', 'quantum-mechanics-framework', ...FRAMEWORK, [
    'Dirac bra-ket notation',
    'Basis states and state vectors',
    'Inner products and orthogonality',
    'Operators',
    'Eigenvalues and eigenstates',
    'Expectation values',
    'Hamiltonian operator',
    'Unitary time evolution',
    'Time-dependent Schrödinger equation',
    'Time-independent Schrödinger equation',
    'Boundary conditions and quantization',
  ]),
  module(6, 'Simple Quantum Systems', 'simple-quantum-systems', ...FRAMEWORK, [
    'Particle in a one-dimensional box',
    'Infinite potential well',
    'Quantized energy levels',
    'Probability distributions',
    'Finite potential well',
    'Potential barriers',
    'Quantum tunnelling',
    'Quantum harmonic oscillator - introduction',
    'Hydrogen atom and orbitals',
    'Quantum numbers and Pauli exclusion principle',
  ]),
  module(7, 'Spin and Entanglement', 'spin-and-entanglement', ...SPIN, [
    'Intrinsic quantum spin',
    'Stern-Gerlach experiment',
    'Spin-up and spin-down states',
    'Measurement along different axes',
    'Spin superposition',
    'Composite quantum systems',
    'Tensor products',
    'Product states',
    'Entangled states',
    'Bell states',
    'Bell inequality - conceptual meaning',
    'No-signalling principle',
    'No-cloning theorem',
  ]),
  module(8, 'Quantum Computing', 'quantum-computing', ...COMPUTING, [
    'Classical bits, binary information and logic gates',
    'Reversible computation',
    'Qubits and computational basis',
    'Measurement probabilities',
    'Bloch sphere',
    'Single-qubit gates: X, Y, Z and H',
    'Phase gates: S and T',
    'Rotation gates',
    'Multiple-qubit states',
    'CNOT and controlled gates',
    'Quantum circuits and Bell-state preparation',
    'Superdense coding',
    'Quantum teleportation',
    'Deutsch and Deutsch-Jozsa algorithms',
    'Bernstein-Vazirani algorithm',
    'Phase kickback',
    'Grover search',
    'Quantum Fourier transform',
    'Shor algorithm - conceptual overview',
  ]),
  module(9, 'Real Quantum Computers', 'real-quantum-computers', ...MACHINES, [
    'Physical qubit implementations',
    'Superconducting qubits',
    'Trapped-ion qubits',
    'Photonic qubits',
    'State preparation and readout',
    'Quantum noise',
    'Decoherence',
    'Gate and measurement errors',
    'Physical and logical qubits',
    'Quantum error correction',
    'NISQ devices',
    'Quantum advantage and present limitations',
  ]),
];

export const ALL_TOPICS: SyllabusTopic[] = SYLLABUS.flatMap((m) => m.topics);

export const getModule = (slug: string): SyllabusModule | undefined =>
  SYLLABUS.find((m) => m.slug === slug);

export const getTopic = (id: string): { module: SyllabusModule; topic: SyllabusTopic } | undefined => {
  for (const m of SYLLABUS) {
    const t = m.topics.find((x) => x.id === id);
    if (t) return { module: m, topic: t };
  }
  return undefined;
};

export const findTopicBySlugs = (moduleSlug: string, topicSlug: string) => {
  const m = getModule(moduleSlug);
  const t = m?.topics.find((x) => x.slug === topicSlug);
  return m && t ? { module: m, topic: t } : undefined;
};

export const topicPath = (moduleSlug: string, topicSlug: string) =>
  `/learn/foundations/${moduleSlug}/${topicSlug}`;

/** The syllabus row before and after a topic, crossing module boundaries. */
export function topicNeighbours(id: string) {
  const i = ALL_TOPICS.findIndex((t) => t.id === id);
  const wrap = (t: SyllabusTopic | undefined) => (t ? { ...getTopic(t.id)!, href: topicPath(getTopic(t.id)!.module.slug, t.slug) } : undefined);
  return { previous: wrap(ALL_TOPICS[i - 1]), next: wrap(ALL_TOPICS[i + 1]) };
}

/**
 * Which questions of the 100-question bank assess which topic.
 *
 * Many-to-many on purpose: Q78 is a wave-speed calculation that ends in a
 * phase, so it belongs to 02.07 and to 01.04. A topic with no entry has no
 * assessment yet, which the index page says out loud.
 */
export const TOPIC_QUESTIONS: Record<string, number[]> = {
  '01.01': [1, 26, 51],
  '01.02': [2, 27, 76, 87],
  '01.03': [8, 32],
  '01.04': [3, 28, 77, 78],
  '01.05': [5, 29, 79],
  '01.06': [6, 30],
  '01.07': [24, 48, 65, 81],
  '01.08': [7, 31, 67, 92],
  '01.09': [8, 32, 52],
  '02.01': [8, 32, 52],
  '02.06': [9, 33, 34, 53, 99],
  '02.07': [10, 54, 56, 78],
  '02.08': [4, 11, 12, 35, 55],
  '02.10': [51],
  '03.01': [14, 100],
  '03.02': [36, 82],
  '03.03': [13, 37],
  '03.04': [15, 16, 17, 38, 39, 40, 41, 58, 59, 60, 61, 83, 84, 85],
  '03.05': [18, 42, 57, 62, 86, 87],
  '03.06': [19, 43],
  '03.07': [20, 44, 63, 88],
  '03.09': [21, 45, 64, 89],
  '03.11': [22, 46, 74, 90],
  '04.02': [23],
  '04.03': [23, 47],
  '04.04': [24, 48, 65, 81],
  '04.05': [73],
  '04.06': [73, 91],
  '04.07': [66, 80, 91],
  '06.09': [68, 69, 70, 71, 93, 94, 95, 97],
  '06.10': [25, 49, 72, 95, 96],
  '09.01': [50, 75, 98],
};

export const questionIdsForTopic = (id: string): number[] => TOPIC_QUESTIONS[id] ?? [];

/** Shape of the figure a lesson embeds — the same registry the quiz draws from. */
export interface FigureSpec {
  animation: AnimationId;
  params?: FigureParams;
}
