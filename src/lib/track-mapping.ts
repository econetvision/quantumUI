import { TrackDifficulty } from "@prisma/client";

export interface TrackConfig {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: TrackDifficulty;
  order: number;
  labCount: number;
  questionCount: number;
  estimatedHours: number;
  qworldSource: string;
  notebookPatterns: string[]; // Glob patterns to match notebooks
  isPremium: boolean;
}

export const TRACK_CONFIGS: TrackConfig[] = [
  // ===== FREE TRACKS (1-4) =====
  {
    id: 1,
    slug: "quantum-fundamentals",
    title: "Quantum Fundamentals",
    description:
      "Master the basics: qubits, superposition, measurement, Bloch sphere visualization, and Dirac notation.",
    difficulty: TrackDifficulty.BEGINNER,
    order: 1,
    labCount: 8,
    questionCount: 24,
    estimatedHours: 6,
    qworldSource: "qbook101/qbook101",
    notebookPatterns: [
      "**/QB12_IQ*.ipynb", // Intro to quantum mechanics
      "**/QB23_Q*.ipynb", // Basics of quantum systems
      "**/QB31_C01_Complex*.ipynb",
      "**/QB32_C*.ipynb", // Bloch sphere
    ],
    isPremium: false,
  },

  {
    id: 2,
    // Must match the lesson data file (src/data/lessons/quantum-gates.json)
    // and the track detail route — this was the only slug that disagreed.
    slug: "quantum-gates",
    title: "Quantum Gates & Circuits",
    description:
      "Learn Pauli gates (X, Y, Z), Hadamard, Phase gates, CNOT, Toffoli, and build circuits in Qiskit.",
    difficulty: TrackDifficulty.BEGINNER,
    order: 2,
    labCount: 10,
    questionCount: 32,
    estimatedHours: 8,
    qworldSource: "qbook101/qbook101",
    notebookPatterns: [
      "**/QB24_Q*.ipynb", // Quantum operators
      "**/QB33_C*.ipynb", // Complex-valued quantum operators
      "**/QB41_A01*.ipynb", // Classical gates
    ],
    isPremium: false,
  },

  {
    id: 3,
    slug: "qiskit-sdk-deep-dive",
    title: "Qiskit SDK Deep Dive",
    description:
      "Master QuantumCircuit, transpiler, simulators, noise models, and IBM Quantum backend access.",
    difficulty: TrackDifficulty.INTERMEDIATE,
    order: 3,
    labCount: 12,
    questionCount: 40,
    estimatedHours: 10,
    qworldSource: "qbook101/appendices/C_qiskit",
    notebookPatterns: [
      "**/QB_C*.ipynb", // Qiskit appendix
      "**/QB22_Photon*.ipynb", // Photons
    ],
    isPremium: false,
  },

  {
    id: 4,
    slug: "quantum-entanglement",
    title: "Quantum Entanglement",
    description: "Explore Bell states, EPR paradox, GHZ states, and entanglement entropy.",
    difficulty: TrackDifficulty.INTERMEDIATE,
    order: 4,
    labCount: 6,
    questionCount: 20,
    estimatedHours: 5,
    qworldSource: "qbook101/qbook101",
    notebookPatterns: [
      "**/QB25_Q60*.ipynb", // Two qubits
      "**/QB25_Q64*.ipynb", // Phase kickback
    ],
    isPremium: false,
  },

  // ===== PRO TRACKS (5-10) =====
  {
    id: 5,
    slug: "quantum-algorithms",
    title: "Quantum Algorithms",
    description:
      "Implement Deutsch-Jozsa, Bernstein-Vazirani, Simon's, Grover's search, QFT, Shor's factoring.",
    difficulty: TrackDifficulty.ADVANCED,
    order: 5,
    labCount: 8,
    questionCount: 28,
    estimatedHours: 12,
    qworldSource: "qbook101/qbook101",
    notebookPatterns: [
      "**/QB43_A*.ipynb", // Conventional quantum algorithms
      "**/QB42_Q*.ipynb", // Grover's search
      "**/QB51_D*.ipynb", // QFT
      "**/QB52_D*.ipynb", // Shor's algorithm
    ],
    isPremium: true,
  },

  {
    id: 6,
    slug: "quantum-teleportation-protocols",
    title: "Quantum Teleportation & Protocols",
    description: "Master quantum teleportation, superdense coding, and quantum communication protocols.",
    difficulty: TrackDifficulty.ADVANCED,
    order: 6,
    labCount: 5,
    questionCount: 16,
    estimatedHours: 6,
    qworldSource: "qbook101/qbook101",
    notebookPatterns: ["**/QB25_Q72*.ipynb", "**/QB25_Q76*.ipynb", "**/QB25_Q80*.ipynb"],
    isPremium: true,
  },

  {
    id: 7,
    slug: "quantum-error-correction",
    title: "Quantum Error Correction",
    description: "Learn error correction codes, stabilizer formalism, and fault-tolerant quantum computing.",
    difficulty: TrackDifficulty.EXPERT,
    order: 7,
    labCount: 5,
    questionCount: 16,
    estimatedHours: 8,
    qworldSource: "qec",
    notebookPatterns: ["**/*.ipynb"],
    isPremium: true,
  },

  {
    id: 8,
    slug: "quantum-cryptography-qkd",
    title: "Quantum Cryptography / QKD",
    description: "Explore BB84, E91 protocols, quantum key distribution, and quantum security.",
    difficulty: TrackDifficulty.ADVANCED,
    order: 8,
    labCount: 6,
    questionCount: 20,
    estimatedHours: 7,
    qworldSource: "qkd",
    notebookPatterns: ["**/*.ipynb"],
    isPremium: true,
  },

  {
    id: 9,
    slug: "variational-quantum-algorithms",
    title: "Variational Quantum Algorithms",
    description: "Master VQE, QAOA, and hybrid quantum-classical optimization algorithms.",
    difficulty: TrackDifficulty.EXPERT,
    order: 9,
    labCount: 6,
    questionCount: 18,
    estimatedHours: 9,
    qworldSource: "silver-qcourse511",
    notebookPatterns: ["**/VQE*.ipynb", "**/QAOA*.ipynb"],
    isPremium: true,
  },

  {
    id: 10,
    slug: "quantum-machine-learning",
    title: "Quantum Machine Learning",
    description: "Quantum neural networks, quantum feature maps, and quantum-enhanced ML.",
    difficulty: TrackDifficulty.EXPERT,
    order: 10,
    labCount: 6,
    questionCount: 18,
    estimatedHours: 10,
    qworldSource: "silver-qcourse511",
    notebookPatterns: ["**/QML*.ipynb", "**/Quantum*ML*.ipynb"],
    isPremium: true,
  },

  // ===== ENTERPRISE TRACKS (11-12) =====
  {
    id: 11,
    slug: "advanced-qiskit-topics",
    title: "Advanced Qiskit Topics",
    description: "Deep dive into advanced Qiskit techniques, noise models, circuit optimization, and best practices.",
    difficulty: TrackDifficulty.EXPERT,
    order: 11,
    labCount: 7,
    questionCount: 22,
    estimatedHours: 8,
    qworldSource: "qnickel-qcourse511-2",
    notebookPatterns: ["**/advanced*.ipynb", "**/noise*.ipynb", "**/optimization*.ipynb"],
    isPremium: true,
  },

  {
    id: 12,
    slug: "ibm-cert-exam-prep",
    title: "IBM Cert Exam Prep",
    description:
      "60-question timed mock exams aligned with IBM Qiskit Developer Certification exam blueprint.",
    difficulty: TrackDifficulty.EXPERT,
    order: 12,
    labCount: 0, // Exam-focused, no labs
    questionCount: 60,
    estimatedHours: 15,
    qworldSource: "",
    notebookPatterns: [],
    isPremium: true,
  },
];

