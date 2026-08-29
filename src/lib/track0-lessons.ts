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
  | 'measurement-tally'
  | 'entangled-pair'
  | 'gate-lab'
  | 'interference'
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
  {
    slug: 'the-moment-you-look',
    order: 4,
    title: 'The Moment You Look',
    tagline: 'Looking is not free. Looking is what makes it decide.',
    emoji: '👁️',
    minutes: 9,
    interactive: 'measurement-tally',
    kid: {
      intro:
        'The spinning coin is both at once — until you look. Looking is the thing that makes it pick. And once it has picked, it stays picked.',
      points: [
        'While it spins it is both. The moment you look, it becomes one: heads or tails, never both.',
        'You cannot look gently. There is no way to peek without making it decide.',
        'Look again straight away and you get the same answer. The picking only happens once.',
        'You cannot control which one it picks. You can only change how often each one wins.',
      ],
    },
    student: {
      intro:
        'Measurement projects the state onto one basis vector and renormalises. It is not a passive read — it is the only place where the deterministic evolution of a quantum state stops being deterministic.',
      points: [
        'The Born rule gives the probability of each outcome as the squared magnitude of its amplitude.',
        'After measuring, the state is the outcome you got. The other amplitude is gone, not hidden.',
        'Immediately re-measuring in the same basis returns the same result with probability 1 — measurement is idempotent in its own basis.',
        'Measuring in a different basis is a different question, and can give a random answer to a state that was certain a moment ago.',
      ],
      math: [
        'P(0) = |\\alpha|^2 \\qquad P(1) = |\\beta|^2 \\qquad |\\alpha|^2 + |\\beta|^2 = 1',
        '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle \;\\xrightarrow{\\text{measure } 0}\; |0\\rangle',
      ],
    },
    professional: {
      intro:
        'The projection postulate is a statement about what a measurement does to the state, and it is where every practical difficulty in reading a quantum computer begins.',
      points: [
        'Projective measurement in the computational basis is the special case; the general object is a POVM, and readout hardware implements something closer to that than to a clean projector.',
        'One shot yields one bitstring. Recovering a distribution costs O(1/epsilon^2) shots for precision epsilon, which is why shot count, not gate count, often dominates runtime.',
        'Readout error is asymmetric on most hardware — decay during the measurement window makes 1 read as 0 more often than the reverse — so mitigation matrices are not symmetric either.',
        'Mid-circuit measurement plus feed-forward is the primitive that error correction needs, and it is far harder than terminal measurement because the unmeasured qubits must stay coherent throughout.',
      ],
      math: ['P(m) = \\langle\\psi|M_m^\\dagger M_m|\\psi\\rangle \\qquad |\\psi\'\\rangle = \\frac{M_m|\\psi\\rangle}{\\sqrt{P(m)}}'],
    },
    quiz: [
      {
        q: 'What makes a spinning coin pick heads or tails?',
        options: ['Waiting long enough', 'Looking at it', 'Spinning it harder'],
        answer: 1,
        hint: 'It is the act of checking that forces the choice.',
      },
      {
        q: 'You measure a qubit and get 0. You measure it again immediately. What do you get?',
        options: ['0 again', 'A random answer', 'An error'],
        answer: 0,
        hint: 'The picking already happened. It stays picked.',
      },
      {
        q: 'If the amplitude on |0> has size 0.6, how often do you measure 0?',
        options: ['60% of the time', '36% of the time', 'Always'],
        answer: 1,
        hint: 'Square the amplitude to get the probability: 0.6 x 0.6.',
      },
    ],
    bridge: { label: 'Measurement in Track 1', href: '/tracks/quantum-fundamentals' },
  },
  {
    slug: 'not-a-fair-coin',
    order: 5,
    title: 'Not a Fair Coin',
    tagline: 'You can tilt the odds — and the tilt can be negative.',
    emoji: '🎯',
    minutes: 10,
    interactive: 'gate-lab',
    kid: {
      intro:
        'A real coin is fair: half heads, half tails. A qubit does not have to be. You can tilt it so it lands on 0 nine times out of ten — or almost never.',
      points: [
        'The tilt is part of the qubit, not part of how you throw it.',
        'You set the tilt before you look. After you look it is too late — it has already picked.',
        'A tilt of "all the way to 0" is just an ordinary bit again. Ordinary bits are qubits that gave up.',
        'Here is the strange part: the tilt can be negative, and negative tilts can cancel each other out. Nothing in the ordinary world does that.',
      ],
    },
    student: {
      intro:
        'The two numbers describing a qubit are amplitudes, not probabilities. They are complex, they can be negative, and probability is what you get when you square them.',
      points: [
        'Amplitudes carry a sign and a phase; probabilities do not. Throwing away the phase throws away everything quantum.',
        'Normalisation is the only constraint: the squared magnitudes must sum to 1.',
        'Global phase is unobservable — multiplying the whole state by a unit complex number changes no measurement outcome.',
        'Relative phase between the two terms is very observable, and is what makes interference possible.',
      ],
      math: [
        '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad \\alpha,\\beta \\in \\mathbb{C}',
        '|\\psi\\rangle = \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle',
      ],
    },
    professional: {
      intro:
        'Two complex numbers minus normalisation minus global phase leaves two real parameters — which is why a pure single-qubit state is a point on a sphere and not in a four-dimensional space.',
      points: [
        'The Bloch sphere is a faithful picture for one pure qubit and actively misleading for two: it cannot show entanglement, and a maximally entangled qubit sits at the centre with zero length.',
        'Mixed states need a density matrix. The distinction between a superposition and a statistical mixture is the off-diagonal terms, and those are exactly what decoherence destroys.',
        'Single-qubit gates are rotations of the sphere, so any of them factors into at most three rotations about two axes — the basis of every hardware transpiler.',
        'Phase is not a bookkeeping convention. Algorithms encode answers in relative phase and convert phase back to amplitude before measuring; nothing else about the state is readable.',
      ],
      math: ['\\rho = \\frac{1}{2}\\left(I + r_x X + r_y Y + r_z Z\\right), \\qquad |\\vec{r}| \\le 1'],
    },
    quiz: [
      {
        q: 'A qubit has amplitude 0.8 on |0>. What is the chance of measuring 0?',
        options: ['80%', '64%', '40%'],
        answer: 1,
        hint: 'Square it: 0.8 x 0.8 = 0.64.',
      },
      {
        q: 'What can amplitudes do that probabilities cannot?',
        options: ['Be negative', 'Add up to 1', 'Be measured directly'],
        answer: 0,
        hint: 'This is the property that lets two paths cancel.',
      },
      {
        q: 'A qubit whose amplitude sits entirely on |0> behaves like what?',
        options: ['An ordinary bit', 'A fair coin', 'An error'],
        answer: 0,
        hint: 'No uncertainty left — it always gives the same answer.',
      },
    ],
    bridge: { label: 'Amplitudes and the Bloch sphere', href: '/tracks/quantum-fundamentals' },
  },
  {
    slug: 'the-impossible-pair',
    order: 6,
    title: 'The Impossible Pair',
    tagline: 'Two coins that always agree — without either one deciding first.',
    emoji: '🔗',
    minutes: 11,
    interactive: 'entangled-pair',
    kid: {
      intro:
        'Make two magic coins together in the right way and something impossible happens. Look at one and it picks at random. Look at the other and it always matches. Every single time, however far apart they are.',
      points: [
        'Neither coin decided in advance. If they had, you could open one, and the answer would have been sitting there all along.',
        'It is not a message. The first coin still picks at random, so you cannot send anything by choosing what you get.',
        'You cannot describe one coin on its own any more. The pair has a description; the halves do not.',
        'Einstein hated this and called it spooky. He was right that it is strange, and wrong that it does not happen.',
      ],
    },
    student: {
      intro:
        'An entangled state is one that cannot be written as a product of single-qubit states. That is the whole definition, and everything surprising follows from it.',
      points: [
        'The Bell state (|00> + |11>)/sqrt(2) has no factorisation into two independent qubits — try it and the algebra refuses.',
        'Each qubit measured alone is uniformly random. The correlation lives in the pair, not in either half.',
        'Measuring one determines the other instantly, but the outcome is random, so no information travels — no-communication holds.',
        'Bell inequalities make this testable: no theory where the answers were fixed in advance can reproduce the observed correlations, and experiment agrees with quantum mechanics.',
      ],
      math: [
        '|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}\\left(|00\\rangle + |11\\rangle\\right)',
        '|\\Phi^+\\rangle \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle \\quad \\text{for any } |\\psi_A\\rangle, |\\psi_B\\rangle',
      ],
    },
    professional: {
      intro:
        'Entanglement is a resource with a cost, a lifetime and an exchange rate, and treating it as a curiosity rather than as inventory is how people mis-plan quantum systems.',
      points: [
        'Tracing out one half of a Bell pair leaves the maximally mixed state — maximal entanglement means maximal local ignorance, which is why the Bloch vector has zero length.',
        'It is monogamous: a qubit maximally entangled with one partner cannot be correlated with a third at all. This constrains network topology, not just intuition.',
        'Two-qubit gate error dominates hardware error budgets, typically by an order of magnitude over single-qubit gates, and entangling gates are the expensive ones.',
        'Entanglement alone is not speedup. Gottesman-Knill: stabiliser circuits can be massively entangled and are still classically simulable in polynomial time.',
      ],
      math: ['\\rho_A = \\operatorname{Tr}_B\\left(|\\Phi^+\\rangle\\langle\\Phi^+|\\right) = \\tfrac{1}{2}I'],
    },
    quiz: [
      {
        q: 'You measure one entangled coin and get heads. What does the other give?',
        options: ['Heads', 'Tails', 'Random'],
        answer: 0,
        hint: 'In this pair they always agree.',
      },
      {
        q: 'Can you use an entangled pair to send a message faster than light?',
        options: ['Yes', 'No', 'Only over short distances'],
        answer: 1,
        hint: 'Your own outcome is random, so you cannot choose what the other person sees.',
      },
      {
        q: 'What is true of an entangled pair?',
        options: [
          'Each qubit has its own complete description',
          'Only the pair has a complete description',
          'They are just copies of each other',
        ],
        answer: 1,
        hint: 'The information lives in the relationship, not in the halves.',
      },
    ],
    bridge: { label: 'Entanglement in depth', href: '/tracks/quantum-entanglement' },
  },
  {
    slug: 'moves-you-can-make',
    order: 7,
    title: 'Moves You Can Make',
    tagline: 'Every quantum move can be undone. That is the rule.',
    emoji: '🎛️',
    minutes: 10,
    interactive: 'gate-lab',
    kid: {
      intro:
        'A gate is a move you make on a qubit. Flip it. Put it in a spin. Nudge its tilt. There are only a few basic moves, and everything else is made of them.',
      points: [
        'X is the flip: 0 becomes 1, 1 becomes 0. The same move a plain computer makes.',
        'H is the spinner: it takes a settled qubit and puts it exactly half and half.',
        'Z leaves the odds alone and changes the hidden sign — which sounds useless until two paths meet.',
        'Every quantum move can be run backwards to undo it. There is no quantum move that forgets.',
      ],
    },
    student: {
      intro:
        'Gates are unitary matrices. Unitarity is the whole constraint, and it is what makes every quantum operation reversible.',
      points: [
        'X, Y and Z are the Pauli matrices; H maps the computational basis to the plus/minus basis and is its own inverse.',
        'Unitary means U-dagger U = I, so every gate has an inverse that is also a gate — quantum circuits cannot discard information.',
        'Applying H twice returns the original state exactly. The intermediate superposition is not lost information, it is a different description.',
        'Two-qubit gates like CNOT are what create entanglement; no sequence of single-qubit gates ever can.',
      ],
      math: [
        'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix} \\quad H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix} \\quad Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
        'U^\\dagger U = I \\quad \\Longrightarrow \\quad \\text{every gate is reversible}',
      ],
    },
    professional: {
      intro:
        'Reversibility is not an aesthetic choice — it is forced by unitarity, and it is why quantum computation sits below the Landauer limit that classical irreversible logic cannot escape.',
      points: [
        'Clifford+T is the standard universal set. Cliffords are cheap and classically simulable; T gates are the expensive resource, and T-count is the real cost metric in fault-tolerant estimates.',
        'Solovay-Kitaev bounds the overhead of approximating an arbitrary single-qubit unitary to precision epsilon by O(log^c(1/epsilon)) gates, with c near 2 for practical constructions.',
        'Hardware exposes a fixed native set — often a single entangling gate plus arbitrary single-qubit rotations — and the transpiler rewrites everything into it. Depth after transpilation is what matters, not depth as written.',
        'Measurement is the one non-unitary primitive, and every classical-feeling operation in a quantum algorithm ultimately routes through it.',
      ],
      math: ['\\text{CNOT} = \\begin{pmatrix} 1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&0&1 \\\\ 0&0&1&0 \\end{pmatrix}'],
    },
    quiz: [
      {
        q: 'What does the X gate do to |0>?',
        options: ['Nothing', 'Turns it into |1>', 'Puts it in superposition'],
        answer: 1,
        hint: 'X is the flip — the quantum version of NOT.',
      },
      {
        q: 'What does H do to a settled qubit?',
        options: ['Flips it', 'Makes it half-and-half', 'Measures it'],
        answer: 1,
        hint: 'H is the spinner that creates an even superposition.',
      },
      {
        q: 'Why can every quantum gate be undone?',
        options: [
          'Because they are all unitary',
          'Because computers are fast',
          'Because nothing is ever measured',
        ],
        answer: 0,
        hint: 'Unitary matrices always have an inverse.',
      },
    ],
    bridge: { label: 'Gates and circuits', href: '/tracks/quantum-gates' },
  },
  {
    slug: 'waves-that-cancel',
    order: 8,
    title: 'Waves That Cancel',
    tagline: 'The trick is not trying everything. It is cancelling the wrong answers.',
    emoji: '🌊',
    minutes: 11,
    interactive: 'interference',
    kid: {
      intro:
        'Drop two stones in a pond. Where two crests meet, the wave gets taller. Where a crest meets a trough, the water goes flat. Qubits do this too — and it is the whole trick.',
      points: [
        'Two ways of getting the same answer can add up, making that answer more likely.',
        'Or they can cancel out completely, making that answer impossible.',
        'A quantum computer does not check every answer. It arranges for the wrong ones to cancel.',
        'That is why negative tilts mattered. Without them nothing could ever cancel.',
      ],
    },
    student: {
      intro:
        'Interference is the mechanism behind every quantum algorithm that beats its classical counterpart. Superposition alone buys nothing; superposition plus engineered cancellation buys everything.',
      points: [
        'Amplitudes for indistinguishable paths to the same outcome add before squaring. Probabilities would add after — and never cancel.',
        'Applying H to |0> then H again gives back |0> exactly: the two paths to |1> cancel, and the two paths to |0> reinforce.',
        'If anything records which path was taken, the paths become distinguishable and the interference disappears. This is decoherence in one sentence.',
        'Algorithm design is largely phase engineering: mark the answer with a phase, then convert phase into amplitude so a measurement can see it.',
      ],
      math: [
        'H H |0\\rangle = |0\\rangle',
        'P = |A_1 + A_2|^2 = |A_1|^2 + |A_2|^2 + 2\\,\\mathrm{Re}(A_1^{*}A_2)',
      ],
    },
    professional: {
      intro:
        'The interference term is the only place a quantum advantage can come from, and it is the first thing noise destroys — which is why coherence time, not qubit count, is the binding constraint.',
      points: [
        'Grover: the diffusion operator is an inversion about the mean, amplifying the marked amplitude by roughly 2/sqrt(N) per iteration. Run too many iterations and it interferes back down — the amplitude oscillates.',
        'Shor: the quantum Fourier transform turns the period of a modular exponential into constructive interference at multiples of the frequency. The number theory is classical; only the period-finding is quantum.',
        'Coupling to the environment entangles the system with something you do not measure, which decoheres the off-diagonal density-matrix elements — mathematically identical to the environment learning which path was taken.',
        'This is why classical simulation of low-entanglement circuits is easy: without sustained interference across a large entangled state, a tensor-network contraction reproduces the result.',
      ],
      math: ['|\\psi_k\\rangle \\to \\sin\\!\\left((2k+1)\\theta\\right)|w\\rangle + \\cos\\!\\left((2k+1)\\theta\\right)|w^{\\perp}\\rangle, \\quad \\sin\\theta = \\tfrac{1}{\\sqrt{N}}'],
    },
    quiz: [
      {
        q: 'What happens when a crest meets a trough?',
        options: ['A bigger wave', 'Flat water', 'Two waves'],
        answer: 1,
        hint: 'They cancel each other out.',
      },
      {
        q: 'How does a quantum computer find the right answer?',
        options: [
          'It checks every answer at once',
          'It makes the wrong answers cancel',
          'It guesses very fast',
        ],
        answer: 1,
        hint: 'Checking everything at once is the popular myth. Cancellation is the real mechanism.',
      },
      {
        q: 'What do you get if you apply H twice to |0>?',
        options: ['|0>', '|1>', 'A random result'],
        answer: 0,
        hint: 'The paths to |1> cancel exactly.',
      },
    ],
    bridge: { label: 'Interference in algorithms', href: '/tracks/quantum-algorithms' },
  },
  {
    slug: 'what-is-it-good-at',
    order: 9,
    title: 'What Is It Actually Good At?',
    tagline: 'Not everything. A short, specific list — and that is fine.',
    emoji: '🧭',
    minutes: 10,
    interactive: 'none',
    kid: {
      intro:
        'A quantum computer is not a faster laptop. It is more like a special tool that is brilliant at a few jobs and useless at most others. Knowing which is which is the real skill.',
      points: [
        'Great at: finding hidden patterns, and pretending to be molecules so chemists can watch them.',
        'Useless at: your email, your games, your homework. A laptop is better and always will be.',
        'It will not make everything faster. Anyone who says it will is selling something.',
        'The good jobs are ones where the wrong answers can be made to cancel. That is the test.',
      ],
    },
    student: {
      intro:
        'Quantum speedups are structural, not general. A problem benefits only when its structure admits an interference pattern that concentrates amplitude on the answer.',
      points: [
        'Shor factors integers in polynomial time — exponentially faster than the best known classical algorithm, and the reason post-quantum cryptography exists.',
        'Grover gives a quadratic speedup for unstructured search: sqrt(N) instead of N. Quadratic is real but modest, and constant factors on real hardware often eat it.',
        'Simulating quantum systems is the natural application. Chemistry and materials are quantum already, so the mapping is direct rather than contrived.',
        'For most problems there is no known speedup, and for some there is a proof that none exists. Unstructured search cannot beat sqrt(N).',
      ],
      math: ['\\text{Shor: } O\\!\\left((\\log N)^3\\right) \\quad \\text{vs} \\quad \\text{GNFS: } e^{O\\left((\\log N)^{1/3}(\\log\\log N)^{2/3}\\right)}'],
    },
    professional: {
      intro:
        'The honest framing is resource estimation, not asymptotics: a speedup that needs a million physical qubits and eight hours of coherence is a research direction, not a product.',
      points: [
        'Breaking RSA-2048 needs roughly 20 million noisy physical qubits for ~8 hours under standard surface-code assumptions. Current devices are three to four orders of magnitude short in count and far short in error rate.',
        'Quadratic speedups rarely survive error-correction overhead. Grover on encrypted search loses to classical hardware once you price the fault-tolerant cycle time; this is the argument in Babbush et al. on the limits of quadratic advantage.',
        'Chemistry is the most credible near-term target because useful instances are small, and because a modest active space already exceeds classical exact methods.',
        'Most published "quantum machine learning" speedups assume QRAM with an access cost that dominates the algorithm, or dequantise once a classical analogue is found. Read the loading assumptions before the runtime claim.',
      ],
    },
    quiz: [
      {
        q: 'Will a quantum computer make your games run faster?',
        options: ['Yes', 'No', 'Only online ones'],
        answer: 1,
        hint: 'It is a special tool for a short list of jobs.',
      },
      {
        q: 'Which job is a quantum computer naturally suited to?',
        options: ['Simulating molecules', 'Sending email', 'Storing photos'],
        answer: 0,
        hint: 'Molecules are already quantum — the match is direct.',
      },
      {
        q: 'What kind of speedup does Grover give for unstructured search?',
        options: ['Exponential', 'Quadratic', 'None'],
        answer: 1,
        hint: 'It turns N into the square root of N.',
      },
    ],
    bridge: { label: 'Algorithms track', href: '/tracks/quantum-algorithms' },
  },
  {
    slug: 'why-it-is-so-hard',
    order: 10,
    title: 'Why It Is So Hard',
    tagline: 'The magic leaks. Everything else is a fight to slow the leak down.',
    emoji: '❄️',
    minutes: 10,
    interactive: 'none',
    kid: {
      intro:
        'If qubits are so clever, why is there not one in your phone? Because the magic is fragile. A bump, a flash of light, a little warmth — and the qubit forgets.',
      points: [
        'The world is always watching. Anything that notices which way the coin landed ends the magic.',
        'That is why real machines sit in tanks colder than outer space, holding very still.',
        'The magic lasts a tiny fraction of a second, so every move has to be finished before it fades.',
        'The fix is teamwork: many shaky qubits protecting one good one, checking each other constantly.',
      ],
    },
    student: {
      intro:
        'Decoherence is entanglement with the environment. Once the environment holds a record of which path a qubit took, the interference term vanishes — not hidden, gone from the accessible state.',
      points: [
        'T1 is energy relaxation, the decay from |1> to |0>. T2 is dephasing, the loss of relative phase, and T2 is always at most 2*T1.',
        'Circuit depth is bounded by coherence time divided by gate time. That ratio, not qubit count, sets what you can run.',
        'The no-cloning theorem forbids copying a qubit, so classical error correction by redundancy is unavailable.',
        'Error correction works instead by measuring parity checks — learning that an error occurred without learning the encoded value, which would collapse it.',
      ],
      math: ['\\frac{1}{T_2} = \\frac{1}{2T_1} + \\frac{1}{T_\\varphi} \\qquad T_2 \\le 2T_1'],
    },
    professional: {
      intro:
        'Fault tolerance is a threshold argument: below a physical error rate, concatenation suppresses logical error faster than overhead grows. Above it, more qubits make things worse.',
      points: [
        'The surface code has a threshold near 1% under circuit-level depolarising noise, which is why hardware targets 10^-3 and better rather than merely "low".',
        'Logical error falls as (p/p_th)^{(d+1)/2} for distance d, so a useful logical qubit costs roughly 10^3 to 10^4 physical qubits at realistic error rates.',
        'Magic-state distillation dominates the fault-tolerant budget. Cliffords are nearly free under the code; T gates require distilled states and drive both qubit count and wall-clock time.',
        'Correlated and non-Markovian noise — crosstalk, TLS defects, leakage out of the computational subspace — violates the independence assumptions in threshold proofs, and is the gap between benchmark numbers and application performance.',
      ],
      math: ['P_L \\propto \\left(\\frac{p}{p_{\\text{th}}}\\right)^{\\lfloor (d+1)/2 \\rfloor}'],
    },
    quiz: [
      {
        q: 'What ends a qubit\u2019s magic?',
        options: ['Anything that notices it', 'Running out of battery', 'Too many gates'],
        answer: 0,
        hint: 'The environment learning which path was taken is exactly the problem.',
      },
      {
        q: 'Why can you not fix errors by making copies?',
        options: [
          'Copies are too slow',
          'Quantum states cannot be copied',
          'There is not enough memory',
        ],
        answer: 1,
        hint: 'This is the no-cloning theorem.',
      },
      {
        q: 'Why are quantum computers kept so cold?',
        options: [
          'To keep the environment from disturbing the qubits',
          'To make them run faster',
          'To save electricity',
        ],
        answer: 0,
        hint: 'Heat is one of the things that notices.',
      },
    ],
    bridge: { label: 'Error correction track', href: '/tracks/quantum-error-correction' },
  },
  {
    slug: 'you-can-run-one',
    order: 11,
    title: 'You Can Run One',
    tagline: 'Everything you just learned, in five lines you can actually execute.',
    emoji: '⚡',
    minutes: 12,
    interactive: 'entangled-pair',
    kid: {
      intro:
        'Everything in this track is real, and you can make it happen yourself. Five short lines build the impossible pair from lesson 6 and show you the answers.',
      points: [
        'You build a circuit, add moves, then look. That is the whole shape of every quantum program.',
        'The numbers that come back are counts: how many times each answer turned up.',
        'They will not be exactly equal, and that is correct. Real randomness is lumpy.',
        'Run it again and the numbers change slightly. That is the machine being honest.',
      ],
    },
    student: {
      intro:
        'The pattern is always the same: allocate qubits, apply gates, measure, sample. Here is a Bell pair with the counts you should expect.',
      points: [
        'H on qubit 0 creates the superposition; CNOT copies the correlation, not the value.',
        'You should see roughly half 00 and half 11, and essentially no 01 or 10.',
        'The imbalance between 00 and 11 shrinks as the square root of the shot count — 1024 shots gives about 3% noise.',
        'Any 01 or 10 you see on real hardware is error, not physics. On a simulator there should be none.',
      ],
      math: ['\\text{counts} \\approx \\{\\,00: N/2,\; 11: N/2\\,\\}, \\quad \\sigma \\sim \\sqrt{N}/2'],
    },
    professional: {
      intro:
        'Bell state fidelity is the standard two-qubit health check, and the counts tell you more about the device than about quantum mechanics.',
      points: [
        'Populations in 01 and 10 measure combined two-qubit gate and readout error; on current superconducting hardware expect low single-digit percent.',
        'Counts alone cannot distinguish a Bell state from a classical mixture of 00 and 11 — both give the same histogram. Proving entanglement requires measuring in a rotated basis, which is what a Bell test does.',
        'Bit ordering is a real trap: SDKs disagree on whether the leftmost character is qubit 0 or the highest-index qubit. This platform pins canonical ordering so the labels match the syllabus.',
        'Shot noise is not device error. Budget both before concluding anything from a histogram.',
      ],
    },
    quiz: [
      {
        q: 'Running a Bell pair 1000 times, which answers do you expect?',
        options: ['Only 00', 'About half 00 and half 11', 'All four equally'],
        answer: 1,
        hint: 'The two qubits always agree, but which value they agree on is random.',
      },
      {
        q: 'Your counts come back 496 and 528 instead of 500 and 500. What is that?',
        options: ['A bug', 'Normal randomness', 'Broken hardware'],
        answer: 1,
        hint: 'Real sampling is lumpy — that gap is about one sigma.',
      },
      {
        q: 'What does the CNOT gate copy?',
        options: ['The value of the qubit', 'The correlation between qubits', 'Nothing'],
        answer: 1,
        hint: 'Copying the value outright is forbidden by no-cloning.',
      },
    ],
    bridge: { label: 'Open the playground', href: '/playground' },
  },
  {
    slug: 'where-to-go-next',
    order: 12,
    title: 'Where To Go Next',
    tagline: 'You now know more than most people who write headlines about this.',
    emoji: '🚀',
    minutes: 7,
    interactive: 'none',
    kid: {
      intro:
        'That is the whole idea. Bits are switches, qubits are spinning coins, looking makes them pick, pairs can be linked, and wrong answers cancel. Everything else is detail.',
      points: [
        'You can now spot a wrong headline: nothing "tries every answer at once".',
        'You can explain entanglement without saying "spooky" — the pair has a description, the halves do not.',
        'You know why the machines are cold, and why they are not in phones yet.',
        'If you want more, the twelve tracks start from here and go all the way to building real circuits.',
      ],
    },
    student: {
      intro:
        'You have the conceptual spine: state, measurement, amplitude, entanglement, gates, interference, noise. Track 1 rebuilds all of it with the mathematics made explicit.',
      points: [
        'Track 1 covers state vectors, Dirac notation and the Bloch sphere properly, with the linear algebra written out.',
        'Track 2 is gates and circuits, where the matrices from lesson 7 become circuits you compose and run.',
        'Track 4 develops entanglement, Bell inequalities and teleportation, which is lesson 6 with proofs.',
        'The labs execute on the QpiAI SDK, so every claim in this track is one you can check yourself rather than take on trust.',
      ],
    },
    professional: {
      intro:
        'The fastest way to calibrate is to run the thing and read the primary sources, in that order — intuition built on secondary summaries fails in exactly the places that matter.',
      points: [
        'Nielsen and Chuang remains the standard reference; chapters 1-2 and 4 cover everything in this track rigorously.',
        'Preskill\u2019s "Quantum Computing in the NISQ Era and Beyond" is the honest framing of what current hardware can and cannot do.',
        'For resource estimation rather than asymptotics, Gidney and Ekera on factoring RSA-2048 is the paper that makes the cost concrete.',
        'The exam track here targets certification syllabi; the algorithms track runs Shor, Grover and QFT on the SDK so the scaling is observed rather than asserted.',
      ],
    },
    quiz: [
      {
        q: 'Which statement about quantum computers is wrong?',
        options: [
          'They cancel wrong answers',
          'They try every answer at once',
          'They are fragile and need cooling',
        ],
        answer: 1,
        hint: 'This is the myth lesson 8 was written to kill.',
      },
      {
        q: 'What makes an entangled pair strange?',
        options: [
          'The halves have no separate description',
          'They send messages faster than light',
          'They are copies of each other',
        ],
        answer: 0,
        hint: 'Think about what lives in the pair rather than in either qubit.',
      },
      {
        q: 'Where do you go for the same ideas with the maths written out?',
        options: ['Track 1', 'The playground', 'Nowhere'],
        answer: 0,
        hint: 'The numbered tracks pick up exactly where this one stops.',
      },
    ],
    bridge: { label: 'Start Track 1', href: '/tracks/quantum-fundamentals' },
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
