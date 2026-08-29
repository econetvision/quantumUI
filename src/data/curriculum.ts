/**
 * 0-to-Quantum-Champion curriculum.
 * Every stage maps QWorld-derived tracks and lab topics to the certification
 * it builds toward: Microsoft Quantum Katas, IBM Qiskit Developer, Google Cirq.
 */

export interface CurriculumStage {
  level: number;
  title: string;
  emoji: string;
  description: string;
  tracks: { slug: string; name: string }[];
  labTopics: string[]; // slugs in lab-questions.json
  certifications: string[];
  outcome: string;
}

export const CERTIFICATIONS = [
  {
    name: 'Microsoft Quantum Katas',
    color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    focus: 'Q# katas: superposition, measurement, entanglement, oracles',
  },
  {
    name: 'IBM Qiskit Developer',
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    focus: 'Certified Associate Developer: circuits, Aer, primitives, visualization',
  },
  {
    name: 'Google Cirq',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    focus: 'Cirq circuits, simulation, NISQ algorithms',
  },
];

export const CURRICULUM: CurriculumStage[] = [
  {
    level: 0,
    title: 'Classical Foundations',
    emoji: '🧮',
    description:
      'Python, complex numbers, vectors and matrices, probabilistic bits — the math you need before the first qubit.',
    tracks: [{ slug: 'quantum-fundamentals', name: 'Quantum Fundamentals (early lessons)' }],
    labTopics: ['quantum-fundamentals'],
    certifications: [],
    outcome: 'Comfortable with the linear algebra and Python behind quantum computing',
  },
  {
    level: 1,
    title: 'Qubits & Superposition',
    emoji: '⚛️',
    description:
      'Quantum states, Dirac notation, the Bloch sphere, measurement, and your first Hadamard.',
    tracks: [{ slug: 'quantum-fundamentals', name: 'Quantum Fundamentals' }],
    labTopics: ['quantum-fundamentals'],
    certifications: ['Microsoft Quantum Katas'],
    outcome: 'Build and measure single-qubit states in the Lab Shell',
  },
  {
    level: 2,
    title: 'Gates & Circuits',
    emoji: '🔀',
    description:
      'Single- and multi-qubit gates, rotations, circuit composition — the working vocabulary of quantum programs.',
    tracks: [{ slug: 'quantum-gates', name: 'Quantum Gates & Circuits' }],
    labTopics: ['quantum-gates'],
    certifications: ['Microsoft Quantum Katas', 'IBM Qiskit Developer'],
    outcome: 'Compose multi-gate circuits and predict their outputs',
  },
  {
    level: 3,
    title: 'Entanglement',
    emoji: '🔗',
    description: 'Bell states, GHZ states, correlation, superdense coding and teleportation.',
    tracks: [
      { slug: 'quantum-entanglement', name: 'Quantum Entanglement' },
      { slug: 'quantum-teleportation-protocols', name: 'Teleportation Protocols' },
    ],
    labTopics: ['quantum-entanglement'],
    certifications: ['Microsoft Quantum Katas'],
    outcome: 'Create entangled states and run the teleportation protocol',
  },
  {
    level: 4,
    title: 'SDK Mastery: Qiskit & Cirq',
    emoji: '🛠️',
    description:
      'The two industry SDKs: Qiskit (IBM) end to end, plus Cirq (Google) circuits and simulation.',
    tracks: [
      { slug: 'qiskit-sdk-deep-dive', name: 'Qiskit SDK Deep Dive' },
      { slug: 'advanced-qiskit-topics', name: 'Advanced Qiskit Topics' },
    ],
    labTopics: ['qiskit-sdk-deep-dive', 'cirq-sdk'],
    certifications: ['IBM Qiskit Developer', 'Google Cirq'],
    outcome: 'Write, transpile and simulate circuits in both Qiskit and Cirq',
  },
  {
    level: 5,
    title: 'Quantum Algorithms',
    emoji: '🧠',
    description:
      'Deutsch-Jozsa, Bernstein-Vazirani, Grover, QFT, phase estimation and Shor — the classics.',
    tracks: [{ slug: 'quantum-algorithms', name: 'Quantum Algorithms' }],
    labTopics: ['quantum-algorithms'],
    certifications: ['IBM Qiskit Developer', 'Google Cirq'],
    outcome: 'Implement search and factoring algorithms from scratch',
  },
  {
    level: 6,
    title: 'Applied Quantum',
    emoji: '🔐',
    description:
      'Quantum cryptography (BB84, E91), error correction, and variational algorithms (VQE/QAOA/QML).',
    tracks: [
      { slug: 'quantum-cryptography-qkd', name: 'Quantum Cryptography & QKD' },
      { slug: 'quantum-error-correction', name: 'Quantum Error Correction' },
      { slug: 'variational-quantum-algorithms', name: 'Variational Quantum Algorithms' },
      { slug: 'quantum-machine-learning', name: 'Quantum Machine Learning' },
    ],
    labTopics: ['quantum-cryptography-qkd', 'quantum-error-correction'],
    certifications: ['IBM Qiskit Developer'],
    outcome: 'Run QKD protocols and protect circuits with error-correcting codes',
  },
  {
    level: 7,
    title: 'Certification & Champion',
    emoji: '🏆',
    description:
      'IBM exam prep with mock exams, capstone Quantum Projects, and deployment to real QpiAI hardware.',
    tracks: [{ slug: 'ibm-cert-exam-prep', name: 'IBM Certification Exam Prep' }],
    labTopics: [],
    certifications: ['Microsoft Quantum Katas', 'IBM Qiskit Developer', 'Google Cirq'],
    outcome: 'Quantum Champion: certified, with deployed capstone projects',
  },
];
