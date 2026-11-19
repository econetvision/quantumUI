import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 05 — Quantum Mechanics Framework.
 *
 * The notation and the machinery: kets, bases, inner products, operators,
 * eigenstuff, expectation values, the Hamiltonian and both Schrödinger
 * equations, ending where boundary conditions make quantisation fall out.
 */
export const MODULE_05: FoundationLesson[] = [
  {
    topic: '05.01', minutes: 6,
    figure: { animation: 'bloch-sphere', params: { theta: 1.0472, phi: 0.7854 } },
    kid: {
      intro: 'Physicists write quantum states inside a funny bracket: |0⟩ is “the zero state”, |1⟩ is “the one state”, |cat⟩ could be a cat. The half-bracket is called a ket, and it is just a label that says “this is a quantum state, not an ordinary number”.',
      points: [
        '|0⟩ and |1⟩ are the two ends of the arrow on the ball. Any arrow is a mix: some amount of |0⟩ plus some amount of |1⟩.',
        'The mirror-image bracket ⟨0| is called a bra. Put a bra and a ket together, ⟨0|1⟩, and you get a number: how much the two states overlap.',
        'Same state overlapped with itself gives 1. Opposite states overlapped give 0.',
        'Bra + ket = bracket. Paul Dirac invented the joke and the notation in 1939.',
      ],
    },
    student: {
      intro: 'Dirac notation: a ket |ψ⟩ is a column vector in state space; the bra ⟨ψ| is its conjugate transpose (a row vector); the bracket ⟨φ|ψ⟩ is the inner product, a complex number. Operators act on kets from the left: A|ψ⟩.',
      points: [
        'For a qubit, |0⟩ = (1, 0)ᵀ, |1⟩ = (0, 1)ᵀ, |ψ⟩ = α|0⟩ + β|1⟩ = (α, β)ᵀ, ⟨ψ| = (α*, β*).',
        '⟨ψ|ψ⟩ = |α|² + |β|² = 1 (normalisation); ⟨0|1⟩ = 0 (orthogonality); ⟨0|ψ⟩ = α (a component).',
        'Outer products are operators: |0⟩⟨0| projects onto |0⟩; |0⟩⟨1| maps |1⟩ to |0⟩. Any 2 × 2 matrix is a sum of four such outer products.',
        'Matrix elements: ⟨φ|A|ψ⟩. The expectation value is ⟨ψ|A|ψ⟩.',
      ],
      math: ['\\ket{\\psi} = \\begin{pmatrix}\\alpha\\\\\\beta\\end{pmatrix}, \\quad \\bra{\\psi} = (\\alpha^{*}, \\beta^{*}), \\quad \\braket{\\varphi}{\\psi} = \\sum_i \\varphi_i^{*}\\psi_i'],
    },
    professional: {
      intro: 'Dirac notation is basis-free linear algebra with the inner product built into the symbols. Its value in practice is that it makes the structure visible — projectors, outer products, tensor products — and that quantum circuit identities become one-line manipulations.',
      points: [
        'Resolution of the identity I = Σᵢ |i⟩⟨i| is the single most useful line in the notation: insert it anywhere to change basis, e.g. ⟨φ|ψ⟩ = Σᵢ ⟨φ|i⟩⟨i|ψ⟩.',
        'Tensor products: |0⟩|1⟩ = |01⟩ = |0⟩ ⊗ |1⟩; an operator on qubit 1 is A ⊗ I. Keeping track of ordering conventions (which qubit is leftmost) is the most common source of bugs in hand calculations and in code.',
        'Density matrices live naturally here: ρ = Σ pᵢ|ψᵢ⟩⟨ψᵢ|, Tr(ρA) = ⟨A⟩. Partial trace over a subsystem is expressed as Σₖ (I ⊗ ⟨k|) ρ (I ⊗ |k⟩).',
        'Continuous bases: ⟨x|ψ⟩ = ψ(x), with ∫|x⟩⟨x| dx = I and ⟨x|x′⟩ = δ(x − x′) — the same notation covers wavefunctions and qubits, which is why it is the lingua franca.',
      ],
      math: ['I = \\sum_i \\ket{i}\\bra{i}, \\qquad \\langle A\\rangle = \\mathrm{Tr}(\\rho A), \\qquad \\braket{x}{\\psi} = \\psi(x)'],
    },
  },
  {
    topic: '05.02', minutes: 6,
    figure: { animation: 'bloch-sphere', params: { theta: 0, gate: 'H' } },
    kid: {
      intro: 'To describe where an arrow points, you need reference directions — north and east on a map, up and down on the ball. In quantum physics the reference states are called a basis, and every state is written as “so much of this basis state plus so much of that one”.',
      points: [
        '|0⟩ and |1⟩ are the usual basis: up and down. Any arrow is some |0⟩ plus some |1⟩.',
        'You could just as well use left and right, |+⟩ and |−⟩, as your reference. Same arrows, different description.',
        'Switching between the two descriptions is what the H gate does: it turns up into right and down into left.',
        'The basis is your choice of ruler. The state does not care which ruler you use.',
      ],
    },
    student: {
      intro: 'A basis is a set of orthonormal states that spans the space; any state is a unique linear combination of them, with coefficients given by inner products. The computational basis {|0⟩, |1⟩} and the Hadamard basis {|+⟩, |−⟩} are both complete for a qubit; H maps one to the other.',
      points: [
        '|ψ⟩ = α|0⟩ + β|1⟩ = α′|+⟩ + β′|−⟩ with α′ = (α + β)/√2, β′ = (α − β)/√2. The state is the same vector; only the coordinates change.',
        'Components in a basis are inner products: α = ⟨0|ψ⟩, α′ = ⟨+|ψ⟩. Probabilities of measuring in that basis are their squared moduli.',
        'H|0⟩ = |+⟩, H|1⟩ = |−⟩, and H² = I, so H also maps |±⟩ back to |0⟩/|1⟩ — a change of basis is its own inverse here.',
        'For n qubits the computational basis has 2ⁿ states |00…0⟩ … |11…1⟩; a general state has 2ⁿ amplitudes.',
      ],
      math: ['H = \\frac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}, \\qquad H\\ket{0} = \\ket{+}, \\quad H\\ket{1} = \\ket{-}'],
    },
    professional: {
      intro: 'A basis choice is a unitary; a measurement basis is the eigenbasis of the observable you read. Algorithms are often clearest as basis changes — the QFT is a change to the Fourier basis, Hadamards move between bit and phase pictures — and hardware implements every basis change as physical rotations before one fixed readout.',
      points: [
        'The computational basis is privileged only by hardware: it is the eigenbasis of the readout observable (σ_z for most platforms). Everything else is σ_z plus rotations.',
        'Eigenbases of X and Z are mutually unbiased; choosing a random one of them per qubit is the BB84 protocol, and the information-theoretic security rests on the overlap |⟨±|0⟩|² = ½.',
        'Change of basis costs gates: measuring a Pauli string in the X basis needs a layer of Hadamards; a general product basis needs single-qubit rotations; an entangled basis (Bell) needs a CNOT. Count them in your depth budget.',
        'Numerically, the amplitude array of a statevector simulator is the coordinate vector in the computational basis; a basis change is a (sparse, structured) matrix–vector product applied in O(2ⁿ) rather than O(4ⁿ).',
      ],
      math: ['\\ket{\\psi} = \\sum_{x\\in\\{0,1\\}^{n}} \\alpha_x \\ket{x}, \\qquad \\alpha_x = \\braket{x}{\\psi}'],
    },
  },
  {
    topic: '05.03', minutes: 6,
    figure: { animation: 'operator-action', params: { mode: 'inner' } },
    kid: {
      intro: 'How alike are two arrows? Point them from the same spot and look at the shadow one casts along the other. Same direction: full-length shadow. At right angles: no shadow at all. That shadow length is the inner product, and “no shadow” is what physicists call orthogonal.',
      points: [
        'Orthogonal states are as different as states can be — you can always tell them apart with one look.',
        'Up and down are orthogonal. Left and right are orthogonal. Up and right are not: they share half a shadow.',
        'The square of the shadow is a probability: start with one arrow, ask about the other, and the shadow squared is the chance of “yes”.',
        'A good basis is a set of arrows that are all orthogonal to each other — no shadows between them.',
      ],
    },
    student: {
      intro: 'The inner product ⟨φ|ψ⟩ = Σ φᵢ*ψᵢ is linear in the ket, antilinear in the bra, and satisfies ⟨φ|ψ⟩ = ⟨ψ|φ⟩*. Its modulus squared is the transition probability between the two states; it is zero for orthogonal states and one for identical ones.',
      points: [
        '⟨0|1⟩ = 0, ⟨+|−⟩ = 0, ⟨0|+⟩ = 1/√2 — so |⟨0|+⟩|² = ½: a qubit in |+⟩ gives 0 half the time.',
        'The figure sweeps the angle between two real unit vectors: the projection cos θ is the inner product, zero at 90°.',
        'Orthonormal basis: ⟨i|j⟩ = δᵢⱼ. Components are then aᵢ = ⟨i|a⟩ and ⟨a|b⟩ = Σ aᵢ*bᵢ.',
        'Cauchy–Schwarz: |⟨φ|ψ⟩| ≤ ‖φ‖‖ψ‖, with equality only for parallel vectors — which is why fidelity |⟨φ|ψ⟩|² is at most 1.',
      ],
      math: ['\\braket{\\varphi}{\\psi} = \\sum_i \\varphi_i^{*}\\psi_i, \\qquad P(\\varphi \\mid \\psi) = |\\braket{\\varphi}{\\psi}|^{2}'],
    },
    professional: {
      intro: 'The inner product defines distinguishability, fidelity and the geometry of state space. Two states can be perfectly discriminated iff they are orthogonal; otherwise the optimal error probability is set by their overlap (Helstrom), and that overlap is also what no-cloning protects.',
      points: [
        'Fidelity F = |⟨φ|ψ⟩|² between pure states; for mixed states F = (Tr√(√ρσ√ρ))². Gate fidelity averages this over inputs; 99.9% two-qubit fidelity means an average infidelity of 10⁻³.',
        'Helstrom bound: the minimum error in distinguishing |ψ₀⟩ from |ψ₁⟩ (equal priors) is ½(1 − √(1 − |⟨ψ₀|ψ₁⟩|²)). Non-orthogonal states cannot be told apart reliably, which is why BB84 works and why readout of nearly-degenerate states is slow.',
        'Overlap decays exponentially with system size for generic states (orthogonality catastrophe), which is why fidelity targets for large registers are stated per gate, not per state.',
        'The swap test estimates |⟨φ|ψ⟩|² on a quantum computer with an ancilla, a controlled-SWAP and a Hadamard — an inner product computed by interference rather than by reading amplitudes.',
      ],
      math: ['P_{\\text{err}}^{\\min} = \\tfrac12\\left(1 - \\sqrt{1 - |\\braket{\\psi_0}{\\psi_1}|^{2}}\\right)'],
    },
  },
  {
    topic: '05.04', minutes: 7,
    figure: { animation: 'matrix-action', params: { matrix: 'X', vector: [0.6, 0.8] } },
    kid: {
      intro: 'An operator is a machine that takes a state in and hands a state out: flip it, turn it, swap its parts. In quantum physics every action and every question is an operator. Gates are operators that change the state; measurements are operators that ask about it.',
      points: [
        'The X machine swaps the amounts of |0⟩ and |1⟩: feed it 0.6 of |0⟩ and 0.8 of |1⟩ and it hands back 0.8 and 0.6.',
        'Some machines leave certain arrows alone. Those arrows are special to that machine.',
        'Doing machine A then machine B is itself a machine — and usually a different one from B then A.',
        'Every quantum program is a long chain of these machines ending in a question.',
      ],
    },
    student: {
      intro: 'A linear operator maps states to states: A(α|ψ⟩ + β|φ⟩) = αA|ψ⟩ + βA|φ⟩. In a basis it is a matrix with elements Aᵢⱼ = ⟨i|A|j⟩. Two classes matter: unitary operators (U†U = I), which describe evolution and gates, and Hermitian operators (A = A†), which describe observables.',
      points: [
        'The Paulis X, Y, Z are both unitary and Hermitian; H is too. S and T are unitary but not Hermitian (they are not observables).',
        'The adjoint A† is the conjugate transpose. (AB)† = B†A†. Unitaries preserve inner products; Hermitian operators have real eigenvalues.',
        'Projectors P = |φ⟩⟨φ| satisfy P² = P and P† = P; they are the operators of yes/no questions.',
        'Commutator [A, B] = AB − BA measures order dependence. XZ = −ZX, so [X, Z] = 2XZ = −2iY.',
      ],
      math: ['A_{ij} = \\bra{i}A\\ket{j}, \\qquad U^{\\dagger}U = I, \\qquad A = A^{\\dagger}, \\qquad (AB)^{\\dagger} = B^{\\dagger}A^{\\dagger}'],
    },
    professional: {
      intro: 'Operators are the whole language: gates are unitaries, observables are Hermitian, noise is a completely positive map, and generators of continuous evolution are anti-Hermitian (−iH). The decomposition of operators into Pauli strings is the practical basis for both simulation and measurement.',
      points: [
        'Any n-qubit operator expands in the 4ⁿ Pauli strings; Hamiltonians of interest have polynomially many terms, which is what makes them measurable term by term. Unitaries expand too, but with exponentially many terms in general.',
        'Unitary ↔ Hermitian via exponentiation: U = e^{−iHt/ħ}; every gate is the exponential of a Hermitian generator (Rz = e^{−iθZ/2}), and gate decomposition is the inverse problem.',
        'Kraus representation: a noisy operation is ρ → Σₖ Kₖ ρ Kₖ† with Σ Kₖ†Kₖ = I. Amplitude damping, dephasing and depolarising channels are the three you will model first.',
        'Operator norms give error bounds: ‖U_ideal − U_real‖ bounds the worst-case output error, and errors add at most linearly over a circuit — the basis of threshold theorems.',
      ],
      math: ['\\rho \\to \\sum_k K_k \\rho K_k^{\\dagger}, \\quad \\sum_k K_k^{\\dagger}K_k = I; \\qquad U = e^{-iHt/\\hbar}'],
    },
  },
  {
    topic: '05.05', minutes: 7,
    figure: { animation: 'operator-action', params: { mode: 'eigen' } },
    kid: {
      intro: 'Every machine has a few special inputs it leaves pointing the same way — it may stretch or flip them, but it does not turn them. Those are its eigenstates, and the stretch factor is the eigenvalue. The eigenvalues are the only answers a measurement can give.',
      points: [
        'The Z machine leaves “up” as up (factor +1) and “down” as down but flipped in sign (factor −1). Up and down are Z’s eigenstates.',
        'Feed Z a sideways arrow and it does turn it: sideways-right becomes sideways-left. Sideways is not special to Z.',
        'Measure Z and you get +1 or −1 — exactly its two factors — and the arrow ends up as the matching eigenstate.',
        'Each machine has its own special arrows. X’s are left and right; Z’s are up and down.',
      ],
    },
    student: {
      intro: 'An eigenstate of an operator satisfies A|a⟩ = a|a⟩: the operator rescales it by the eigenvalue a without changing its direction. For a Hermitian observable the eigenvalues are real, eigenstates with different eigenvalues are orthogonal, and the eigenstates form a basis — the measurement basis.',
      points: [
        'Z|0⟩ = +|0⟩, Z|1⟩ = −|1⟩; X|±⟩ = ±|±⟩. Measuring Z yields +1 or −1 and leaves the eigenstate behind.',
        'Z|+⟩ = |−⟩ ≠ λ|+⟩: |+⟩ is not an eigenstate of Z. The figure shows |0⟩ held fixed and |+⟩ rotated to |−⟩.',
        'Eigenvalues solve det(A − λI) = 0. For a 2 × 2 Hermitian matrix there are two real roots; for the Paulis they are ±1.',
        'Spectral decomposition: A = Σ aᵢ|aᵢ⟩⟨aᵢ| — an observable is its eigenvalues weighted by projectors onto its eigenstates.',
      ],
      math: ['A\\ket{a} = a\\ket{a}, \\qquad A = \\sum_i a_i\\ket{a_i}\\bra{a_i}, \\qquad \\det(A - \\lambda I) = 0'],
    },
    professional: {
      intro: 'Eigenvalues are what experiments return; eigenstates are what they leave behind. The energy eigenstates of a Hamiltonian are the stationary states, their differences are the spectral lines and qubit frequencies, and finding them — exactly or variationally — is the problem quantum simulation exists to solve.',
      points: [
        'Phase estimation extracts an eigenvalue e^{iλ} of a unitary onto a register of ancillas via controlled-U^(2ᵏ) and an inverse QFT; applied to e^{−iHt} it yields energies to precision 2⁻ᵏ with k ancillas.',
        'VQE approximates the ground eigenvalue variationally: ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀ for every trial state, so minimising over θ bounds E₀ from above.',
        'Eigenvalues of a unitary lie on the unit circle; of a Hermitian on the real line; of a density matrix in [0, 1] summing to 1 (its spectrum is the mixture you cannot remove by rotation).',
        'Degeneracy — several eigenstates sharing an eigenvalue — means the measurement does not pin down the state within that subspace; stabiliser codes store logical information in exactly such a degenerate subspace.',
      ],
      math: ['\\bra{\\psi(\\theta)}H\\ket{\\psi(\\theta)} \\ge E_0, \\qquad U\\ket{u} = e^{i\\lambda}\\ket{u} \\xrightarrow{\\text{QPE}} \\lambda \\pm 2^{-k}'],
    },
  },
  {
    topic: '05.06', minutes: 6,
    figure: { animation: 'operator-action', params: { mode: 'expectation' } },
    kid: {
      intro: 'If you repeat a quantum measurement many times, you get a spread of answers. The expectation value is simply their average. It need not be an answer you ever actually get — the average of a coin scored +1 and −1 is 0, which the coin never shows.',
      points: [
        'An arrow straight up gives +1 every time: average +1. Straight down: −1. Sideways: half +1, half −1 — average 0.',
        'Tilt the arrow part way and the average slides smoothly between +1 and −1.',
        'The average is what the Bloch arrow’s height tells you directly. The arrow is a summary of all the averages at once.',
        'Quantum chemistry on a quantum computer is mostly about finding one average — the lowest possible energy.',
      ],
    },
    student: {
      intro: 'The expectation value of an observable A in state |ψ⟩ is ⟨A⟩ = ⟨ψ|A|ψ⟩ = Σ aᵢ Pᵢ, the probability-weighted mean of its eigenvalues. It is what the sample mean of many shots converges to, and the variance ⟨A²⟩ − ⟨A⟩² sets the spread.',
      points: [
        'For |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩: ⟨Z⟩ = cos²(θ/2) − sin²(θ/2) = cos θ. At θ = 90°, ⟨Z⟩ = 0 though every shot is ±1.',
        'The Bloch vector is (⟨X⟩, ⟨Y⟩, ⟨Z⟩); its length is 1 for a pure state and less for a mixture.',
        'Energy: ⟨H⟩ is the mean energy; in an eigenstate the variance is zero and the energy is sharp.',
        'Estimating ⟨A⟩ from N shots has statistical error ~ σ_A/√N: to reach 10⁻³ precision on a ±1 observable needs ~10⁶ shots.',
      ],
      math: ['\\langle A\\rangle = \\bra{\\psi}A\\ket{\\psi} = \\sum_i a_i P_i, \\qquad \\langle Z\\rangle = \\cos\\theta, \\qquad \\Delta A^{2} = \\langle A^{2}\\rangle - \\langle A\\rangle^{2}'],
    },
    professional: {
      intro: 'Expectation values are the output type of most near-term quantum algorithms, and their estimation cost dominates runtime. ⟨H⟩ = Σ cₖ⟨Pₖ⟩ decomposes into Pauli expectations, each measured in its own basis with shot noise σ²/N; variance reduction is the engineering.',
      points: [
        'Shot budget for an energy to chemical accuracy (1.6 mHa) scales as (Σ|cₖ|)²/ε²; for a 50-qubit molecule this is 10⁸–10¹⁰ shots without tricks — the reason for grouping, importance sampling and classical shadows.',
        'Ehrenfest’s theorem: d⟨A⟩/dt = (i/ħ)⟨[H, A]⟩ + ⟨∂A/∂t⟩. Expectation values follow classical-looking equations; the quantum content is in the fluctuations.',
        'Mixed states: ⟨A⟩ = Tr(ρA). Readout error biases this; mitigation (confusion-matrix inversion, zero-noise extrapolation) trades bias for variance.',
        'Variational principle: ⟨H⟩ ≥ E₀ for any state, so a measured ⟨H⟩ is a rigorous upper bound — a rare case where a noisy device gives a guaranteed one-sided result.',
      ],
      math: ['\\frac{d\\langle A\\rangle}{dt} = \\frac{i}{\\hbar}\\langle[H,A]\\rangle, \\qquad N_{\\text{shots}} \\approx \\frac{(\\sum_k |c_k|)^{2}}{\\varepsilon^{2}}'],
    },
  },
  {
    topic: '05.07', minutes: 7,
    figure: { animation: 'time-evolution', params: { mode: 'eigenstate' } },
    kid: {
      intro: 'The Hamiltonian is the machine for energy. Feed it a state and it tells you the energy; its special arrows are the states with a definite energy, and a state that has definite energy does not change over time at all — it is “stationary”.',
      points: [
        'Every quantum system has one Hamiltonian, and it decides everything about how the system moves.',
        'Its eigenvalues are the allowed energies — the rungs of the energy ladder, like the levels in an atom.',
        'A state on one rung just sits there. A state spread over two rungs sloshes back and forth at a rate set by the gap between them.',
        'Building a quantum computer is largely about building a Hamiltonian you can switch on and off at will.',
      ],
    },
    student: {
      intro: 'The Hamiltonian H is the observable for total energy, kinetic plus potential: H = p²/2m + V(x). Its eigenvalues Eₙ are the allowed energies and its eigenstates |n⟩ are stationary states. H also generates time evolution, so it plays two roles at once.',
      points: [
        'H|n⟩ = Eₙ|n⟩. In a stationary state all probabilities are constant; only an overall phase e^{−iEₙt/ħ} turns, which is unobservable.',
        'For a qubit, H = (ħω₀/2)σ_z (up to a constant): eigenvalues ±ħω₀/2, gap ħω₀, and ω₀ is the qubit frequency.',
        'A superposition of two eigenstates evolves with a relative phase e^{−i(E₂−E₁)t/ħ}: observables oscillate at the Bohr frequency (E₂ − E₁)/h.',
        'Adding a drive term (e.g. ħΩ cos(ωt) σ_x) makes H time-dependent; on resonance it causes Rabi oscillations between the levels — a gate.',
      ],
      math: ['H = \\frac{p^{2}}{2m} + V(x), \\qquad H\\ket{n} = E_n\\ket{n}, \\qquad H_{\\text{qubit}} = \\tfrac12\\hbar\\omega_0\\,\\sigma_z'],
    },
    professional: {
      intro: 'Everything about a quantum device is a Hamiltonian engineering problem: the static part sets qubit frequencies and anharmonicities, the coupling part sets two-qubit gates, the drive part implements single-qubit gates, and the unwanted part is noise. Writing H down is the first step of every design.',
      points: [
        'Transmon: H = 4E_C(n − n_g)² − E_J cos φ. In the transmon regime E_J/E_C ≈ 50 the spectrum is a weakly anharmonic ladder with ω₀₁ ≈ √(8E_JE_C) − E_C and anharmonicity ≈ −E_C.',
        'Two-qubit coupling g σ_x σ_x (or exchange) in the rotating frame becomes an effective ZZ or iSWAP interaction; gate time is π/(2g_eff). Always-on coupling is also a source of crosstalk errors.',
        'Problem Hamiltonians: in quantum simulation the target H (molecular, spin-model) is mapped to qubit Paulis (Jordan–Wigner, Bravyi–Kitaev) and implemented as a Trotterised product of exponentials of its terms.',
        'The rotating-wave approximation and the interaction picture are the two manipulations you will use daily to turn a lab-frame Hamiltonian into a tractable gate Hamiltonian.',
      ],
      math: ['H_{\\text{transmon}} = 4E_C (\\hat n - n_g)^{2} - E_J\\cos\\hat\\varphi, \\qquad \\omega_{01} \\approx \\sqrt{8E_JE_C} - E_C'],
    },
  },
  {
    topic: '05.08', minutes: 7,
    figure: { animation: 'time-evolution', params: { mode: 'unitary' } },
    kid: {
      intro: 'Between measurements, quantum states change smoothly and completely predictably — like an arrow turning steadily on the ball. The turning never stretches or shrinks the arrow, and it can always be run backwards. This kind of change is called unitary.',
      points: [
        'The arrow turns; its length stays exactly 1. Total chance stays exactly 1.',
        'Nothing is lost: run the same turning in reverse and you get your original arrow back, perfectly.',
        'Quantum gates are little chunks of this turning. A circuit is turn, turn, turn — then one measurement.',
        'The only thing that is not reversible is measuring. That is why it is kept for the end.',
      ],
    },
    student: {
      intro: 'Time evolution of a closed system is unitary: |ψ(t)⟩ = U(t)|ψ(0)⟩ with U†U = I, so inner products and probabilities are preserved and the evolution is invertible. For a time-independent Hamiltonian U(t) = e^{−iHt/ħ}.',
      points: [
        'Unitarity ⇔ probability conservation: ⟨ψ(t)|ψ(t)⟩ = ⟨ψ(0)|U†U|ψ(0)⟩ = 1.',
        'In the energy basis U is diagonal: U|n⟩ = e^{−iEₙt/ħ}|n⟩. Expand any state in eigenstates, attach the phases, re-sum.',
        'Gates are unitaries: X, H, CNOT, Rz(θ) = e^{−iθZ/2}. U⁻¹ = U†, so every gate is undone by its adjoint — reversibility is built in.',
        'Composition: evolving for t₁ then t₂ is U(t₂)U(t₁) = U(t₁ + t₂) for constant H; matrices multiply right to left, in the order the gates act.',
      ],
      math: ['U(t) = e^{-iHt/\\hbar}, \\qquad U^{\\dagger}U = I, \\qquad \\ket{\\psi(t)} = \\sum_n c_n e^{-iE_nt/\\hbar}\\ket{n}'],
    },
    professional: {
      intro: 'Unitarity is the ideal every gate aspires to and the property every noise process breaks. The gap between the unitary you intended and the channel you got is the error; closing it is calibration, and correcting what remains is error correction.',
      points: [
        'Gate synthesis: any single-qubit unitary is Rz(α)Ry(β)Rz(γ) up to phase; any n-qubit unitary decomposes into CNOTs and single-qubit gates (Solovay–Kitaev gives polylog(1/ε) depth for a finite gate set). The cost is measured in two-qubit gates.',
        'Reversibility means a quantum circuit can be uncomputed: run it backwards to disentangle ancillas and return garbage to |0⟩ — essential because leftover entanglement with garbage destroys interference.',
        'Trotter–Suzuki: e^{−i(A+B)t} ≈ (e^{−iAt/n}e^{−iBt/n})ⁿ with error O(t²/n); this is how a target Hamiltonian’s evolution becomes a gate sequence, and the error–depth trade-off is the central budget in quantum simulation.',
        'Non-unitary effects — leakage, decay — are detected as loss of purity or norm in the qubit subspace; randomised benchmarking fits the decay of sequence fidelity to extract the average error per gate.',
      ],
      math: ['e^{-i(A+B)t} = \\left(e^{-iAt/n}e^{-iBt/n}\\right)^{n} + O\\!\\left(\\tfrac{t^{2}}{n}\\right)'],
    },
  },
  {
    topic: '05.09', minutes: 8,
    figure: { animation: 'time-evolution', params: { mode: 'superposition' } },
    kid: {
      intro: 'There is one master equation that tells every quantum state how to change from moment to moment. It was written down by Erwin Schrödinger in 1926. You do not need to solve it to understand what it says: “how the state changes right now depends on its energy machine”.',
      points: [
        'Feed the state’s current shape into the energy machine; what comes out tells you the shape a moment later.',
        'A state with one sharp energy just turns its clock hand; nothing visible happens.',
        'A state made of two energies turns two clock hands at different speeds, and the difference makes something visibly swing.',
        'Big energy gap: fast swinging. Small gap: slow. That is literally how fast an atom or a qubit “ticks”.',
      ],
    },
    student: {
      intro: 'The time-dependent Schrödinger equation iħ ∂|ψ⟩/∂t = H|ψ⟩ is first order in time: the state now determines the state forever after. Its solution for constant H is |ψ(t)⟩ = e^{−iHt/ħ}|ψ(0)⟩; in the energy basis each component acquires a phase e^{−iEₙt/ħ}.',
      points: [
        'Eigenstate: |ψ(t)⟩ = e^{−iEt/ħ}|n⟩, probabilities constant — stationary. Superposition c₁|1⟩ + c₂|2⟩: a relative phase e^{−i(E₂−E₁)t/ħ} grows and off-diagonal observables oscillate at ω₂₁ = (E₂ − E₁)/ħ.',
        'For a qubit with H = (ħω₀/2)σ_z starting in |+⟩: ⟨X⟩ = cos ω₀t, ⟨Y⟩ = −sin ω₀t — Larmor precession about z at the qubit frequency.',
        'The equation is linear, so superpositions of solutions are solutions, and it is deterministic — all randomness enters at measurement.',
        'In position representation: iħ ∂ψ/∂t = −(ħ²/2m) ∂²ψ/∂x² + V(x)ψ, a wave equation with a complex i that makes it diffusive-oscillatory rather than a classical wave.',
      ],
      math: [
        'i\\hbar\\frac{\\partial}{\\partial t}\\ket{\\psi} = H\\ket{\\psi}, \\qquad \\ket{\\psi(t)} = \\sum_n c_n e^{-iE_nt/\\hbar}\\ket{n}',
        '\\langle X\\rangle(t) = \\cos\\omega_0 t \\ \\text{for } \\ket{\\psi(0)} = \\ket{+}',
      ],
    },
    professional: {
      intro: 'The TDSE is what you integrate when you design a pulse: given H(t) = H₀ + H_drive(t), the gate is the time-ordered exponential, and optimal control (GRAPE, Krotov) searches over H_drive(t) for the pulse whose propagator is closest to the target unitary. The rotating frame is the trick that makes it tractable.',
      points: [
        'Time-dependent H: U = T exp(−(i/ħ)∫H dt′), a time-ordered product because H(t) at different times need not commute. Numerically, split into small steps where H is constant.',
        'Rotating frame at the drive frequency ω: H → H − ħωσ_z/2 removes the fast precession; with the rotating-wave approximation a resonant drive becomes a static (ħΩ/2)σ_x and the TDSE solution is a rotation by angle Ωt — the π pulse is t = π/Ω.',
        'Adiabatic theorem: if H(t) changes slowly compared with ħ/gap², a system in an eigenstate stays in the instantaneous eigenstate. Adiabatic quantum computing and annealing are this theorem turned into a machine; the gap closing is where it fails.',
        'Lindblad master equation extends the TDSE to open systems: dρ/dt = −(i/ħ)[H, ρ] + Σ (LρL† − ½{L†L, ρ}) — the equation you actually simulate for a noisy qubit.',
      ],
      math: ['U(t) = \\mathcal{T}\\exp\\!\\left(-\\frac{i}{\\hbar}\\int_0^{t} H(t\')\\,dt\'\\right), \\qquad \\dot\\rho = -\\frac{i}{\\hbar}[H,\\rho] + \\sum_k \\mathcal{D}[L_k]\\rho'],
    },
  },
  {
    topic: '05.10', minutes: 7,
    figure: { animation: 'wave-in-box', params: { n: 1 } },
    kid: {
      intro: 'If you only care about the states that do not change in time — the energy rungs — there is a simpler version of Schrödinger’s equation. It asks: which wave shapes, when fed to the energy machine, come back unchanged except for a stretch? The stretch factor is the energy.',
      points: [
        'It is like asking which notes a guitar string can play: only shapes that fit the string are allowed.',
        'For a particle trapped in a box, the allowed shapes are half-waves, whole waves, one-and-a-half waves …',
        'Each allowed shape has its own energy, and the energies climb: 1, 4, 9, 16 times the lowest.',
        'There is no zero: even the calmest allowed shape has some energy. The particle can never be perfectly still.',
      ],
    },
    student: {
      intro: 'Separating variables in the TDSE with ψ(x, t) = φ(x)e^{−iEt/ħ} gives the time-independent Schrödinger equation Hφ = Eφ: −(ħ²/2m)φ″ + V(x)φ = Eφ. It is an eigenvalue problem; its solutions are the stationary states and allowed energies.',
      points: [
        'Inside a box (V = 0, 0 < x < L) the equation is φ″ = −k²φ with k = √(2mE)/ħ: sines and cosines. Requiring φ = 0 at the walls picks k = nπ/L.',
        'Result: Eₙ = n²h²/8mL², φₙ = √(2/L) sin(nπx/L). For an electron in L = 1 nm, E₁ = 0.376 eV, E₂ = 1.50 eV, E₃ = 3.38 eV.',
        'Ground state energy E₁ > 0: zero-point energy, a consequence of confinement and the uncertainty principle.',
        'Number of nodes grows with n: φₙ has n − 1 interior zeros. More wiggles, more curvature, more kinetic energy.',
      ],
      math: [
        '-\\frac{\\hbar^{2}}{2m}\\frac{d^{2}\\varphi}{dx^{2}} + V\\varphi = E\\varphi, \\qquad E_n = \\frac{n^{2}h^{2}}{8mL^{2}}',
      ],
    },
    professional: {
      intro: 'The TISE is the eigenproblem at the heart of materials, chemistry and device design, and it is where numerical methods enter: finite differences turn it into a matrix, basis expansions turn it into a generalised eigenproblem, and for many-body systems the matrix is exponentially large — the problem quantum computers are proposed to solve.',
      points: [
        'Discretise x on N points: the kinetic term becomes a tridiagonal matrix with −2, 1, 1 entries scaled by ħ²/2mΔx²; diagonalise and you have Eₙ and φₙ to O(Δx²). Ten lines of code reproduce the box, the oscillator and the finite well.',
        'Quantum wells in semiconductors are this problem with V set by band offsets; the confinement energies set laser wavelengths and quantum-dot qubit splittings.',
        'Many-body TISE: for N electrons the wavefunction lives on 3N dimensions and the matrix is exponential in N — exact diagonalisation stops near 20–30 spin-orbitals. Quantum phase estimation and VQE target precisely this eigenvalue problem.',
        'Variational theorem for the TISE: ⟨φ|H|φ⟩/⟨φ|φ⟩ ≥ E₀ for any trial φ, the justification for every approximate quantum chemistry method from Hartree–Fock onward.',
      ],
      math: ['H_{ij} = -\\frac{\\hbar^{2}}{2m\\Delta x^{2}}\\,(\\delta_{i,j+1} - 2\\delta_{ij} + \\delta_{i,j-1}) + V_i\\delta_{ij}'],
    },
  },
  {
    topic: '05.11', minutes: 7,
    figure: { animation: 'wave-in-box' },
    kid: {
      intro: 'Why are energies in atoms and boxes only allowed at certain values? Because the wave has to fit. A wave trapped between two walls must be zero at both walls, and only certain wavelengths manage that. The rule about the edges — the boundary condition — is what creates the ladder.',
      points: [
        'Shake a skipping rope tied at both ends: only certain patterns work — one hump, two humps, three. Half a hump is impossible.',
        'The same with a trapped particle: half-waves that do not reach zero at the wall are forbidden.',
        'Fewer, longer humps mean lower energy; more, shorter humps mean higher energy.',
        'Take the walls away and the ladder disappears: a free particle can have any energy. Quantisation comes from being trapped.',
      ],
    },
    student: {
      intro: 'The TISE has solutions for every E; boundary conditions select the physical ones. Requiring φ to be zero at infinite walls, finite and normalisable at infinity, or periodic on a ring restricts k to a discrete set, and the discrete energies follow. Bound states are quantised; scattering states are not.',
      points: [
        'Infinite well: φ(0) = φ(L) = 0 ⇒ sin(kL) = 0 ⇒ kₙ = nπ/L ⇒ Eₙ ∝ n². One condition, one quantum number.',
        'Ring of circumference L: φ(x + L) = φ(x) ⇒ k = 2πn/L with n any integer (positive and negative) — the origin of angular-momentum quantisation and of Bohr’s nλ = 2πr.',
        'Finite well: continuity of φ and φ′ at the edges gives a transcendental equation with finitely many bound states; above the well top the spectrum is continuous.',
        'Normalisability is a boundary condition too: solutions that blow up at ±∞ are rejected, which is what quantises the harmonic oscillator and the hydrogen atom.',
      ],
      math: ['\\varphi(0) = \\varphi(L) = 0 \\ \\Rightarrow\\ k_n = \\frac{n\\pi}{L}, \\qquad \\varphi(x+L) = \\varphi(x) \\ \\Rightarrow\\ k_n = \\frac{2\\pi n}{L}'],
    },
    professional: {
      intro: 'Boundary conditions encode the device: the geometry of a transmon capacitor, the length of a resonator, the periodicity of a lattice. Change the boundary and you change the spectrum; that is how resonators are tuned, how flux quantisation arises, and how topological states appear at edges.',
      points: [
        'A λ/4 coplanar-waveguide resonator (short at one end, open at the other) has modes at f = (2n+1)v/4L; a 6 GHz readout resonator is a few millimetres of superconducting trace. Its boundary conditions are literally its ends.',
        'Flux quantisation in a superconducting loop is a periodic boundary condition on the Cooper-pair wavefunction phase: Φ = nΦ₀. The SQUID that tunes a transmon obeys this.',
        'Bloch’s theorem: periodic potentials give φ(x + a) = e^{ika}φ(x), hence bands and gaps; semiconductors, and the band-structure engineering behind spin-qubit quantum dots, follow from that one boundary condition.',
        'Topological insulators and Majorana modes are what happens when the bulk boundary condition forces a state to live at the edge regardless of local details — the proposed basis for topologically protected qubits.',
      ],
      math: ['\\varphi(x + a) = e^{ika}\\varphi(x) \\ \\text{(Bloch)}, \\qquad \\oint \\nabla\\theta\\cdot d\\mathbf{l} = 2\\pi n \\ \\Rightarrow\\ \\Phi = n\\Phi_0'],
    },
  },
];