export const IBM_EXAM_TOPICS = [
  {
    topic: "Performing operations on quantum circuits",
    weight: 47,
    subtopics: [
      "Build quantum circuits with multi-qubit gates",
      "Construct operators from gates and linear algebra",
      "Apply barrier, measure, and reset operations",
      "Compose and manipulate circuits",
    ],
  },
  {
    topic: "Executing quantum circuits and representing quantum states",
    weight: 20,
    subtopics: [
      "Execute circuits on quantum simulators",
      "Interpret measurement results",
      "Represent quantum states using statevector",
      "Use visualization tools",
    ],
  },
  {
    topic: "Using the transpiler",
    weight: 13,
    subtopics: [
      "Understand transpilation process",
      "Set optimization levels",
      "Analyze transpiled circuits",
      "Use custom transpiler passes",
    ],
  },
  {
    topic: "Working with Quantum Backends",
    weight: 10,
    subtopics: [
      "Select appropriate backends and simulators",
      "Submit and monitor jobs",
      "Retrieve and analyze results",
      "Handle backend properties and noise",
    ],
  },
  {
    topic: "Other Qiskit SDK features",
    weight: 10,
    subtopics: [
      "Use primitives (Sampler, Estimator)",
      "Apply error mitigation techniques",
      "Work with quantum info module",
      "Use runtime programs",
    ],
  },
];
