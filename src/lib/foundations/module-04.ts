import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 04 — Core Quantum Principles.
 *
 * States, amplitudes, the Born rule, superposition, phase, interference,
 * measurement, observables, uncertainty and compatibility. The eleven ideas
 * a qubit is made of, before any notation heavier than a ket.
 */
export const MODULE_04: FoundationLesson[] = [
  {
    topic: '04.01', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 0, gate: 'RY' } },
    kid: {
      intro: 'A quantum state is everything there is to know about a tiny system — like a complete recipe card. For a qubit the recipe is just a direction: imagine an arrow pointing somewhere on a ball. Preparing a state means setting that arrow where you want it.',
      points: [
        'Arrow straight up means “definitely 0”. Straight down means “definitely 1”. Pointing sideways means “could be either”.',
        'You prepare a state by starting from a known place (cooling the qubit until it is certainly 0) and then nudging the arrow with carefully timed pulses.',
        'The arrow is not a guess about where the qubit “really” is. It is the whole truth — there is nothing hidden underneath.',
        'Two qubits with the same arrow are identical in every way, however they were made.',
      ],
    },
    student: {
      intro: 'A pure quantum state is a normalised vector |ψ⟩ in a complex vector space; it encodes the probabilities of every possible measurement. State preparation is the procedure that produces a known |ψ⟩ reliably: initialise to a fiducial state, then apply a known unitary.',
      points: [
        'For a qubit, |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1. Up to an irrelevant global phase that is two real numbers — the angles (θ, φ) on the Bloch sphere.',
        'Initialisation: relax the qubit to its ground state |0⟩ (cooling, optical pumping, or measure-and-reset). Then a rotation Ry(θ) followed by Rz(φ) reaches any point on the sphere.',
        'A state is defined by its preparation, not by a prior “value”: |+⟩ = (|0⟩ + |1⟩)/√2 is as definite a state as |0⟩, with different measurement statistics.',
        'Identically prepared systems form an ensemble; probabilities refer to repeated preparation and measurement of that ensemble.',
      ],
      math: ['\\ket{\\psi} = \\cos\\tfrac{\\theta}{2}\\ket{0} + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\ket{1}, \\qquad \\ket{\\psi} = R_z(\\varphi)R_y(\\theta)\\ket{0}'],
    },
    professional: {
      intro: 'State preparation is the first of the DiVincenzo criteria and in practice a fidelity budget line: residual excited-state population after reset, rotation-angle error, and leakage all land here. Characterising a prepared state is tomography; certifying it cheaply is fidelity estimation.',
      points: [
        'Thermal reset leaves P(|1⟩) ≈ e^{−ħω/kT}; at 5 GHz and 15 mK that is ~10⁻⁷ in principle, ~1% in practice from stray photons. Active reset (measure, conditionally flip) or sideband cooling gets below 10⁻³ in microseconds.',
        'Preparing |ψ⟩ = U|0⟩ inherits U’s error. Single-qubit gate infidelity of 10⁻⁴ is routine; the preparation is then limited by reset and by readout used to verify it (SPAM error).',
        'Mixed states: an imperfect preparation is a density matrix ρ = Σ pᵢ|ψᵢ⟩⟨ψᵢ|, Bloch vector inside the sphere, purity Tr ρ² < 1. The pure-state picture is the ideal; the density matrix is what you measure.',
        'State tomography on n qubits needs ~4ⁿ measurement settings; for large n one uses direct fidelity estimation or randomised benchmarking, which characterise the process rather than the state.',
      ],
      math: ['\\rho = \\sum_i p_i\\ket{\\psi_i}\\bra{\\psi_i}, \\qquad \\mathrm{Tr}\\,\\rho^{2} \\le 1, \\qquad F = \\bra{\\psi}\\rho\\ket{\\psi}'],
    },
  },
  {
    topic: '04.02', minutes: 7,
    figure: { animation: 'wave-in-box', params: { n: 2 } },
    kid: {
      intro: 'Instead of saying where a particle is, quantum physics gives it a wave — a wobbly curve that is tall where the particle is likely to be found and flat where it is not. The curve itself is not the chance; it is the thing you square to get the chance.',
      points: [
        'The wave can be above the line (positive) or below it (negative). Both mean “likely here” once you square them.',
        'The sign matters when two waves meet: positive plus negative cancels. That is how the stripes in the two-slit experiment appear.',
        'Where the wave crosses zero, the particle is never found — even though it is found on both sides.',
        'The wave is spread out, but the particle is always detected at one spot. The wave says where; the detection says here.',
      ],
    },
    student: {
      intro: 'The wavefunction ψ(x) is a complex-valued probability amplitude: |ψ(x)|² dx is the probability of finding the particle between x and x + dx. ψ itself carries a sign and a phase that are invisible in a single measurement but govern how amplitudes combine.',
      points: [
        'Amplitude, not probability, is what evolves linearly and adds under superposition. Probabilities are derived from it by the Born rule.',
        'Nodes: points where ψ = 0 and the particle is never found. The n-th box state has n − 1 nodes; the figure’s n = 2 state has one, at the centre.',
        'ψ can be negative; the sign between regions is physical because it determines interference when the regions overlap after evolution.',
        'For a discrete system the “wavefunction” is just the list of amplitudes: a qubit’s ψ is the pair (α, β).',
      ],
      math: ['P(x \\le X \\le x + dx) = |\\psi(x)|^{2}\\,dx, \\qquad \\int |\\psi|^{2}\\,dx = 1'],
    },
    professional: {
      intro: 'The wavefunction is the representation of the state vector in the position basis, ψ(x) = ⟨x|ψ⟩; the amplitudes αᵢ of a qubit register are the same object in the computational basis. Neither is directly observable; both are fully determined by what is observable.',
      points: [
        'Change of basis is a unitary transform of the amplitudes: the momentum wavefunction is the Fourier transform of ψ(x); the Hadamard basis amplitudes of a qubit are (α ± β)/√2. Which basis is natural depends on what you intend to measure.',
        'Amplitudes are not local hidden variables: the double-slit cross term and Bell-inequality violations (Module 07) show that no assignment of definite but unknown values reproduces them.',
        'A 2ⁿ-amplitude register is why classical simulation is exponential and why a quantum computer is interesting; it is also why you cannot read the amplitudes out — measurement gives one basis state per shot.',
        'Reconstructing ψ (tomography) requires many copies and many bases; the no-cloning theorem forbids amplifying a single copy. Amplitude estimation algorithms work around this with O(1/ε) queries rather than O(1/ε²) samples.',
      ],
      math: ['\\psi(x) = \\braket{x}{\\psi}, \\qquad \\tilde\\psi(p) = \\frac{1}{\\sqrt{2\\pi\\hbar}}\\int \\psi(x)\\,e^{-ipx/\\hbar}\\,dx'],
    },
  },
  {
    topic: '04.03', minutes: 6,
    figure: { animation: 'born-rule' },
    kid: {
      intro: 'The rule that turns the quantum wave into real chances is almost silly in its simplicity: take the size of the wave at a spot and square it. Big wave, big chance; half-size wave, a quarter of the chance.',
      points: [
        'Squaring makes everything positive, so a negative wave gives the same chance as a positive one.',
        'If the wave is 0.6 tall at a spot, the chance is 0.36 — thirty-six in a hundred.',
        'Squares of all the spots add to exactly 1, because the particle must be somewhere.',
        'This is the only place where chance enters quantum physics. Everything else is certain, smooth and predictable.',
      ],
    },
    student: {
      intro: 'The Born rule: the probability of outcome i is the squared modulus of the corresponding amplitude, Pᵢ = |⟨i|ψ⟩|² = |αᵢ|². For a continuous variable, probability density |ψ(x)|². The modulus kills the phase, which is why phases are only observable through interference.',
      points: [
        'Amplitude 0.6 (or 0.6i, or 0.6e^{iθ}) gives probability 0.36. Amplitude 1/√2 gives ½; i/√2 also gives ½.',
        'Probabilities of all outcomes sum to 1 because the state is normalised: Σ|αᵢ|² = ⟨ψ|ψ⟩ = 1.',
        'The Born rule also gives expectation values: ⟨A⟩ = Σ aᵢ Pᵢ for an observable with outcomes aᵢ.',
        'Mixtures versus superpositions: a 50/50 mixture of |0⟩ and |1⟩ and the state |+⟩ give identical Z statistics but differ in X statistics, because the superposition has a relative phase and the mixture does not.',
      ],
      math: ['P_i = |\\braket{i}{\\psi}|^{2} = |\\alpha_i|^{2}, \\qquad \\sum_i |\\alpha_i|^{2} = 1'],
    },
    professional: {
      intro: 'The Born rule is the interface between the linear, deterministic Hilbert-space dynamics and the data you collect. Gleason’s theorem shows it is the only consistent probability assignment on subspaces (for dimension ≥ 3); operationally it is the reason every quantum result is a histogram over shots.',
      points: [
        'Projective measurement of observable A = Σ aᵢ Pᵢ gives outcome aᵢ with probability ⟨ψ|Pᵢ|ψ⟩; generalised measurements (POVMs) replace projectors with positive operators Eᵢ summing to identity — the model for noisy readout.',
        'Sampling cost: estimating a probability p to additive error ε needs ~p(1 − p)/ε² shots. For expectation values of Pauli strings this is the dominant runtime of variational algorithms.',
        'Readout error turns the ideal Born probabilities into measured ones via a confusion matrix; measurement-error mitigation inverts that matrix (at a cost in variance).',
        'Interpretations differ on what the rule means; they do not differ on what it predicts. Engineering only needs the latter.',
      ],
      math: ['P(a_i) = \\bra{\\psi}P_i\\ket{\\psi}, \\qquad \\sum_i E_i = I \\ \\text{(POVM)}, \\qquad \\sigma_p \\approx \\sqrt{\\frac{p(1-p)}{N}}'],
    },
  },
  {
    topic: '04.04', minutes: 6,
    figure: { animation: 'normalisation', params: { known: [0.8], amplitudes: true } },
    kid: {
      intro: 'All the chances of all the things that could happen have to add up to one whole. In quantum physics that means the sizes of the wave, squared, must add up to 1. We call a wave that obeys this “normalised”.',
      points: [
        'If one outcome has chance 0.36, the only other outcome must have chance 0.64. No freedom.',
        'For the wave sizes themselves: 0.6 and 0.8 work, because 0.36 + 0.64 = 1. 0.7 and 0.7 do not (0.98).',
        'Normalising is like scaling a recipe so the portions add up to exactly one cake.',
        'Everything a quantum computer does keeps this total at 1 — nothing leaks and nothing is created.',
      ],
    },
    student: {
      intro: 'A physical state must have total probability one: Σ|αᵢ|² = 1, or ∫|ψ|² dx = 1. Given all but one amplitude, normalisation fixes the magnitude of the last. Unitary evolution preserves normalisation automatically.',
      points: [
        'Real amplitudes a and 0.8: a² = 1 − 0.64 = 0.36, a = 0.6. Complex b = i/√2: |b|² = ½, so |a|² = ½ and a = 1/√2 for a real positive.',
        'An unnormalised vector is rescaled by 1/√⟨ψ|ψ⟩; the direction (the physics) is unchanged.',
        'Three outcomes at 0.12, 0.28, 0.35 leave 0.25 for the fourth — the discrete version of the same rule.',
        'Plane waves e^{ikx} cannot be normalised over all space; they are idealisations, handled with wave packets or box normalisation.',
      ],
      math: ['\\sum_i |\\alpha_i|^{2} = 1, \\qquad \\ket{\\psi}_{\\text{norm}} = \\frac{\\ket{\\psi}}{\\sqrt{\\braket{\\psi}{\\psi}}}'],
    },
    professional: {
      intro: 'Normalisation is probability conservation, and its preservation under time evolution is what forces the evolution operator to be unitary (and the Hamiltonian Hermitian). Where normalisation is lost in a model, probability has gone somewhere the model does not track — which is a precise definition of loss.',
      points: [
        'Unitarity: ⟨Uψ|Uψ⟩ = ⟨ψ|U†U|ψ⟩ = ⟨ψ|ψ⟩. A gate matrix that fails U†U = I to 10⁻¹² in a simulator is the first thing to check when probabilities drift.',
        'Non-unitary effective evolution (complex energies, non-Hermitian Hamiltonians) models decay: the norm falls as e^{−Γt}, and the missing probability is the population that has left the subspace — leakage out of the qubit manifold is tracked exactly this way.',
        'After measurement the post-measurement state Pᵢ|ψ⟩ has norm √Pᵢ and must be renormalised by hand; the measurement update rule does this.',
        'Density matrices generalise the condition to Tr ρ = 1; trace-preserving completely positive maps (quantum channels) are the noisy analogue of unitaries, and trace preservation is normalisation again.',
      ],
      math: ['U^{\\dagger}U = I, \\qquad \\mathrm{Tr}\\,\\rho = 1, \\qquad \\ket{\\psi\'} = \\frac{P_i\\ket{\\psi}}{\\sqrt{\\bra{\\psi}P_i\\ket{\\psi}}}'],
    },
  },
  {
    topic: '04.05', minutes: 8,
    figure: { animation: 'bloch-sphere', params: { theta: 1.5708, phi: 0 } },
    kid: {
      intro: 'A quantum thing does not have to be in one state or the other. It can be in a blend of both — and the blend is not “we don’t know which”. It is a real third kind of state, with its own behaviour, like a chord instead of a single note.',
      points: [
        'The arrow pointing sideways on the ball is a blend of up and down. Measure it and you get up half the time, down half the time.',
        'But it is not the same as a coin you have not looked at. A sideways arrow can be turned back into “definitely up” by a precise nudge; a hidden coin cannot be un-flipped.',
        'Two blends can look identical when you measure one way and completely different when you measure another way.',
        'Superposition is the raw material of quantum computing: many possibilities carried at once, until the end.',
      ],
    },
    student: {
      intro: 'Any normalised linear combination of states is a state: |ψ⟩ = α|0⟩ + β|1⟩. Superposition is not ignorance — it has definite measurement outcomes in some basis (|+⟩ always gives + in the X basis) and probabilistic ones in others, and it interferes.',
      points: [
        '|+⟩ = (|0⟩ + |1⟩)/√2 gives 0 or 1 with probability ½ each in the Z basis, but + with certainty in the X basis. A classical 50/50 mixture gives ½ in every basis.',
        'Superposition is basis-relative: |0⟩ is itself a superposition of |+⟩ and |−⟩. “Being in a superposition” only means something once you say of what.',
        'Linear evolution preserves superposition: U(α|0⟩ + β|1⟩) = αU|0⟩ + βU|1⟩. A gate acts on all components at once — the origin of quantum parallelism, with the caveat that measurement returns only one.',
        'Macroscopic superpositions (Schrödinger’s cat) are allowed by the formalism and destroyed by decoherence on timescales that shrink with system size.',
      ],
      math: ['\\ket{\\pm} = \\frac{\\ket{0} \\pm \\ket{1}}{\\sqrt2}, \\qquad \\ket{0} = \\frac{\\ket{+} + \\ket{-}}{\\sqrt2}'],
    },
    professional: {
      intro: 'Superposition is linearity of the state space, and its operational content is the existence of a basis in which the state is an eigenstate. The distinction from a mixture is the off-diagonal density-matrix element — coherence — which is exactly what decoherence erases.',
      points: [
        'ρ_super = |+⟩⟨+| has off-diagonals ½; ρ_mix = (|0⟩⟨0| + |1⟩⟨1|)/2 has none. They share Z statistics and differ in X. Coherence is measurable: ⟨X⟩ = 1 versus 0.',
        'Quantum parallelism is real but not free: a function evaluated on a superposition of 2ⁿ inputs yields 2ⁿ amplitudes you cannot read. Algorithms gain by arranging interference so the answer is in a few basis states — Deutsch–Jozsa and Simon are the clean examples.',
        'Superposition in hardware: a Ramsey experiment (π/2, wait, π/2) measures how long a superposition keeps its phase — T₂. Coherence times from microseconds (transmons) to seconds (ions) are the single most-quoted hardware number.',
        'Cat states (|α⟩ + |−α⟩ in an oscillator) are engineered superpositions used as bosonic error-correcting codes; their decoherence rate scales with the separation |α|², a direct measurement of the size–fragility trade-off.',
      ],
      math: ['\\rho_{\\text{super}} = \\tfrac12\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}, \\qquad \\rho_{\\text{mix}} = \\tfrac12\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}'],
    },
  },
  {
    topic: '04.06', minutes: 8,
    figure: { animation: 'bloch-sphere', params: { theta: 1.5708, phi: 0, gate: 'Z' } },
    kid: {
      intro: 'Every piece of a quantum wave also has a “clock hand” — a direction called its phase. Turn all the clock hands together and nothing changes at all. Turn one piece’s hand relative to another and everything can change: that is the difference between a bright stripe and a dark one.',
      points: [
        'Global phase: rotate every hand by the same amount. No experiment can tell. It is like renaming midnight.',
        'Relative phase: rotate the hand on the “1” part only. The arrow on the ball swings round the equator from front to back.',
        'Front and back of the equator both give 50/50 up-and-down — but they behave oppositely in interference, like a plus and a minus.',
        'Quantum gates like Z and S do nothing but turn one clock hand. They are among the most important gates there are.',
      ],
    },
    student: {
      intro: 'Multiplying a whole state by e^{iα} (global phase) changes no probability of any measurement — |ψ⟩ and e^{iα}|ψ⟩ are the same physical state. A phase between components, α|0⟩ + e^{iφ}β|1⟩, is relative phase: it moves the state around the Bloch sphere’s azimuth and changes X and Y statistics while leaving Z alone.',
      points: [
        '|+⟩ and |−⟩ = (|0⟩ − |1⟩)/√2 differ only by a relative phase of π. Both give Z outcomes ½/½; they are orthogonal and perfectly distinguishable in the X basis.',
        'Z|+⟩ = |−⟩: the Z gate applies a relative phase of π. S applies π/2 (|+⟩ → |+i⟩), T applies π/4. These are rotations about the z-axis by φ.',
        'Global phase is why a state has two real parameters, not three: (θ, φ) suffice.',
        'Relative phase is what interference reads: two paths with phase difference φ give probability ∝ cos²(φ/2).',
      ],
      math: ['e^{i\\alpha}\\ket{\\psi} \\equiv \\ket{\\psi}, \\qquad Z\\ket{+} = \\ket{-}, \\qquad R_z(\\varphi) = \\begin{pmatrix}e^{-i\\varphi/2}&0\\\\0&e^{i\\varphi/2}\\end{pmatrix}'],
    },
    professional: {
      intro: 'Global phase is unobservable until it becomes relative: a controlled operation turns the target’s phase into a relative phase on the control — phase kickback — and that is the mechanism of phase estimation, Deutsch–Jozsa and Shor. Relative phase is also the most fragile thing in the machine.',
      points: [
        'Kickback: if U|u⟩ = e^{iλ}|u⟩, then controlled-U on (|0⟩ + |1⟩)|u⟩ gives (|0⟩ + e^{iλ}|1⟩)|u⟩. The eigenvalue phase, global for the target, is now relative on the control and readable by interference.',
        'Virtual Z gates: a Z rotation is implemented for free by re-labelling the phase of all subsequent drive pulses — zero duration, zero error — because only relative phase between the qubit and its drive frame matters.',
        'Dephasing (T₂) is random relative phase accumulated from frequency noise; a Hahn echo (π pulse in the middle) refocuses the static part. T₂ ≤ 2T₁ always.',
        'Phase precision is the resource in metrology: a phase φ accumulated in time t by a superposition of energy eigenstates measures the energy difference to Δφ ~ 1/√N shots — the standard quantum limit, beaten only with entanglement.',
      ],
      math: ['\\text{c-}U\\,\\tfrac{1}{\\sqrt2}(\\ket{0}+\\ket{1})\\ket{u} = \\tfrac{1}{\\sqrt2}(\\ket{0}+e^{i\\lambda}\\ket{1})\\ket{u}'],
    },
  },
  {
    topic: '04.07', minutes: 8,
    figure: { animation: 'amplitude-sum', params: { mode: 'sweep' } },
    kid: {
      intro: 'When there are two ways for something to happen and nobody can tell which way it went, quantum physics does not add the chances. It adds the waves first — clock hands and all — and squares afterwards. The two ways can help each other or wipe each other out.',
      points: [
        'Two ways, each with a chance of a quarter: classically that makes a half. Quantum: it can be anything from zero to one, depending on the clock hands.',
        'Hands pointing the same way: the ways reinforce — brighter than either alone.',
        'Hands pointing opposite ways: the ways cancel — nothing happens, though each way alone would work.',
        'This is the trick behind quantum computers: arrange the clock hands so wrong answers cancel and right answers reinforce.',
      ],
    },
    student: {
      intro: 'For indistinguishable alternatives, add the amplitudes and then square: P = |ψ₁ + ψ₂|². For distinguishable alternatives, square and then add: P = |ψ₁|² + |ψ₂|². The difference is the interference term 2Re(ψ₁*ψ₂), which ranges from −2|ψ₁||ψ₂| to +2|ψ₁||ψ₂|.',
      points: [
        'Amplitudes ½ and −½ for the same result: (½ − ½)² = 0 — the result never occurs, though each route alone gives ¼.',
        'Amplitudes 1/√2 and e^{iπ}/√2 = −1/√2 also cancel to 0; with e^{i0} they would reinforce to 1.',
        'Amplitudes ½ and i/2 for distinguishable outcomes: ¼ + ¼ = ½. (For indistinguishable ones |½ + i/2|² also equals ½, since the phase difference is π/2 — the interference term is zero.)',
        'A superposition carries relative phase that affects later probabilities; a mixture does not. That is the operational difference the figure sweeps through.',
      ],
      math: [
        '|\\psi_1 + \\psi_2|^{2} = |\\psi_1|^{2} + |\\psi_2|^{2} + 2|\\psi_1||\\psi_2|\\cos\\Delta\\varphi',
        '\\Delta\\varphi = \\pi: \\ \\text{cancel}, \\qquad \\Delta\\varphi = 0: \\ \\text{reinforce}, \\qquad \\Delta\\varphi = \\pi/2: \\ \\text{no cross term}',
      ],
    },
    professional: {
      intro: 'Amplitude interference is the computational resource. Every quantum speed-up is an interference pattern over computational paths, engineered so the amplitude of the desired output grows while the rest cancels; decoherence is the loss of the cross terms that make it work.',
      points: [
        'Deutsch–Jozsa: a balanced oracle flips the sign of half the paths, which then cancel on the all-zero output; a constant oracle leaves them to reinforce there. One query decides.',
        'Grover: each iteration rotates the state by 2θ (sin θ = 1/√N) toward the marked state — amplitude amplification by constructive interference, ⌊(π/4)√N⌋ times.',
        'Quantum Fourier transform: interference among phases e^{2πi jk/N} concentrates amplitude on the period of a function — the core of Shor.',
        'Hardware consequence: a relative phase error δ per gate degrades interference contrast as cos δ; a 1° error per gate across 100 gates is a 100° random walk in the worst case. Phase coherence, not amplitude, is the tightest budget.',
      ],
      math: ['\\text{Grover: } \\ket{\\psi_k} = \\sin((2k+1)\\theta)\\ket{\\text{marked}} + \\cos((2k+1)\\theta)\\ket{\\text{rest}}'],
    },
  },
  {
    topic: '04.08', minutes: 8,
    figure: { animation: 'measurement-collapse', params: { theta: 1.0472 } },
    kid: {
      intro: 'Asking a quantum system a question changes it. Before you look, the arrow can point anywhere; the moment you measure “up or down?”, it snaps to up or to down and stays there. The blend is gone and you cannot get it back.',
      points: [
        'The arrow tilted mostly up: you get “up” most of the time, “down” some of the time — the tilt sets the odds.',
        'After you get “up”, the arrow is straight up. Ask again and you will get “up” every time.',
        'Measuring is not like peeking under a cup. It is more like asking a spinning coin to land — the question forces an answer.',
        'This is why a quantum computer does its thinking first, with the arrows untouched, and only measures at the very end.',
      ],
    },
    student: {
      intro: 'A projective measurement of an observable yields one of its eigenvalues, with probability given by the Born rule, and leaves the system in the corresponding eigenstate — the state update (“collapse”). Repeating the same measurement immediately then returns the same result with certainty.',
      points: [
        'State cos(θ/2)|0⟩ + sin(θ/2)|1⟩ measured in Z: outcome 0 with P = cos²(θ/2), after which the state is |0⟩. For θ = 60°, P(0) = 0.75.',
        'Measurement is irreversible and non-linear in the sense that the post-state depends on the outcome; no unitary does this.',
        'The outcome is random; the statistics are not. Over many preparations the histogram converges on the Born probabilities (the figure’s tally).',
        'Measuring destroys superposition in the measured basis but not in all bases: after a Z measurement the state |0⟩ is still a superposition of |±⟩.',
      ],
      math: ['P(0) = \\cos^{2}\\tfrac{\\theta}{2}, \\qquad \\ket{\\psi} \\xrightarrow{\\text{outcome } 0} \\ket{0}'],
    },
    professional: {
      intro: 'The measurement postulate is the one non-unitary rule, and the one that interpretations argue about; operationally it is a well-defined update map, and modern practice generalises it to weak, continuous and non-demolition measurements that are tools rather than endpoints.',
      points: [
        'Quantum non-demolition (QND) readout — dispersive measurement of a transmon through its resonator — projects onto |0⟩/|1⟩ without destroying the qubit, so the post-measurement state is reusable: the basis of active reset and mid-circuit measurement.',
        'Measurement strength is a dial: a weak measurement partially collapses and yields partial information; the trade-off is quantified by the measurement back-action, and quantum trajectories track the state shot by shot.',
        'Decoherence is measurement by the environment: the same update, with the record discarded. A dephased qubit is one that has been measured by something you cannot ask.',
        'Readout fidelity (typically 97–99.5%) enters every result as SPAM error; it is calibrated by preparing |0⟩ and |1⟩ and recording the confusion matrix, then inverted in post-processing.',
      ],
      math: ['\\rho \\to \\sum_i P_i\\rho P_i \\ \\text{(unread)}, \\qquad \\rho \\to \\frac{P_i\\rho P_i}{\\mathrm{Tr}(P_i\\rho)} \\ \\text{(outcome } i\\text{)}'],
    },
  },
  {
    topic: '04.09', minutes: 7,
    figure: { animation: 'measurement-collapse', params: { theta: 1.5708, phi: 0, basis: 'x' } },
    kid: {
      intro: 'You can ask a qubit more than one kind of question. “Up or down?” is one. “Left or right?” is another. The same arrow gives a certain answer to one question and a random answer to the other — and no arrow answers both with certainty.',
      points: [
        'An arrow pointing right answers “left or right?” with “right”, every time. Ask it “up or down?” and it is a coin flip.',
        'An arrow pointing up is the opposite: certain for up/down, random for left/right.',
        'Each question has its own pair of “certain” directions. Those pairs are at right angles to each other on the ball.',
        'Choosing the question is part of the experiment. Change the question and you change what you can know.',
      ],
    },
    student: {
      intro: 'An observable is a Hermitian operator; its eigenstates form an orthonormal measurement basis and its eigenvalues are the possible outcomes. Z has basis {|0⟩, |1⟩}, X has {|+⟩, |−⟩}, Y has {|+i⟩, |−i⟩}. The same state has different statistics in different bases.',
      points: [
        '|+⟩ measured in X gives + with certainty (it is an eigenstate); measured in Z gives 0/1 at ½ each. The figure measures |+⟩ in the X basis by rotating with H first.',
        'Measuring in the X basis is implemented by applying H and then measuring Z — all hardware measures in one fixed basis and rotates the state beforehand.',
        'Expectation values: ⟨Z⟩ = P(0) − P(1), ⟨X⟩ = P(+) − P(−). The Bloch vector is (⟨X⟩, ⟨Y⟩, ⟨Z⟩).',
        'Orthogonal eigenstates are perfectly distinguishable in their own basis and maximally random in a mutually unbiased one.',
      ],
      math: ['X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}, \\quad X\\ket{\\pm} = \\pm\\ket{\\pm}, \\qquad \\langle Z\\rangle = P(0) - P(1)'],
    },
    professional: {
      intro: 'Choosing a measurement basis is choosing which operator’s eigenvalues you sample; a tomographically complete set of bases (X, Y, Z per qubit) reconstructs the state, and the fact that no state is an eigenstate of all of them is the uncertainty principle in its operational form.',
      points: [
        'Pauli expectation values are what variational algorithms estimate: a Hamiltonian is decomposed into Pauli strings, each measured in its own basis, each costing shots. Grouping commuting strings into one basis is a real optimisation.',
        'Mutually unbiased bases: |⟨a|b⟩|² = 1/d for every pair across the bases. For a qubit, X, Y and Z are mutually unbiased — perfect knowledge in one gives zero in the others. BB84 key distribution rests on exactly this.',
        'Measurement in an entangled basis (Bell basis) is what teleportation and superdense coding require; it is implemented by a CNOT and H before Z measurements.',
        'Readout crosstalk and basis-rotation errors mean the “X basis” on hardware is slightly tilted; characterising that tilt is gate-set tomography.',
      ],
      math: ['\\langle H\\rangle = \\sum_k c_k \\langle P_k\\rangle, \\qquad |\\braket{a}{b}|^{2} = \\tfrac{1}{d}\\ \\text{(mutually unbiased)}'],
    },
  },
  {
    topic: '04.10', minutes: 8,
    figure: { animation: 'uncertainty' },
    kid: {
      intro: 'You cannot pin down both where a particle is and how fast it is moving. The sharper you make one, the blurrier the other becomes. This is not clumsy instruments — it is built into what a wave is.',
      points: [
        'A short, sharp wave pulse has a clear position but no clear wavelength. A long smooth wave has a clear wavelength but no clear position.',
        'Wavelength is speed in disguise (de Broglie), so clear position means blurry speed, and the other way round.',
        'Squeeze an electron into a tiny box and it jiggles faster — that jiggle is why atoms do not collapse.',
        'The blur is tiny for big things and huge for electrons, which is why you never notice it with a tennis ball.',
      ],
    },
    student: {
      intro: 'Heisenberg’s relation Δx·Δp ≥ ħ/2 bounds the product of the standard deviations of position and momentum for any state. It follows from the Fourier relationship between ψ(x) and its momentum representation: a narrow packet in x is broad in p.',
      points: [
        'A Gaussian packet saturates the bound: Δx·Δp = ħ/2 exactly. The figure sweeps Δx and shows Δp = ħ/2Δx tracking it.',
        'Confining an electron to Δx = 1 Å forces Δp ≥ 5.3 × 10⁻²⁵ kg m s⁻¹, i.e. speeds of order 6 × 10⁵ m s⁻¹ and kinetic energies of eV — the atomic energy scale emerges from confinement alone.',
        'Energy–time: ΔE·Δt ≳ ħ/2 relates a state’s lifetime to its energy width (natural linewidth), though t is a parameter, not an observable.',
        'It is a statement about ensembles of identically prepared systems, not about disturbance by a clumsy measurement — though measurement back-action is a related, separate fact.',
      ],
      math: ['\\Delta x\\,\\Delta p \\ge \\frac{\\hbar}{2}, \\qquad \\Delta E\\,\\Delta t \\gtrsim \\frac{\\hbar}{2}'],
    },
    professional: {
      intro: 'The uncertainty relation is a theorem about non-commuting operators: ΔA·ΔB ≥ ½|⟨[A, B]⟩|. For x and p the commutator is iħ; for Pauli operators it is 2i times the third Pauli. It bounds what any state can simultaneously specify and sets the floor for every measurement that must track two conjugate variables.',
      points: [
        'Standard quantum limit: measuring an oscillator’s position continuously adds back-action noise to momentum, which feeds back into position; the optimum trades them at the SQL. Squeezed states beat it in one quadrature at the cost of the other — used in LIGO and proposed for qubit readout.',
        'Number–phase uncertainty in a resonator: a readout tone with well-defined photon number has random phase; dispersive readout works in the regime where the signal-to-noise per photon is set by this trade-off.',
        'For qubits, ΔX·ΔZ ≥ |⟨Y⟩|: no state has sharp values of two Paulis unless the third has zero expectation — which is why a Bloch vector has length ≤ 1.',
        'Zero-point motion of a trapped ion (Δx ≈ 10 nm at MHz trap frequencies) is a direct consequence; the Lamb–Dicke parameter compares it to the laser wavelength and decides whether sideband gates work.',
      ],
      math: ['\\Delta A\\,\\Delta B \\ge \\tfrac12\\left|\\langle[A,B]\\rangle\\right|, \\qquad [x,p] = i\\hbar, \\qquad [X,Z] = -2iY'],
    },
  },
  {
    topic: '04.11', minutes: 7,
    figure: { animation: 'incompatible-observables' },
    kid: {
      intro: 'Some questions you can ask a quantum system together without spoiling anything; others fight. Ask “up or down?” twice in a row and you get the same answer. Ask “up or down?”, then “left or right?”, then “up or down?” again — and the last answer is a coin flip.',
      points: [
        'The middle question (left/right) scrambled what the first question had settled (up/down).',
        'Questions that get along are called compatible. Questions that fight are incompatible.',
        'Up/down and left/right are the classic fighting pair — exactly the pair in the uncertainty principle.',
        'A good quantum programmer knows which measurements can share a shot and which cannot.',
      ],
    },
    student: {
      intro: 'Two observables are compatible if they commute, [A, B] = 0; they then share a complete set of eigenstates and can be measured together without disturbance. Incompatible observables ([A, B] ≠ 0) have no common eigenbasis, and measuring one randomises the other.',
      points: [
        'Z, Z, Z on |0⟩: 0 every time. Z, X, Z on |0⟩: the X measurement leaves |+⟩ or |−⟩, each of which gives Z = 0 or 1 at ½ — the final Z is random.',
        '[X, Z] = XZ − ZX = −2iY ≠ 0: incompatible. [Z ⊗ I, I ⊗ Z] = 0: compatible — measurements on different qubits never disturb each other.',
        'The uncertainty relation is the quantitative version: ΔA·ΔB ≥ ½|⟨[A,B]⟩|. Compatible observables can both be sharp.',
        'Commuting Pauli strings (e.g. XX and ZZ) can be measured in one setting; this is how stabiliser measurements extract error syndromes without learning the logical state.',
      ],
      math: ['[A,B] = AB - BA, \\qquad [X,Z] = -2iY, \\qquad [Z_1, Z_2] = 0'],
    },
    professional: {
      intro: 'Compatibility is the structure that error correction exploits: stabiliser generators are chosen to commute with each other and with the logical operators, so their measurement reveals the error and nothing else. Incompatibility is what limits how much a Hamiltonian estimate can be parallelised.',
      points: [
        'A set of n commuting Pauli strings can be simultaneously diagonalised and measured in a single basis; partitioning a Hamiltonian’s terms into commuting groups reduces the number of circuits from the number of terms to the number of groups (often a 5–10× saving).',
        'Stabiliser codes: the code space is the joint +1 eigenspace of commuting generators. Measuring them projects an error into a syndrome without collapsing the encoded superposition, precisely because they commute with the logical operators.',
        'Contextuality (Kochen–Specker) is the sharpened statement: outcome values cannot be pre-assigned even to compatible sets consistently across contexts — a resource for some quantum advantages.',
        'Hardware crosstalk is unintended incompatibility: measuring qubit A should commute with qubit B’s state, and when it does not, B dephases during A’s readout. Characterising that is part of calibration.',
      ],
      math: ['[S_i, S_j] = 0, \\quad [S_i, \\bar Z] = [S_i, \\bar X] = 0 \\ \\text{(stabiliser code)}'],
    },
  },
];
