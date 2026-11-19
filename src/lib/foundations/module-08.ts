import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 08 — Quantum Computing.
 *
 * Nineteen topics from classical bits to Shor. The circuit figures run the
 * real gates through the statevector simulator; the Bernstein–Vazirani,
 * Grover and QFT circuits are the templates Qlaude's MCP server returned,
 * checked against its 1000-shot simulations (BV secret 101 → data bits 101
 * every shot; 3-qubit Grover → |101⟩ in 93.6% of shots).
 */
export const MODULE_08: FoundationLesson[] = [
  {
    topic: '08.01', minutes: 6,
    figure: { animation: 'classical-gates' },
    kid: {
      intro: 'Everything a normal computer does is built from switches that are on or off — bits — and tiny machines called logic gates that combine them. AND says “yes only if both are yes”. OR says “yes if either is”. NOT flips. That is the whole alphabet.',
      points: [
        'A bit is a 0 or a 1. Eight of them make a byte; a photo is millions of bytes.',
        'AND, OR, NOT: three gates, and from them you can build adders, memories and whole processors.',
        'Most gates throw information away: if AND outputs 0, you cannot tell which input was 0. That lost information leaks out as heat.',
        'Quantum gates must never throw information away — which is the first thing that makes them different.',
      ],
    },
    student: {
      intro: 'Classical information is bits; computation is Boolean functions of bits, built from gates. NAND (or NOR) alone is universal. Most classical gates are irreversible — AND maps four inputs to two outputs — and Landauer’s principle assigns a minimum energy cost kT ln 2 to each erased bit.',
      points: [
        'Truth tables: AND = a·b, OR = a + b − ab, XOR = a ⊕ b, NAND = ¬(a·b). Two-input gates have 16 possible truth tables.',
        'Universality: any Boolean function is a circuit of NANDs; a half-adder is one XOR and one AND.',
        'Irreversibility: AND(0,0) = AND(0,1) = AND(1,0) = 0, so the input is not recoverable from the output. Landauer: erasing a bit at 300 K costs at least 2.9 × 10⁻²¹ J.',
        'A classical n-bit register holds one of 2ⁿ states; a probabilistic one holds a probability distribution over them, with non-negative weights summing to 1.',
      ],
      math: ['\\text{NAND}(a,b) = \\lnot(a\\land b), \\qquad E_{\\text{erase}} \\ge k_BT\\ln 2 \\approx 2.9\\times10^{-21}\\ \\text{J at 300 K}'],
    },
    professional: {
      intro: 'Classical logic is the comparison class for every quantum claim, and it is also most of a quantum computer: control electronics, decoders for error correction and the classical post-processing in Shor are classical circuits that must run at cryogenic temperatures or across a wire into the fridge. Knowing where the classical–quantum boundary sits is a design decision.',
      points: [
        'Complexity baseline: a problem is in P if a classical circuit family of polynomial size decides it; BQP is the quantum analogue. Shor shows factoring in BQP while the best classical algorithms are sub-exponential; Grover gives only a quadratic speed-up over classical search.',
        'Error-correction decoders (minimum-weight matching, union-find) are classical algorithms that must process syndromes faster than errors accumulate — microseconds per round for a surface code — pushing them onto FPGAs or cryo-CMOS.',
        'Landauer’s bound is 10⁻²¹ J; a CMOS gate today spends ~10⁻¹⁵ J, so classical computing is still far from the thermodynamic floor. Reversible computing is the route to that floor, and quantum gates are necessarily reversible.',
        'Probabilistic classical computation (BPP) can be simulated with stochastic bits; the difference from quantum is that amplitudes can be negative and interfere — the single feature the next eighteen topics build on.',
      ],
      math: ['\\text{P} \\subseteq \\text{BPP} \\subseteq \\text{BQP} \\subseteq \\text{PSPACE}'],
    },
  },
  {
    topic: '08.02', minutes: 6,
    figure: { animation: 'circuit', params: { program: 'X0;X1;CCX0,1,2', qubits: 3, note: 'Toffoli: a reversible AND — inputs kept, result on the third wire' } },
    kid: {
      intro: 'A reversible computer never forgets. Every step can be run backwards to recover exactly what came before. It sounds like a luxury, but for quantum computers it is a law: quantum steps are turns of an arrow, and every turn can be un-turned.',
      points: [
        'NOT is reversible: flip it twice and you are back. AND is not: you cannot un-AND.',
        'The fix is to keep the inputs and write the answer onto a spare wire. That is the Toffoli gate: a reversible AND.',
        'A reversible computer could, in principle, run without generating heat, because it never erases.',
        'Every quantum circuit is reversible until the very last step, the measurement.',
      ],
    },
    student: {
      intro: 'A reversible gate is a bijection on bit strings: equal numbers of inputs and outputs and an inverse gate. Toffoli (CCNOT) flips the third bit iff the first two are 1; with the target set to 0 it computes AND reversibly, and it is universal for reversible classical computation. Every quantum gate is a unitary, hence reversible.',
      points: [
        'Toffoli |a, b, c⟩ → |a, b, c ⊕ ab⟩: with c = 0 the third output is AND(a, b) and the inputs survive. The figure sets a = b = 1 and shows |110⟩ → |111⟩.',
        'Any irreversible circuit can be made reversible with ancilla bits and garbage outputs (Bennett); uncomputing the garbage by running the circuit backwards leaves only the answer and the inputs.',
        'Fredkin (controlled-SWAP) is also universal and conserves the number of 1s — a “billiard-ball” gate.',
        'Reversibility does not cost speed: a reversible adder has the same depth up to constants; it costs ancilla bits and the discipline of uncomputation.',
      ],
      math: ['\\text{TOF}\\ket{a,b,c} = \\ket{a,b,c\\oplus ab}, \\qquad \\text{TOF}^{2} = I'],
    },
    professional: {
      intro: 'Reversibility is why quantum arithmetic is expensive and why uncomputation is a correctness requirement, not a tidiness preference: garbage left entangled with the result destroys the interference the algorithm depends on. Oracle construction in Grover and Shor is reversible classical circuit design.',
      points: [
        'Toffoli is not Clifford; in fault-tolerant architectures it costs T gates (typically 4–7 per Toffoli) and T gates are the dominant cost. Resource estimates for Shor are quoted in Toffoli or T counts, not qubit count alone.',
        'Modular exponentiation for RSA-2048 needs ~10⁹ Toffolis; at 1 µs per Toffoli layer with error correction that is the hours-to-days runtime estimate, and the ~10⁶ physical qubits.',
        'Uncomputation: compute f(x) into an ancilla, copy the needed bit with a CNOT, then run the computation backwards. Skipping it leaves |x⟩|f(x)⟩|garbage⟩ and the Hadamard interference on x fails.',
        'Measurement-based uncomputation and Bennett’s pebbling trade qubits for time; both are standard compiler passes.',
      ],
      math: ['\\ket{x}\\ket{0}\\ket{0} \\xrightarrow{U_f} \\ket{x}\\ket{f(x)}\\ket{g(x)} \\xrightarrow{\\text{copy}} \\ket{x}\\ket{f(x)}\\ket{g(x)}\\ket{f(x)} \\xrightarrow{U_f^{\\dagger}} \\ket{x}\\ket{0}\\ket{0}\\ket{f(x)}'],
    },
  },
  {
    topic: '08.03', minutes: 6,
    figure: { animation: 'bloch-sphere', params: { theta: 0 } },
    kid: {
      intro: 'A qubit is the quantum version of a bit. It can be 0, it can be 1, and it can be any blend of the two — an arrow anywhere on a ball, with straight up for 0 and straight down for 1. When you read it, though, you always get a plain 0 or 1.',
      points: [
        'Any two-level quantum thing can be a qubit: a spin, two energy levels of an atom, a photon’s polarisation, a superconducting circuit.',
        'The arrow is the qubit’s state. Pulses turn the arrow; a measurement snaps it to up or down.',
        'The pair of basic states, 0 and 1, is called the computational basis. It is the alphabet everything is written in.',
        'Two numbers describe the arrow (how tilted, which way round). That is more than one bit, but you can only ever read one bit out.',
      ],
    },
    student: {
      intro: 'A qubit is a two-dimensional quantum system with computational basis {|0⟩, |1⟩}; its state is |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1. Up to global phase, (θ, φ) on the Bloch sphere parameterise it; measurement in the computational basis yields 0 with probability |α|².',
      points: [
        'Physical realisations: |0⟩/|1⟩ are ground/excited transmon levels, hyperfine sublevels of an ion, horizontal/vertical polarisation, spin down/up.',
        'The Bloch sphere: |0⟩ at the north pole, |1⟩ at the south, |±⟩ on the ±x axis, |±i⟩ on ±y. Orthogonal states are antipodal.',
        'A qubit holds two continuous parameters but Holevo’s bound limits the information retrievable from n qubits to n bits.',
        'The computational basis is the readout basis; everything else is reached by rotating the state before measuring.',
      ],
      math: ['\\ket{\\psi} = \\cos\\tfrac{\\theta}{2}\\ket{0} + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\ket{1}, \\qquad P(0) = \\cos^{2}\\tfrac{\\theta}{2}'],
    },
    professional: {
      intro: 'The qubit abstraction hides a physical system with more than two levels, finite coherence and imperfect readout; the DiVincenzo criteria (well-defined qubits, initialisation, long coherence, universal gates, readout) are the checklist that turns a two-level system into a computational one.',
      points: [
        'Leakage: real qubits have a |2⟩. Population outside the computational subspace is not a Pauli error and is not corrected by standard codes; leakage-reduction units and reset are needed.',
        'Encoded qubits: a logical qubit of a surface code is a two-dimensional subspace of ~1000 physical qubits; the Bloch sphere of a logical qubit is as real as that of a physical one, with far longer coherence once below threshold.',
        'Qubit frequency choices are a packing problem: transmons at 4–6 GHz must be spaced to avoid crosstalk and frequency collisions; fixed-frequency designs rely on fabrication precision (~1%), tunable ones on flux bias.',
        'Figures of merit per qubit: T₁, T₂, single-qubit gate fidelity, readout fidelity, and (as a product) the number of operations within the coherence time, Q = T₂/t_gate ~ 10³–10⁴ today.',
      ],
      math: ['Q_{\\text{ops}} \\sim \\frac{T_2}{t_{\\text{gate}}}, \\qquad I_{\\text{accessible}} \\le n \\ \\text{bits (Holevo)}'],
    },
  },
  {
    topic: '08.04', minutes: 6,
    figure: { animation: 'measurement-collapse', params: { theta: 2.0944 } },
    kid: {
      intro: 'When you read a qubit you get 0 or 1, and the arrow’s tilt decides the odds. An arrow mostly down gives 1 most of the time. To find out the odds you have to prepare the same arrow and read it many times — one reading tells you almost nothing.',
      points: [
        'Tilted two-thirds of the way down: about a quarter 0s, three-quarters 1s.',
        'Run it a thousand times and the tally settles near those numbers. Run it ten times and it could be anything.',
        'After reading, the qubit is whatever you read — the tilt is gone.',
        'This is why every quantum program is run over and over: the answer is in the pattern of readings.',
      ],
    },
    student: {
      intro: 'Measuring a qubit in the computational basis gives 0 with probability |α|² = cos²(θ/2) and 1 with probability |β|² = sin²(θ/2), and leaves the qubit in the observed state. For n qubits, measuring all gives bitstring x with probability |α_x|². Estimating a probability from N shots has error ≈ √(p(1−p)/N).',
      points: [
        'θ = 120°: P(0) = cos²(60°) = 0.25, P(1) = 0.75 — the figure’s running tally.',
        'Measuring a subset of qubits projects the rest: for (|00⟩ + |11⟩)/√2, reading qubit 0 as 1 leaves qubit 1 in |1⟩ with certainty.',
        'Shot noise: 1000 shots give p to about ±1.4% at p = ½; 10⁶ shots are needed for ±0.05%.',
        'Measurement in another basis = rotate then measure: apply H to measure X, S†H to measure Y.',
      ],
      math: ['P(x) = |\\alpha_x|^{2}, \\qquad \\sigma_p \\approx \\sqrt{\\frac{p(1-p)}{N}}'],
    },
    professional: {
      intro: 'Measurement is the most error-prone operation on most platforms (1–3% versus 0.1% for single-qubit gates) and the slowest (hundreds of nanoseconds to microseconds against tens of nanoseconds). Its statistics set the shot budget; its errors set the need for readout mitigation; its speed sets the feedback latency for error correction.',
      points: [
        'Readout fidelity is characterised by the assignment matrix [[P(0|0), P(0|1)], [P(1|0), P(1|1)]]; inverting it on measured histograms corrects bias at the cost of amplified variance and possible negative “probabilities” that need constrained fitting.',
        'Mid-circuit measurement with feed-forward requires readout plus classical decision within the coherence time — the capability behind error correction, teleportation and dynamic circuits.',
        'QND readout (dispersive for transmons, fluorescence shelving for ions) leaves the qubit in the measured eigenstate so it can be reused; destructive readout (photon detection) consumes the qubit.',
        'Sampling complexity: estimating all 2ⁿ probabilities needs exponentially many shots; useful algorithms concentrate the distribution (Grover, phase estimation) or estimate a few expectation values (VQE).',
      ],
      math: ['\\begin{pmatrix}\\tilde p_0\\\\\\tilde p_1\\end{pmatrix} = \\begin{pmatrix}P(0|0)&P(0|1)\\\\P(1|0)&P(1|1)\\end{pmatrix}\\begin{pmatrix}p_0\\\\p_1\\end{pmatrix}'],
    },
  },
  {
    topic: '08.05', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 1.0472, phi: 1.0472 } },
    kid: {
      intro: 'The Bloch sphere is the map of everything a single qubit can be. Every point on the surface is a possible state: north pole 0, south pole 1, the equator all the perfect fifty-fifty blends, and the longitude around the equator is the phase twist.',
      points: [
        'Height on the ball = how likely you are to read 0. Top: certain 0. Middle: fifty-fifty. Bottom: certain 1.',
        'Going round the equator does not change the 0/1 odds at all — it changes the hidden twist that matters for interference.',
        'Gates are rotations of the ball. X flips north to south; Z spins it around the vertical axis; H swaps north with the front of the equator.',
        'Opposite points on the ball are the two answers to one question. Up/down, front/back, left/right: three different questions.',
      ],
    },
    student: {
      intro: 'The Bloch sphere represents a qubit state by the unit vector (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩). Orthogonal states are antipodal; the eigenstates of X, Y, Z lie on the three axes; single-qubit unitaries are rotations of the sphere, and mixed states lie inside it.',
      points: [
        'At θ = 60°, φ = 60°: P(0) = cos²30° = 0.75, Bloch vector (0.43, 0.75, 0.5). ⟨Z⟩ = 0.5 is the height.',
        'Rotations: X = rotation by π about x, Z by π about z, H by π about (x + z)/√2, S by π/2 about z, Rₙ(θ) by θ about n̂.',
        'Angles on the sphere are double the Hilbert-space angles: orthogonal states (90° in Hilbert space) are 180° apart on the sphere — the half-angle in cos(θ/2).',
        'The sphere exists only for one qubit; two qubits have 6 real parameters and no such picture, which is itself a statement about entanglement.',
      ],
      math: ['\\mathbf{r} = (\\langle X\\rangle, \\langle Y\\rangle, \\langle Z\\rangle), \\qquad |\\mathbf{r}| = 1 \\ \\text{(pure)}, \\quad |\\mathbf{r}| < 1 \\ \\text{(mixed)}'],
    },
    professional: {
      intro: 'The Bloch sphere is the calibration dashboard: Rabi oscillations are great circles through the poles, Ramsey fringes are rotations about z, T₁ pulls the vector to the pole, T₂ shrinks it toward the axis. Pulse errors are over/under-rotations and axis tilts, all visible as deviations from the intended trajectory.',
      points: [
        'Composite pulses (BB1, CORPSE, SK1) are sequences of rotations designed so that amplitude or detuning errors cancel to first or second order — the geometry of the sphere makes the cancellation conditions explicit.',
        'Density-matrix picture: ρ = (I + r·σ)/2, with purity (1 + |r|²)/2. Depolarising noise shrinks r uniformly; dephasing shrinks the x–y components; amplitude damping moves r toward +z while shrinking.',
        'Virtual Z: rotating the reference frame instead of the state (updating the phase of all subsequent pulses) implements Rz exactly and instantly — a Bloch-sphere symmetry turned into a free gate.',
        'Geometric (Berry) phase: a state carried around a closed loop on the sphere acquires a phase equal to half the solid angle enclosed; holonomic gates use this for noise resilience.',
      ],
      math: ['\\rho = \\tfrac12(I + \\mathbf{r}\\cdot\\boldsymbol{\\sigma}), \\qquad \\gamma_{\\text{Berry}} = -\\tfrac12\\Omega_{\\text{solid}}'],
    },
  },
  {
    topic: '08.06', minutes: 8,
    figure: { animation: 'bloch-sphere', params: { theta: 0, gate: 'H' } },
    kid: {
      intro: 'Four moves cover most of what you do to one qubit. X is the flip: 0 becomes 1. Z is the twist: it leaves 0 and 1 alone but flips the sign of the blend. Y is both at once. H, the Hadamard, is the blender: it turns a definite 0 into a perfect fifty-fifty — and a fifty-fifty back into a definite 0.',
      points: [
        'X: a half-turn of the ball about the left–right axis. North becomes south.',
        'Z: a half-turn about the vertical axis. The poles stay; the equator spins to the opposite side.',
        'H: a half-turn about a tilted axis. North goes to the front of the equator; do it again and it comes back.',
        'Two H gates in a row do nothing at all — and that “nothing” is the simplest quantum interference there is.',
      ],
    },
    student: {
      intro: 'The Pauli gates X, Y, Z and the Hadamard H are the basic single-qubit unitaries. X|0⟩ = |1⟩ (bit flip), Z|1⟩ = −|1⟩ (phase flip), Y = iXZ, and H|0⟩ = |+⟩, H|1⟩ = |−⟩. All four are Hermitian and unitary, so each squares to the identity.',
      points: [
        'Matrices: X = [[0,1],[1,0]], Y = [[0,−i],[i,0]], Z = [[1,0],[0,−1]], H = (1/√2)[[1,1],[1,−1]].',
        'H as a basis change: it maps the Z basis to the X basis and back, so HZH = X and HXH = Z — measuring X is “apply H, measure Z”.',
        'HH|0⟩ = |0⟩ with certainty: the two amplitudes to |1⟩, (+½ and −½), cancel. Insert Z between them and HZH|0⟩ = X|0⟩ = |1⟩.',
        'Products: XY = iZ, YZ = iX, ZX = iY; the Paulis anticommute pairwise and, with I, span all 2 × 2 matrices.',
      ],
      math: [
        'H = \\frac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}, \\qquad HZH = X, \\qquad HH = I',
        'HH\\ket{0} = \\ket{0}, \\qquad HZH\\ket{0} = \\ket{1}',
      ],
    },
    professional: {
      intro: 'X, Y, Z and H are Clifford gates: they map Pauli operators to Pauli operators and, with S and CNOT, generate the Clifford group, which is efficiently classically simulable (Gottesman–Knill). That is why they are cheap in error-corrected architectures and why non-Clifford gates (T) are the expensive resource.',
      points: [
        'Hardware: X and Y are resonant microwave (or laser) pulses of area π with 0° or 90° phase; Z is virtual (frame update); H is typically compiled as Rz(π)·Ry(π/2) or realised as a single calibrated pulse. Native gate sets rarely contain H directly.',
        'Pauli frame tracking: in error correction, X and Z corrections are not applied physically but recorded classically and propagated through subsequent Cliffords — possible precisely because Cliffords map Paulis to Paulis.',
        'Randomised benchmarking uses random Clifford sequences that compose to the identity; the exponential decay of survival probability with sequence length gives the average Clifford error, independent of SPAM.',
        'Gottesman–Knill means a circuit of only H, S, CNOT and Pauli measurements can be simulated in poly time; quantum advantage needs T (or another non-Clifford) gates, and their count is the standard cost metric.',
      ],
      math: ['\\mathcal{C}_1 = \\langle H, S\\rangle, \\qquad \\mathcal{C}_n = \\langle H, S, \\text{CNOT}\\rangle, \\qquad P_{\\text{surv}}(m) = A p^{m} + B'],
    },
  },
  {
    topic: '08.07', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 1.5708, phi: 0, gate: 'S' } },
    kid: {
      intro: 'S and T are gentler versions of Z. Z twists the blend by a half-turn; S by a quarter-turn; T by an eighth. On a definite 0 or 1 they do nothing you could notice. On a blend, they set the hidden twist that decides how the pieces will interfere later.',
      points: [
        'S is “half a Z”: two S gates make one Z. T is “half an S”: two T gates make one S.',
        'On the ball, S swings a front-facing arrow a quarter of the way round the equator, to the side.',
        'T is the odd one out: it is the gate that makes quantum computers genuinely hard to imitate.',
        'In the far future, T gates will be the scarce, expensive ingredient of big quantum programs.',
      ],
    },
    student: {
      intro: 'S = diag(1, i) and T = diag(1, e^{iπ/4}) are phase gates: rotations about the z-axis by π/2 and π/4. S² = Z and T² = S. They leave |0⟩ and |1⟩ unchanged up to phase and move equatorial states around the equator: S|+⟩ = |+i⟩.',
      points: [
        'Rz(φ) = diag(e^{−iφ/2}, e^{iφ/2}) equals the phase gate diag(1, e^{iφ}) up to global phase; S = Rz(π/2), T = Rz(π/4), Z = Rz(π).',
        'S is Clifford (S X S† = Y); T is not (T X T† is not a Pauli). H and T together generate a dense subset of single-qubit unitaries — universality for one qubit.',
        'S† and T† are the inverse rotations; measuring Y is implemented as S†, then H, then measure Z.',
        'The relative phase these gates set is invisible to a Z measurement and decisive for X and Y measurements — the figure shows the Z-basis probabilities unchanged while the arrow moves.',
      ],
      math: ['S = \\begin{pmatrix}1&0\\\\0&i\\end{pmatrix}, \\quad T = \\begin{pmatrix}1&0\\\\0&e^{i\\pi/4}\\end{pmatrix}, \\qquad S^{2} = Z, \\quad T^{2} = S'],
    },
    professional: {
      intro: 'T is the standard non-Clifford gate and, in fault-tolerant computing, the unit of cost: it cannot be applied transversally in the surface code and is instead injected from distilled magic states, each costing tens of physical operations. T-count and T-depth are the headline numbers of a fault-tolerant algorithm.',
      points: [
        'Magic-state distillation (15-to-1 Bravyi–Kitaev) turns 15 noisy T states of error p into one of error 35p³; a few rounds reach 10⁻¹⁰ to 10⁻¹² at a cost of ~10³ physical qubit-cycles per T. Factories can occupy half a fault-tolerant processor.',
        'Solovay–Kitaev / Ross–Selinger: an arbitrary Rz(θ) is approximated to precision ε with ~3 log₂(1/ε) T gates; ε = 10⁻¹⁰ costs ~100 T gates per rotation.',
        'On NISQ hardware the picture inverts: S and T are virtual Z rotations, exactly free; the expensive gates are the entangling ones. Compilers target different costs for the two eras.',
        'Clifford+T is universal and the T gate alone, added to Cliffords, promotes efficiently simulable circuits to BQP-complete — the sharpest statement of where quantum hardness enters.',
      ],
      math: ['15 \\text{ T states at } p \\to 1 \\text{ at } 35p^{3}, \\qquad N_T(\\varepsilon) \\approx 3\\log_2\\!\\frac{1}{\\varepsilon}'],
    },
  },
  {
    topic: '08.08', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 0, gate: 'RX' } },
    kid: {
      intro: 'The named gates are special turns, but a qubit can be turned by any angle about any axis. Rotation gates take an angle as a dial setting: a quarter-turn, a third, a tiny nudge. They are how a quantum computer steers its arrows precisely rather than just flipping them.',
      points: [
        'Rx turns about the left–right axis, Ry about the front–back axis, Rz about the vertical axis.',
        'Rx by a half-turn is X. Rx by a quarter-turn takes north to the equator — a fifty-fifty state.',
        'Real machines make rotations with pulses: a longer or stronger pulse, a bigger turn.',
        'Three rotations in a row, with the right angles, can reach any arrow on the ball from any other.',
      ],
    },
    student: {
      intro: 'Rotation gates Rₙ(θ) = e^{−iθ n̂·σ/2} rotate the Bloch vector by θ about axis n̂. Rx(θ) = cos(θ/2) I − i sin(θ/2) X, and similarly for Ry, Rz. Any single-qubit unitary is, up to global phase, Rz(α) Ry(β) Rz(γ) — three Euler angles.',
      points: [
        'Rx(π) = −iX, Ry(π) = −iY, Rz(π) = −iZ: the Paulis are half-turns up to a phase. Rx(π/2)|0⟩ = (|0⟩ − i|1⟩)/√2, on the equator.',
        'Half-angle again: the matrix uses θ/2 while the Bloch vector turns by θ; Rₙ(2π) = −I, Rₙ(4π) = I.',
        'Euler decomposition: U = e^{iδ} Rz(α) Ry(β) Rz(γ) — four real parameters for U(2), three for the physical state change.',
        'Parameterised circuits in variational algorithms are built from Rx, Ry, Rz with trainable angles and fixed entangling gates.',
      ],
      math: ['R_x(\\theta) = \\begin{pmatrix}\\cos\\frac{\\theta}{2} & -i\\sin\\frac{\\theta}{2}\\\\ -i\\sin\\frac{\\theta}{2} & \\cos\\frac{\\theta}{2}\\end{pmatrix}, \\qquad U = e^{i\\delta}R_z(\\alpha)R_y(\\beta)R_z(\\gamma)'],
    },
    professional: {
      intro: 'Rotations are the native single-qubit operations of every platform: a microwave or laser pulse of amplitude Ω and duration t is Rₙ(Ωt) about an axis set by the pulse phase. Calibration is the measurement of Ω(amplitude) and of the axis; gradients of rotation angles are what variational optimisers compute.',
      points: [
        'Native sets: IBM exposes √X (Rx(π/2)) plus virtual Rz; trapped ions expose Rφ(θ) about any equatorial axis; both reach arbitrary U with two physical pulses and free Z rotations. Compilers decompose Euler angles accordingly.',
        'Parameter-shift rule: for a gate e^{−iθP/2} with P a Pauli, ∂⟨A⟩/∂θ = [⟨A⟩(θ + π/2) − ⟨A⟩(θ − π/2)]/2 exactly — analytic gradients from two circuit evaluations, no finite differences.',
        'Pulse-level: a rotation’s fidelity depends on the pulse shape’s spectrum; Gaussian and DRAG envelopes suppress leakage to |2⟩ and phase errors. 20 ns Rx(π/2) at 99.95% is typical for transmons.',
        'Small-angle rotations are the hardest to implement with fixed fractional error and are also where fault-tolerant synthesis cost is highest; both eras prefer algorithms whose angles are multiples of π/4 where possible.',
      ],
      math: ['\\frac{\\partial\\langle A\\rangle}{\\partial\\theta} = \\tfrac12\\left[\\langle A\\rangle_{\\theta+\\pi/2} - \\langle A\\rangle_{\\theta-\\pi/2}\\right]'],
    },
  },
  {
    topic: '08.09', minutes: 6,
    figure: { animation: 'two-qubit', params: { mode: 'ghz' } },
    kid: {
      intro: 'Put several qubits together and the number of basic states explodes: two qubits have four, three have eight, ten have a thousand and twenty have a million. A quantum state of the group can spread across all of them at once — and some of those states cannot be split back into separate qubits.',
      points: [
        'Three qubits all “same”: 000 half the time, 111 the other half, nothing else. That is a GHZ state — three qubits, one shared fact.',
        'Measure any one and the other two are instantly fixed to match.',
        'A list of a million blend weights is too long for any classical computer to carry for a few hundred qubits. The quantum register carries it for free.',
        'But remember the catch: one measurement gives one basic state. The art is making the right one likely.',
      ],
    },
    student: {
      intro: 'An n-qubit state is Σ α_x|x⟩ over 2ⁿ bitstrings. Product states have polynomially many parameters; general states have 2ⁿ complex amplitudes. The GHZ state (|000⟩ + |111⟩)/√2, made by H then two CNOTs, is maximally entangled across all three qubits.',
      points: [
        'GHZ preparation: H on qubit 0, CNOT 0→1, CNOT 0→2. The figure shows the bars at |000⟩ and |111⟩ appear after the last CNOT.',
        'Tracing out one qubit of GHZ leaves a classical mixture of |00⟩ and |11⟩ with no entanglement — GHZ entanglement is fragile to loss of any party, unlike W states.',
        'Measurement of qubit 0 projects the others: outcome 0 ⇒ |00⟩, outcome 1 ⇒ |11⟩.',
        'Amplitude count: 20 qubits → 2²⁰ ≈ 10⁶ amplitudes; 300 qubits → 2³⁰⁰ ≈ 10⁹⁰, more than the atoms in the observable universe.',
      ],
      math: ['\\ket{\\text{GHZ}_3} = \\frac{\\ket{000}+\\ket{111}}{\\sqrt2}, \\qquad \\dim\\mathcal{H}_n = 2^{n}'],
    },
    professional: {
      intro: 'Multi-qubit states are where simulation cost, entanglement structure and noise sensitivity all become visible at once. GHZ states are the standard test of multi-qubit coherence: their parity oscillation decays n times faster than a single qubit’s, which is both a benchmark and a warning.',
      points: [
        'GHZ parity: measuring all qubits in a rotated basis gives a signal oscillating at n times the single-qubit frequency with contrast that decays as e^{−n t/T₂}. GHZ states of 20+ qubits have been certified on ions and transmons this way.',
        'Stabiliser description: GHZ is stabilised by X⊗X⊗X and Z⊗Z⊗I, I⊗Z⊗Z — three generators specify the 8-amplitude state, the compression Gottesman–Knill exploits.',
        'Entanglement classes: for three qubits, GHZ and W are inequivalent under local operations; W states (one excitation shared) survive loss of a qubit. Error-correcting codes use entangled multi-qubit states whose correlations encode information robustly.',
        'Classical simulation frontier: random circuits on ~50–60 qubits at depth ~20 are at the edge of tensor-network methods; structured states (low entanglement, Clifford) remain simulable at any size.',
      ],
      math: ['\\text{GHZ}_n: \\ \\langle \\text{parity}(\\phi)\\rangle \\propto e^{-nt/T_2}\\cos(n\\phi)'],
    },
  },
  {
    topic: '08.10', minutes: 7,
    figure: { animation: 'two-qubit', params: { mode: 'cnot' } },
    kid: {
      intro: 'The CNOT is the gate that lets qubits talk to each other. It has a control and a target: if the control is 1, flip the target; if the control is 0, leave it. Simple on plain 0s and 1s — but feed the control a blend, and the two qubits become entangled.',
      points: [
        '00 → 00, 01 → 01, 10 → 11, 11 → 10: only the last two rows change, because only there is the control 1.',
        'Control in a blend of 0 and 1: the target ends up in a blend of “not flipped” and “flipped”, tied to the control.',
        'Every entangled state in a quantum computer is made with gates like this one.',
        'CNOT twice in a row undoes itself — reversible, like everything quantum.',
      ],
    },
    student: {
      intro: 'CNOT = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X flips the target iff the control is |1⟩. It is a 4 × 4 permutation matrix on the computational basis, a Clifford gate, and together with single-qubit gates it is universal. Controlled-U generalises it to any single-qubit unitary U.',
      points: [
        'Matrix (control first): CNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]. The figure cycles the four basis inputs through it.',
        'On a superposed control: CNOT(|+⟩|0⟩) = (|00⟩ + |11⟩)/√2 — a Bell state, the standard entangler.',
        'CZ = diag(1, 1, 1, −1) is symmetric between the qubits and equals (I ⊗ H) CNOT (I ⊗ H); many platforms implement CZ natively.',
        'Phase kickback: with the target in |−⟩, CNOT leaves the target alone and flips the control’s sign — the control acquires the eigenvalue.',
      ],
      math: ['\\text{CNOT} = \\ket{0}\\bra{0}\\otimes I + \\ket{1}\\bra{1}\\otimes X, \\qquad \\text{CZ} = (I\\otimes H)\\,\\text{CNOT}\\,(I\\otimes H)'],
    },
    professional: {
      intro: 'Two-qubit gates are the limiting operation on every platform — the slowest, the least accurate (0.1–1% error versus 0.01–0.1% for single-qubit) and the ones that require connectivity. Native entangling gates differ by hardware (CZ, iSWAP, Mølmer–Sørensen, cross-resonance) and compilers translate CNOT into them.',
      points: [
        'Transmons: cross-resonance (fixed-frequency, 200–500 ns), tunable-coupler CZ (~30–60 ns, 99.5–99.9%), parametric iSWAP. Ions: Mølmer–Sørensen XX(θ) via shared motion (10–200 µs, 99.9%+). Neutral atoms: Rydberg-blockade CZ (~100s ns).',
        'Connectivity: on a 2-D lattice a CNOT between distant qubits costs a chain of SWAPs (3 CNOTs each); routing overhead can multiply two-qubit gate count by 3–10×, which is why all-to-all ion connectivity matters.',
        'Characterisation: interleaved randomised benchmarking isolates the two-qubit gate error; cross-entropy benchmarking and cycle benchmarking capture crosstalk and coherent errors that RB averages away.',
        'Any two-qubit unitary needs at most 3 CNOTs (KAK decomposition); most algorithm primitives (SWAP = 3 CNOT, Toffoli = 6 CNOT) are counted in this currency.',
      ],
      math: ['U_{4\\times4} = (A_1\\otimes B_1)\\,e^{i(\\alpha XX + \\beta YY + \\gamma ZZ)}\\,(A_2\\otimes B_2) \\ \\text{(KAK)}'],
    },
  },
  {
    topic: '08.11', minutes: 7,
    figure: { animation: 'circuit', params: { program: 'H0;CX0,1', qubits: 2, note: 'the Bell state (|00⟩+|11⟩)/√2' } },
    kid: {
      intro: 'A quantum circuit is a recipe read left to right: each wire is a qubit, each box is a gate, and the end is a measurement. The most famous two-line recipe is H then CNOT — it turns two plain 0s into an entangled pair.',
      points: [
        'Start: both qubits 0. Step one: H on the top qubit makes it a fifty-fifty blend.',
        'Step two: CNOT from top to bottom. Where the top is 1 the bottom flips; where it is 0 it stays. Now they match.',
        'Measure: 00 or 11, never 01 or 10. Two gates, one entangled pair.',
        'Every bigger circuit is more wires and more boxes, but the reading rule is the same.',
      ],
    },
    student: {
      intro: 'A circuit diagram shows qubits as horizontal wires (time flows left to right) and gates as boxes or symbols; the circuit’s unitary is the product of the gate matrices in reverse order. H on qubit 0 followed by CNOT(0→1) maps |00⟩ to |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.',
      points: [
        'Step by step: |00⟩ → (H ⊗ I) → (|00⟩ + |10⟩)/√2 → CNOT → (|00⟩ + |11⟩)/√2. The figure’s bars move from |00⟩ to {|00⟩, |10⟩} to {|00⟩, |11⟩}.',
        'Matrix order: U_circuit = CNOT · (H ⊗ I); the first gate applied is the rightmost factor.',
        'Depth is the number of layers of simultaneously applicable gates; width is the number of qubits. This circuit has depth 2, width 2.',
        'Reversing the circuit (CNOT then H) maps the four Bell states back to the computational basis — a Bell measurement.',
      ],
      math: ['U = \\text{CNOT}\\,(H\\otimes I), \\qquad U\\ket{00} = \\frac{\\ket{00}+\\ket{11}}{\\sqrt2}'],
    },
    professional: {
      intro: 'The Bell-pair circuit is the smallest complete benchmark: it exercises a single-qubit gate, an entangling gate, and correlated readout, and its output fidelity is the first number reported for any new processor. It is also the unit of a quantum network and the consumable of teleportation.',
      points: [
        'Reported fidelity of H+CNOT Bell pairs: ~99% on leading superconducting and ion devices; the error budget splits roughly into two-qubit gate error, readout error and residual single-qubit error.',
        'Compilation: on hardware with native CZ, CNOT = (I ⊗ H) CZ (I ⊗ H), so the Bell circuit becomes H, H, CZ, H — three single-qubit pulses and one entangler, the Hs on the target partly cancelling with frame tricks.',
        'Circuit notation hides timing: idle qubits decohere during other qubits’ gates, so scheduling (as-late-as-possible) and dynamical decoupling on idle wires are real compiler passes.',
        'Bell pairs between modules (photonic links, ion shuttling) are the proposed interconnect for scaling; teleported gates consume one pair per remote CNOT.',
      ],
      math: ['\\text{CNOT} = (I\\otimes H)\\,\\text{CZ}\\,(I\\otimes H), \\qquad F_{\\text{Bell}} = \\bra{\\Phi^{+}}\\rho\\ket{\\Phi^{+}}'],
    },
  },
  {
    topic: '08.12', minutes: 8,
    figure: { animation: 'two-qubit', params: { mode: 'superdense' } },
    kid: {
      intro: 'Normally one qubit can carry one bit. But if two people share an entangled pair in advance, one of them can send two bits by touching only their own qubit and posting it. The receiver combines the posted qubit with their half and reads both bits.',
      points: [
        'Alice and Bob each hold half of an entangled pair. Alice wants to send 00, 01, 10 or 11.',
        'She applies nothing, a flip, a twist, or both to her qubit — four choices for four messages — and sends it to Bob.',
        'Bob now has both qubits. He measures them together and reads her two bits perfectly.',
        'The pair had to be shared beforehand, so nothing travels faster than light. But one qubit did carry two bits.',
      ],
    },
    student: {
      intro: 'Superdense coding sends two classical bits with one qubit plus one pre-shared Bell pair. Alice applies I, X, Z or ZX to her qubit (encoding 00, 01, 10, 11), mapping |Φ⁺⟩ to one of the four orthogonal Bell states; Bob performs a Bell measurement (CNOT, H, measure) and reads the two bits.',
      points: [
        'Encoding: I → |Φ⁺⟩, X → |Ψ⁺⟩, Z → |Φ⁻⟩, ZX → |Ψ⁻⟩ (up to sign). The four are orthogonal, hence perfectly distinguishable.',
        'Decoding: CNOT(0→1) then H on qubit 0 maps |Φ⁺⟩ → |00⟩, |Ψ⁺⟩ → |01⟩, |Φ⁻⟩ → |10⟩, |Ψ⁻⟩ → |11⟩ — the figure’s final step.',
        'Holevo’s bound says one qubit alone carries at most one bit; the second bit was paid for by the entanglement sent earlier.',
        'It is the dual of teleportation: superdense coding trades one qubit + one ebit for two bits; teleportation trades two bits + one ebit for one qubit.',
      ],
      math: ['\\{I, X, Z, ZX\\}\\otimes I\\ket{\\Phi^{+}} = \\{\\ket{\\Phi^{+}}, \\ket{\\Psi^{+}}, \\ket{\\Phi^{-}}, \\ket{\\Psi^{-}}\\}'],
    },
    professional: {
      intro: 'Superdense coding is the cleanest demonstration that entanglement is a communication resource with an exchange rate, and the Bell measurement it needs is the same primitive teleportation and entanglement swapping need. Its photonic implementations are limited by exactly that measurement.',
      points: [
        'Linear-optical Bell measurements distinguish only two of the four Bell states without ancillas or nonlinearity, capping photonic superdense coding at log₂3 ≈ 1.58 bits per photon unless hyperentanglement or extra resources are used.',
        'Resource accounting: 1 ebit + 1 qubit → 2 cbits (superdense); 1 ebit + 2 cbits → 1 qubit (teleportation). Neither increases total information beyond Holevo; both reshuffle it.',
        'Channel capacity: entanglement-assisted classical capacity of a noiseless qubit channel is 2 bits — superdense coding achieves it; for noisy channels the assisted capacity has a closed form (Bennett–Shor–Smolin–Thapliyal) unlike the unassisted one.',
        'On processors, the protocol is a 2-qubit, depth-4 circuit; running all four encodings and checking the decoded bits is a compact test of CNOT and H fidelity under a meaningful task.',
      ],
      math: ['C_E = \\max_\\rho \\big[S(\\rho) + S(\\mathcal{N}(\\rho)) - S((\\mathcal{N}\\otimes I)(\\Phi_\\rho))\\big] = 2 \\ \\text{for the noiseless qubit}'],
    },
  },
  {
    topic: '08.13', minutes: 9,
    figure: { animation: 'circuit', params: { program: 'RY0:1.0472;H1;CX1,2;CX0,1;H0', qubits: 3, note: 'before Bob’s X/Z corrections, qubit 2 holds the state up to a Pauli' } },
    kid: {
      intro: 'Teleportation moves a qubit’s state from one place to another without moving the qubit. Alice has a mystery state and shares an entangled pair with Bob. She measures, sends Bob two ordinary bits, Bob makes two simple moves — and his qubit is now in the mystery state. Alice’s original is gone.',
      points: [
        'No copy is made: Alice’s qubit loses the state as Bob’s gains it. No-cloning is respected.',
        'The two bits travel by ordinary means — a text message would do — so nothing beats light.',
        'Bob’s qubit is useless until the bits arrive; without them it is pure noise.',
        'What moves is information about an arrow nobody measured — an unknown state carried by two known bits and one shared pair.',
      ],
    },
    student: {
      intro: 'Teleportation: Alice holds |ψ⟩ = α|0⟩ + β|1⟩ and half of |Φ⁺⟩; Bob holds the other half. Alice applies CNOT(ψ → her half) and H to ψ, measures both, and sends the two bits (m₁, m₂) to Bob, who applies Z^{m₁} X^{m₂}. Bob’s qubit is now |ψ⟩; Alice’s copies are destroyed by the measurement.',
      points: [
        'Before measurement the joint state is ½ Σ |m₁m₂⟩ ⊗ X^{m₂}Z^{m₁}|ψ⟩: each of the four outcomes leaves Bob with |ψ⟩ up to a known Pauli. The figure stops here; the bars show the four outcomes equally likely.',
        'The bits are needed: averaged over unknown (m₁, m₂), Bob’s state is maximally mixed — no signalling.',
        'Resources: one ebit and two classical bits per qubit teleported; the original is consumed, consistent with no-cloning.',
        'The circuit is Bell-pair preparation (H, CNOT) on qubits 1–2, then a Bell measurement (CNOT, H) on qubits 0–1.',
      ],
      math: ['\\ket{\\psi}\\ket{\\Phi^{+}} = \\tfrac12\\sum_{m_1m_2}\\ket{m_1m_2}\\otimes X^{m_2}Z^{m_1}\\ket{\\psi}'],
    },
    professional: {
      intro: 'Teleportation is a primitive, not a party trick: gate teleportation injects magic states to implement T fault-tolerantly, teleported CNOTs connect modules, and measurement-based quantum computing is teleportation chained across a cluster state. Its requirement — Bell measurement plus fast classical feed-forward — is a hardware specification.',
      points: [
        'Gate teleportation: teleport |ψ⟩ through a resource state |A⟩ = T|+⟩ and the Pauli correction becomes a Clifford; T is applied without ever running a T gate on data — the mechanism that makes magic-state distillation useful.',
        'Feed-forward latency: Bob’s correction must be applied within the coherence time; on transmons that means readout (~500 ns) plus decision (~100 ns) plus pulse, feasible; on photonics it means fibre delay lines.',
        'Deterministic teleportation over 1400 km (Micius satellite, 2017) and chip-to-chip teleportation of logical operations demonstrate the protocol as networking and as modular computing.',
        'Entanglement swapping is teleportation of half a Bell pair; chained, it is the quantum repeater. Fidelity composes multiplicatively, so distillation between hops is required at scale.',
      ],
      math: ['T\\ket{\\psi} = \\text{teleport}(\\ket{\\psi}; \\ket{A}),\\ \\ket{A} = T\\ket{+}, \\ \\text{correction} \\in \\text{Clifford}'],
    },
  },
  {
    topic: '08.14', minutes: 9,
    figure: { animation: 'circuit', params: { program: 'X1;H0;H1;CX0,1;H0', qubits: 2, note: 'balanced oracle f(x) = x → qubit 0 reads 1; a constant oracle would read 0' } },
    kid: {
      intro: 'Here is a puzzle: a mystery box takes a 0 or a 1 and gives back a 0 or a 1. Is it “constant” (same answer for both inputs) or “balanced” (different answers)? Classically you must try both inputs — two goes. A quantum computer finds out in one go, by feeding in a blend of both inputs at once.',
      points: [
        'The trick is not that the quantum computer asks both questions. It is that the two answers interfere, and the interference tells you “same” or “different” in a single reading.',
        'The answer comes out as a plain 0 (constant) or 1 (balanced) on the first qubit.',
        'Deutsch–Jozsa is the big version: with n input bits, classical needs up to 2ⁿ⁻¹ + 1 goes; quantum still needs one.',
        'It is not useful for anything practical — but it was the first proof that quantum computers can beat classical ones.',
      ],
    },
    student: {
      intro: 'Deutsch’s algorithm decides whether f: {0,1} → {0,1} is constant or balanced with one query. Prepare |0⟩|1⟩, apply H⊗H, query the oracle U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ (which, with the target in |−⟩, kicks back (−1)^{f(x)} onto |x⟩), apply H to the first qubit, measure: 0 if constant, 1 if balanced.',
      points: [
        'Phase kickback turns the oracle into |x⟩ → (−1)^{f(x)}|x⟩ on the first register: (|0⟩ + |1⟩)/√2 becomes (±|0⟩ ± |1⟩)/√2 with equal signs if constant, opposite if balanced.',
        'The final H maps equal signs to |0⟩ and opposite signs to |1⟩ — interference reads the global property f(0) ⊕ f(1) without learning f(0) or f(1).',
        'The figure implements f(x) = x (balanced) with a CNOT as the oracle: the final state has qubit 0 = 1 with certainty.',
        'Deutsch–Jozsa on n bits: H⊗ⁿ, oracle, H⊗ⁿ; the all-zero string has amplitude (1/2ⁿ) Σ_x (−1)^{f(x)} = ±1 if constant, 0 if balanced. One query versus 2ⁿ⁻¹ + 1 deterministic classical queries.',
      ],
      math: ['U_f\\ket{x}\\ket{-} = (-1)^{f(x)}\\ket{x}\\ket{-}, \\qquad \\alpha_{0\\ldots0} = \\frac{1}{2^{n}}\\sum_x (-1)^{f(x)}'],
    },
    professional: {
      intro: 'Deutsch–Jozsa is the template of the whole oracle-algorithm family: superpose over inputs, encode the function into phases by kickback, interfere with a Hadamard (or Fourier) transform so that a global property lands on a single basis state. Bernstein–Vazirani, Simon and Shor are successive upgrades of each step.',
      points: [
        'The speed-up is query complexity, not time, and it is exact versus deterministic classical; a randomised classical algorithm solves Deutsch–Jozsa with high probability in O(1) queries, which is why it is a proof of concept rather than an application.',
        'Oracle construction is the real cost: U_f for a given f is a reversible circuit (Module 08.02) whose depth is the depth of computing f classically — the “oracle” hides nothing for free.',
        'On hardware it is the standard first algorithm demo (2 qubits, depth 4); its single-shot determinism makes gate errors directly visible as wrong-answer probability.',
        'Structure matters: the promise “constant or balanced” is what allows a single interference pattern to decide; without a promise, no quantum algorithm learns a general f faster than classical.',
      ],
      math: ['\\text{Simon: } f(x) = f(y) \\iff y = x \\oplus s \\ \\Rightarrow\\ O(n) \\text{ quantum vs } \\Omega(2^{n/2}) \\text{ classical queries}'],
    },
  },
  {
    topic: '08.15', minutes: 8,
    figure: { animation: 'circuit', params: { program: 'X3;H0;H1;H2;H3;CX0,3;CX2,3;H0;H1;H2', qubits: 4, note: 'secret string 101 read off qubits 0–2 in one query (Qlaude: 100% of 1000 shots)' } },
    kid: {
      intro: 'A mystery box hides a secret string of bits. You can feed it any string and it tells you one bit: whether an odd or even number of your bits line up with the secret. Classically you need one go per secret bit. Quantum needs one go, full stop — the whole secret pops out.',
      points: [
        'Three-bit secret, say 101. Classically: try 100, 010, 001 — three goes. Quantum: one go.',
        'Feed in a blend of all eight strings at once; the box marks each with a sign; interference turns the signs into the secret.',
        'Read the first three qubits: 1, 0, 1. Done.',
        'The circuit in the picture was built and run on a quantum simulator in the cloud: 1000 tries, 1000 correct.',
      ],
    },
    student: {
      intro: 'Bernstein–Vazirani: the oracle computes f(x) = s·x mod 2 for a hidden string s. With the target in |−⟩, the oracle applies (−1)^{s·x}; H⊗ⁿ then maps Σ_x (−1)^{s·x}|x⟩/2^{n/2} exactly to |s⟩. One query recovers all n bits; classically n queries are necessary.',
      points: [
        'Oracle for s = 101: CNOTs from the data qubits where sᵢ = 1 (qubits 0 and 2) onto the target. That is the figure’s circuit: X, H⊗4, CX(0,3), CX(2,3), H⊗3.',
        'Key identity: H⊗ⁿ|s⟩ = 2^{−n/2} Σ_x (−1)^{s·x}|x⟩, and H⊗ⁿ is its own inverse, so the phase pattern (−1)^{s·x} is “the Hadamard transform of |s⟩” and one more H⊗ⁿ returns |s⟩.',
        'Measured output: qubits 0–2 read 101 with certainty; the ancilla is left in |−⟩ and reads 0 or 1 at random (Qlaude’s simulation: 1011 and 1010 each ~50%).',
        'The advantage is linear (n versus 1), exact, and the first algorithm whose quantum query complexity is provably better even against randomised classical algorithms.',
      ],
      math: ['H^{\\otimes n}\\ \\frac{1}{2^{n/2}}\\sum_x (-1)^{s\\cdot x}\\ket{x} = \\ket{s}'],
    },
    professional: {
      intro: 'Bernstein–Vazirani is the cleanest hardware benchmark among the oracle algorithms because its correct output is a single deterministic bitstring whose success probability degrades gracefully with noise: P(correct) ≈ (1 − ε)^{number of gates}. It has been run on 20+ qubits and is a standard entry in device scorecards.',
      points: [
        'Depth is constant (one oracle layer of parallel CNOTs between two Hadamard layers), so the circuit tests two-qubit gate fidelity and crosstalk under simultaneous operation more than coherence time.',
        'With connectivity constraints the CNOTs onto a single ancilla serialise and require routing; a star-shaped oracle is the worst case for a line topology — compare the same n across devices with care.',
        'The recursive version (Bernstein–Vazirani 1993) gives a superpolynomial separation relative to an oracle, foreshadowing Simon and Shor; the non-recursive version shown here is the practical demo.',
        'The “hidden linear structure” recovered by a Hadamard transform generalises to the hidden subgroup problem over Z₂ⁿ; Shor is the same idea over Z_N with the QFT replacing H⊗ⁿ.',
      ],
      math: ['P_{\\text{correct}} \\approx \\prod_{\\text{gates}}(1 - \\varepsilon_g) \\approx 1 - \\sum_g \\varepsilon_g'],
    },
  },
  {
    topic: '08.16', minutes: 8,
    figure: { animation: 'circuit', params: { program: 'X1;H1;H0;CX0,1;H0', qubits: 2, note: 'the target in |−⟩ never changes; the sign lands on the control, which reads 1' } },
    kid: {
      intro: 'Phase kickback is a sneaky trick. You aim a controlled gate at a target qubit prepared in a special state, and the target does not change at all. Instead, the “mark” the gate would have made bounces back onto the control qubit as a hidden twist — which a Hadamard can then turn into a readable 0 or 1.',
      points: [
        'Target in the special state |−⟩: flipping it only changes its sign, not what it looks like.',
        'A controlled flip then leaves the target as it was and puts the sign on the “control = 1” part instead.',
        'The control was in a blend; now its two halves have opposite signs — a hidden twist.',
        'A final H turns that twist into a definite 1. The control learned something without the target changing.',
      ],
    },
    student: {
      intro: 'If U|u⟩ = e^{iλ}|u⟩, then controlled-U on (α|0⟩ + β|1⟩)|u⟩ gives (α|0⟩ + e^{iλ}β|1⟩)|u⟩: the target is unchanged and the eigenvalue phase appears as a relative phase on the control. For CNOT with target |−⟩ (eigenvalue −1 of X), the control picks up a sign: |+⟩|−⟩ → |−⟩|−⟩.',
      points: [
        'The figure: X then H prepares qubit 1 in |−⟩; H puts qubit 0 in |+⟩; CNOT kicks back −1 onto the |1⟩ component of qubit 0, giving |−⟩; the final H maps it to |1⟩. Qubit 1 stays |−⟩ and reads 0/1 at random.',
        'This is why oracles are built as U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ with y = |−⟩: the output bit is never read; its effect is a phase (−1)^{f(x)} on the input register.',
        'Kickback converts a global phase on the target into a relative phase on the control — the only way an eigenvalue phase becomes observable.',
        'Controlled-U^(2ᵏ) on k ancillas kicks back λ in binary; the inverse QFT reads it out — quantum phase estimation.',
      ],
      math: ['\\text{c-}U(\\alpha\\ket{0}+\\beta\\ket{1})\\ket{u} = (\\alpha\\ket{0}+e^{i\\lambda}\\beta\\ket{1})\\ket{u}, \\qquad \\text{CNOT}\\ket{+}\\ket{-} = \\ket{-}\\ket{-}'],
    },
    professional: {
      intro: 'Phase kickback is the mechanism behind every eigenvalue-reading algorithm and behind the way oracles are compiled; understanding it is what lets you recognise that “the ancilla is unchanged” is a feature, and that the information has gone into the control register’s phase where only interference can read it.',
      points: [
        'Phase estimation: with t ancillas and controlled-U^(2ʲ), the ancilla register becomes Σ_k e^{2πi φ k}|k⟩/√2ᵗ; the inverse QFT yields φ to t bits. Precision costs controlled powers of U, i.e. circuit depth exponential in t for generic U — the price of exponentially precise eigenvalues.',
        'Kickback is also how a Z error on a target propagates to the control in a CNOT (while X errors propagate control to target). Fault-tolerant circuit design tracks both directions.',
        'Hamiltonian simulation uses the same structure: controlled-e^{−iHt} kicks back energy phases, so phase estimation on a Trotterised unitary estimates ground-state energies — the long-term quantum chemistry route.',
        'The Hadamard test — H, controlled-U, H, measure — estimates Re⟨ψ|U|ψ⟩ from the control’s bias; with an S gate it gives the imaginary part. It is kickback used to measure an overlap.',
      ],
      math: ['\\text{QPE: } \\frac{1}{\\sqrt{2^{t}}}\\sum_{k=0}^{2^{t}-1} e^{2\\pi i\\varphi k}\\ket{k}\\ket{u} \\xrightarrow{\\text{QFT}^{-1}} \\ket{\\tilde\\varphi}\\ket{u}'],
    },
  },
  {
    topic: '08.17', minutes: 9,
    figure: { animation: 'circuit', params: { program: 'H0;H1;CZ0,1;H0;H1;X0;X1;CZ0,1;X0;X1;H0;H1', qubits: 2, note: 'one Grover iteration on 4 items finds the marked |11⟩ with certainty' } },
    kid: {
      intro: 'Imagine a phone book with a million names in random order and you need the one with a given number. Classically you check names one by one — half a million on average. Grover’s algorithm finds it in about a thousand looks. Not instantly, but a thousand instead of half a million.',
      points: [
        'Start with a blend of every entry at once. Mark the right one with a hidden minus sign.',
        'Then do a “flip about the average” move. The marked entry grows a little; the others shrink a little.',
        'Repeat about √N times — a thousand for a million — and the marked entry is almost certain to come out.',
        'With four entries, one repeat is enough: the figure finds entry 11 every single time.',
      ],
    },
    student: {
      intro: 'Grover’s algorithm searches N = 2ⁿ unstructured items for a marked one in O(√N) oracle queries. Start in the uniform superposition |s⟩; each iteration applies the oracle O (phase −1 on the marked item) and the diffusion operator D = 2|s⟩⟨s| − I. Geometrically each iteration rotates the state by 2θ toward the marked state, sin θ = 1/√N.',
      points: [
        'For N = 4, θ = 30°: one iteration rotates from 30° to 90° — success probability exactly 1. The figure’s circuit (H⊗2, CZ oracle marking |11⟩, diffusion H X CZ X H) outputs |11⟩ with certainty.',
        'Optimal iterations ⌊(π/4)√N⌋: 785 for N = 10⁶ against ~5 × 10⁵ classical checks on average. Over-rotating past the optimum reduces the success probability again.',
        'Amplitude picture: the oracle flips the marked amplitude’s sign; diffusion reflects every amplitude about the mean, so the flipped one jumps up and the rest drop — amplitude amplification.',
        'The speed-up is quadratic and provably optimal for black-box search (BBBV bound): no quantum algorithm does unstructured search in fewer than Ω(√N) queries.',
      ],
      math: ['\\sin\\theta = \\frac{1}{\\sqrt N}, \\qquad k_{\\text{opt}} = \\left\\lfloor\\frac{\\pi}{4}\\sqrt N\\right\\rfloor, \\qquad D = 2\\ket{s}\\bra{s} - I'],
    },
    professional: {
      intro: 'Grover is general — any NP-style verifier becomes an oracle — and its quadratic speed-up is modest: the constant factors of fault-tolerant overhead, and the requirement that the whole oracle run coherently √N times, mean practical advantage needs very large N and very cheap oracles. It is best understood as amplitude amplification, a subroutine, rather than as a search product.',
      points: [
        'Amplitude amplification boosts any algorithm with success probability p to near-certainty in O(1/√p) repetitions instead of O(1/p); amplitude estimation then estimates p to precision ε in O(1/ε) queries — the quadratic speed-up for Monte Carlo that is more plausible than database search.',
        'Resource reality: Grover on a 2⁶⁴ search needs ~3 × 10⁹ coherent oracle calls; at microsecond logical cycle times that is hours, and each oracle call is a full reversible circuit. Symmetric-key sizes are doubled (AES-256) to pre-empt it.',
        'On NISQ devices, 3-qubit Grover (Qlaude’s template: |101⟩ in 93.6% of shots) is near the limit of useful depth; the Qlaude 2-qubit template uses two iterations and over-rotates — check the geometry before trusting a template.',
        'Grover’s diffusion is a reflection about the uniform state; generalised reflections about other states underlie quantum walks and the quadratic speed-ups for collision finding and element distinctness.',
      ],
      math: ['\\text{amplitude estimation: } \\tilde p = \\sin^{2}\\!\\left(\\frac{\\pi m}{M}\\right), \\quad |\\tilde p - p| = O(1/M)'],
    },
  },
  {
    topic: '08.18', minutes: 9,
    figure: { animation: 'circuit', params: { program: 'H0;RZ1:0.7854;CX0,1;RZ1:-0.7854;CX0,1;H1;SWAP0,1', qubits: 2, note: 'QFT of |00⟩ is the uniform superposition; on a periodic input it would peak at the frequency' } },
    kid: {
      intro: 'A Fourier transform turns a repeating pattern into the number of repeats — it is how your phone finds the pitch of a note. The quantum Fourier transform does the same to the hidden twists of a quantum register, and it does it exponentially faster than any classical method, because it acts on all the amplitudes at once.',
      points: [
        'Feed in a state that repeats every four steps and the QFT hands back “four” as a bright peak.',
        'The circuit is Hadamards and controlled twists — no searching, no looping, just a fixed pattern of gates.',
        'On two qubits it is a handful of gates; on n qubits about n² — tiny compared with the 2ⁿ numbers it transforms.',
        'The catch, as always: you cannot read all the transformed numbers, only sample them. That is enough when the answer is a sharp peak.',
      ],
    },
    student: {
      intro: 'The QFT on n qubits maps |j⟩ to (1/√N) Σ_k e^{2πi jk/N}|k⟩ with N = 2ⁿ — the discrete Fourier transform applied to the amplitude vector. It is implemented with n Hadamards and n(n−1)/2 controlled phase rotations (plus swaps), O(n²) gates for a transform of 2ⁿ amplitudes.',
      points: [
        'Two-qubit QFT: H on qubit 0, controlled-S from qubit 1 to 0, H on qubit 1, SWAP. Qlaude’s template realises the controlled phase as RZ–CX–RZ–CX, which the figure runs.',
        'QFT|00⟩ = uniform superposition — the transform of a delta function is flat, as in classical Fourier analysis.',
        'A state with amplitude concentrated on multiples of r (period r) transforms to peaks at multiples of N/r: the QFT reads periods, which is what Shor needs.',
        'The inverse QFT is the same circuit reversed with conjugate phases; it is the readout step of phase estimation.',
      ],
      math: ['\\text{QFT}\\ket{j} = \\frac{1}{\\sqrt N}\\sum_{k=0}^{N-1} e^{2\\pi i jk/N}\\ket{k}, \\qquad \\text{gates} = O(n^{2})'],
    },
    professional: {
      intro: 'The QFT is exponentially cheaper than the classical FFT (O(n²) gates versus O(N log N) operations) but delivers a quantum state, not a list of coefficients; its utility is in algorithms where sampling the transformed state suffices — period finding, phase estimation, and hidden-subgroup problems. Its small rotations are also the first thing approximated away.',
      points: [
        'Approximate QFT: controlled rotations by angles below ~π/2ᵐ with m ≈ log₂(n) + 2 can be dropped with negligible error, reducing the gate count to O(n log n) — essential for fault-tolerant cost, where each small rotation is ~100 T gates.',
        'Semi-classical QFT (Griffiths–Niu): when the QFT is followed immediately by measurement, controlled rotations can be replaced by measurement-conditioned single-qubit rotations — no two-qubit gates at all, given fast feed-forward.',
        'Shor’s period-finding register holds ~2n qubits for an n-bit modulus; the QFT on it is the only part of Shor that is “quantum-native”; modular exponentiation dominates the cost.',
        'The QFT diagonalises shift operators, which is the group-theoretic reason it solves abelian hidden-subgroup problems (factoring, discrete log) and not non-abelian ones (graph isomorphism remains open).',
      ],
      math: ['\\text{AQFT}_m: \\ \\text{drop } R_k \\text{ for } k > m, \\quad m = O(\\log n), \\quad \\text{error } O(n\\,2^{-m})'],
    },
  },
  {
    topic: '08.19', minutes: 9,
    figure: { animation: 'period-finding', params: { base: 7, modulus: 15 } },
    kid: {
      intro: 'Much of internet security rests on one fact: multiplying two huge primes is easy, but finding them again from the product is nearly impossible for ordinary computers. Peter Shor showed in 1994 that a quantum computer could do it fast — by turning factoring into finding the rhythm of a repeating sequence.',
      points: [
        'Pick a number, keep multiplying it by itself and taking the remainder after dividing by the number you want to factor. The remainders repeat in a cycle.',
        'For 15 and the number 7: 1, 7, 4, 13, 1, 7, 4, 13 … The cycle length is 4.',
        'From that cycle length, a bit of ordinary arithmetic hands you the factors: 3 and 5.',
        'Finding the cycle is slow classically but fast with the quantum Fourier transform. That is the whole trick.',
      ],
    },
    student: {
      intro: 'Shor’s algorithm factors N by finding the period r of f(x) = aˣ mod N for a random a coprime to N. If r is even and a^{r/2} ≠ −1 mod N, then gcd(a^{r/2} ± 1, N) gives a nontrivial factor. Period finding is done by preparing Σ_x |x⟩|aˣ mod N⟩, measuring the second register, and applying the QFT to the first.',
      points: [
        'Example: N = 15, a = 7: 7¹ = 7, 7² = 49 ≡ 4, 7³ ≡ 13, 7⁴ ≡ 1, so r = 4. Then 7² = 49: gcd(48, 15) = 3 and gcd(50, 15) = 5. The figure plots the sequence and extracts the period.',
        'After measuring f, the first register is periodic with period r; the QFT concentrates amplitude at multiples of 2ⁿ/r, and continued fractions recover r from a sample.',
        'Complexity: O((log N)³) gates (dominated by modular exponentiation) against sub-exponential exp(O((log N)^{1/3}(log log N)^{2/3})) for the best classical method (GNFS).',
        'The same structure (period finding via QFT) solves discrete logarithms, breaking Diffie–Hellman and elliptic-curve cryptography as well as RSA.',
      ],
      math: ['a^{r} \\equiv 1 \\pmod N, \\qquad \\gcd(a^{r/2}\\pm1, N) \\ \\text{divides } N; \\qquad 7^{4} \\equiv 1 \\pmod{15}, \\ \\gcd(48,15)=3, \\ \\gcd(50,15)=5'],
    },
    professional: {
      intro: 'Shor is the reason quantum computing is a national priority and post-quantum cryptography is being deployed now: a cryptographically relevant quantum computer (CRQC) would break RSA, DH and ECC. Current estimates put RSA-2048 at ~10⁶ physical qubits for ~8 hours (Gidney–Ekerå 2019, refined since to fewer), far beyond today’s hundreds of noisy qubits but not beyond foreseeable engineering.',
      points: [
        'Cost breakdown for RSA-2048: ~2n ≈ 4100 logical qubits for the registers, ~10⁹ Toffolis in modular exponentiation (windowed arithmetic, Montgomery/Barrett reductions), surface-code distance ~27 at 10⁻³ physical error, hence ~10⁶ physical qubits and hours of runtime.',
        'Demonstrations to date factor 15, 21 and (with heavy classical pre-compilation) slightly larger numbers; none run the general algorithm at scale, and “factoring records” using annealers or shortcuts are not Shor.',
        'Post-quantum migration: NIST standardised lattice-based schemes (ML-KEM, ML-DSA) in 2024; “harvest now, decrypt later” means data with a long confidentiality lifetime is already at risk.',
        'The quantum part is small: order finding is QPE on the unitary U|y⟩ = |ay mod N⟩; everything else — choosing a, continued fractions, gcd — is classical, which is why hybrid cost models matter.',
      ],
      math: ['U_a\\ket{y} = \\ket{ay \\bmod N}, \\quad \\text{eigenvalues } e^{2\\pi i s/r}; \\qquad \\text{RSA-2048} \\approx 10^{9}\\ \\text{Toffoli}, \\ \\sim10^{6}\\ \\text{physical qubits}'],
    },
  },
];
