import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 02 — Classical Physics Foundations.
 *
 * The classical ideas quantum mechanics keeps (momentum, energy, phase,
 * superposition) and the ones it replaces (trajectories, continuous energy).
 * The professional tier makes that bridge explicit on every topic.
 */
export const MODULE_02: FoundationLesson[] = [
  {
    topic: '02.01',
    minutes: 7,
    figure: { animation: 'tangent-slope', params: { curve: 'throw' } },
    kid: {
      intro:
        'Motion is just “where is it, and how is that changing?”. Position says where. Velocity says how fast and which way. Acceleration says how quickly the velocity itself is changing.',
      points: [
        'Throw a ball straight up: it goes slower and slower, stops for an instant at the top, then comes down faster and faster.',
        'At the very top its velocity is zero — but its acceleration is not! Gravity is still pulling. That is why it does not stay there.',
        'A speedometer shows speed. Velocity is speed with a direction: 10 m/s up is not the same as 10 m/s down.',
        'On a position–time graph, how steep the line is tells you the velocity. Flat means stopped.',
      ],
    },
    student: {
      intro:
        'Position x(t), velocity v = dx/dt and acceleration a = dv/dt = d²x/dt². With constant acceleration the kinematic equations follow by integrating twice.',
      points: [
        'v = u + at, x = ut + ½at², v² = u² + 2ax — three forms of the same two integrations, written for different unknowns.',
        'A thrown ball x = 4t − t² (suitable units) has v = 4 − 2t, zero at t = 2, and a = −2 throughout. Velocity zero, acceleration not — at the turning point.',
        'Slope of x–t is v; slope of v–t is a; area under v–t is displacement. The graphs carry the same information as the equations.',
        'In two dimensions treat x and y separately. A projectile accelerates only vertically; its horizontal velocity is constant.',
      ],
      math: [
        'v = \\frac{dx}{dt}, \\qquad a = \\frac{dv}{dt} = \\frac{d^{2}x}{dt^{2}}',
        'x = ut + \\tfrac12 a t^{2}, \\qquad v^{2} = u^{2} + 2ax',
      ],
    },
    professional: {
      intro:
        'Classical kinematics is the limit quantum mechanics must reproduce for heavy, warm, large objects — and the vocabulary (position, momentum, trajectory) that quantum mechanics then has to give up.',
      points: [
        'Ehrenfest’s theorem: expectation values obey Newton’s laws, d⟨x⟩/dt = ⟨p⟩/m and d⟨p⟩/dt = −⟨dV/dx⟩. The centre of a wave packet moves classically; the packet itself spreads.',
        'There is no quantum trajectory: a particle has no simultaneously sharp x(t) and v(t). The double-slit experiment is precisely the failure of “which path did it take”.',
        'Trapped-ion qubits are literally oscillating charged particles; their motional states are quantised harmonic-oscillator levels, and two-qubit gates are driven by coupling spin to that motion.',
        'Timing in control electronics is kinematics in disguise: a 20 ns gate on a 5 GHz qubit is 100 cycles, and 100 ps of jitter is a phase error of π/10.',
      ],
      math: ['\\frac{d\\langle x\\rangle}{dt} = \\frac{\\langle p\\rangle}{m}, \\qquad \\frac{d\\langle p\\rangle}{dt} = -\\left\\langle \\frac{dV}{dx}\\right\\rangle'],
    },
  },
  {
    topic: '02.02',
    minutes: 7,
    figure: { animation: 'newton-cart', params: { mass: 2, force: 4 } },
    kid: {
      intro:
        'Push a shopping trolley and it starts to move; push harder and it speeds up faster; load it full and the same push does less. That is Newton’s second law, and it runs the whole world of everyday things.',
      points: [
        'First law: things keep doing what they are doing unless something pushes. A rolling ball on perfect ice would roll forever.',
        'Second law: push harder, speed up faster; make it heavier, speed up slower. Force = mass × acceleration.',
        'Momentum is “how hard it would be to stop”: mass times velocity. A slow lorry and a fast bicycle can have the same momentum.',
        'Third law: pushes come in pairs. When you push the wall, the wall pushes you back just as hard — which is why you roll away on a skateboard.',
      ],
    },
    student: {
      intro:
        'Momentum p = mv; Newton’s second law in general form is F = dp/dt, which reduces to F = ma for constant mass. Momentum is conserved when no external force acts.',
      points: [
        'F = 4 N on m = 2 kg gives a = 2 m s⁻²; after 2 s the velocity is 4 m s⁻¹ and the momentum 8 kg m s⁻¹.',
        'Impulse: FΔt = Δp. A long gentle push and a short hard one can deliver the same momentum change — airbags lengthen Δt to lower F.',
        'Conservation: in a collision with no external force, total momentum before equals total momentum after, even when kinetic energy is lost.',
        'Third-law pairs act on different bodies. The force on the cart and the force on the pusher are equal and opposite, but only one of them accelerates the cart.',
      ],
      math: [
        'p = mv, \\qquad F = \\frac{dp}{dt} = ma',
        'F\\,\\Delta t = \\Delta p, \\qquad \\sum p_{\\text{before}} = \\sum p_{\\text{after}}',
      ],
    },
    professional: {
      intro:
        'Momentum survives the transition to quantum mechanics intact — as a conserved quantity and as an operator; force does not. The Compton effect is momentum conservation applied to a photon, and the de Broglie relation is momentum given a wavelength.',
      points: [
        'Photons carry momentum p = h/λ despite having no mass; a 500 nm photon has p = 1.33 × 10⁻²⁷ kg m s⁻¹, which is what radiation pressure and Compton scattering measure.',
        'The momentum operator is p̂ = −iħ ∂/∂x; its eigenstates are plane waves e^{ikx} with p = ħk. A state of definite momentum has no definite position — the uncertainty principle begins here.',
        'Conservation laws come from symmetries (Noether): momentum from translation invariance, which holds exactly in quantum mechanics, so momentum conservation is exact even where trajectories are not.',
        'Engineering: photon recoil cools atoms (Doppler cooling) and kicks trapped ions; the kick from one scattered photon is tiny, but a million per second add up to a usable force.',
      ],
      math: ['p = \\frac{h}{\\lambda} = \\hbar k, \\qquad \\hat p = -i\\hbar\\frac{\\partial}{\\partial x}'],
    },
  },
  {
    topic: '02.03',
    minutes: 7,
    figure: { animation: 'energy-conservation' },
    kid: {
      intro:
        'Energy is the stuff that makes things happen, and the big rule is that it never disappears — it only changes form. A swing at the top has “stored” energy; at the bottom it has turned into “moving” energy.',
      points: [
        'Lift something up and you give it stored energy (potential). Let it fall and that turns into moving energy (kinetic).',
        'At the top of a swing you are still but high; at the bottom you are low but fast. Add the two kinds together and you always get the same total.',
        'Work is energy you put in by pushing something along: push harder or push further and you do more work.',
        'Friction turns moving energy into heat. The energy is not lost — it has just gone somewhere you cannot easily get it back from.',
      ],
    },
    student: {
      intro:
        'Work W = F·d transfers energy; kinetic energy K = ½mv²; gravitational potential energy U = mgh near the surface. In a closed system without friction, K + U is constant.',
      points: [
        'A pendulum released from angle θ₀ has U = mgL(1 − cos θ) and K = mgL(cos θ − cos θ₀); their sum is mgL(1 − cos θ₀) at every instant.',
        'Work–energy theorem: net work done on a body equals its change in kinetic energy. Lifting at constant speed does work against gravity and stores it as U.',
        'Power is energy per time, P = W/t = Fv. A 60 W bulb converts 60 J every second.',
        'Electronvolts: 1 eV = 1.602 × 10⁻¹⁹ J is the energy an electron gains across 1 V. A stopping potential of 1.8 V means Kₘₐₓ = 1.8 eV = 2.88 × 10⁻¹⁹ J.',
      ],
      math: [
        'W = F d, \\qquad K = \\tfrac12 m v^{2}, \\qquad U = mgh',
        'K + U = \\text{const} \\quad (\\text{no friction})',
      ],
    },
    professional: {
      intro:
        'Energy is the central observable of quantum mechanics: the Hamiltonian generates time evolution, its eigenvalues are the allowed energies, and its conservation is time-translation symmetry. Spectral lines and qubit frequencies are both energy differences.',
      points: [
        'Bound systems have discrete energies; a transition emits a photon of exactly the gap, hν = E₂ − E₁. The 10.2 eV Lyman-α line is energy conservation for one electron.',
        'A qubit is a two-level system with splitting ħω₀₁ ≈ 20 µeV for a 5 GHz transmon. kT at 15 mK is ≈ 1.3 µeV, which is why the fridge is cold: thermal energy must sit well below the gap.',
        'Energy is conserved under unitary evolution (⟨H⟩ constant when H is time-independent), but a driven qubit exchanges energy with the drive field — Rabi oscillations are energy sloshing between qubit and control line.',
        'Dissipation (T₁) is energy leaving to an environment you do not model; it is why “closed system” is an idealisation and error correction exists.',
      ],
      math: ['h\\nu = E_{2} - E_{1}, \\qquad \\frac{d\\langle H\\rangle}{dt} = 0 \\ \\text{ for } \\partial_t H = 0'],
    },
  },
  {
    topic: '02.04',
    minutes: 8,
    figure: { animation: 'electric-field' },
    kid: {
      intro:
        'Rub a balloon on your hair and it sticks to the wall — that is electric charge at work. Charges push and pull on each other without touching, and the “field” is the map of those pushes.',
      points: [
        'There are two kinds of charge, plus and minus. Same kinds push apart; opposite kinds pull together.',
        'Put a tiny plus charge anywhere near a big plus charge and it gets pushed away. The arrows on the map show which way and how hard.',
        'Potential is like height for charges: a plus charge “rolls downhill” from high potential (near plus) to low potential (near minus).',
        'Electricity in a wire is charges rolling downhill through the metal. A battery is a pump that keeps lifting them back up.',
      ],
    },
    student: {
      intro:
        'Coulomb’s law gives the force between point charges; the field E = F/q is the force per unit test charge; the potential V is energy per unit charge, with E = −dV/dx. Field lines run from positive to negative charge.',
      points: [
        'F = k q₁q₂/r²: inverse square, attractive for opposite signs, with k = 1/(4πε₀) ≈ 9 × 10⁹ N m² C⁻².',
        'The field of several charges is the vector sum of each one’s field — superposition. The arrows in the figure are computed exactly that way.',
        'Potential difference does work: W = qΔV. An electron crossing 1 V gains 1 eV; a stopping potential V₀ turns back electrons with K ≤ eV₀.',
        'Equipotentials are perpendicular to field lines; no work is done moving along one.',
      ],
      math: [
        'F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^{2}}, \\qquad \\vec E = \\frac{\\vec F}{q}',
        'E_x = -\\frac{dV}{dx}, \\qquad W = q\\,\\Delta V',
      ],
    },
    professional: {
      intro:
        'Charge and its potential energy hold atoms together and are what you control in most qubit hardware. The Coulomb potential is the Hamiltonian of hydrogen; gate voltages are potentials that trap, shuttle and couple charges.',
      points: [
        'Hydrogen’s levels, −13.6 eV/n², are the eigenvalues of kinetic energy plus the Coulomb potential. Change the potential and the spectrum changes — that is spectroscopy as chemistry.',
        'Trapped-ion qubits sit in an oscillating electric potential (Paul trap); superconducting qubits are LC circuits whose charge and flux are conjugate quantum variables.',
        'Charge noise — stray fields from fluctuating defects — is a leading dephasing mechanism in semiconductor spin qubits; the transmon design deliberately makes the qubit frequency flat against charge offset.',
        'Field superposition is linear, which is why fields can be summed; state space is linear for the same deep reason, and “superposition” in both senses is the same word.',
      ],
      math: ['V(r) = -\\frac{e^{2}}{4\\pi\\varepsilon_0 r}, \\qquad E_n = -\\frac{13.6\\ \\text{eV}}{n^{2}}'],
    },
  },
  {
    topic: '02.05',
    minutes: 8,
    figure: { animation: 'induction' },
    kid: {
      intro:
        'A magnet can push a compass needle around without touching it. Even better: move a magnet near a coil of wire and electricity appears in the wire — but only while the magnet is moving. That trick runs every power station.',
      points: [
        'Push the magnet into the coil: the meter flicks one way. Pull it out: it flicks the other way. Hold it still: nothing.',
        'It is the change that matters, not the magnet. A strong magnet sitting still makes no current at all.',
        'A generator is just a coil spun near a magnet so the field through it keeps changing — forever, as long as you keep spinning.',
        'Electric motors are the same idea backwards: current through a coil in a magnetic field makes it move.',
      ],
    },
    student: {
      intro:
        'A current or a moving charge produces a magnetic field; a changing magnetic flux through a loop induces an emf, ε = −dΦ/dt (Faraday). The minus sign is Lenz’s law: the induced current opposes the change that made it.',
      points: [
        'Flux Φ = BA cos θ: field strength, loop area and orientation. Any of the three changing induces an emf.',
        'Faster motion means larger dΦ/dt and larger emf; the meter reads the rate of change, which is why it is silent when the magnet is still.',
        'Lorentz force on a moving charge: F = qv × B, perpendicular to both, so a magnetic field changes direction but never speed — it does no work.',
        'Electromagnetic waves are the two fields regenerating each other: a changing E makes B, a changing B makes E, and the pair travels at c.',
      ],
      math: [
        '\\varepsilon = -\\frac{d\\Phi}{dt}, \\qquad \\Phi = B A \\cos\\theta',
        '\\vec F = q\\,\\vec v \\times \\vec B',
      ],
    },
    professional: {
      intro:
        'Magnetism is where spin enters physics: the electron’s intrinsic magnetic moment is what Stern–Gerlach sorts, what NMR and spin qubits drive, and what superconducting qubits are tuned and read out with.',
      points: [
        'A magnetic moment μ in a field B has energy −μ·B; for a spin-½ the two orientations are split by ΔE = gμ_B B — the Zeeman splitting that sets a spin qubit’s frequency (≈ 28 GHz per tesla for a free electron).',
        'Flux quantisation: through a superconducting loop the flux comes in units of Φ₀ = h/2e ≈ 2.07 × 10⁻¹⁵ Wb. Tunable transmons are tuned by threading a fraction of Φ₀ through a SQUID loop.',
        'Induction is the control backbone: microwave pulses couple to the qubit inductively or capacitively; flux noise (≈ 1 µΦ₀/√Hz) is a dephasing source engineers fight.',
        'Faraday’s law in quantum form: flux through a loop shifts the phase of a charged particle’s wavefunction even where the field is zero — the Aharonov–Bohm effect, a phase you can only see by interference.',
      ],
      math: ['\\Delta E = g\\,\\mu_B B, \\qquad \\Phi_0 = \\frac{h}{2e}'],
    },
  },
  {
    topic: '02.06',
    minutes: 8,
    figure: { animation: 'shm-restoring', params: { trace: true } },
    kid: {
      intro:
        'A swing, a bouncing spring, a plucked guitar string: all of them go back and forth around a middle point. The rule they share is simple — the further you are from the middle, the harder you get pulled back.',
      points: [
        'Pull a spring to one side and let go: it rushes to the middle, overshoots, slows, stops, and comes back. Over and over.',
        'Period is how long one full back-and-forth takes. Frequency is how many you get per second — the same fact upside down.',
        'At the ends you are still for an instant; through the middle you are fastest. Where you are still, the pull is strongest.',
        'Release from one side, and a quarter of a cycle later you pass through the middle. Half a cycle later you are at the far side.',
      ],
    },
    student: {
      intro:
        'Simple harmonic motion is motion under a restoring force proportional to displacement: a = −ω²x. Solutions are x = A cos(ωt + φ) with period T = 2π/ω and frequency f = 1/T.',
      points: [
        'Spring: F = −kx gives ω = √(k/m). Pendulum (small angles): ω = √(g/L). Neither depends on amplitude — that is what makes clocks possible.',
        'Released from x = A at rest, x = A cos ωt: a quarter period later cos(π/2) = 0 and the mass passes through equilibrium at maximum speed ωA.',
        'T = 0.020 s is f = 50 Hz; 5 cycles in 2.0 s is 2.5 Hz; 4.0 Hz for 2.5 s is 10 cycles. Period, frequency and count are one relation three ways.',
        'Energy sloshes between kinetic (greatest at the centre) and potential (greatest at the ends); the total is ½kA² — amplitude squared, which is why intensity goes as amplitude squared.',
      ],
      math: [
        'a = -\\omega^{2}x, \\qquad x = A\\cos(\\omega t + \\varphi), \\qquad T = \\frac{2\\pi}{\\omega} = \\frac{1}{f}',
        '\\omega = \\sqrt{k/m}, \\qquad E = \\tfrac12 k A^{2}',
      ],
    },
    professional: {
      intro:
        'The harmonic oscillator is the most important system in quantum physics: exactly solvable, levels equally spaced by ħω, and every field mode — light, phonons, microwave resonators — is one. “A photon” is one quantum of excitation of a harmonic oscillator.',
      points: [
        'Quantised: Eₙ = ħω(n + ½). The zero-point energy ½ħω is real and measurable; it is why a trapped ion cannot be stopped completely, only cooled to n ≈ 0.',
        'Superconducting qubits are anharmonic on purpose: a transmon’s levels are unequally spaced (anharmonicity ≈ −200 MHz) so a drive at ω₀₁ does not also drive 1 → 2. A pure harmonic oscillator cannot be a qubit.',
        'Readout resonators are harmonic oscillators coupled to the qubit; their frequency shifts by the dispersive shift χ depending on the qubit state, and that shift is what you measure.',
        'Classical SHM amplitude ↔ quantum coherent state: a driven oscillator in a coherent state has ⟨x⟩ following A cos ωt exactly, with Poissonian photon number — the correspondence principle in its cleanest form.',
      ],
      math: ['E_n = \\hbar\\omega\\left(n + \\tfrac12\\right), \\qquad H = \\hbar\\omega\\left(a^{\\dagger}a + \\tfrac12\\right)'],
    },
  },
  {
    topic: '02.07',
    minutes: 7,
    figure: { animation: 'wave-speed', params: { f: 20, lambda: 0.5, ask: 'v' } },
    kid: {
      intro:
        'Watch ripples on a pond. How tall they are is the amplitude. How far apart the ripples are is the wavelength. How many pass a floating leaf each second is the frequency. Those three numbers describe every wave.',
      points: [
        'Amplitude: big waves, loud sounds, bright light. Small amplitude: quiet, dim.',
        'Wavelength: the distance from one crest to the next. Long for radio, tiny for X-rays.',
        'Frequency: how many crests pass per second. High for a whistle, low for a drum.',
        'Speed = how far one crest travels per second = one wavelength per cycle × cycles per second. Twenty crests a second, each half a metre apart, is ten metres a second.',
      ],
    },
    student: {
      intro:
        'A travelling wave y(x, t) = A sin(kx − ωt) is fixed by amplitude A, wavelength λ = 2π/k and frequency f = ω/2π. Its speed is v = fλ: one wavelength advances every period.',
      points: [
        'v = fλ: 20 Hz × 0.50 m = 10 m s⁻¹; λ = v/f: 240 m s⁻¹ ÷ 80 Hz = 3.0 m. For light v = c, so λ and f are tied: f = c/λ.',
        'Period T = 1/f. A 50 Hz wave at 20 m s⁻¹ has λ = 0.40 m; points 0.10 m apart are a quarter wavelength, π/2 rad apart.',
        'Amplitude and intensity: intensity ∝ A². Doubling the amplitude quadruples the energy delivered.',
        'Frequency is set by the source and does not change when a wave enters a new medium; speed and wavelength change together.',
      ],
      math: [
        'y(x,t) = A\\sin(kx - \\omega t), \\qquad k = \\frac{2\\pi}{\\lambda}, \\quad \\omega = 2\\pi f',
        'v = f\\lambda, \\qquad I \\propto A^{2}',
      ],
    },
    professional: {
      intro:
        'In quantum mechanics the wave quantities are particle quantities in disguise: wavelength is momentum (p = h/λ = ħk), frequency is energy (E = hf = ħω), and amplitude squared is probability density. The vocabulary carries over; the interpretation changes.',
      points: [
        'De Broglie: λ = h/p. An electron at 3 × 10⁻²⁴ kg m s⁻¹ has λ = 2.21 × 10⁻¹⁰ m — atomic scale, hence electron diffraction from crystals.',
        'Phase velocity ω/k and group velocity dω/dk differ for matter waves (ω ∝ k²); a wave packet moves at the group velocity, which equals the classical particle velocity p/m.',
        'Intensity ∝ |amplitude|² becomes the Born rule. For a classical field it is energy density; for a single particle it is where you will find it.',
        'Qubit control pulses are waves too: a 5 GHz drive with a 20 ns Gaussian envelope has a bandwidth of ≈ 50 MHz, which must stay clear of the 1 → 2 transition — the anharmonicity budget is a wave-quantities calculation.',
      ],
      math: ['\\lambda = \\frac{h}{p}, \\qquad E = hf = \\hbar\\omega, \\qquad v_g = \\frac{d\\omega}{dk}'],
    },
  },
  {
    topic: '02.08',
    minutes: 8,
    figure: { animation: 'wave-cancellation' },
    kid: {
      intro:
        'Drop two stones in a pond and the ripples cross. Where crest meets crest the water leaps higher; where crest meets trough it goes flat. The waves add up point by point — that adding is called superposition.',
      points: [
        'Two equal waves in step: twice as tall. Two equal waves exactly out of step: nothing at all. In between: something in between.',
        'At one spot, if one wave is pushing up by 2 and the other down by 1.5, the water is up by 0.5. Just add, minus signs and all.',
        'Noise-cancelling headphones make a sound that is the exact opposite of the noise, so the two add to silence.',
        'Light does this too: two slits make bright and dark stripes on a screen. The dark stripes are where light plus light gives no light.',
      ],
    },
    student: {
      intro:
        'The principle of superposition: where waves overlap, the resultant displacement is the algebraic sum of the individual displacements. Interference is the pattern that sum produces when the waves keep a fixed phase relationship.',
      points: [
        'Equal amplitudes A: in phase → 2A (constructive); phase difference π → 0 (destructive); general φ → resultant 2A cos(φ/2).',
        'Maximum destructive interference at φ = (2k + 1)π, maximum constructive at 2kπ. Path difference d gives φ = 2πd/λ, so dark fringes at d = (k + ½)λ.',
        'Displacements +2.0 cm and −1.5 cm at a point sum to +0.5 cm whatever the amplitudes; the sum is instant by instant.',
        'Intensity ∝ (resultant amplitude)², so bright fringes are 4× one wave’s intensity, not 2× — energy is redistributed, not created.',
      ],
      math: [
        'y = y_1 + y_2, \\qquad A_{\\text{res}} = 2A\\cos\\left(\\tfrac{\\varphi}{2}\\right)',
        '\\varphi = (2k+1)\\pi \\Rightarrow A_{\\text{res}} = 0; \\qquad \\varphi = 2k\\pi \\Rightarrow A_{\\text{res}} = 2A',
      ],
    },
    professional: {
      intro:
        'Quantum mechanics is a theory of superposed amplitudes, and interference is its only non-classical signature. Every quantum algorithm is an interference experiment arranged so that wrong answers cancel and right answers reinforce.',
      points: [
        'Amplitudes add before squaring: |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁*ψ₂). The cross term is the interference; with ψ₂ = −ψ₁ the probability is exactly zero.',
        'Which-path information kills it: if the alternatives are distinguishable the cross term vanishes and probabilities add classically. Decoherence is the environment acquiring which-path information.',
        'H then H returns |0⟩ with certainty because the two paths to |1⟩ carry amplitudes +½ and −½ and cancel. Insert a Z between them and the cancellation moves to |0⟩. That is a two-path interferometer in gate language.',
        'Grover’s amplitude amplification and the QFT are engineered interference: phases are arranged so that O(√N) iterations constructively build the marked amplitude while the rest washes out.',
      ],
      math: [
        '|\\psi_1 + \\psi_2|^{2} = |\\psi_1|^{2} + |\\psi_2|^{2} + 2\\,\\mathrm{Re}(\\psi_1^{*}\\psi_2)',
        'HH\\ket{0} = \\ket{0}, \\qquad HZH\\ket{0} = \\ket{1}',
      ],
    },
  },
  {
    topic: '02.09',
    minutes: 7,
    figure: { animation: 'em-spectrum' },
    kid: {
      intro:
        'Light is a wave of electricity and magnetism travelling through empty space, incredibly fast. Radio, microwaves, the warmth of a fire, the colours you see, X-rays — they are all the same kind of wave, just with different wavelengths.',
      points: [
        'All of them travel at the same speed: 300,000 km every second. Light from the Sun takes eight minutes to reach you.',
        'Long wavelengths (radio) carry little energy per wave; short wavelengths (X-rays, gamma) carry a lot. That is why sunburn comes from ultraviolet, not from red light.',
        'Your eyes only see a tiny slice — from red (long) to violet (short). Bees see further into ultraviolet; snakes sense infrared.',
        'A microwave oven, a phone, a TV remote and a hospital scanner all use the same family of waves at different places on the line.',
      ],
    },
    student: {
      intro:
        'Electromagnetic waves are coupled oscillating electric and magnetic fields propagating at c = 3.0 × 10⁸ m s⁻¹ in vacuum. The spectrum is ordered by wavelength — equivalently frequency, f = c/λ — from radio through visible to gamma.',
      points: [
        'f = c/λ: a 500 nm green photon has f = 6 × 10¹⁴ Hz; a 1 m radio wave has 300 MHz. Visible light spans roughly 400–700 nm.',
        'Photon energy E = hf = hc/λ = 1240 eV nm / λ: 2.5 eV for green, 10 eV for UV, keV for X-rays. Chemistry happens at eV, which is why UV breaks bonds and radio does not.',
        'The spectrum is continuous but named in bands by how the waves are made and detected, not by any physical boundary.',
        'Blackbody radiation is thermal emission across the spectrum; the peak wavelength shifts shorter as temperature rises (Wien: λ_peak T = 2.90 × 10⁻³ m K).',
      ],
      math: [
        'c = f\\lambda, \\qquad E = hf = \\frac{hc}{\\lambda}',
        '\\lambda_{\\text{peak}}\\,T = 2.90\\times10^{-3}\\ \\text{m K}',
      ],
    },
    professional: {
      intro:
        'The EM spectrum is the toolkit of quantum hardware: microwaves drive superconducting qubits, optical and UV lasers drive ions and neutral atoms, infrared carries photonic qubits through fibre. Choosing a platform is choosing a band.',
      points: [
        'Superconducting qubits live at 4–8 GHz (λ ≈ 5 cm, photon energy ≈ 20 µeV); they must be colder than that energy, hence dilution refrigerators at 15 mK (kT ≈ 1.3 µeV).',
        'Trapped-ion and neutral-atom qubits use optical transitions at 10¹⁴–10¹⁵ Hz; the 729 nm clock transition in ⁴⁰Ca⁺ has a linewidth below 1 Hz, which is why ions make the most precise clocks and gates.',
        'Photonic qubits ride at telecom 1550 nm where fibre loss is 0.2 dB/km; quantum networking is the problem of converting between bands without destroying the state (transduction).',
        'Room-temperature blackbody radiation peaks at 10 µm, in the infrared, and its microwave tail is why a warm cable into a fridge is a photon source that depolarises qubits.',
      ],
      math: ['E_{\\gamma} = \\frac{1240\\ \\text{eV nm}}{\\lambda}, \\qquad kT_{300\\,\\text{K}} \\approx 26\\ \\text{meV}, \\quad kT_{15\\,\\text{mK}} \\approx 1.3\\ \\mu\\text{eV}'],
    },
  },
  {
    topic: '02.10',
    minutes: 6,
    figure: { animation: 'scale-ladder' },
    kid: {
      intro:
        'Everything is made of atoms, and atoms are unbelievably small — a hundred million of them in a line would stretch one centimetre. Inside each one, almost all the stuff is squeezed into a nucleus a hundred thousand times smaller still.',
      points: [
        'If an atom were as big as a football stadium, the nucleus would be a pea on the centre spot. The rest is nearly empty.',
        'Electrons buzz around the outside. They are what touch, bond and make chemistry; the nucleus mostly just sits there being heavy.',
        'Going down the sizes: you (1 m), a cell (ten thousand times smaller), a molecule (another ten thousand), an atom, then a huge jump down to the nucleus.',
        'At these sizes the everyday rules stop working — that is where quantum physics begins.',
      ],
    },
    student: {
      intro:
        'Atoms are ≈ 10⁻¹⁰ m (1 Å) across; nuclei ≈ 10⁻¹⁵–10⁻¹⁴ m (1–10 fm). Mass is concentrated in the nucleus (protons and neutrons, ≈ 1836 electron masses each); the electrons determine size and chemistry.',
      points: [
        'Scientific notation is unavoidable here: an atom is 10⁵ nuclear diameters wide, so by volume it is 10¹⁵ times mostly empty.',
        'Rutherford’s scattering of alpha particles from gold foil found the nucleus: most passed straight through, a few bounced back, which only a tiny dense core explains.',
        'Atomic spacing in solids is a few Å, matching the de Broglie wavelength of ≈ 100 eV electrons — the reason electron diffraction works and the first proof of matter waves.',
        'Energy scales: electron binding in atoms is eV; nuclear binding is MeV, a million times more, which is why chemistry and nuclear power differ by that factor.',
      ],
      math: [
        'r_{\\text{atom}} \\sim 10^{-10}\\ \\text{m}, \\qquad r_{\\text{nucleus}} \\sim 10^{-15}\\ \\text{m}',
        '\\frac{1.2\\times10^{-8}\\ \\text{m}}{3.0\\times10^{-9}\\ \\text{m}} = 4',
      ],
    },
    professional: {
      intro:
        'Scale is why quantum mechanics is needed at all: at 10⁻¹⁰ m the de Broglie wavelength of an electron is the size of its container, and wave behaviour cannot be ignored. The scales also set what qubits can be made of.',
      points: [
        'The Bohr radius a₀ = 0.529 Å comes out of ħ, mₑ and e alone — the atom’s size is a quantum quantity with no classical analogue. Classical physics gives atoms no reason to be any particular size.',
        'Qubit candidates span the ladder: nuclear spins (10⁻¹⁵ m, coherence seconds to hours), electron spins in quantum dots (10⁻⁸ m), trapped ions (10⁻¹⁰ m atoms in 10⁻³ m traps), transmons (10⁻⁴ m circuits where 10¹⁰ Cooper pairs behave as one quantum object).',
        'Decoherence scales with size: a transmon’s macroscopic wavefunction couples to many environmental modes; a nuclear spin couples to almost nothing. The engineering trade is isolation against controllability.',
        'Dimensionless ratios are the stable facts: the fine-structure constant α ≈ 1/137 sets atomic sizes and speeds, and 13.6 eV / 511 keV ≈ α²/2 is why atomic physics is non-relativistic.',
      ],
      math: [
        'a_0 = \\frac{4\\pi\\varepsilon_0\\hbar^{2}}{m_e e^{2}} = 0.529\\times10^{-10}\\ \\text{m}, \\qquad \\alpha = \\frac{e^{2}}{4\\pi\\varepsilon_0\\hbar c} \\approx \\frac{1}{137}',
      ],
    },
  },
];
