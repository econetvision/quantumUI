/**
 * Concept diagrams per track.
 *
 * Files are placed under `public/images/lesson-images/<slug>/` by
 * `scripts/sync-track-images.py`; this manifest gives each one the alt text and
 * caption the UI needs. Keep the two in step — the script owns *which* files
 * exist, this file owns *how they are described*.
 *
 * Alt text describes the diagram's content for screen readers; the caption is
 * the teaching note shown beneath it. They are deliberately different.
 *
 * Tracks absent from this manifest have no diagrams on purpose — see
 * DELIBERATE_GAPS in the sync script for the reason in each case.
 */

export interface TrackImage {
  /** Path under /public. */
  src: string;
  alt: string;
  caption: string;
}

export interface TrackImagery {
  /** Hero image for the track header, if one exists. */
  overview?: string;
  /** Concept diagrams shown in the track's gallery. */
  gallery: TrackImage[];
}

const dir = (slug: string, file: string) =>
  `/images/lesson-images/${slug}/${file}`;

export const TRACK_IMAGERY: Record<string, TrackImagery> = {
  'quantum-fundamentals': {
    overview: '/images/animated/quantum-fundamentals.gif',
    gallery: [
      {
        src: dir('quantum-fundamentals', 'classical-vs-quantum-bit.png'),
        alt: 'A classical bit shown as 0 or 1 beside a qubit shown as a superposition of both',
        caption: 'A bit is one of two values. A qubit is a combination of both until measured.',
      },
      {
        src: dir('quantum-fundamentals', 'bloch-sphere-intro.png'),
        alt: 'The Bloch sphere with the |0⟩ state at the north pole and |1⟩ at the south pole',
        caption: 'Every pure single-qubit state is a point on the surface of the Bloch sphere.',
      },
      {
        src: dir('quantum-fundamentals', 'spinning-coin-superposition.png'),
        alt: 'A spinning coin used as an analogy for a qubit in superposition',
        caption: 'The spinning-coin analogy: not secretly heads or tails, but genuinely both.',
      },
      {
        src: dir('quantum-fundamentals', 'amplitude-to-probability.svg'),
        alt: 'Diagram showing a probability amplitude being squared to give a measurement probability',
        caption: 'Probability is the square of the amplitude — which is why negative amplitudes matter.',
      },
      {
        src: dir('quantum-fundamentals', 'wave-interference.png'),
        alt: 'Two waves interfering constructively and destructively',
        caption: 'Amplitudes can cancel. Interference is what separates quantum from random.',
      },
    ],
  },

  'quantum-gates': {
    overview: '/images/animated/quantum-gates.gif',
    gallery: [
      {
        src: dir('quantum-gates', 'pauli-x-bloch.png'),
        alt: 'The Pauli-X gate shown as a 180 degree rotation about the X axis of the Bloch sphere',
        caption: 'Pauli-X is a half turn about the X axis — the quantum NOT.',
      },
      {
        src: dir('quantum-gates', 'hadamard-bloch.png'),
        alt: 'The Hadamard gate mapping the |0⟩ state to the |+⟩ state on the Bloch sphere',
        caption: 'Hadamard moves |0⟩ to the equator, creating an even superposition.',
      },
      {
        src: dir('quantum-gates', 'rotation-gates.png'),
        alt: 'Rx, Ry and Rz rotation gates shown as rotations about each Bloch sphere axis',
        caption: 'Rx, Ry and Rz rotate by any angle — the continuous gates behind variational circuits.',
      },
      {
        src: dir('quantum-gates', 'cnot-circuit.png'),
        alt: 'A CNOT gate circuit with a filled control dot and a target',
        caption: 'CNOT flips the target only when the control is |1⟩.',
      },
      {
        src: dir('quantum-gates', 'toffoli-circuit.png'),
        alt: 'A Toffoli gate circuit with two control qubits and one target',
        caption: 'Toffoli (CCX) needs both controls set — it makes quantum logic universal.',
      },
      {
        src: dir('quantum-gates', 'phase-gates-st.png'),
        alt: 'The S and T phase gates shown on the Bloch sphere',
        caption: 'S and T add phase without changing measurement probabilities in the Z basis.',
      },
    ],
  },

  'quantum-entanglement': {
    overview: '/images/animated/quantum-entanglement.gif',
    gallery: [
      {
        src: dir('quantum-entanglement', 'bell-states-visual.png'),
        alt: 'The four Bell states written out in Dirac notation',
        caption: 'The four maximally entangled two-qubit states form the Bell basis.',
      },
      {
        src: dir('quantum-entanglement', 'bell-circuits.png'),
        alt: 'Circuits preparing each of the four Bell states from Hadamard and CNOT gates',
        caption: 'Every Bell state is a Hadamard and a CNOT, differing only in the input.',
      },
      {
        src: dir('quantum-entanglement', 'epr-concept.png'),
        alt: 'Two separated observers measuring an entangled pair',
        caption: 'The EPR setup: correlated outcomes no matter how far apart the qubits are.',
      },
      {
        src: dir('quantum-entanglement', 'chsh-inequality.png'),
        alt: 'The CHSH inequality bound with classical and quantum limits marked',
        caption: 'CHSH: quantum correlations exceed what any local hidden-variable theory allows.',
      },
      {
        src: dir('quantum-entanglement', 'ghz-w-states.png'),
        alt: 'GHZ and W state structures compared for three qubits',
        caption: 'GHZ shatters when one qubit is lost; W keeps its entanglement.',
      },
    ],
  },

  'quantum-algorithms': {
    gallery: [
      {
        src: dir('quantum-algorithms', 'grover-circuit.png'),
        alt: 'Grover search circuit: Hadamards, then repeated oracle and diffusion operator blocks, then measurement',
        caption: "Grover's structure: prepare, then repeat oracle + diffusion about √N times.",
      },
      {
        src: dir('quantum-algorithms', 'grover-first-reflection.jpg'),
        alt: 'Amplitude bar chart after the oracle flips the sign of the marked item',
        caption: 'Step 1 — the oracle marks the target by flipping its amplitude negative.',
      },
      {
        src: dir('quantum-algorithms', 'grover-second-reflection.jpg'),
        alt: 'Amplitude bar chart after reflection about the mean amplifies the marked item',
        caption: 'Step 2 — reflecting about the mean amplifies exactly that amplitude.',
      },
      {
        src: dir('quantum-algorithms', 'grover-diffusion-operator.png'),
        alt: 'Gate-level decomposition of the Grover diffusion operator',
        caption: 'The diffusion operator built from Hadamards and a multi-controlled Z.',
      },
      {
        src: dir('quantum-algorithms', 'deutsch-jozsa-circuit.png'),
        alt: 'Deutsch-Jozsa circuit with an n-qubit input register and a single ancilla',
        caption: 'Deutsch-Jozsa settles constant vs balanced in one query instead of 2ⁿ⁻¹+1.',
      },
      {
        src: dir('quantum-algorithms', 'phase-kickback.png'),
        alt: 'Diagram showing phase from a controlled operation appearing on the control qubit',
        caption: 'Phase kickback — the mechanism shared by Deutsch-Jozsa, Grover and QPE.',
      },
      {
        src: dir('quantum-algorithms', 'simon-circuit.png'),
        alt: "Simon's algorithm circuit with two registers and an oracle between Hadamard layers",
        caption: "Simon's exponential separation — the result that inspired Shor.",
      },
    ],
  },

  'quantum-teleportation-protocols': {
    gallery: [
      {
        src: dir('quantum-teleportation-protocols', 'teleportation-qubit-roles.png'),
        alt: 'Three qubit wires labelled as the message, the sender half of an entangled pair, and the receiver half',
        caption: 'Teleportation needs three qubits: the message, and one half each of a shared pair.',
      },
      {
        src: dir('quantum-teleportation-protocols', 'superdense-coding.jpg'),
        alt: 'Superdense coding protocol sending two classical bits using one qubit',
        caption: 'Superdense coding is teleportation run backwards: two classical bits in one qubit.',
      },
    ],
  },

  'quantum-cryptography-qkd': {
    gallery: [
      {
        src: dir('quantum-cryptography-qkd', 'bb84-protocol.jpg'),
        alt: 'Full BB84 protocol flowchart across quantum and classical channels between two parties',
        caption: 'BB84 end to end — the quantum channel carries qubits, the classical one carries bases.',
      },
      {
        src: dir('quantum-cryptography-qkd', 'measurement-bases.jpg'),
        alt: 'The rectilinear and diagonal measurement bases used to encode bits',
        caption: 'Two bases, chosen at random. Measuring in the wrong one destroys the information.',
      },
      {
        src: dir('quantum-cryptography-qkd', 'bb84-sifting.png'),
        alt: 'Sifting step where rounds with mismatched bases are discarded',
        caption: 'Sifting: keep only the rounds where both parties happened to pick the same basis.',
      },
      {
        src: dir('quantum-cryptography-qkd', 'bb84-with-noise.jpg'),
        alt: 'BB84 with channel noise raising the observed error rate',
        caption: 'Noise and eavesdropping look alike — which is exactly what makes BB84 secure.',
      },
      {
        src: dir('quantum-cryptography-qkd', 'e91-protocol.jpg'),
        alt: 'E91 protocol using entangled pairs and a Bell inequality test',
        caption: 'E91 replaces prepared qubits with entanglement, and tests CHSH to detect tampering.',
      },
    ],
  },

  'variational-quantum-algorithms': {
    gallery: [
      {
        src: dir('variational-quantum-algorithms', 'maxcut-graph.png'),
        alt: 'An uncoloured four-vertex graph posed as a MaxCut problem',
        caption: 'MaxCut: split the vertices into two sets cutting as many edges as possible.',
      },
      {
        src: dir('variational-quantum-algorithms', 'maxcut-solution-1.png'),
        alt: 'The same graph with vertices two-coloured red and blue',
        caption: 'A candidate cut. QAOA searches this space by tuning circuit angles.',
      },
      {
        src: dir('variational-quantum-algorithms', 'maxcut-solution-2.png'),
        alt: 'An alternative two-colouring of the same graph',
        caption: 'A different cut — the optimiser is choosing between assignments like these.',
      },
      {
        src: dir('variational-quantum-algorithms', 'travelling-salesman.png'),
        alt: 'A travelling salesman routing problem drawn as a weighted graph',
        caption: 'The same variational machinery attacks routing and scheduling problems.',
      },
    ],
  },

  'advanced-qiskit-topics': {
    gallery: [
      {
        src: dir('advanced-qiskit-topics', 'fredkin-gate.png'),
        alt: 'The Fredkin controlled-swap gate circuit',
        caption: 'Fredkin (CSWAP) — reversible, and the basis of the swap test.',
      },
      {
        src: dir('advanced-qiskit-topics', 'quantum-half-adder.png'),
        alt: 'A quantum half adder built from CNOT and Toffoli gates',
        caption: 'Classical arithmetic rebuilt reversibly from CNOT and Toffoli.',
      },
      {
        src: dir('advanced-qiskit-topics', 'oracle-operator.png'),
        alt: 'A black-box oracle operator acting on input and output registers',
        caption: 'Oracles turn a classical function into a reversible quantum operation.',
      },
      {
        src: dir('advanced-qiskit-topics', 'function-circuit.png'),
        alt: 'Circuit implementing a boolean function as a reversible quantum operation',
        caption: 'Implementing f(x) in-circuit — the step most algorithm write-ups skip.',
      },
    ],
  },
};

/**
 * Concept figures generated individually via GPAI.
 *
 * These figures were previously a single 384x384 animated grid shown once on
 * /tracks — about 96px per concept, unreadable, and attached to no particular
 * track. They are now full-resolution figures filed under the track that
 * teaches each one. Written by `scripts/import_concept_figures.py`.
 */
import conceptFigures from '@/data/concept-figures.json';

interface ConceptBank {
  generatedBy: string;
  tracks: Record<string, TrackImage[]>;
}

const CONCEPTS = (conceptFigures as ConceptBank).tracks ?? {};

/**
 * Imagery for a track, or null when it deliberately has none.
 *
 * Hand-made gallery entries come first, then the generated concept figures, so
 * the curated ordering is preserved and generated material extends it rather
 * than displacing it.
 */
export function getTrackImagery(slug: string): TrackImagery | null {
  const curated = TRACK_IMAGERY[slug];
  const generated = CONCEPTS[slug] ?? [];

  if (!curated && generated.length === 0) return null;

  const seen = new Set((curated?.gallery ?? []).map((image) => image.src));
  return {
    overview: curated?.overview,
    gallery: [
      ...(curated?.gallery ?? []),
      ...generated.filter((image) => !seen.has(image.src)),
    ],
  };
}
