import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 07 — Spin and Entanglement.
 *
 * From the two-valued spin of Stern–Gerlach to Bell states, Bell's
 * inequality, no-signalling and no-cloning: the bridge the syllabus names
 * between two-level systems and qubits.
 */
export const MODULE_07: FoundationLesson[] = [
  {
    topic: '07.01', minutes: 7,
    figure: { animation: 'stern-gerlach', params: { sequence: 'z' } },
    kid: {
      intro: 'Electrons behave as if they are tiny spinning magnets — but “spin” is a name, not a description. Nothing is actually turning. It is a built-in property, like charge, and it has a shocking feature: whichever way you measure it, you only ever get two answers.',
      points: [
        'A real spinning top can lean at any angle. An electron’s spin, when measured, is always exactly “up” or exactly “down”, never in between.',
        'Spin is permanent. You cannot stop an electron spinning or speed it up; you can only point it.',
        'Every electron has exactly the same amount of spin. Protons and neutrons do too.',
        'This two-answer property is exactly what you want for a qubit: up is 0, down is 1.',
      ],
    },
    student: {
      intro: 'Spin is an intrinsic angular momentum with no classical counterpart: an electron has s = ½, so any component measured along any axis gives ±ħ/2. It carries a magnetic moment μ = −gμ_B S/ħ with g ≈ 2, so spin couples to magnetic fields and can be sorted and driven by them.',
      points: [
        'Magnitude |S| = √(s(s+1)) ħ = (√3/2)ħ, but a component is only ever ±ħ/2 — the vector is never fully aligned with any axis.',
        'The magnetic moment of a spin-½ in a field B has two energies ∓½gμ_B B, split by ΔE = gμ_B B ≈ 28 GHz per tesla × h for an electron.',
        'Spin is not rotation: a point particle cannot rotate, and the g-factor of 2 (not 1) shows the moment is not that of a spinning charge.',
        'Particles with half-integer spin (electrons, protons, neutrons) are fermions and obey the exclusion principle; integer spin (photons, spin 1) are bosons.',
      ],
      math: ['S_z = \\pm\\frac{\\hbar}{2}, \\qquad |\\mathbf{S}| = \\frac{\\sqrt3}{2}\\hbar, \\qquad \\Delta E = g\\mu_B B'],
    },
    professional: {
      intro: 'Spin-½ is the canonical qubit: a genuine two-dimensional Hilbert space with no leakage levels, a Hamiltonian ∝ B·σ that is linear in a controllable field, and coherence times from milliseconds (electron spins in silicon) to hours (nuclear spins). Every single-qubit concept — Bloch sphere, Rabi driving, Ramsey dephasing — was worked out for spins first, in NMR and ESR.',
      points: [
        'Spin Hamiltonian H = −μ·B = (gμ_B/2) B·σ. A static B_z sets the qubit frequency (Zeeman splitting); an oscillating B_x at that frequency drives Rabi rotations. ESR gates on an electron in silicon run at ~1 MHz Rabi frequency with ~1 mT of drive field.',
        'Electron versus nuclear spin: μ_B/μ_N ≈ 1836, so electron spins are fast to drive and fast to decohere; nuclear spins (³¹P in Si, ¹³C in diamond) are slow and sheltered — used as memories alongside electron-spin processors.',
        'Spin–orbit coupling lets electric fields drive spins (EDSR), trading some coherence for all-electrical control that scales with CMOS fabrication — the pitch of silicon spin qubits.',
        'Spin is also the resource in NV centres (optically initialised and read at room temperature) and the basis of the first quantum algorithms ever run (NMR, 1998–2001), before their mixed-state limitation was understood.',
      ],
      math: ['H = \\frac{g\\mu_B}{2}\\,\\mathbf{B}\\cdot\\boldsymbol{\\sigma}, \\qquad \\omega_{\\text{Rabi}} = \\frac{g\\mu_B B_1}{2\\hbar}'],
    },
  },
  {
    topic: '07.02', minutes: 8,
    figure: { animation: 'stern-gerlach', params: { sequence: 'zx' } },
    kid: {
      intro: 'In 1922 Otto Stern and Walther Gerlach fired silver atoms through a lumpy magnet onto a glass plate. A classical magnet would smear the atoms into a band. Instead, two neat spots appeared — the first direct sight of a quantum two-way split.',
      points: [
        'The lumpy magnet pushes “up” atoms up and “down” atoms down. In-between atoms should land in between. None did.',
        'Take the “up” beam and send it through a second magnet turned sideways. It splits in two again, left and right, fifty-fifty.',
        'Measuring sideways has scrambled what “up” meant: send a “left” beam into an up/down magnet and you get both again.',
        'The experiment is a qubit measurement built out of a magnet and a glass plate.',
      ],
    },
    student: {
      intro: 'An inhomogeneous magnetic field exerts a force F = ∇(μ·B) that depends on the spin component along the gradient. Classical moments would give a continuous spread; spin-½ atoms give two spots, measuring S_z = ±ħ/2. Sequential Stern–Gerlach apparatus along different axes shows that measuring S_x erases knowledge of S_z.',
      points: [
        'Silver has one unpaired 5s electron: the atom’s moment is that electron’s spin, so the beam splits in two (2s + 1 = 2 outcomes).',
        'SG_z then SG_x on the “up” beam: 50/50 left/right, because |↑⟩ = (|→⟩ + |←⟩)/√2 and P = |⟨→|↑⟩|² = ½.',
        'SG_z, SG_x, SG_z: the final split is 50/50 again — the X measurement left an X eigenstate, which is an equal superposition of Z eigenstates. The sequence is the Z, X, Z demonstration of incompatible observables.',
        'Blocking one output of the middle magnet selects a state; letting both through and recombining coherently restores the original — measurement is the irreversibility, not the magnet.',
      ],
      math: ['F_z = \\mu_z\\frac{\\partial B_z}{\\partial z}, \\qquad P(\\rightarrow\\mid\\uparrow) = |\\braket{\\rightarrow}{\\uparrow}|^{2} = \\tfrac12'],
    },
    professional: {
      intro: 'Stern–Gerlach is projective measurement made spatial: the magnet entangles the spin with the atom’s position, and position is then read by a detector. Every qubit readout has the same anatomy — couple the qubit to a pointer, amplify the pointer — and the same consequences for what can be known.',
      points: [
        'The device implements the map |↑⟩|x₀⟩ → |↑⟩|x₊⟩, |↓⟩|x₀⟩ → |↓⟩|x₋⟩; once the position wavepackets no longer overlap the spin is effectively measured, whether or not anyone looks at the plate. This is the decoherence model of measurement.',
        'Dispersive transmon readout is the same: the qubit state shifts the resonator frequency (pointer), and the transmitted microwave’s phase is the recorded position. Fidelity depends on how well the two pointer states separate relative to noise — exactly the spot-separation condition.',
        'Sequential SG with recombination (a spin interferometer) is the Ramsey experiment in disguise; neutron interferometry has performed it literally and observed the 4π periodicity of spinor rotation.',
        'Spin-dependent forces in gradients are used today to separate and shuttle trapped ions by internal state and to realise state-dependent optical lattices for neutral atoms.',
      ],
      math: ['\\ket{\\psi}\\ket{x_0} \\to \\alpha\\ket{\\uparrow}\\ket{x_+} + \\beta\\ket{\\downarrow}\\ket{x_-}, \\qquad \\braket{x_+}{x_-} \\to 0'],
    },
  },
  {
    topic: '07.03', minutes: 6,
    figure: { animation: 'bloch-sphere', params: { theta: 0, spin: true } },
    kid: {
      intro: 'Spin-up and spin-down are the two sure-fire states of a spin: measure along the chosen direction and you know the answer in advance. They are the “0” and “1” of a spin qubit — and any other spin state is a blend of them.',
      points: [
        'Up means: the magnet will push me up, every time. Down means: pushed down, every time.',
        'Up and down are complete opposites — as different as two spin states can be.',
        'They are not the only sure-fire states: “left” and “right” are sure-fire for a sideways magnet. But up and down are the ones we use to label the ball.',
        'A spin qubit in a computer starts as “up”, gets twisted around by pulses, and is read as up or down at the end.',
      ],
    },
    student: {
      intro: '|↑⟩ and |↓⟩ are the eigenstates of S_z with eigenvalues +ħ/2 and −ħ/2. They are orthogonal, normalised and complete for a spin-½, so any spin state is α|↑⟩ + β|↓⟩. In qubit language |↑⟩ = |0⟩, |↓⟩ = |1⟩, and S_z = (ħ/2)σ_z.',
      points: [
        'In matrix form |↑⟩ = (1, 0)ᵀ, |↓⟩ = (0, 1)ᵀ, S_z = (ħ/2) diag(1, −1), with S_z|↑⟩ = +(ħ/2)|↑⟩.',
        'S_x and S_y are (ħ/2)σ_x and (ħ/2)σ_y; their eigenstates are (|↑⟩ ± |↓⟩)/√2 and (|↑⟩ ± i|↓⟩)/√2 — up/down along x and y.',
        'In a field B_z the energies are ∓½gμ_B B: |↑⟩ (moment anti-parallel, for an electron) is the higher level. The Zeeman gap is the qubit frequency.',
        'Raising and lowering: S₊|↓⟩ = ħ|↑⟩, S₋|↑⟩ = ħ|↓⟩, S₊|↑⟩ = 0 — there is nowhere higher to go.',
      ],
      math: ['S_z = \\frac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}, \\qquad \\ket{\\uparrow} \\equiv \\ket{0}, \\quad \\ket{\\downarrow} \\equiv \\ket{1}'],
    },
    professional: {
      intro: 'The spin eigenstates define the computational basis of every spin-based platform, and the energy ordering, selection rules and initialisation routes all follow from which state is lower. The mapping |↑⟩ ↔ |0⟩ is a convention that must be tracked through hardware calibration and software, and sign errors here are a classic source of inverted readout.',
      points: [
        'Initialisation to |↓⟩ (ground state for an electron in B) is thermal only when gμ_B B ≫ kT: at 1 T and 100 mK the ratio is ~13, giving >99.99% polarisation; at 4 K it is 0.3 — hence the dilution fridge for spin qubits too.',
        'Readout by spin-to-charge conversion (Elzerman): a spin-dependent tunnelling event turns |↑⟩ versus |↓⟩ into the presence or absence of an electron on a dot, sensed electrostatically — spin states become charge states because spin alone is too weak to detect in one shot.',
        'NV centres read out optically: |ms = 0⟩ fluoresces brighter than |±1⟩ by ~30%, averaged over many cycles, or in single shot at low temperature via resonant excitation.',
        'Hyperfine qubits in ions use two ground-state sublevels (e.g. |F = 0⟩, |F = 1, m = 0⟩ in ¹⁷¹Yb⁺) that are “spin-up/down” of a composite spin and magnetically insensitive at first order — clock states with seconds of coherence.',
      ],
      math: ['P(\\uparrow) = \\frac{1}{1 + e^{g\\mu_B B/kT}}, \\qquad \\frac{g\\mu_B B}{kT}\\Big|_{1\\,\\text{T},\\,100\\,\\text{mK}} \\approx 13'],
    },
  },
  {
    topic: '07.04', minutes: 7,
    figure: { animation: 'stern-gerlach', params: { sequence: 'zxz' } },
    kid: {
      intro: 'You can measure a spin along any direction you like: up/down, left/right, or any tilt in between. Each direction gives two answers. But a spin that is “definitely up” gives a random answer when you measure it sideways — and a definite answer only along its own axis.',
      points: [
        'Measure an “up” spin along a slightly tilted axis: mostly “up”, occasionally “down”. Tilt further: more fifty-fifty. Sideways: exactly fifty-fifty.',
        'The rule is smooth: the closer the measuring axis to the spin’s own axis, the more certain the answer.',
        'Measuring along a new axis resets the spin to that axis. The old direction is forgotten.',
        'That is why the Z, X, Z sequence ends in a coin flip — the middle measurement wiped the slate.',
      ],
    },
    student: {
      intro: 'The spin component along a unit vector n̂ at angle θ to the z-axis is S_n = n̂·S; its eigenstates are |↑ₙ⟩ = cos(θ/2)|↑⟩ + e^{iφ}sin(θ/2)|↓⟩ and the orthogonal |↓ₙ⟩. A spin prepared in |↑⟩ measured along n̂ gives “up” with probability cos²(θ/2).',
      points: [
        'θ = 0: certainty. θ = 90°: ½. θ = 180°: 0. θ = 60°: 0.75. The probability is the squared overlap |⟨↑ₙ|↑⟩|².',
        'After the measurement the spin is |↑ₙ⟩ or |↓ₙ⟩ — a definite state along n̂ and a superposition along z.',
        'Sequence Z → X → Z on |↑⟩: the X stage yields |→⟩ or |←⟩ (½ each); either gives Z = ↑ or ↓ at ½ — the final Z is random. The X measurement erased the Z information.',
        'Rotating the measurement axis by θ is equivalent to rotating the state by −θ and measuring along z: hardware measures along one axis and rotates states with pulses.',
      ],
      math: ['\\ket{\\uparrow_{\\hat n}} = \\cos\\tfrac{\\theta}{2}\\ket{\\uparrow} + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\ket{\\downarrow}, \\qquad P(\\uparrow_{\\hat n}\\mid\\uparrow) = \\cos^{2}\\tfrac{\\theta}{2}'],
    },
    professional: {
      intro: 'Measurement along arbitrary axes is how a spin (or any qubit) is characterised: tomography measures ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩ to reconstruct the Bloch vector, and Bell tests measure correlations along axes chosen to maximise the quantum–classical gap. The cos²(θ/2) law is also the calibration curve for every rotation pulse.',
      points: [
        'Rabi calibration: drive for time t, measure along z; P(↑) = cos²(Ωt/2) traces the cos² law with θ = Ωt, and the π-pulse time is read off the first minimum. Ramsey adds a wait and reads the axis-dependence through φ.',
        'The “half-angle” — cos(θ/2), not cos θ — is the spinor signature: a 360° rotation of the state multiplies it by −1 (observable in interference), and only 720° returns it exactly. Neutron interferometry measured this in 1975.',
        'Bell-test optimum: Alice and Bob measure along axes 45° apart (22.5°, 67.5°) because the singlet correlation −cos(a − b) departs most from any straight line there.',
        'Axis errors in hardware (miscalibrated phase of the drive frame) tilt the effective measurement basis; gate-set tomography fits these systematically rather than assuming ideal axes.',
      ],
      math: ['P(\\uparrow)(t) = \\cos^{2}\\!\\left(\\frac{\\Omega t}{2}\\right), \\qquad R(2\\pi)\\ket{\\psi} = -\\ket{\\psi}'],
    },
  },
  {
    topic: '07.05', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 1.5708, phi: 0, spin: true } },
    kid: {
      intro: 'A spin pointing sideways is a superposition of up and down — equal parts of each. It is not a spin that has not decided. It is a spin that would answer “right” with certainty if you asked the sideways question. Which question you ask decides which answers are certain.',
      points: [
        'Sideways spin, up/down question: coin flip. Sideways spin, left/right question: always “right”.',
        'You can make a sideways spin from an up spin with one precise pulse — a quarter turn of the arrow.',
        'Add a twist (a phase) and the arrow swings around the equator: sideways-forward, sideways-back. Same coin flip for up/down, opposite answers for left/right.',
        'This is the state a spin qubit is in halfway through almost every computation.',
      ],
    },
    student: {
      intro: 'A spin superposition α|↑⟩ + β|↓⟩ is a definite state along some other axis: (|↑⟩ + |↓⟩)/√2 is spin-up along x, (|↑⟩ + i|↓⟩)/√2 along y, and the general state with angles (θ, φ) is spin-up along the Bloch direction n̂(θ, φ). Relative phase φ is the azimuth; it is physical and it precesses in a field.',
      points: [
        'Larmor precession: in B_z the relative phase grows as φ(t) = ω_L t with ω_L = gμ_B B/ħ, so an x-polarised spin rotates in the x–y plane at the Larmor frequency — 28 GHz per tesla for an electron.',
        'Rabi: a resonant transverse field rotates the spin from up toward down and back; a π/2 pulse makes the equal superposition, a π pulse flips.',
        'Ramsey: π/2 – wait – π/2 converts accumulated phase into population; the fringe frequency measures the detuning and its decay measures T₂.',
        'A spin superposition is not a mixture: ⟨S_x⟩ = ħ/2 for |→⟩ but 0 for a 50/50 mixture of |↑⟩ and |↓⟩; only the superposition precesses visibly.',
      ],
      math: ['\\ket{\\rightarrow} = \\frac{\\ket{\\uparrow} + \\ket{\\downarrow}}{\\sqrt2}, \\qquad \\varphi(t) = \\omega_L t, \\quad \\omega_L = \\frac{g\\mu_B B}{\\hbar}'],
    },
    professional: {
      intro: 'Spin superpositions precess, and precession in an uncontrolled field is dephasing. The entire toolkit of dynamical decoupling — Hahn echo, CPMG, XY8 — exists to keep a spin superposition coherent in a noisy field by refocusing the phase, and it transferred wholesale from NMR to superconducting and spin qubits.',
      points: [
        'Hahn echo: a π pulse at τ reverses the sign of accumulated static phase, so a spin dephased by a static field spread refocuses at 2τ. T₂ᵉᶜʰᵒ exceeds T₂* by the ratio of slow to fast noise — in Si/SiGe spin qubits, 1 µs → 100 µs.',
        'Multi-pulse sequences (CPMG, XY8) act as filters on the noise spectrum; the coherence decay versus pulse spacing maps the noise power spectral density — noise spectroscopy with the qubit as probe.',
        'Clock transitions: at a sweet spot where dE/dB = 0 the superposition’s phase is first-order insensitive to field noise; hyperfine clock states in ions and flux sweet spots in transmons are the same idea.',
        'A spin superposition in a gradient is a sensor: NV magnetometry reads nanotesla fields from the Ramsey phase of a single electron spin at room temperature.',
      ],
      math: ['\\text{echo: } \\varphi \\to -\\varphi \\ \\text{at } \\tau, \\qquad W(T) = \\exp\\!\\left(-\\int S(\\omega)F(\\omega T)\\,d\\omega\\right)'],
    },
  },
  {
    topic: '07.06', minutes: 7,
    figure: { animation: 'two-qubit', params: { mode: 'cnot' } },
    kid: {
      intro: 'One spin has two states. Two spins together have four: up-up, up-down, down-up, down-down. Three have eight. Every extra spin doubles the list. A quantum state of the group can be any blend of the whole list — which is where quantum computers get their room to work.',
      points: [
        'Two coins: four ways they can land. Two spins: four basic states, and a blend can involve all four at once.',
        'Twenty spins: about a million basic states. Three hundred spins: more states than there are atoms in the universe.',
        'A classical computer must write down each blend weight separately. That is why it cannot keep up.',
        'The catch: when you measure, you still only get one of the basic states out.',
      ],
    },
    student: {
      intro: 'The state space of a composite system is the tensor product of the parts: two qubits live in a 4-dimensional space with basis |00⟩, |01⟩, |10⟩, |11⟩; n qubits in 2ⁿ dimensions. A general state is Σ α_x|x⟩ over all 2ⁿ bitstrings, normalised.',
      points: [
        'Basis labels are read qubit by qubit: |10⟩ means qubit 0 is 1 and qubit 1 is 0 (in this site’s convention, qubit 0 is leftmost).',
        'Operators on one qubit act as A ⊗ I or I ⊗ A; a two-qubit gate like CNOT is a 4 × 4 matrix that is not a product of single-qubit matrices.',
        'Measuring both qubits returns one bitstring with probability |α_x|²; measuring one qubit projects the other onto the conditional state.',
        'The figure cycles the four basis inputs through a CNOT: the target flips only when the control is 1 — a permutation of the four basis states.',
      ],
      math: ['\\mathcal{H}_{AB} = \\mathcal{H}_A \\otimes \\mathcal{H}_B, \\qquad \\dim = 2^{n}, \\qquad \\ket{\\psi} = \\sum_{x\\in\\{0,1\\}^{n}}\\alpha_x\\ket{x}'],
    },
    professional: {
      intro: 'Exponential dimension is the resource and the obstacle: 2ⁿ amplitudes cannot be stored classically past n ≈ 50, which is the whole case for quantum hardware, but they also cannot be read out, which is why algorithms must end in interference and why entanglement across the register is what distinguishes quantum from classical parallelism.',
      points: [
        'Statevector memory: 2ⁿ × 16 bytes — 16 GB at 30 qubits, 18 PB at 50. Tensor-network and stabiliser simulators evade this for low-entanglement or Clifford circuits, which is precisely why “hard to simulate” requires entangling, non-Clifford depth.',
        'Partial trace and reduced density matrices: the state of a subsystem of an entangled whole is mixed. Entanglement entropy S = −Tr ρ_A log ρ_A quantifies it and bounds what a tensor network can compress.',
        'Qubit ordering conventions (big- versus little-endian) differ between frameworks (Qiskit is little-endian: qubit 0 is rightmost); misreading a 4 × 4 CNOT matrix is the most common composite-system bug.',
        'Multi-qubit measurement is not n independent single-qubit measurements when the state is entangled: correlations in the joint outcomes carry the information, which is what Bell tests and error-syndrome extraction read.',
      ],
      math: ['\\rho_A = \\mathrm{Tr}_B\\,\\rho_{AB}, \\qquad S(\\rho_A) = -\\mathrm{Tr}\\,\\rho_A\\log_2\\rho_A'],
    },
  },
  {
    topic: '07.07', minutes: 7,
    figure: { animation: 'two-qubit', params: { mode: 'product' } },
    kid: {
      intro: 'How do you describe two qubits at once? Multiply their descriptions together, pair by pair. If the first is “all 0” and the second is “half 0 half 1”, the pair is “half 00, half 01”. This combining rule is called the tensor product, and it is just careful bookkeeping.',
      points: [
        'Think of two dice: one die has 6 faces, two dice have 36 combinations. The combined list is all pairs.',
        'For qubits, the “amount” of each pair is the amount of the first times the amount of the second.',
        'A gate on one qubit only touches its half of each pair. The other half rides along unchanged.',
        'Some two-qubit states cannot be made by this multiplying rule at all. Those are the entangled ones — coming up.',
      ],
    },
    student: {
      intro: 'The tensor (Kronecker) product combines vectors and matrices of subsystems: (a₀, a₁) ⊗ (b₀, b₁) = (a₀b₀, a₀b₁, a₁b₀, a₁b₁), and (A ⊗ B)(|a⟩ ⊗ |b⟩) = A|a⟩ ⊗ B|b⟩. Dimensions multiply; the product of 2 × 2 matrices is 4 × 4.',
      points: [
        '|+⟩ ⊗ |0⟩ = (1/√2)(|00⟩ + |10⟩): the figure’s H on qubit 0 produces exactly this, with bars at |00⟩ and |10⟩.',
        'Single-qubit gate on qubit 1 of a two-qubit register: I ⊗ H. On qubit 0: H ⊗ I. Both are 4 × 4 and they commute.',
        'Inner products factor: ⟨a′b′|ab⟩ = ⟨a′|a⟩⟨b′|b⟩. Norms multiply, so a product of normalised states is normalised.',
        'Not every 4-vector is a tensor product of two 2-vectors: the product has 2 + 2 − 1 = 3 free real parameters (after phases), the general state has 6.',
      ],
      math: ['\\begin{pmatrix}a_0\\\\a_1\\end{pmatrix}\\otimes\\begin{pmatrix}b_0\\\\b_1\\end{pmatrix} = \\begin{pmatrix}a_0b_0\\\\a_0b_1\\\\a_1b_0\\\\a_1b_1\\end{pmatrix}, \\qquad (A\\otimes B)(\\ket{a}\\otimes\\ket{b}) = A\\ket{a}\\otimes B\\ket{b}'],
    },
    professional: {
      intro: 'The tensor-product structure is what a simulator exploits and what a compiler respects: a single-qubit gate on an n-qubit state is applied in O(2ⁿ) by iterating over amplitude pairs, never by forming the 2ⁿ × 2ⁿ Kronecker matrix. Locality of gates in the tensor structure is also what makes error correction and hardware connectivity meaningful.',
      points: [
        'In-place application: for target qubit t, pair amplitudes whose indices differ only in bit t and multiply each pair by the 2 × 2 gate. This is the inner loop of every statevector simulator, including the one drawing these figures.',
        'Kronecker products of Paulis form the 4ⁿ-element Pauli basis; a Hamiltonian written in it has locality (how many non-identity factors per term) that sets measurement cost and Trotter error.',
        'Tensor-network states (MPS) write the 2ⁿ-amplitude tensor as a chain of small tensors; bond dimension χ bounds entanglement. Circuits with limited entanglement are simulable at cost poly(n, χ), which is why entangling depth is the hardness parameter.',
        'Hardware tensor structure is physical: qubits are separate devices, and a two-qubit gate between non-adjacent qubits costs SWAP chains. Qubit mapping and routing are tensor-product bookkeeping with a cost model.',
      ],
      math: ['\\text{cost}(A_t\\ket{\\psi}) = O(2^{n}) \\ \\text{in place}, \\qquad \\ket{\\psi} \\approx \\sum A^{[1]}_{s_1}A^{[2]}_{s_2}\\cdots A^{[n]}_{s_n}\\ket{s_1\\ldots s_n}'],
    },
  },
  {
    topic: '07.08', minutes: 6,
    figure: { animation: 'two-qubit', params: { mode: 'product' } },
    kid: {
      intro: 'A product state is a pair of qubits that are simply two separate qubits standing next to each other. Each has its own arrow; knowing one tells you nothing about the other. Most states you can make with one-qubit gates alone are like this.',
      points: [
        'Qubit A sideways, qubit B up: measure A and get 0 or 1 at random — and B is still up, no matter what A said.',
        'You could describe each one on its own ball. Two balls, two arrows, no strings attached.',
        'Gates that act on one qubit at a time can never tie the two together. For that you need a two-qubit gate.',
        'Product states are the boring case — and the test for the interesting case: if you cannot split a state into two arrows, it is entangled.',
      ],
    },
    student: {
      intro: 'A product (separable) pure state is one that factorises, |ψ⟩ = |a⟩ ⊗ |b⟩. Measurements on the two parts are statistically independent: P(x, y) = P(x)P(y), and the outcome on one leaves the other’s state unchanged. Local unitaries (U ⊗ V) map product states to product states.',
      points: [
        '(|00⟩ + |10⟩)/√2 = |+⟩|0⟩ is a product state; measuring qubit 0 gives 0 or 1 at ½ and qubit 1 remains |0⟩ either way.',
        'Test for two qubits: write amplitudes as a 2 × 2 matrix M with M_{ab} = α_{ab}; the state is a product iff det M = 0 (rank 1).',
        'Correlations in a product state are zero: ⟨A ⊗ B⟩ = ⟨A⟩⟨B⟩ for every pair of local observables.',
        'Preparing n qubits with single-qubit gates gives a product state with 2n real parameters — polynomial, and classically trivial to describe.',
      ],
      math: ['\\ket{\\psi} = \\ket{a}\\otimes\\ket{b} \\iff \\det\\begin{pmatrix}\\alpha_{00}&\\alpha_{01}\\\\\\alpha_{10}&\\alpha_{11}\\end{pmatrix} = 0'],
    },
    professional: {
      intro: 'Product states are the classical corner of state space, and the mean-field approximation in many-body physics is the assumption that the ground state is nearly one. Their reduced density matrices are pure; any mixedness in a subsystem of a pure global state is the signature of entanglement — the diagnostic used in both theory and tomography.',
      points: [
        'Schmidt decomposition: any bipartite pure state is Σ λᵢ|iᴬ⟩|iᴮ⟩ with λᵢ ≥ 0; product iff a single λ is nonzero. The number of terms (Schmidt rank) and the entropy of λᵢ² quantify entanglement.',
        'Hartree–Fock is the best product (single-determinant) approximation to an electronic ground state; correlation energy is by definition what product states miss, and it is the part quantum computers are meant to capture.',
        'Variational ansätze start from a product state (|0…0⟩ or Hartree–Fock) and add entangling layers; the expressibility of the ansatz is how far from product it can reach.',
        'Separability for mixed states is harder (NP-hard in general); witnesses and the PPT criterion are the practical tests, and certifying entanglement on hardware uses them.',
      ],
      math: ['\\ket{\\psi}_{AB} = \\sum_i \\lambda_i\\ket{i_A}\\ket{i_B}, \\qquad \\text{product} \\iff \\text{Schmidt rank} = 1'],
    },
  },
  {
    topic: '07.09', minutes: 8,
    figure: { animation: 'two-qubit', params: { mode: 'bell' } },
    kid: {
      intro: 'An entangled pair of qubits is one state shared by two particles. Neither has an arrow of its own; only the pair has a description. Measure one and the other’s answer is fixed instantly — even if it is on the other side of the world — though neither answer was decided before you looked.',
      points: [
        'Make a pair where the only rule is “both the same”: half the time 00, half the time 11, never 01 or 10.',
        'Look at the first: random. Look at the second: it matches the first, every single time.',
        'A classical trick could do that — two sealed envelopes with the same letter. But the quantum pair also matches when you measure sideways, and no envelopes can do both.',
        'Entanglement is not a wire and sends no message. It is a correlation stronger than any that could have been written down in advance.',
      ],
    },
    student: {
      intro: 'A state is entangled if it is not a product: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 cannot be written as |a⟩|b⟩. Its measurement outcomes are perfectly correlated in the Z basis and also in the X basis, and each qubit on its own is maximally mixed — all the information is in the correlations.',
      points: [
        'Prepared by H on qubit 0 then CNOT: |00⟩ → (|00⟩ + |10⟩)/√2 → (|00⟩ + |11⟩)/√2. The figure runs exactly these two gates.',
        'Z measurements: 00 or 11, never 01/10. X measurements: ++ or −−, never +−. No pre-assigned pair of values reproduces both (Bell’s theorem).',
        'Reduced state of either qubit: ρ = I/2, Bloch vector of length zero. A maximally entangled qubit looks maximally random alone.',
        'Entanglement is created only by interactions (two-qubit gates) and is not increased by local operations and classical communication.',
      ],
      math: ['\\ket{\\Phi^{+}} = \\frac{\\ket{00}+\\ket{11}}{\\sqrt2} \\ne \\ket{a}\\otimes\\ket{b}, \\qquad \\rho_A = \\mathrm{Tr}_B\\ket{\\Phi^{+}}\\bra{\\Phi^{+}} = \\tfrac12 I'],
    },
    professional: {
      intro: 'Entanglement is the resource that separates quantum from classical computation and communication: it is consumed by teleportation and superdense coding, generated by every two-qubit gate, quantified by entropy and concurrence, and destroyed by decoherence at a rate that grows with the number of entangled parties.',
      points: [
        'Concurrence C = |α₀₀α₁₁ − α₀₁α₁₀| × 2 for two-qubit pure states (1 for Bell states, 0 for products); entanglement of formation follows from it. For mixed states, negativity and witnesses are the computable measures.',
        'Two-qubit gate fidelity is in practice measured as how well a Bell state is produced: state tomography of |Φ⁺⟩ after H + CNOT gives a fidelity that upper-bounds the gate, and >99% is now routine on several platforms.',
        'Entanglement in a register makes the state hard to simulate (volume-law entropy) and also fragile: a GHZ state of n qubits dephases n times faster than one qubit. Error correction is the art of entangling for protection rather than fragility.',
        'Entanglement swapping and quantum repeaters distribute Bell pairs over distance; the Bell pair is the unit of a quantum network, with fidelity and rate as the two figures of merit.',
      ],
      math: ['C(\\psi) = 2|\\alpha_{00}\\alpha_{11} - \\alpha_{01}\\alpha_{10}|, \\qquad C(\\Phi^{+}) = 1'],
    },
  },
  {
    topic: '07.10', minutes: 7,
    figure: { animation: 'two-qubit', params: { mode: 'superdense' } },
    kid: {
      intro: 'There are exactly four ways to make a maximally entangled pair of qubits, and they have names: the Bell states. They differ only by a flip or a sign on one side — and you can switch between them by touching just one of the two qubits.',
      points: [
        'Same-same with a plus: the first Bell state. Same-same with a minus: the second. Opposite-opposite, plus or minus: the third and fourth.',
        'Flip one qubit and “same” becomes “opposite”. Twist one qubit’s phase and plus becomes minus.',
        'Because one qubit controls which of the four you have, one qubit can carry two bits of choice — that is superdense coding.',
        'The four Bell states are perfectly distinguishable from each other, but only if you measure both qubits together.',
      ],
    },
    student: {
      intro: 'The Bell basis is the four maximally entangled two-qubit states |Φ±⟩ = (|00⟩ ± |11⟩)/√2 and |Ψ±⟩ = (|01⟩ ± |10⟩)/√2. They are orthonormal and span the two-qubit space; local Paulis on one qubit map between them: X turns Φ into Ψ, Z flips the sign.',
      points: [
        '|Φ⁺⟩ is made by H then CNOT from |00⟩; X on qubit 0 then gives |Ψ⁺⟩, Z gives |Φ⁻⟩, ZX gives |Ψ⁻⟩ — the figure’s encoding step.',
        'Bell measurement: CNOT then H on the control maps the four Bell states back to |00⟩, |01⟩, |10⟩, |11⟩, so two Z measurements read which Bell state you had — the decoding step.',
        'Superdense coding: share |Φ⁺⟩ in advance; Alice applies one of I, X, Z, ZX to her qubit (choosing 2 bits) and sends it; Bob’s Bell measurement recovers both bits from one transmitted qubit.',
        '|Ψ⁻⟩ is the singlet: antisymmetric, rotationally invariant, and the state used in the standard Bell-inequality analysis with correlation −cos θ.',
      ],
      math: ['\\ket{\\Phi^{\\pm}} = \\frac{\\ket{00}\\pm\\ket{11}}{\\sqrt2}, \\quad \\ket{\\Psi^{\\pm}} = \\frac{\\ket{01}\\pm\\ket{10}}{\\sqrt2}; \\qquad (X\\otimes I)\\ket{\\Phi^{+}} = \\ket{\\Psi^{+}}, \\ (Z\\otimes I)\\ket{\\Phi^{+}} = \\ket{\\Phi^{-}}'],
    },
    professional: {
      intro: 'Bell states are the currency of quantum communication and the stabiliser states that error correction is built from: |Φ⁺⟩ is the joint +1 eigenstate of XX and ZZ, and measuring those two commuting operators without measuring Z or X individually is the simplest syndrome extraction.',
      points: [
        'Stabilisers: XX|Φ⁺⟩ = ZZ|Φ⁺⟩ = +|Φ⁺⟩; the other Bell states are the other three sign combinations. A Bell-state measurement is a measurement of XX and ZZ, which is how parity checks in surface codes should be read.',
        'Bell-pair fidelity is the benchmark of a quantum link: entanglement distribution over fibre and satellite is quoted as pairs per second at fidelity F, and F > ½ is the threshold for any use, F > 0.78 for violating CHSH with the raw pair.',
        'Entanglement distillation converts many low-fidelity Bell pairs into fewer high-fidelity ones using local operations and classical communication — the protocol that makes quantum repeaters possible.',
        'The Bell basis is the eigenbasis of the two-qubit Pauli group’s commuting pair {XX, ZZ}; generalising to n qubits gives GHZ states and graph states, the resource states of measurement-based quantum computing.',
      ],
      math: ['XX\\ket{\\Phi^{+}} = ZZ\\ket{\\Phi^{+}} = +\\ket{\\Phi^{+}}, \\qquad F > \\tfrac{1}{\\sqrt2} \\approx 0.71 \\ \\text{for CHSH violation}'],
    },
  },
  {
    topic: '07.11', minutes: 9,
    figure: { animation: 'bell-test', params: { mode: 'chsh' } },
    kid: {
      intro: 'Einstein thought entangled particles must secretly carry their answers with them, like sealed envelopes. John Bell found a way to test that: a scoring game whose maximum score for any envelope strategy is 2. Entangled particles score about 2.8. The envelopes are impossible.',
      points: [
        'Two players far apart each get a random question and must answer without talking. Envelopes prepared in advance can win the game at most a certain fraction of the time.',
        'With an entangled pair and clever measurement angles, they win more often than any envelope plan allows.',
        'Experiments have run this game thousands of times, with the players so far apart that light could not carry a hint between them. Quantum wins every time.',
        'Nature does not keep sealed envelopes. The answers really are not decided until measured.',
      ],
    },
    student: {
      intro: 'Bell’s theorem: any theory with local hidden variables predicts correlations obeying the CHSH inequality |S| ≤ 2, where S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′). Quantum mechanics for the singlet gives E(a,b) = −cos(a − b), and with angles 0°, 90°, 45°, 135° the result is |S| = 2√2 ≈ 2.83. Experiments confirm the quantum value.',
      points: [
        'E(a, b) is the average of the product of the two ±1 outcomes. For aligned detectors the singlet gives −1 (always opposite); for 90° apart, 0.',
        'A local-realist model must have E linear in the angle between the two straight-line extremes; quantum’s −cos bows away from it, most strongly at 22.5° and 67.5°.',
        'Loophole-free tests (2015, Delft, Vienna, NIST) closed the locality loophole (space-like separated choices) and the detection loophole simultaneously; the 2022 Nobel Prize recognised this line of work.',
        'The violation does not allow signalling: each party’s own outcomes are 50/50 regardless of the other’s setting. Only the correlations, visible after comparing notes, are non-classical.',
      ],
      math: ['S = E(a,b) - E(a,b\') + E(a\',b) + E(a\',b\'), \\qquad |S|_{\\text{LHV}} \\le 2, \\qquad |S|_{\\text{QM}} = 2\\sqrt2'],
    },
    professional: {
      intro: 'Bell violation is a device-independent certificate: if two separated boxes produce correlations with S > 2, their outputs contain entanglement and intrinsic randomness whatever the boxes are made of. That makes CHSH the foundation of device-independent QKD and certified random-number generation, and a routine benchmark of two-qubit gates.',
      points: [
        'Tsirelson’s bound 2√2 is the quantum maximum; exceeding it would signal post-quantum physics. Violations on hardware are typically 2.3–2.7, limited by gate and readout fidelity: S = 2√2·V for visibility V, so V > 0.71 is needed.',
        'Device-independent randomness: at S = 2√2 each outcome bit has one full bit of certified entropy against any adversary holding the devices’ internal state; at S slightly above 2 the rate drops to zero smoothly.',
        'On a quantum processor, a CHSH test is four circuits (two measurement bases per qubit) on a Bell pair; it is a stricter check than state fidelity because it is sensitive to the sign structure of the correlations.',
        'Bell nonlocality is a different resource from entanglement: all pure entangled states violate some inequality, but some mixed entangled states do not; the hierarchy entanglement ⊇ steering ⊇ nonlocality matters for which protocols a noisy link can run.',
      ],
      math: ['S_{\\text{measured}} = 2\\sqrt2\\,V, \\qquad H_{\\min} \\ge 1 - \\log_2\\!\\left(1 + \\sqrt{2 - S^{2}/4}\\right)'],
    },
  },
  {
    topic: '07.12', minutes: 7,
    figure: { animation: 'bell-test', params: { mode: 'marginals' } },
    kid: {
      intro: 'Entangled particles match up instantly across any distance — so can you use them to send a message faster than light? No. Whatever your far-away partner does, your own results look like pure coin flips. The matching only shows up later, when you compare notes by ordinary means.',
      points: [
        'Your partner can measure up/down or left/right. Either way, your half gives heads and tails at random. You cannot tell which they chose.',
        'The correlation is real but it is invisible until the two lists are brought together — at light speed or slower.',
        'This is not a technical limitation; it is a theorem. Quantum mechanics forbids signalling by entanglement.',
        'So relativity and quantum mechanics get along after all: spooky, yes; a telephone, no.',
      ],
    },
    student: {
      intro: 'No-signalling: the marginal distribution of Alice’s outcomes does not depend on Bob’s choice of measurement (or on whether he measures at all). For the singlet, P(Alice ↑) = ½ for every setting of Bob, even though the joint distribution P(a, b) depends on both. Correlations are not communication.',
      points: [
        'Formally Σ_b P(a, b | x, y) = P(a | x) for all y: summing over Bob’s outcomes removes any trace of Bob’s setting.',
        'Equivalently, Alice’s reduced density matrix ρ_A = Tr_B ρ_AB is unchanged by any local operation Bob performs — Tr_B[(I ⊗ U)ρ(I ⊗ U†)] = ρ_A.',
        'The figure: Alice’s P(↑) sits flat at 0.5 while the correlation E(a, b) swings with Bob’s angle. The swinging quantity requires both results to compute.',
        'Measurement collapse is therefore not a physical signal travelling from Bob to Alice; it is an update of the joint description that only has consequences when the two sides are compared.',
      ],
      math: ['\\sum_b P(a,b\\mid x,y) = P(a\\mid x) \\ \\ \\forall y, \\qquad \\mathrm{Tr}_B\\big[(I\\otimes U)\\rho(I\\otimes U^{\\dagger})\\big] = \\rho_A'],
    },
    professional: {
      intro: 'No-signalling is a structural constraint that also bounds what quantum mechanics can do: it rules out faster-than-light communication, it is part of why cloning is impossible (cloning plus entanglement would signal), and it is weaker than quantum mechanics — PR boxes reach S = 4 without signalling, so no-signalling alone does not explain the Tsirelson bound.',
      points: [
        'Teleportation respects it: Bob’s qubit is maximally mixed until Alice’s two classical bits arrive, which travel no faster than light; the quantum state is reconstructed only after the classical message.',
        'In quantum networks, no-signalling is why entanglement distribution plus classical communication is the resource model (LOCC): entanglement alone transmits nothing.',
        'Security proofs of QKD use it in the device-independent setting: an eavesdropper holding a purification of the devices cannot alter Alice’s marginals, and Bell violation bounds her information.',
        'Causal structure: quantum correlations are compatible with relativistic causality because the no-signalling conditions hold, yet they are not explainable by any common cause with local hidden variables — that tension is the content of Bell’s theorem, not a contradiction.',
      ],
      math: ['\\text{PR box: } S = 4 \\ \\text{(no-signalling)}, \\qquad S_{\\text{QM}} \\le 2\\sqrt2 \\ \\text{(Tsirelson)}'],
    },
  },
  {
    topic: '07.13', minutes: 7,
    figure: { animation: 'cloning-attempt' },
    kid: {
      intro: 'You can photocopy a page but you cannot photocopy a qubit. No machine, however clever, can take an unknown quantum state and produce two of it. This is not a limit of engineering — it follows directly from the rules — and it is the reason quantum messages cannot be secretly copied.',
      points: [
        'A copier that works for “up” and for “down” must, by the rules, fail for “sideways”: instead of two sideways qubits it makes an entangled pair.',
        'If copying were possible you could measure the copies in every direction and learn the original’s arrow exactly — which the uncertainty principle forbids.',
        'That is good news for secrecy: an eavesdropper cannot copy a quantum key without disturbing it.',
        'It is bad news for backups: a quantum computer cannot save a checkpoint of its state.',
      ],
    },
    student: {
      intro: 'The no-cloning theorem: no unitary U satisfies U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for all |ψ⟩. Proof by linearity: if U clones |0⟩ and |1⟩, then U(|0⟩ + |1⟩)|0⟩/√2 = (|00⟩ + |11⟩)/√2, which is not (|0⟩ + |1⟩)(|0⟩ + |1⟩)/2. Only orthogonal states can be copied by one device.',
      points: [
        'The CNOT copies basis states perfectly (|0⟩|0⟩ → |00⟩, |1⟩|0⟩ → |11⟩) and turns |+⟩|0⟩ into a Bell state — the figure’s computation.',
        'Alternative proof via inner products: cloning would require ⟨φ|ψ⟩ = ⟨φ|ψ⟩², forcing ⟨φ|ψ⟩ ∈ {0, 1}.',
        'Consequences: no amplifier for single quantum states; no classical-style fan-out in quantum circuits; measurement cannot be made non-disturbing by copying first.',
        'Approximate cloning is possible with fidelity 5/6 for qubits (Bužek–Hillery), which is the quantitative statement of what an eavesdropper can get away with.',
      ],
      math: ['U\\ket{\\psi}\\ket{0} = \\ket{\\psi}\\ket{\\psi}\\ \\forall\\psi \\ \\text{is impossible}; \\qquad \\text{CNOT}\\,\\ket{+}\\ket{0} = \\frac{\\ket{00}+\\ket{11}}{\\sqrt2} \\ne \\ket{+}\\ket{+}'],
    },
    professional: {
      intro: 'No-cloning shapes quantum engineering at every level: error correction cannot use redundancy by copying and instead encodes into entangled subspaces; quantum repeaters cannot amplify and instead swap entanglement; and QKD security rests on the fact that an eavesdropper’s copy costs disturbance that the legitimate parties can detect.',
      points: [
        'Error correction without copying: the three-qubit code maps α|0⟩ + β|1⟩ to α|000⟩ + β|111⟩ — entangled, not copied — and syndrome measurements read parities, never the logical state. The surface code is this idea at scale.',
        'Quantum repeaters: classical optical repeaters amplify the signal; quantum links cannot, so repeaters create entanglement in short segments and swap it, with memories to buffer the probabilistic steps.',
        'Security: in BB84, an eavesdropper who intercepts and resends introduces a 25% error rate in mismatched bases; optimal cloning attacks are bounded by the same theorem, and the disturbance–information trade-off is the heart of every security proof.',
        'No-deleting and no-broadcasting are the companion theorems; together with no-signalling they delineate the information-processing boundary of the theory.',
      ],
      math: ['\\alpha\\ket{0}+\\beta\\ket{1} \\to \\alpha\\ket{000}+\\beta\\ket{111} \\ \\text{(encoding, not cloning)}, \\qquad F_{\\text{clone}}^{\\max} = \\tfrac56'],
    },
  },
];
