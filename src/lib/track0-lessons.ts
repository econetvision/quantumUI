/**
 * Track 0 lesson content.
 *
 * Data, not MDX. Each lesson carries three tiers of prose and names the
 * interactive it embeds; the page composes them. Keeping it as typed data
 * means the coverage audit in docs/track0-coverage.md can be checked
 * mechanically, and a lesson cannot silently ship with a tier missing.
 *
 * Tiers are cumulative depth, not three rewrites. `student` extends the kid
 * story with notation; `professional` answers what it costs and where it
 * breaks. A lesson may omit a tier and ModeSwitch falls back down the chain.
 */

export type InteractiveId =
  | 'binary-name-tag'
  | 'spinning-coin'
  | 'sorting-game'
  | 'none';

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Shown after a wrong pick — a nudge, never a failure. */
  hint: string;
}

export interface LessonTier {
  /** Short lead paragraph. */
  intro: string;
  /** Body points. KaTeX allowed in student/professional via `math` blocks. */
  points: string[];
  /** Optional display equations, LaTeX source without delimiters. */
  math?: string[];
}

export interface Track0Lesson {
  slug: string;
  order: number;
  title: string;
  /** One line under the title, tuned for the kid tier. */
  tagline: string;
  emoji: string;
  minutes: number;
  interactive: InteractiveId;
  kid: LessonTier;
  student?: LessonTier;
  professional?: LessonTier;
  quiz: QuizQuestion[];
  /** Deep link into the advanced curriculum, shown in student+ tiers. */
  bridge?: { label: string; href: string };
}

