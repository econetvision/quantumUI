import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 06 — Simple Quantum Systems.
 *
 * The solvable systems, in the syllabus order: the box, the wells, the
 * barrier and tunnelling, the oscillator, hydrogen, and the quantum numbers
 * with the exclusion principle that builds the periodic table.
 */
export const MODULE_06: FoundationLesson[] = [
  {
    topic: '06.01', minutes: 7,
    figure: { animation: 'wave-in-box' },
    kid: {
      intro: 'Put a particle in a box it cannot get out of. Classically it could sit still anywhere inside with any energy. Quantum-mechanically it is a wave that has to fit between the walls, so it is never still, it has favourite places, and it only comes in certain energies.',
      points: [
        'The simplest allowed wave is one hump: most likely found in the middle, never at the walls.',
        'The next is two humps: likely on the left or the right, never in the exact middle — even though it is in both halves.',
        'Each extra hump costs energy: 1, 4, 9, 16 … times the first.',
        'Make the box smaller and every energy goes up. Squeezing a quantum particle makes it jittery.',
      ],
    },
    student: {
      intro: 'A particle in a one-dimensional box of width L (V = 0 inside, infinite outside) has stationary states φₙ(x) = √(2/L) sin(nπx/L) and energies Eₙ = n²h²/8mL², n = 1, 2, 3 … It is the first exactly solvable system and the template for all confinement.',
      points: [
        'Electron in L = 1 nm: E₁ = 0.376 eV, E₂ = 1.50 eV, E₃ = 3.38 eV; the 2 → 1 photon has 1.13 eV (1100 nm, infrared).',
        'Eₙ ∝ 1/L²: halving the box quadruples every level. Eₙ ∝ 1/m: a proton in the same box has levels 1836 times lower.',
        'Zero-point energy E₁ = h²/8mL² ≠ 0, consistent with Δx ≈ L forcing Δp ≈ h/2L.',
        'Level spacing grows with n (E_{n+1} − Eₙ ∝ 2n + 1) — unlike the oscillator (constant) and hydrogen (shrinking).',
      ],
      math: ['\\varphi_n(x) = \\sqrt{\\frac{2}{L}}\\sin\\frac{n\\pi x}{L}, \\qquad E_n = \\frac{n^{2}h^{2}}{8mL^{2}} = n^{2}E_1'],
    },
    professional: {
      intro: 'The box is the zeroth-order model for every nanostructure: quantum dots, nanowires, the conduction-band well of a HEMT, the semiconductor spin-qubit dot. Its one parameter, L, converts a fabrication dimension into an energy, and that energy decides whether the structure is quantum at the operating temperature.',
      points: [
        'Design rule: quantum behaviour needs level spacing ≫ kT. For an electron in a 10 nm dot, E₂ − E₁ ≈ 11 meV ≈ 130 K — quantum at 4 K, classical at room temperature. At 1 nm it is 1.1 eV, quantum anywhere.',
        'CdSe quantum dots glow a colour set by their size through this formula (with effective mass): 2 nm blue, 6 nm red. The box spectrum is in your television.',
        'Effective mass m* replaces m in a crystal (0.067 mₑ in GaAs), raising confinement energies 15×; that is why GaAs/Si dots work at tens of nanometres.',
        'Momentum in the box is not sharp: φₙ is a standing wave, a superposition of ±ħkₙ. Measuring momentum gives ±ħkₙ with a spread — the first example where energy eigenstates are not momentum eigenstates.',
      ],
      math: ['E_2 - E_1 = \\frac{3h^{2}}{8m^{*}L^{2}} \\gg k_BT \\ \\text{for quantum operation}'],
    },
  },
  {
    topic: '06.02', minutes: 6,
    figure: { animation: 'wave-in-box', params: { n: 2 } },
    kid: {
      intro: 'The “infinite potential well” is the official name for the perfect box: walls so high nothing could ever climb them. It is an idealisation, but a useful one — the wave is forced to exactly zero at each wall, which makes the maths clean and the answers exact.',
      points: [
        'Think of the walls as cliffs infinitely tall. The particle has zero chance of being in the wall.',
        'Because the wave must touch zero at both walls, only whole numbers of half-waves fit.',
        'Two half-waves (one whole wave) is the second allowed state, with a quiet spot right in the middle.',
        'Real walls are never infinite — the next lesson relaxes that — but the picture barely changes for deep wells.',
      ],
    },
    student: {
      intro: 'The infinite potential well imposes Dirichlet boundary conditions φ(0) = φ(L) = 0 because the wavefunction must vanish where V = ∞. Inside, the TISE is φ″ = −k²φ; the boundary conditions quantise k and hence E, and the normalisation constant is √(2/L).',
      points: [
        'General interior solution A sin kx + B cos kx; φ(0) = 0 kills B; φ(L) = 0 forces kL = nπ. n = 0 gives φ ≡ 0 (not a state), so n starts at 1.',
        'Orthogonality: ∫φₘφₙ dx = δₘₙ — the stationary states form an orthonormal basis, so any initial wavefunction expands as Σ cₙφₙ and evolves as Σ cₙe^{−iEₙt/ħ}φₙ.',
        'Expectation values: ⟨x⟩ = L/2 for every n by symmetry; ⟨p⟩ = 0; ⟨p²⟩ = (nπħ/L)², consistent with Eₙ = ⟨p²⟩/2m.',
        'The n = 2 state has probability zero at x = L/2 yet equal probability in each half; a particle “in both halves” that is never in the middle.',
      ],
      math: ['\\varphi(0) = \\varphi(L) = 0, \\qquad \\int_0^{L}\\varphi_m\\varphi_n\\,dx = \\delta_{mn}, \\qquad \\langle p^{2}\\rangle_n = \\left(\\frac{n\\pi\\hbar}{L}\\right)^{2}'],
    },
    professional: {
      intro: 'The infinite well is the clean limit used to check numerics and to teach the superposition–evolution machinery: a wavefunction that is not an eigenstate sloshes, revives and spreads in ways that are exactly computable here and only numerically elsewhere.',
      points: [
        'Quantum revival: because Eₙ ∝ n², an arbitrary wavepacket in the well returns exactly to its initial shape at T_rev = 4mL²/πħ — a purely quantum recurrence with no classical analogue, observed in Rydberg atoms and cold atoms in optical boxes.',
        'Sudden expansion: double L instantaneously and the old ground state is a superposition of new eigenstates with cₙ = ⟨φₙ^{new}|φ₁^{old}⟩; the probability of staying in the ground state is (8/3π)² ≈ 0.72. A textbook calculation, and the model for diabatic gate errors.',
        'Finite-difference benchmark: the eigenvalues of the tridiagonal Laplacian on N points are exactly known, so the box is the unit test for any TISE solver.',
        'Hard-wall boundary conditions are the ideal of a qubit’s computational subspace: leakage is the real-world wall being finite.',
      ],
      math: ['T_{\\text{rev}} = \\frac{4mL^{2}}{\\pi\\hbar}, \\qquad P_{\\text{stay}} = \\left(\\frac{8}{3\\pi}\\right)^{2} \\approx 0.72'],
    },
  },
  {
    topic: '06.03', minutes: 6,
    figure: { animation: 'wave-in-box', params: { n: 3 } },
    kid: {
      intro: 'Trapped quantum systems have energy ladders, but not all ladders look alike. A box has rungs that get further apart as you climb. A spring has rungs evenly spaced. An atom has rungs that bunch together near the top. The shape of the trap sets the shape of the ladder.',
      points: [
        'Box: 1, 4, 9, 16 — the gaps grow. Spring: 1, 3, 5, 7 (in half-steps) — the gaps are equal. Atom: the gaps shrink toward a ceiling.',
        'A photon out of the system must match a gap exactly, so the ladder is what you see in the spectrum.',
        'Photon in: the system climbs a rung, if and only if the photon fits a gap.',
        'The lowest rung is never at zero. Trapped things always keep a little energy.',
      ],
    },
    student: {
      intro: 'Quantised energy levels are the eigenvalues of the Hamiltonian for a bound system. Their pattern reflects the potential: Eₙ ∝ n² for the infinite well, Eₙ ∝ (n + ½) for the harmonic oscillator, Eₙ ∝ −1/n² for the Coulomb potential. Transitions between levels give the line spectrum.',
      points: [
        'Box electron, L = 1 nm: levels 0.376, 1.50, 3.38, 6.02 eV; gaps 1.13, 1.88, 2.63 eV — growing.',
        'Oscillator: gaps all equal to ħω; the spectrum is a single frequency and its harmonics are absent in the harmonic approximation.',
        'Hydrogen: −13.6, −3.40, −1.51, −0.85 eV; gaps 10.2, 1.89, 0.66 eV — shrinking toward the ionisation limit at 0.',
        'Degeneracy counts how many states share a level: none in 1-D, n² (ignoring spin) in hydrogen, rising with symmetry.',
      ],
      math: ['E_n^{\\text{box}} = n^{2}E_1, \\qquad E_n^{\\text{HO}} = \\hbar\\omega(n+\\tfrac12), \\qquad E_n^{\\text{H}} = -\\frac{13.6\\ \\text{eV}}{n^{2}}'],
    },
    professional: {
      intro: 'The spacing pattern of a level ladder is the single most important property of a candidate qubit: you need two levels you can address without touching a third. Equal spacing (a pure oscillator) is useless; unequal spacing (anharmonicity) is what makes a transmon, an atom or an ion a qubit.',
      points: [
        'Transmon anharmonicity α = ω₁₂ − ω₀₁ ≈ −200 to −300 MHz on ω₀₁ ≈ 5 GHz. A 20 ns gate has a ~50 MHz bandwidth, comfortably inside |α|; a 5 ns gate would not be, hence DRAG pulse shaping.',
        'Atoms and ions have enormous anharmonicity (optical gaps versus hyperfine), which is why their qubits are so clean and their gates comparatively slow.',
        'Level structure also sets measurement: dispersive readout needs a third level’s coupling (the transmon’s |2⟩ contributes to χ), and leakage to |2⟩ is a distinct error class that standard codes do not correct.',
        'Fluxonium and 0–π qubits engineer the ladder deliberately — large anharmonicity plus protected transitions — trading fabrication complexity for coherence.',
      ],
      math: ['\\alpha = \\omega_{12} - \\omega_{01}, \\qquad \\text{need } |\\alpha| \\gg \\frac{1}{t_{\\text{gate}}}'],
    },
  },
  {
    topic: '06.04', minutes: 6,
    figure: { animation: 'wave-in-box', params: { density: true } },
    kid: {
      intro: 'Where will you actually find the particle if you look? Square the wave. The result is a map of likelihood: hills where it is often found, valleys where it is rarely found, and zero at special spots where it is never found at all.',
      points: [
        'One-hump wave: the map has a single hill in the middle. Look there and you will usually find it.',
        'Two-hump wave: two hills with a dead zone in between. It is never caught in the dead zone.',
        'Higher waves have more hills and more dead zones — a comb of places it can and cannot be.',
        'Very high up the ladder, the comb becomes so fine that it looks evenly spread — like a classical ball bouncing back and forth.',
      ],
    },
    student: {
      intro: 'The probability density |φₙ(x)|² = (2/L) sin²(nπx/L) gives where the particle is found in the n-th state. It has n maxima and n − 1 interior nodes; averaged over a small region it approaches the classical uniform density 1/L as n grows — the correspondence principle.',
      points: [
        'P(0 < x < L/4) for n = 1 is ∫₀^{L/4}(2/L)sin²(πx/L) dx = 1/4 − 1/2π ≈ 0.091, less than the classical 0.25: the ground state hugs the centre.',
        'For n = 2 the same interval has probability exactly 0.25 — the two humps restore the classical average.',
        'Nodes at x = L/n, 2L/n, …; the particle is never found there, yet its probability is nonzero on both sides.',
        'Expectation ⟨x⟩ = L/2 for all n; the spread Δx grows from 0.18L (n = 1) toward the classical 0.29L.',
      ],
      math: ['|\\varphi_n|^{2} = \\frac{2}{L}\\sin^{2}\\frac{n\\pi x}{L}, \\qquad P_{n=1}\\left(0<x<\\tfrac{L}{4}\\right) = \\frac14 - \\frac{1}{2\\pi} \\approx 0.091'],
    },
    professional: {
      intro: 'Probability densities are what scanning probes image (STM maps |ψ|² of surface states and quantum corrals directly), what sets tunnelling rates (density at the barrier edge), and what determines coupling strengths between a confined electron and anything it touches.',
      points: [
        'Spin qubit exchange coupling J depends on the overlap of two dots’ wavefunction tails — a density-at-the-barrier quantity tunable by gate voltage over orders of magnitude, which is the two-qubit gate.',
        'Hyperfine interaction in a quantum dot is proportional to |ψ(Rₙ)|² at each nucleus; isotopically purified ²⁸Si reduces the nuclear density and lengthens T₂ from µs to ms.',
        'The correspondence principle in practice: Rydberg wavepackets with n ≈ 50 trace near-classical orbits before spreading and reviving — quantum density mimicking a classical trajectory for a while.',
        'Densities do not carry phase; two states with identical |φ|² everywhere can still be orthogonal. Momentum-space density |φ̃(p)|² is the complementary map and is measured by time-of-flight.',
      ],
      math: ['A_{\\text{hf}} \\propto |\\psi(\\mathbf{R}_n)|^{2}, \\qquad J \\propto \\text{(wavefunction overlap in the barrier)}'],
    },
  },
  {
    topic: '06.05', minutes: 7,
    figure: { animation: 'tunnelling', params: { mode: 'well' } },
    kid: {
      intro: 'Real walls are not infinitely high. Make the box walls merely tall, and something odd happens: the wave does not stop dead at the wall. It leaks a little way in, fading quickly. There is a small chance of finding the particle inside the wall — a place it does not have the energy to be.',
      points: [
        'Inside the wall the wave shrinks fast, like a sound fading through a thick door — but it is not zero.',
        'Because it leaks, the wave is a little more spread out, so its energy is a little lower than in a perfect box.',
        'Tall, thick walls: almost no leak. Low, thin walls: lots of leak.',
        'A finite well only has room for a few trapped states; above the wall top, the particle is free.',
      ],
    },
    student: {
      intro: 'In a finite square well (V = −V₀ inside, 0 outside) bound states with E < 0 have oscillatory φ inside and decaying exponentials e^{−κ|x|} outside, κ = √(−2mE)/ħ. Matching φ and φ′ at the edges gives a transcendental equation with a finite number of solutions.',
      points: [
        'Penetration depth 1/κ: for a 1 eV binding and an electron, 1/κ ≈ 0.2 nm — comparable to the well itself at the nanoscale.',
        'Energies lie below the corresponding infinite-well values because the wave spreads into the walls, lowering its curvature.',
        'There is always at least one bound state in one dimension, however shallow the well; the number grows with √(V₀)L.',
        'Classically forbidden region: E < V there, so kinetic energy would be negative; the particle is nevertheless found there with probability ∫|φ|² over the walls.',
      ],
      math: ['\\varphi_{\\text{out}} \\propto e^{-\\kappa|x|}, \\quad \\kappa = \\frac{\\sqrt{2m(V - E)}}{\\hbar}, \\qquad \\text{penetration} \\sim \\frac{1}{\\kappa}'],
    },
    professional: {
      intro: 'Evanescent tails are how confined states talk to the outside: they set tunnel coupling between dots, leakage from a trap, and the decay of a quasi-bound state. Designing a well is designing its tails.',
      points: [
        'Double quantum dot: two finite wells whose tails overlap produce bonding/antibonding states split by 2t, with t ∝ e^{−κd}; this exponential dependence on barrier width d (set by a gate voltage) is the tunability that makes exchange-based spin gates possible.',
        'Heterostructure wells (GaAs/AlGaAs) have band offsets of a few hundred meV — finite, so wavefunctions penetrate the barrier and feel interface roughness; growth quality limits mobility and coherence.',
        'Shallow wells with one weakly bound state are Feshbach-resonance physics: the tail dominates, the state is huge, and scattering lengths diverge — the tool for tuning atom–atom interactions in cold-atom simulators.',
        'A bound state with a finite barrier to a continuum is only quasi-bound: it decays by tunnelling with rate ∝ e^{−2κL}, the next two lessons’ subject.',
      ],
      math: ['t \\propto e^{-\\kappa d}, \\qquad E_{\\pm} = E_0 \\pm t \\ \\text{(double well)}'],
    },
  },
  {
    topic: '06.06', minutes: 7,
    figure: { animation: 'tunnelling', params: { barrierEv: 1, widthNm: 0.5, energyEv: 0.5 } },
    kid: {
      intro: 'Now turn the wall into a hurdle: a thin barrier with free space beyond. A wave coming at a hurdle too high for it leaks into the hurdle, fades — and if the hurdle is thin enough, some wave is still left when it reaches the far side. It pops out and carries on.',
      points: [
        'Most of the wave bounces back. A small part gets through. How small depends on how thick and how high the hurdle is.',
        'Twice as thick is not twice as hard — it is far, far harder. The leak fades exponentially.',
        'Classically a ball with too little energy never crosses. Quantum-mechanically it sometimes does, with no extra push.',
        'This is not cheating on energy: the particle on the far side has the same energy it started with.',
      ],
    },
    student: {
      intro: 'A rectangular barrier of height V₀ and width L with incident energy E < V₀: inside, φ ∝ e^{±κx} with κ = √(2m(V₀ − E))/ħ. Matching at both edges gives a transmission coefficient that, for κL ≫ 1, is T ≈ 16(E/V₀)(1 − E/V₀)e^{−2κL} — exponential in width and in √(V₀ − E).',
      points: [
        'Electron, V₀ − E = 0.5 eV: κ = 3.6 nm⁻¹. L = 0.5 nm gives e^{−2κL} ≈ 0.027; L = 1 nm gives ≈ 7 × 10⁻⁴. Doubling the width costs a factor of ~40.',
        'Heavier particles tunnel far less: κ ∝ √m, so a proton’s exponent is √1836 ≈ 43 times larger than an electron’s for the same barrier.',
        'For E > V₀ transmission is not 1 either: there is partial reflection, with T = 1 only at resonances where the barrier contains an integer number of half-wavelengths.',
        'Reflection and transmission probabilities sum to 1; the figure draws the transmitted wave with amplitude √T.',
      ],
      math: ['\\kappa = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}, \\qquad T \\approx 16\\frac{E}{V_0}\\left(1 - \\frac{E}{V_0}\\right)e^{-2\\kappa L}'],
    },
    professional: {
      intro: 'Barrier transmission is a design parameter in every solid-state qubit and the physical basis of the Josephson junction: two superconductors separated by a ~1 nm oxide through which Cooper pairs tunnel coherently. The exponential sensitivity to thickness is both the lever and the headache.',
      points: [
        'Josephson energy E_J ∝ junction transparency ∝ e^{−2κL}; a 0.1 nm variation in AlOₓ thickness changes E_J by ~30%, which is why qubit frequencies scatter across a wafer and need post-fabrication tuning (laser annealing, flux bias).',
        'Scanning tunnelling microscopy reads this exponential directly: current ∝ e^{−2κz} with κ ≈ 10 nm⁻¹, so 0.1 nm of height is a factor of ~7 in current — atomic resolution for free.',
        'Tunnel barriers in quantum dots are gate-defined; exponential sensitivity means millivolts of gate voltage change tunnel rates by orders of magnitude, giving fast control but strict demands on voltage noise.',
        'Transfer-matrix methods compute T for arbitrary V(x) by slicing it into constant pieces; the WKB formula T ≈ exp(−2∫κ dx) is the smooth-barrier generalisation and is what the figure’s estimate uses.',
      ],
      math: ['T_{\\text{WKB}} \\approx \\exp\\!\\left(-2\\int_{x_1}^{x_2}\\frac{\\sqrt{2m(V(x)-E)}}{\\hbar}\\,dx\\right)'],
    },
  },
  {
    topic: '06.07', minutes: 8,
    figure: { animation: 'tunnelling', params: { barrierEv: 1, widthNm: 1, energyEv: 0.5 } },
    kid: {
      intro: 'Tunnelling is the name for getting through a barrier you do not have the energy to climb. It sounds like a party trick, but it is why the Sun shines, how some electronics work, and how the sharpest microscopes see single atoms.',
      points: [
        'In the Sun, protons tunnel through their electrical repulsion to fuse. Without tunnelling, the Sun would be too cool to burn.',
        'Flash memory stores your photos by tunnelling electrons through a thin wall and trapping them.',
        'A tunnelling microscope holds a needle a few atoms above a surface and measures the trickle of electrons that tunnel across the gap.',
        'The trick works only for small things over tiny distances. You cannot tunnel through a wall; your wave is far too small.',
      ],
    },
    student: {
      intro: 'Quantum tunnelling is transmission through a classically forbidden region, with probability T ≈ e^{−2κL}, κ = √(2m(V₀ − E))/ħ. It is exponentially sensitive to barrier width, height and particle mass, which is why it dominates for electrons at nanometre scales and vanishes for anything macroscopic.',
      points: [
        'Electron, 0.5 eV below a 1 eV barrier, L = 1 nm: T ≈ 7 × 10⁻⁴. Halve L: T ≈ 0.03. Alpha decay of nuclei spans lifetimes from microseconds to 10¹⁷ years through this same exponential.',
        'Applications: scanning tunnelling microscope (I ∝ e^{−2κz}), tunnel diodes, flash memory (Fowler–Nordheim tunnelling through gate oxide), nuclear fusion in stars (Gamow factor).',
        'Tunnelling conserves energy: the transmitted particle has the same E as the incident one. The “negative kinetic energy” inside the barrier is never observed because measuring position inside the barrier would add at least V₀ − E of energy.',
        'Tunnelling time is subtle; the Hartman effect says it saturates with width, and attosecond experiments now probe it directly.',
      ],
      math: ['T \\approx e^{-2\\kappa L}, \\qquad \\kappa L = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}L \\approx 3.6\\ \\text{for } 0.5\\ \\text{eV}, 1\\ \\text{nm}'],
    },
    professional: {
      intro: 'Tunnelling is the enabling mechanism of superconducting qubits (Cooper-pair tunnelling through the Josephson junction gives the nonlinear inductance) and simultaneously a loss channel (quasiparticle tunnelling), a control knob (tunnel coupling in dots) and a computational metaphor (quantum annealing escapes local minima by tunnelling through barriers).',
      points: [
        'Josephson relations: I = I_c sin φ, V = (ħ/2e) dφ/dt. The junction is a nonlinear inductor L_J = ħ/(2eI_c cos φ), and the transmon is an LC oscillator made anharmonic by that nonlinearity — all from tunnelling of pairs.',
        'Quasiparticle poisoning: unpaired electrons tunnelling across the junction flip the qubit parity and cause T₁ events; shielding from infrared and cosmic rays, and normal-metal traps, are the mitigations.',
        'Macroscopic quantum tunnelling of the phase variable out of a washboard potential was the 1985 experiment (Clarke, Devoret, Martinis) that showed a circuit variable behaves quantum-mechanically — the birth certificate of superconducting qubits.',
        'Quantum annealers rely on transverse-field tunnelling to cross energy barriers in a cost landscape; whether this beats classical thermal hopping on a given problem is the still-open advantage question.',
      ],
      math: ['I = I_c\\sin\\varphi, \\qquad V = \\frac{\\hbar}{2e}\\frac{d\\varphi}{dt}, \\qquad L_J = \\frac{\\hbar}{2eI_c\\cos\\varphi}'],
    },
  },
  {
    topic: '06.08', minutes: 7,
    figure: { animation: 'wave-in-box', params: { mode: 'oscillator' } },
    kid: {
      intro: 'A mass on a spring, in the quantum world, has an energy ladder with perfectly even rungs. Each rung up adds exactly the same amount — one “quantum” of vibration. Light works the same way: each photon is one rung on the ladder of a light wave.',
      points: [
        'Evenly spaced rungs mean the oscillator only ever absorbs or gives out one size of energy packet.',
        'The lowest rung is not at zero: even at absolute zero the spring jiggles a little. This is zero-point motion.',
        'The ground-state wave is a smooth bump in the middle; higher states spread wider and get more wiggles.',
        'Almost everything that vibrates — molecules, crystal lattices, light — is built from this one model.',
      ],
    },
    student: {
      intro: 'The quantum harmonic oscillator, H = p²/2m + ½mω²x², has energies Eₙ = ħω(n + ½), n = 0, 1, 2 …: equally spaced by ħω with zero-point energy ½ħω. Eigenfunctions are Gaussians times Hermite polynomials, with n nodes.',
      points: [
        'Ground state φ₀ ∝ e^{−mωx²/2ħ}: a Gaussian that saturates the uncertainty relation, Δx·Δp = ħ/2 exactly.',
        'Equal spacing ⇒ a single emission/absorption frequency ω — the quantum version of a classical oscillator’s single frequency, and the reason a diatomic molecule has one vibrational line (plus anharmonic overtones).',
        'The spectrum of a vibrating CO molecule, ħω ≈ 0.27 eV, is in the infrared — the basis of IR spectroscopy.',
        'Ladder operators a, a† lower and raise n by one: H = ħω(a†a + ½). Every photon, phonon and magnon is an excitation counted by a†a.',
      ],
      math: ['E_n = \\hbar\\omega\\left(n + \\tfrac12\\right), \\qquad \\varphi_0(x) \\propto e^{-m\\omega x^{2}/2\\hbar}, \\qquad H = \\hbar\\omega\\left(a^{\\dagger}a + \\tfrac12\\right)'],
    },
    professional: {
      intro: 'The harmonic oscillator is the model of every bosonic mode in a quantum computer: readout resonators, bus cavities, the motional modes of an ion chain, and the optical modes of a photonic chip. Its equal spacing is the reason it cannot be a qubit on its own and the reason it is a perfect memory and interconnect.',
      points: [
        'Circuit QED: a transmon (anharmonic) dispersively coupled to a resonator (harmonic) gives H ≈ ħω_r a†a + ħω_q σ_z/2 + ħχ a†a σ_z; the resonator frequency shifts by ±χ with the qubit state, and that shift is the readout signal.',
        'Trapped-ion gates (Cirac–Zoller, Mølmer–Sørensen) use the shared motional oscillator as a bus: sideband transitions change n by one conditioned on spin, entangling distant ions.',
        'Bosonic codes (cat, binomial, GKP) store a logical qubit in an oscillator’s Hilbert space, exploiting that photon loss is a single dominant error — a route to hardware-efficient error correction.',
        'Coherent states |α⟩ (eigenstates of a) are the classical-like states of the oscillator: Poissonian number distribution with mean |α|², ⟨x⟩ oscillating classically. A laser or a readout tone is approximately one.',
      ],
      math: ['H_{\\text{cQED}} \\approx \\hbar\\omega_r a^{\\dagger}a + \\tfrac12\\hbar\\omega_q\\sigma_z + \\hbar\\chi\\,a^{\\dagger}a\\,\\sigma_z, \\qquad a\\ket{\\alpha} = \\alpha\\ket{\\alpha}'],
    },
  },
  {
    topic: '06.09', minutes: 8,
    figure: { animation: 'hydrogen-orbital' },
    kid: {
      intro: 'The hydrogen atom — one proton, one electron — is the one atom physics can solve exactly. The electron does not orbit like a planet. It lives in a fuzzy cloud called an orbital, and the shape of the cloud depends on which energy rung it is on.',
      points: [
        'The lowest cloud is a round ball. The electron is most likely found about 0.05 nanometres from the centre — the Bohr radius.',
        'Higher clouds are bigger: a bigger ball with a hollow shell inside it, or a dumbbell with two lobes.',
        'The cloud is not the electron smeared out. It is the map of where you will find the electron if you look.',
        'Bohr got the energies right with his orbits; the clouds explain why the orbits were the wrong picture.',
      ],
    },
    student: {
      intro: 'Solving the TISE for the Coulomb potential −e²/4πε₀r gives Eₙ = −13.6 eV/n² (Bohr’s energies) and wavefunctions ψₙₗₘ = Rₙₗ(r)Yₗₘ(θ, φ) labelled by three quantum numbers. The radial probability P(r) = r²|R|² peaks at a₀ for 1s; 2s has a radial node; 2p is a dumbbell.',
      points: [
        '1s: P(r) ∝ r²e^{−2r/a₀}, most probable radius a₀ = 0.0529 nm; mean radius 1.5a₀. 2s peaks near 5.2a₀ with a node at 2a₀; 2p peaks at 4a₀ with no radial node.',
        'For each n, ℓ = 0 … n − 1 (s, p, d, f) and mℓ = −ℓ … +ℓ; the energy depends only on n for hydrogen, giving n² degenerate orbitals per level.',
        'Orbital shapes: s spherical, p three dumbbells along x, y, z, d five cloverleaf/doughnut shapes. Chemistry’s bonding geometry comes from these.',
        'The electron has no trajectory and no definite radius; ⟨r⟩ and the most probable r are different numbers from the same cloud.',
      ],
      math: ['\\psi_{n\\ell m} = R_{n\\ell}(r)\\,Y_{\\ell m}(\\theta,\\varphi), \\qquad P(r) = r^{2}|R_{n\\ell}|^{2}, \\qquad P_{1s} \\propto r^{2}e^{-2r/a_0}'],
    },
    professional: {
      intro: 'Hydrogen is the benchmark for every electronic-structure method and the first molecule-class problem run on quantum hardware (H₂ in a minimal basis is two qubits after symmetry reduction). Its exact solution calibrates basis sets; its fine and hyperfine structure defines atomic clocks and spin qubits.',
      points: [
        'Fine structure (spin–orbit + relativistic) splits levels by α² × Rydberg ≈ 10⁻⁴ eV; hyperfine (electron–proton spin) splits the ground state by 5.9 µeV — the 1420 MHz line of radio astronomy and the type of transition used as a hyperfine qubit in ions and neutral atoms.',
        'Rydberg states (n ≈ 50–100) have ⟨r⟩ ∝ n² ≈ 0.1–1 µm and polarisability ∝ n⁷; their van der Waals interaction blockades neighbours within several micrometres, which is the neutral-atom two-qubit gate.',
        'H₂ on a quantum computer: STO-3G basis, 4 spin-orbitals → 4 qubits → 2 after tapering; the VQE energy curve versus bond length reproduces exact diagonalisation to mHa and was the 2017 demonstration that started quantum chemistry on hardware.',
        'Accidental degeneracy in n (SO(4) symmetry of 1/r) is lifted in multi-electron atoms by screening, ordering 2s below 2p and producing the aufbau sequence.',
      ],
      math: ['\\Delta E_{\\text{fs}} \\sim \\alpha^{2}\\cdot 13.6\\ \\text{eV}, \\qquad \\Delta E_{\\text{hf}}(1s) = 5.9\\ \\mu\\text{eV} \\leftrightarrow 1420\\ \\text{MHz}'],
    },
  },
  {
    topic: '06.10', minutes: 8,
    figure: { animation: 'quantum-numbers' },
    kid: {
      intro: 'Every electron in an atom has an address made of four numbers: which floor (energy), which type of room (shape), which room on that floor (orientation), and which bed (spin, up or down). The house rule, found by Wolfgang Pauli, is that no two electrons may share the same full address.',
      points: [
        'Floor n = 1, 2, 3 … Room type ℓ goes from 0 up to n − 1. Room number mℓ runs from −ℓ to +ℓ. Spin is up or down.',
        'Floor 1 has one room with two beds: hydrogen and helium fill it. Floor 2 has four rooms, eight beds: lithium to neon.',
        'Because electrons cannot pile into the lowest room, atoms have size, chemistry has structure, and you cannot walk through walls.',
        'The periodic table is just the house filling up, floor by floor, room by room.',
      ],
    },
    student: {
      intro: 'Hydrogen-like states are labelled by n ≥ 1, ℓ = 0 … n − 1, mℓ = −ℓ … +ℓ, and spin ms = ±½. The Pauli exclusion principle forbids two electrons sharing all four, so a subshell holds 2(2ℓ + 1) electrons and a shell holds 2n². Filling in order of energy gives the periodic table.',
      points: [
        'Capacities: s 2, p 6, d 10, f 14; shells 2, 8, 18, 32. n = 3 has 9 orbitals and 18 electrons; n = 4, ℓ = 3 (4f) holds 14.',
        'Allowed combinations: (3, 2, −1, +½) is a 3d electron; (4, 2, 3, +½) is forbidden because |mℓ| > ℓ; (2, 2, 0, +½) is forbidden because ℓ = n.',
        'Two electrons in one orbital share n, ℓ, mℓ and must differ in ms — paired spins, which is why a filled orbital is non-magnetic.',
        'Exclusion applies to all fermions (half-integer spin); bosons (integer spin, e.g. photons) may share states without limit — the difference between a solid and a laser beam.',
      ],
      math: ['0 \\le \\ell \\le n-1, \\quad -\\ell \\le m_\\ell \\le \\ell, \\quad m_s = \\pm\\tfrac12; \\qquad N_{\\text{subshell}} = 2(2\\ell+1), \\quad N_{\\text{shell}} = 2n^{2}'],
    },
    professional: {
      intro: 'The exclusion principle is antisymmetry of the many-fermion wavefunction under exchange, and it is why electronic structure is hard: the state space is antisymmetrised products (Slater determinants), and mapping that to qubits (Jordan–Wigner, Bravyi–Kitaev) is the first step of every quantum-chemistry algorithm.',
      points: [
        'Antisymmetry ψ(1, 2) = −ψ(2, 1) forces ψ = 0 when two electrons share all quantum numbers — exclusion is a theorem of the symmetry, not an extra rule. Spin-statistics connects it to half-integer spin.',
        'Jordan–Wigner encodes fermionic creation operators as Pauli strings with Z-chains to preserve anticommutation; the chains make some terms O(n)-local, which Bravyi–Kitaev reduces to O(log n). This overhead is a direct cost of the exclusion principle on a qubit device.',
        'Degenerate Fermi gases, white dwarfs and neutron stars are held up by exclusion pressure; metals conduct because only electrons near the Fermi surface have empty states to move into.',
        'Pauli blocking limits spin-qubit readout and initialisation (Pauli spin blockade is in fact the readout mechanism for double-dot spin qubits: a triplet cannot tunnel into a doubly occupied singlet orbital).',
      ],
      math: ['\\psi(\\mathbf{r}_1 s_1, \\mathbf{r}_2 s_2) = -\\psi(\\mathbf{r}_2 s_2, \\mathbf{r}_1 s_1), \\qquad a_j^{\\dagger} \\to \\tfrac12(X_j - iY_j)\\prod_{k<j} Z_k'],
    },
  },
];