export const TRACK0_LESSONS: Track0Lesson[] = [
  {
    slug: 'light-switch-world',
    order: 1,
    title: 'The Light Switch World',
    tagline: 'Everything your phone knows is made of tiny switches.',
    emoji: '💡',
    minutes: 8,
    interactive: 'binary-name-tag',
    kid: {
      intro:
        'A bit is like a light switch. It is either ON or OFF — never both, never in between. That is the whole idea.',
      points: [
        'ON means 1. OFF means 0. There is nothing else a switch can be.',
        'Your games, photos and songs are millions of these switches, flicked in patterns.',
        'Eight switches in a row make one letter. Your name is a row of switches.',
        'Nothing here is magic yet — that comes next, when the switch learns a new trick.',
      ],
    },
    student: {
      intro:
        'A classical bit is a two-level physical system with a definite state at all times: a voltage that is high or low, a magnetic domain up or down.',
      points: [
        'The state is deterministic. Read it twice, get the same answer twice, and reading does not disturb it.',
        'Logic gates are functions on bits. AND and OR take two bits to one; NOT takes one to one.',
        'Most classical gates are irreversible: knowing the output of AND does not recover its inputs.',
        'Eight bits make a byte, 2^10 bytes a kilobyte, and the exponents are why storage grew so fast.',
      ],
      math: ['\\text{AND}(1,1)=1 \\quad \\text{OR}(0,1)=1 \\quad \\text{NOT}(0)=1'],
    },
    professional: {
      intro:
        'The interesting property of a classical bit is not that it is 0 or 1 — it is that erasing it costs energy.',
      points: [
        'Landauer: erasing one bit dissipates at least kT ln 2 of heat. Irreversible computation has a thermodynamic floor.',
        'Quantum gates are unitary and therefore reversible, so they sit below that floor — the energy argument is one reason reversibility matters, not a footnote.',
        'Modern CMOS runs many orders of magnitude above the Landauer limit, so this is not yet the binding constraint in classical hardware.',
      ],
      math: ['E_{\\min} = k_B T \\ln 2 \\approx 2.8 \\times 10^{-21}\\,\\text{J at room temperature}'],
    },
    quiz: [
      {
        q: 'How many values can one classical bit hold at the same time?',
        options: ['One', 'Two', 'Infinitely many'],
        answer: 0,
        hint: 'A light switch is either on or off — it cannot be both while you look at it.',
      },
      {
        q: 'What does a bit set to ON usually mean?',
        options: ['0', '1', 'Maybe'],
        answer: 1,
        hint: 'ON is the "yes" value.',
      },
      {
        q: 'How many bits are in one byte?',
        options: ['4', '8', '16'],
        answer: 1,
        hint: 'It is the number that makes one letter of text.',
      },
    ],
    bridge: { label: 'Classical logic in Track 1', href: '/tracks/quantum-fundamentals' },
  },

  {
    slug: 'meet-the-qubit',
    order: 2,
    title: 'Meet the Qubit',
    tagline: 'A magic coin that is heads AND tails while it spins.',
    emoji: '🪙',
    minutes: 10,
    interactive: 'spinning-coin',
    kid: {
      intro:
        'A qubit is a magic coin. While it spins, it is heads and tails at the same time. Only when you catch it does it pick one.',
      points: [
        'Spinning = superposition. Catching = measuring.',
        'You cannot peek without catching. Looking is what makes it choose.',
        'Catch it once and you get one answer. Catch it a hundred times and you see a pattern.',
        'That pattern is the coin telling you how it was spinning — chances, not certainties.',
      ],
    },
    student: {
      intro:
        'A qubit is a normalised vector in a two-dimensional complex space, written in the computational basis as a combination of |0⟩ and |1⟩.',
      points: [
        'α and β are complex amplitudes, not probabilities. Probability is the squared magnitude.',
        'Normalisation is what makes the outcome probabilities sum to one, so it is a physical requirement rather than bookkeeping.',
        'Global phase is unobservable: |ψ⟩ and e^{iγ}|ψ⟩ differ by a factor no measurement can see, so they are the same physical state.',
        'Superposition is why algorithms like Shor and Grover exist at all — they operate on all basis states at once.',
      ],
      math: [
        '\\ket{\\psi} = \\alpha\\ket{0} + \\beta\\ket{1}',
        '|\\alpha|^2 + |\\beta|^2 = 1',
        '\\ket{\\psi} = \\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}',
      ],
    },
    professional: {
      intro:
        'A pure state is the easy case. Real hardware gives you a mixed state almost immediately, and the vector picture stops being enough.',
      points: [
        'Decoherence: T1 is energy relaxation toward |0⟩, T2 is dephasing. Superconducting qubits sit in the tens-to-hundreds of microseconds.',
        'Useful circuit depth is bounded by coherence time divided by gate time — a few thousand gates on good hardware, far fewer in practice.',
        'A mixed state needs a density matrix; the state vector cannot express classical uncertainty about which pure state you hold.',
        'This is why "how many qubits" is the wrong headline number. Fidelity and coherence bound what those qubits can actually run.',
      ],
      math: ['\\rho = \\sum_i p_i \\ket{\\psi_i}\\bra{\\psi_i}'],
    },
    quiz: [
      {
        q: 'While the magic coin is spinning, what is it?',
        options: ['Only heads', 'Only tails', 'Both at once'],
        answer: 2,
        hint: 'That is the whole trick — it does not choose until you catch it.',
      },
      {
        q: 'When does a qubit pick a single answer?',
        options: ['When you measure it', 'Never', 'When you spin it'],
        answer: 0,
        hint: 'Catching the coin is measuring it.',
      },
      {
        q: 'If a qubit has amplitudes with |α|² = 0.75, how often do you expect to measure 0?',
        options: ['About a quarter of the time', 'About three quarters', 'Always'],
        answer: 1,
        hint: 'The probability is the squared magnitude of the amplitude.',
      },
    ],
    bridge: { label: 'Run real qubits in Track 1', href: '/tracks/quantum-fundamentals' },
  },

  {
    slug: 'bit-vs-qubit',
    order: 3,
    title: 'Bit vs Qubit',
    tagline: 'One does one thing at a time. The other holds every option.',
    emoji: '⚖️',
    minutes: 9,
    interactive: 'sorting-game',
    kid: {
      intro:
        'Now you have met both. A switch is steady and sure. A coin is spinning and full of maybes. They are good at completely different jobs.',
      points: [
        'A switch is one answer at a time. A coin holds every answer until you catch it.',
        'Switches do not mind noise. Coins are shy — a bump makes them fall over.',
        'Your laptop is made of switches. A quantum computer is made of coins.',
        'Neither is better. You would not use a hammer to paint a wall.',
      ],
    },
    student: {
      intro:
        'The differences are structural, not a matter of speed. A qubit register holds a superposition over 2ⁿ basis states where n classical bits hold exactly one.',
      points: [
        'State: one of 2ⁿ values, versus a normalised complex vector over all 2ⁿ.',
        'Gates: AND/OR/NOT and mostly irreversible, versus unitary and always reversible.',
        'Output: deterministic, versus probabilistic and usually needing repeated shots.',
        'Noise: classical bits are restored at every gate; quantum states decohere and cannot be copied to check.',
      ],
    },
    professional: {
      intro:
        'The 2ⁿ headline is the most over-quoted number in the field. It describes the state space, not the accessible answer.',
      points: [
        'Measurement returns n classical bits, not 2ⁿ amplitudes. Advantage requires interference that concentrates amplitude on the answer you want.',
        'Known speedups are narrow: exponential for factoring and simulation, quadratic for unstructured search. There is no general speedup.',
        'No-cloning forbids the copy-and-vote error correction classical hardware relies on; surface codes cost roughly a thousand physical qubits per logical one.',
        'For most workloads a classical machine is and will remain the correct tool.',
      ],
    },
    quiz: [
      {
        q: 'Which one can hold many possibilities at the same time?',
        options: ['The light switch', 'The magic coin', 'Both'],
        answer: 1,
        hint: 'Only the spinning one keeps its options open.',
      },
      {
        q: 'Which is more upset by noise and bumps?',
        options: ['The qubit', 'The classical bit', 'Neither'],
        answer: 0,
        hint: 'Think about which one has to be kept extremely cold.',
      },
      {
        q: 'How many basis states does a 3-qubit register span?',
        options: ['3', '6', '8'],
        answer: 2,
        hint: 'Each qubit doubles the count: 2 × 2 × 2.',
      },
    ],
    bridge: { label: 'Compare gate families in Track 2', href: '/tracks/quantum-gates' },
  },
];

export function getLesson(slug: string): Track0Lesson | undefined {
  return TRACK0_LESSONS.find((l) => l.slug === slug);
}

export function lessonNeighbours(slug: string) {
  const i = TRACK0_LESSONS.findIndex((l) => l.slug === slug);
  return {
    previous: i > 0 ? TRACK0_LESSONS[i - 1] : undefined,
    next: i >= 0 && i < TRACK0_LESSONS.length - 1 ? TRACK0_LESSONS[i + 1] : undefined,
  };
}
