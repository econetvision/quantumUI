import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 03 — Birth of Quantum Physics.
 *
 * The experiments, in the order the syllabus runs them. Numbers quoted in the
 * tiers (2.43 pm, 121.6 nm, 0.167 nm) were cross-checked against the
 * physics module and Wolfram while this file was written.
 */
export const MODULE_03: FoundationLesson[] = [
  {
    topic: '03.01', minutes: 6,
    figure: { animation: 'blackbody-curves', params: { classical: true } },
    kid: {
      intro: 'By 1900 physicists thought they had nearly finished. Then a few stubborn experiments refused to fit — hot things glowed the wrong colour, light knocked electrons out of metal in the wrong way, and atoms did not collapse when they should have.',
      points: [
        'A hot poker glows red, then orange, then white. The old rules said it should also blast out deadly ultraviolet and X-rays. It does not.',
        'The old rules said an atom should collapse in a flash. Atoms have lasted billions of years.',
        'Shine light on metal and electrons pop out — but only if the light is the right colour, however bright a wrong-colour lamp is.',
        'Each puzzle on its own could be ignored. Together they meant the rules were wrong at small sizes.',
      ],
    },
    student: {
      intro: 'Three failures of classical physics set up the quantum revolution: the ultraviolet catastrophe in blackbody radiation, the frequency dependence of the photoelectric effect, and the stability and line spectra of atoms. Each contradicted a well-tested classical prediction.',
      points: [
        'Rayleigh–Jeans: equipartition gives each mode kT, and modes multiply as 1/λ⁴, so predicted intensity diverges at short λ. Measured curves peak and fall.',
        'Photoelectric: classically, energy absorbed grows with intensity and emission should occur at any frequency after a delay. Instead there is a sharp threshold frequency and no delay.',
        'Atoms: an orbiting electron radiates (Larmor) and should spiral in within ~10⁻¹¹ s, emitting a continuous spectrum. Atoms are stable and emit discrete lines.',
        'Compton scattering (1923) added a fourth: X-rays scatter with a wavelength shift that depends on angle, as if colliding like particles.',
      ],
      math: ['I_{\\text{RJ}}(\\lambda, T) = \\frac{2ckT}{\\lambda^{4}} \\to \\infty \\ \\text{as } \\lambda \\to 0'],
    },
    professional: {
      intro: 'The classical failures were not small corrections; they were divergences and qualitative contradictions. That matters for how you think about quantum computing today: the theory that replaced them has never been found wrong at any energy scale tested, which is why we trust it enough to build machines on it.',
      points: [
        'Each failure is an infinity or a sharp edge: a divergent integral (UV catastrophe), a step function (threshold), a lifetime of 10⁻¹¹ s against 10¹⁷ s. Quantum mechanics fixes all four with one constant, h.',
        'The same equipartition argument that fails for radiation fails for solids at low temperature (Dulong–Petit → Einstein/Debye heat capacity), which is why cryogenic qubit hardware has such small heat capacity and cools so slowly.',
        'Historically the resolution came in pieces (Planck 1900, Einstein 1905, Bohr 1913, de Broglie 1924, Heisenberg/Schrödinger 1925–26); the formal framework in Module 05 is the consolidated version.',
        'Practical reading: when a model predicts an infinity, the model is missing a scale. For radiation the missing scale was h; for qubit control, the analogous mistake is treating a transmon as a harmonic oscillator and ignoring the anharmonicity scale.',
      ],
      math: ['\\tau_{\\text{classical}} \\sim \\frac{a_0^{3} m_e^{2} c^{3}}{e^{4}} \\cdot 4\\pi\\varepsilon_0^{2} \\approx 10^{-11}\\ \\text{s} \\ \\ \\text{vs. observed stability}'],
    },
  },
  {
    topic: '03.02', minutes: 7,
    figure: { animation: 'blackbody-curves' },
    kid: {
      intro: 'Everything warm glows. You glow in infrared; a toaster glows red; the Sun glows white; a welding arc glows blue. The hotter it is, the brighter and bluer the glow — and the exact shape of that glow was the first thing classical physics could not explain.',
      points: [
        'Heat something and it gives off light of many colours at once, spread in a hump. The hump has a peak colour.',
        'Hotter means the whole hump rises and the peak slides toward blue. That is why a dim ember is red and a bright star is white.',
        'The hump always falls to nothing at the blue end. The old theory said it should shoot up forever there.',
        'Max Planck found a formula that fit the hump perfectly — by assuming light came in little packets.',
      ],
    },
    student: {
      intro: 'A blackbody absorbs all radiation falling on it and emits a thermal spectrum that depends only on temperature. Planck’s law gives the spectral radiance; Wien’s law places its peak; Stefan–Boltzmann gives the total power.',
      points: [
        'Wien: λ_peak T = 2.90 × 10⁻³ m K. The Sun at 5800 K peaks near 500 nm; a 300 K body peaks near 10 µm in the infrared.',
        'Stefan–Boltzmann: total emitted power per area P = σT⁴. Doubling the temperature gives sixteen times the power.',
        'A hotter curve lies above a cooler one at every wavelength and peaks at shorter wavelength — the figure plots both from Planck’s formula.',
        'Planck’s law reduces to Rayleigh–Jeans at long λ and to Wien’s exponential at short λ; the exponential cut-off is where the quantum lives.',
      ],
      math: [
        'B(\\lambda, T) = \\frac{2hc^{2}}{\\lambda^{5}}\\,\\frac{1}{e^{hc/\\lambda k T} - 1}',
        '\\lambda_{\\text{peak}}T = 2.90\\times10^{-3}\\ \\text{m K}, \\qquad P = \\sigma T^{4}',
      ],
    },
    professional: {
      intro: 'Blackbody radiation is the thermal state of the electromagnetic field, and the Planck distribution is the Bose–Einstein occupation of each mode. For a qubit engineer it is the noise floor: every warm surface in the line of sight is a photon source.',
      points: [
        'Mean photon number per mode n̄ = 1/(e^{ħω/kT} − 1). At 5 GHz and 15 mK, ħω/kT ≈ 16 and n̄ ≈ 10⁻⁷; at 4 K, n̄ ≈ 16. That ratio is why the qubit stage, not the 4 K stage, hosts the processor.',
        'Thermal photons leaking down coax lines excite qubits (residual |1⟩ population ~1%) and dephase them; attenuators and filters at each stage thermalise the line to the stage temperature.',
        'Cosmic microwave background is a 2.725 K blackbody to one part in 10⁵ — the best blackbody ever measured, and a reminder that Planck’s law is exact, not a fit.',
        'The Planck spectrum’s exponential tail is the entire reason cryogenics works: cooling by a factor of 300 suppresses occupation at the qubit frequency by e^{−16}, not by a factor of 300.',
      ],
      math: ['\\bar n(\\omega, T) = \\frac{1}{e^{\\hbar\\omega/kT} - 1}, \\qquad \\bar n(5\\,\\text{GHz}, 15\\,\\text{mK}) \\approx 10^{-7}'],
    },
  },
  {
    topic: '03.03', minutes: 6,
    figure: { animation: 'planck-quanta' },
    kid: {
      intro: 'Planck’s trick was to say that light energy cannot come in any amount you like. It comes in packets, and the size of a packet depends on the colour: tiny packets for red, big packets for blue, enormous for ultraviolet.',
      points: [
        'Imagine paying for light in coins. Red light uses pennies; blue uses pounds; ultraviolet uses fifty-pound notes.',
        'A warm object has a small energy budget per “slot”. It can easily afford pennies, sometimes pounds, almost never fifty-pound notes.',
        'That is why the glow fades at the blue end instead of exploding — the big packets are simply too expensive.',
        'Planck himself thought it was just a maths trick. Five years later Einstein said the packets were real.',
      ],
    },
    student: {
      intro: 'Planck proposed that an oscillator of frequency ν exchanges energy only in integer multiples of a quantum E = hν, with h = 6.63 × 10⁻³⁴ J s. Averaging over a Boltzmann distribution of these discrete levels gives his radiation law.',
      points: [
        'Classical average energy per mode: kT, independent of frequency. Quantum average: hν/(e^{hν/kT} − 1), which → kT for hν ≪ kT and → 0 exponentially for hν ≫ kT.',
        'High-frequency modes are “frozen out”: the first rung hν is above the thermal budget, so they hold almost no energy. That removes the ultraviolet catastrophe.',
        'The same freezing-out explains why diatomic gases have heat capacity 5/2 R rather than 7/2 R at room temperature: the vibrational quantum is too large to excite.',
        'h sets the scale of all quantum effects. ħ = h/2π = 1.055 × 10⁻³⁴ J s appears in the uncertainty principle and the Schrödinger equation.',
      ],
      math: [
        'E_n = n h\\nu, \\qquad \\langle E\\rangle = \\frac{h\\nu}{e^{h\\nu/kT} - 1}',
        'h\\nu \\ll kT: \\ \\langle E\\rangle \\to kT; \\qquad h\\nu \\gg kT: \\ \\langle E\\rangle \\to h\\nu e^{-h\\nu/kT}',
      ],
    },
    professional: {
      intro: 'Energy quantisation of an oscillator is the first appearance of the ladder structure that every bosonic mode shares — cavity photons, phonons, the motional modes of a trapped ion. The qubit is the special case where you can isolate the bottom two rungs.',
      points: [
        'A harmonic mode has equally spaced rungs ħω(n + ½); a drive resonant with 0→1 is also resonant with 1→2 and climbs the ladder. Transmons break the spacing (anharmonicity) precisely so that the mode can be used as a two-level system.',
        'Cavity QED reads qubits through photon number: the dispersive shift χ a†a σ_z makes the resonator frequency depend on the qubit state, and the readout tone counts photons in a shifted mode.',
        'Planck’s constant in engineering units: h = 4.136 × 10⁻¹⁵ eV s, so a 5 GHz photon is 20.7 µeV and a 1550 nm photon is 0.80 eV — two orders of magnitude of hardware spanned by one formula.',
        'Zero-point energy ½ħω is physical: it sets the vacuum fluctuations that produce spontaneous emission (Purcell decay) and the standard quantum limit on amplification — both limits on readout.',
      ],
      math: ['H = \\hbar\\omega\\left(a^{\\dagger}a + \\tfrac12\\right), \\qquad H_{\\text{disp}} = \\chi\\, a^{\\dagger}a\\,\\sigma_z'],
    },
  },
  {
    topic: '03.04', minutes: 9,
    figure: { animation: 'photoelectric-threshold', params: { sweep: true } },
    kid: {
      intro: 'Shine light on a clean metal plate and electrons jump out. That part is easy. The surprise is the rules: a dim violet light frees electrons at once, while a blinding red floodlight frees none at all, ever.',
      points: [
        'Think of the light as a stream of little balls. Each ball either has enough punch to knock an electron out, or it does not.',
        'Red balls are weak. Throw a million of them and not one electron moves. Violet balls are strong: even one does the job.',
        'Brighter light just means more balls, so more electrons — but each one comes out with the same energy as before.',
        'This was Einstein’s idea in 1905, and it is what won him the Nobel Prize — not relativity.',
      ],
    },
    student: {
      intro: 'Einstein’s photoelectric equation: Kₘₐₓ = hν − Φ. A photon of energy hν gives all of it to one electron; Φ, the work function, is spent escaping the surface; what remains is kinetic energy. There is a threshold frequency ν₀ = Φ/h below which nothing is emitted.',
      points: [
        'Kₘₐₓ is measured by the stopping potential: eV₀ = Kₘₐₓ. For Φ = 2.0 eV and 400 nm light (3.10 eV), V₀ = 1.10 V.',
        'Intensity sets the photon rate, hence the saturation current; it does not change Kₘₐₓ. Tripling intensity triples the current and leaves V₀ alone.',
        'Plot Kₘₐₓ against ν: a straight line of slope h for every metal, with ν-intercept ν₀ and K-intercept −Φ. Parallel lines for different metals.',
        'No time delay: a single photon ejects a single electron immediately, even at low intensity — impossible for a classical wave that must accumulate energy.',
      ],
      math: [
        'K_{\\max} = h\\nu - \\phi = eV_0, \\qquad \\nu_0 = \\frac{\\phi}{h}, \\quad \\lambda_0 = \\frac{hc}{\\phi} = \\frac{1240\\ \\text{eV nm}}{\\phi}',
      ],
    },
    professional: {
      intro: 'The photoelectric effect is the prototype of every quantum detector: one photon, one countable event. Photomultipliers, avalanche photodiodes and superconducting nanowire detectors are all engineered versions of the same threshold physics, and photonic quantum computing lives or dies by their efficiency.',
      points: [
        'Detector figures of merit descend directly from the equation: quantum efficiency (fraction of photons above threshold that yield an electron), dark counts (thermal emission over Φ), and timing jitter (how promptly the electron appears).',
        'Work functions span 2–5 eV; superconducting nanowire detectors instead break Cooper pairs with meV gaps, which is why they detect single 1550 nm photons (0.8 eV) at >95% efficiency where no photocathode can.',
        'The 1905 argument — energy arrives in indivisible lumps even in a dilute beam — is the same argument as single-photon anti-bunching, the g²(0) < 1 test used to certify a single-photon source for a photonic qubit.',
        'Millikan set out to disprove Einstein’s equation and instead measured h from the slope to 0.5% (1916); it remains one of the cleanest examples of a slope being a fundamental constant.',
      ],
      math: ['\\eta_{\\text{QE}} = \\frac{\\text{electrons out}}{\\text{photons in}}, \\qquad g^{(2)}(0) < 1 \\ \\Rightarrow\\ \\text{single photons}'],
    },
  },
  {
    topic: '03.05', minutes: 7,
    figure: { animation: 'arithmetic', params: { op: 'photon-momentum-nm', a: 500 } },
    kid: {
      intro: 'A photon is a packet of light with no weight at all — yet it carries energy and it carries a push. Sunlight presses on your hand very slightly, and a big enough sail could ride on it through space.',
      points: [
        'Energy: bluer light, bigger packets. A violet photon has about twice the energy of a red one.',
        'Push: light can shove things. A comet’s tail points away from the Sun partly because sunlight pushes the dust.',
        'The push from one photon is unimaginably tiny, but a laser pointer fires about a million million million of them every second.',
        'Scientists use laser light to push atoms to a near standstill — that is how the coldest things in the universe are made.',
      ],
    },
    student: {
      intro: 'A photon of frequency ν (wavelength λ) has energy E = hν = hc/λ and momentum p = E/c = h/λ, though it has zero rest mass. The two are linked by E = pc, the relativistic relation for a massless particle.',
      points: [
        'E in electronvolts from λ in nm: E = 1240/λ. 500 nm → 2.48 eV; 450 nm → 2.76 eV; 1550 nm → 0.80 eV.',
        'p = h/λ: a 500 nm photon has p = 6.63 × 10⁻³⁴ / 5.00 × 10⁻⁷ = 1.33 × 10⁻²⁷ kg m s⁻¹. Halve λ and both E and p double.',
        'Equal numbers of 400 nm and 800 nm photons: the 400 nm batch carries twice the energy. Shorten λ by 20% and p rises by 1/0.8 = 1.25.',
        'Radiation pressure on a perfect absorber is I/c; on a mirror 2I/c. Sunlight at 1 kW m⁻² exerts about 3 µPa on an absorber.',
      ],
      math: ['E = h\\nu = \\frac{hc}{\\lambda}, \\qquad p = \\frac{h}{\\lambda} = \\frac{E}{c}'],
    },
    professional: {
      intro: 'Photon momentum is a working tool: it cools atoms and ions to microkelvin, it is the recoil that limits atomic clocks, and it is the momentum exchanged in Compton scattering that first proved photons are particles. Photon energy, meanwhile, is the bookkeeping of every qubit transition.',
      points: [
        'Doppler cooling: an atom moving toward a red-detuned laser absorbs photons preferentially and loses ħk of momentum per absorption, re-emitting isotropically. ~10⁴ scatterings per millisecond stop a room-temperature atom.',
        'Recoil energy E_r = ħ²k²/2m sets the recoil limit of laser cooling (~µK) and the sideband structure that trapped-ion gates exploit (Lamb–Dicke regime: recoil ≪ trap quantum).',
        'Energy bookkeeping across platforms: 0.80 eV telecom photons for photonic qubits, 20 µeV microwave photons for transmons, 1.7 eV (729 nm) for Ca⁺ optical qubits — all E = hν.',
        'Single-photon momentum transfer is what makes measurement back-action unavoidable: to locate an electron with light of wavelength λ costs a momentum kick ~h/λ, the heuristic behind the uncertainty principle.',
      ],
      math: ['E_r = \\frac{\\hbar^{2}k^{2}}{2m}, \\qquad \\Delta p_{\\text{kick}} \\sim \\frac{h}{\\lambda}'],
    },
  },
  {
    topic: '03.06', minutes: 7,
    figure: { animation: 'energy-levels', params: { spectrum: true } },
    kid: {
      intro: 'Pass the light from a glowing gas through a prism and you do not get a smooth rainbow. You get a few sharp coloured lines on black — a barcode. Every element has its own barcode, and nobody could explain why.',
      points: [
        'Neon’s barcode is red and orange; sodium’s has two bright yellow lines; hydrogen has a red, a blue-green and two violets.',
        'A barcode means the atom can only give out certain exact amounts of energy — like a vending machine with fixed prices.',
        'Astronomers read these barcodes in starlight to know what distant stars are made of.',
        'The other mystery: an atom with electrons whizzing round should quickly collapse and go dark. It never does.',
      ],
    },
    student: {
      intro: 'Atoms emit and absorb light only at discrete wavelengths. The Rydberg formula 1/λ = R(1/n₁² − 1/n₂²) fitted hydrogen’s lines exactly, decades before anyone knew why. Discrete lines imply discrete energy levels: each photon carries the difference between two allowed energies.',
      points: [
        'Hydrogen series: Lyman (n₁ = 1, ultraviolet), Balmer (n₁ = 2, visible: 656, 486, 434, 410 nm), Paschen (n₁ = 3, infrared).',
        'Emission: electron drops, photon out with E = E_upper − E_lower. Absorption: the same lines appear dark in a continuous spectrum passed through the gas (Fraunhofer lines in sunlight).',
        'Classical electrodynamics predicts a radiating, spiralling electron and a continuous spectrum; the observed stability and sharp lines rule that out.',
        'Line wavelengths identify elements uniquely; helium was found in the Sun’s spectrum before it was found on Earth.',
      ],
      math: ['\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_1^{2}} - \\frac{1}{n_2^{2}}\\right), \\qquad R = 1.097\\times10^{7}\\ \\text{m}^{-1}'],
    },
    professional: {
      intro: 'Discrete spectra are discrete Hamiltonian eigenvalues, and a line is a transition between eigenstates with a frequency set by the gap. A qubit is a two-line spectrum you have learned to address; spectroscopy is the toolkit for finding and characterising it.',
      points: [
        'Every qubit calibration starts with spectroscopy: sweep a drive frequency, find the 0→1 line (and for a transmon the 1→2 line at the anharmonicity below it). Linewidth gives decoherence; the line position drifting gives frequency noise.',
        'Selection rules decide which transitions are bright: electric dipole allowed (Δℓ = ±1) lines are fast; forbidden transitions (the 729 nm quadrupole line in Ca⁺) are narrow and slow — exactly what an optical qubit wants.',
        'Natural linewidth Γ = 1/τ: a 10 ns lifetime is a 16 MHz wide line; a 1 s lifetime is 0.16 Hz. Narrow lines are the basis of atomic clocks and of long-lived qubits.',
        'Spectral lines are also how you detect leakage: population in |2⟩ of a transmon shows up as a shifted readout response, and the fix is a pulse whose spectrum avoids the 1→2 line (DRAG).',
      ],
      math: ['h\\nu_{12} = E_2 - E_1, \\qquad \\Gamma = \\frac{1}{\\tau}'],
    },
  },
  {
    topic: '03.07', minutes: 8,
    figure: { animation: 'energy-levels', params: { from: 3, to: 1 } },
    kid: {
      intro: 'Niels Bohr made a bold rule in 1913: an electron may only travel on certain tracks around the nucleus, like a train on fixed rails, and it never loses energy while it stays on a track. Light comes out only when it hops down from one track to a lower one.',
      points: [
        'Tracks are numbered 1, 2, 3 … Track 1 is lowest and closest. The electron cannot sit between tracks.',
        'Jump from track 3 to track 1 and a photon flies out carrying exactly the energy difference. That makes one line of the barcode.',
        'Each possible hop makes one line, so the barcode is the list of hops.',
        'The model was half right: it got hydrogen’s lines perfectly, but it could not explain other atoms, and the “tracks” turned out to be clouds, not orbits.',
      ],
    },
    student: {
      intro: 'Bohr postulated stationary orbits with quantised angular momentum L = nħ, no radiation while in an orbit, and photon emission hν = E_i − E_f on transitions. For hydrogen this gives Eₙ = −13.6 eV / n² and reproduces the Rydberg formula exactly.',
      points: [
        'Levels: E₁ = −13.6 eV, E₂ = −3.40 eV, E₃ = −1.51 eV, E₄ = −0.85 eV. The 3 → 1 transition emits 12.09 eV; 2 → 1 emits 10.2 eV, i.e. λ = 1240/10.2 = 121.6 nm (Lyman-α).',
        'Ionisation energy is 13.6 eV; the Bohr radius a₀ = 0.0529 nm sets the size of the n = 1 orbit, and rₙ = n² a₀.',
        'Successes: hydrogen, He⁺, Li²⁺ (one-electron ions, scaling as Z²). Failures: helium and beyond, line intensities, fine structure, the Zeeman effect’s anomalous splittings.',
        'The deeper problem: it assumed classical orbits plus an ad hoc rule. The wave picture (de Broglie) and then quantum mechanics replaced the orbits with standing waves and probability clouds.',
      ],
      math: [
        'E_n = -\\frac{13.6\\ \\text{eV}}{n^{2}}, \\qquad r_n = n^{2}a_0, \\qquad L = n\\hbar',
        'h\\nu = E_3 - E_1 = -1.51 - (-13.6) = 12.09\\ \\text{eV}',
      ],
    },
    professional: {
      intro: 'Bohr’s model is wrong in mechanism and right in energies, which makes it the perfect lesson in why eigenvalues are what experiments see. The hydrogen spectrum it predicts is the Schrödinger spectrum; the orbits it imagines do not exist.',
      points: [
        'The correct derivation: solve the Schrödinger equation with the Coulomb potential; the energies depend only on n (accidental degeneracy of the 1/r potential), reproducing Bohr, while ℓ and mℓ label orbital shapes Bohr had no room for.',
        'Where the model fails, modern qubits begin: multi-electron atoms need the exclusion principle (Module 06); fine structure needs spin (Module 07); the Zeeman splitting Bohr could not explain is the spin-qubit transition.',
        'Rydberg atoms — n ≈ 50–100 — are Bohr’s large orbits made real, with rₙ ∝ n² reaching micrometres and dipole moments so large that two atoms blockade each other. That blockade is the two-qubit gate of neutral-atom quantum computers.',
        'The Bohr frequency condition ν = ΔE/h survives intact as the resonance condition of every gate: drive at the gap, and only at the gap.',
      ],
      math: ['E_{n\\ell m} = -\\frac{13.6\\ \\text{eV}}{n^{2}} \\ \\text{(independent of } \\ell, m\\text{)}, \\qquad r_n \\propto n^{2}'],
    },
  },
  {
    topic: '03.08', minutes: 7,
    figure: { animation: 'compton', params: { deg: 90 } },
    kid: {
      intro: 'If light is made of particles, they should bounce off things like tiny billiard balls. In 1923 Arthur Compton fired X-rays at electrons and found exactly that: the X-rays bounced off at an angle and came away with a bit less energy, just as a ball does.',
      points: [
        'A photon hits an electron, the electron recoils, the photon flies off in a new direction.',
        'The photon has given some energy away, so it leaves as a “redder” (longer-wavelength) photon.',
        'The more sharply it bounces back, the more energy it loses. Straight back is the biggest loss.',
        'A wave cannot do this — a wave would spread out and keep its colour. Only a particle collision fits.',
      ],
    },
    student: {
      intro: 'Compton treated the X-ray photon as a particle with E = hc/λ and p = h/λ colliding elastically with a free electron. Conserving energy and momentum gives a wavelength shift that depends only on the scattering angle: Δλ = (h/mₑc)(1 − cos θ).',
      points: [
        'The Compton wavelength h/mₑc = 2.43 pm. At θ = 90° the shift is 2.43 pm; at 180° it is 4.85 pm; forward scattering (θ = 0) gives no shift.',
        'The shift is independent of the incoming wavelength, so it is noticeable for X-rays (λ ~ 10–100 pm) and negligible for visible light (λ ~ 500 000 pm).',
        'The recoil electron carries the lost energy: K_e = hc/λ − hc/λ′. Both the photon and the electron are observed, at the angles conservation predicts.',
        'Compton scattering is one of the three ways photons interact with matter (with the photoelectric effect and pair production) and dominates for MeV gamma rays in tissue.',
      ],
      math: ['\\Delta\\lambda = \\lambda\' - \\lambda = \\frac{h}{m_e c}\\,(1 - \\cos\\theta), \\qquad \\frac{h}{m_e c} = 2.43\\ \\text{pm}'],
    },
    professional: {
      intro: 'The Compton effect is a two-body relativistic collision in which the photon is unambiguously a particle with p = h/λ, and it closed the argument Einstein opened in 1905. For a quantum engineer its descendants are the scattering processes that limit and enable control: recoil, Raman transitions, and detector physics.',
      points: [
        'Derivation uses E² = (pc)² + (mc²)² for the electron; the result is exact, not an approximation, and the 2.43 pm scale is the ratio of ħ to mₑc — the length at which an electron’s position uncertainty costs its rest energy.',
        'Inverse Compton scattering (electron gives energy to the photon) powers X-ray astrophysics and free-electron lasers; stimulated Raman scattering — two photons, one atom — is the workhorse of trapped-ion and neutral-atom gates.',
        'Detector physics: Compton scattering in a scintillator produces the “Compton edge” below the photopeak; gamma spectroscopy is the practical face of the formula.',
        'Historically decisive: the shift is independent of intensity and of material (for loosely bound electrons), so no classical wave model with any parameters could reproduce it.',
      ],
      math: ['E_\\gamma\' = \\frac{E_\\gamma}{1 + \\dfrac{E_\\gamma}{m_e c^{2}}(1-\\cos\\theta)}, \\qquad m_e c^{2} = 511\\ \\text{keV}'],
    },
  },
  {
    topic: '03.09', minutes: 7,
    figure: { animation: 'de-broglie-ratio', params: { ratio: 2, frequency: true } },
    kid: {
      intro: 'In 1924 a young French student asked a cheeky question: if light waves can act like particles, can particles act like waves? Louis de Broglie said yes — every moving thing has a wavelength, and the faster and heavier it is, the shorter that wavelength.',
      points: [
        'An electron has a wavelength about the size of an atom. That is why it can do wave tricks like bending round corners.',
        'A football has a wavelength too, but it is a billion billion billion times smaller than an atom, so you never notice.',
        'Speed it up and the wavelength shrinks; slow it down and it grows.',
        'Three years later electrons were caught making ripple patterns, and the cheeky question won a Nobel Prize.',
      ],
    },
    student: {
      intro: 'De Broglie proposed λ = h/p for any particle, by symmetry with p = h/λ for photons. For a particle of kinetic energy K and mass m, p = √(2mK), so λ = h/√(2mK). The hypothesis was confirmed by electron diffraction in 1927.',
      points: [
        'An electron accelerated through 54 V has K = 54 eV and λ = 0.167 nm — comparable to atomic spacings in a crystal (Davisson–Germer).',
        'Momentum 3.0 × 10⁻²⁴ kg m s⁻¹ gives λ = 2.21 × 10⁻¹⁰ m. Triple the momentum and λ falls to a third; for a wave of fixed speed the frequency then triples.',
        'Macroscopic objects: a 0.1 kg ball at 10 m s⁻¹ has λ = 6.6 × 10⁻³⁴ m, far below any observable scale — which is why classical mechanics works for balls.',
        'Bohr’s quantisation follows: an integer number of wavelengths must fit around an orbit, 2πr = nλ, which with λ = h/p gives L = pr = nħ.',
      ],
      math: ['\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2mK}}, \\qquad 2\\pi r_n = n\\lambda \\ \\Rightarrow\\ L = n\\hbar'],
    },
    professional: {
      intro: 'The de Broglie relation is the dictionary between particle and wave language that the Schrödinger equation then makes precise: p = ħk, E = ħω. It is also an engineering statement about resolution and confinement — the wavelength of a matter wave is the scale below which it cannot be localised without cost.',
      points: [
        'Electron microscopy: 100 keV electrons have λ ≈ 3.7 pm (relativistic correction included), hence sub-ångström resolution; the same relation sets the thermal de Broglie wavelength that decides when a gas becomes a Bose–Einstein condensate.',
        'Confinement energy: squeezing a particle into L costs p ~ h/L, so E ~ h²/2mL². For an electron in 1 nm that is ~0.4 eV — the quantum-dot energy scale and the origin of a particle-in-a-box spectrum (Module 06).',
        'Matter-wave interferometry with atoms and even large molecules (over 2000 amu) confirms λ = h/p for composite objects; decoherence, not size, is what eventually hides the interference.',
        'Phase velocity of a matter wave exceeds c and is unobservable; the group velocity dω/dk = p/m is the particle velocity. Wave packets, not plane waves, describe real particles.',
      ],
      math: ['p = \\hbar k, \\qquad E = \\hbar\\omega, \\qquad v_g = \\frac{d\\omega}{dk} = \\frac{\\hbar k}{m} = \\frac{p}{m}'],
    },
  },
  {
    topic: '03.10', minutes: 7,
    figure: { animation: 'electron-diffraction', params: { energyEv: 54 } },
    kid: {
      intro: 'Fire electrons at a crystal and let them land on a screen. If electrons were tiny bullets you would get a blob. Instead you get rings — the same rings light makes when it passes through a fine mesh. Electrons, it turns out, ripple.',
      points: [
        'The rows of atoms in a crystal act like a tiny grating, and the electron wave bends through it.',
        'Each electron lands as one dot. Thousands of dots together draw the rings.',
        'Faster electrons make tighter rings, because faster means a shorter wavelength.',
        'This was the proof of de Broglie’s idea, done in 1927 by Davisson and Germer in America and G. P. Thomson in Scotland.',
      ],
    },
    student: {
      intro: 'Electrons scattered from a crystal show diffraction maxima where Bragg’s condition holds, 2d sin θ = nλ, with λ the de Broglie wavelength. Davisson and Germer saw a peak at 50° for 54 eV electrons on nickel, matching λ = 0.167 nm.',
      points: [
        'For 54 eV, λ = h/√(2mK) = 0.167 nm; the nickel spacing d = 0.091 nm gives 2d sin 65° = 0.165 nm — agreement to a percent.',
        'A powder or polycrystalline target gives rings (all orientations present); a single crystal gives spots. Ring radius ∝ λ ∝ 1/√K.',
        'G. P. Thomson passed electrons through thin metal foil and photographed ring patterns identical in form to X-ray patterns — the electron and the photon behaving alike.',
        'Low-energy electron diffraction (LEED) and electron microscopy are now routine surface-science tools built on the effect.',
      ],
      math: ['2d\\sin\\theta = n\\lambda, \\qquad \\lambda_{54\\,\\text{eV}} = \\frac{h}{\\sqrt{2 m_e \\cdot 54\\ \\text{eV}}} = 0.167\\ \\text{nm}'],
    },
    professional: {
      intro: 'Electron diffraction is single-particle interference with the lattice as the beam splitter: each electron’s amplitude explores every lattice path and the detected position is drawn from |ψ|². It is the same physics as the double slit, with a periodic potential supplying the paths.',
      points: [
        'The pattern is the Fourier transform of the lattice — reciprocal space. The same mathematics gives band structure: an electron wave in a periodic potential has allowed and forbidden energy bands, which is where semiconductors and superconductors come from.',
        'Neutron and atom diffraction follow identically with λ = h/p; neutron wavelengths at thermal energies (~0.18 nm) make them the probe of choice for magnetic structure.',
        'Each electron is detected as a point — the dots accumulate into rings — which is the direct experimental content of the Born rule before anyone wrote it down.',
        'For quantum devices, the lesson is coherence length: diffraction requires the electron’s wave to stay coherent across many lattice spacings; mesoscopic physics (quantum point contacts, Aharonov–Bohm rings) is the regime where that length exceeds the device size.',
      ],
      math: ['I(\\mathbf{k}) \\propto \\left|\\sum_{\\mathbf{R}} e^{i\\mathbf{k}\\cdot\\mathbf{R}}\\right|^{2} \\ \\text{(lattice Fourier transform)}'],
    },
  },
  {
    topic: '03.11', minutes: 9,
    figure: { animation: 'which-path', params: { mode: 'build' } },
    kid: {
      intro: 'Here is the strangest experiment in physics. Send electrons one at a time through two tiny slits toward a screen. Each electron lands as a single dot. But after thousands of them, the dots form stripes — the pattern of a wave that went through both slits at once.',
      points: [
        'One slit open: a blob behind it. Two slits open: stripes, including dark bands where electrons used to land when only one slit was open.',
        'Only one electron is in the machine at a time, so it is not electrons bumping into each other.',
        'Try to watch which slit each electron uses, and the stripes vanish. Looking changes the answer.',
        'Nobody has ever caught an electron going through both slits — and yet the stripes prove something went through both.',
      ],
    },
    student: {
      intro: 'With both slits open and no which-path information, the amplitudes for the two paths add and the detection probability is |ψ₁ + ψ₂|², producing fringes. Each particle is detected at one point; the fringes build statistically. Any measurement that reveals the path destroys the interference term.',
      points: [
        'Fringe spacing Δy = λL/d for wavelength λ, slit separation d and screen distance L — the same formula as for light, with λ = h/p.',
        'Single-particle operation (electrons, neutrons, atoms, molecules) rules out any explanation based on particles interacting with one another.',
        'With path detectors on, the probability becomes |ψ₁|² + |ψ₂|²: two overlapping single-slit humps, no fringes. The interference term 2Re(ψ₁*ψ₂) is gone.',
        'The probability of arriving at a dark fringe is lower with two slits open than with one — adding a route removes arrivals. No classical particle picture does that.',
      ],
      math: [
        'P_{\\text{both}} = |\\psi_1 + \\psi_2|^{2} = |\\psi_1|^{2} + |\\psi_2|^{2} + 2\\,\\mathrm{Re}(\\psi_1^{*}\\psi_2)',
        'P_{\\text{which-path}} = |\\psi_1|^{2} + |\\psi_2|^{2}',
      ],
    },
    professional: {
      intro: 'Feynman called this the only mystery, and it is the operating principle of every quantum algorithm: amplitudes over indistinguishable histories add; distinguishable histories add in probability. A quantum computer is a device for keeping 2ⁿ computational paths indistinguishable long enough for the wrong ones to cancel.',
      points: [
        'Which-path information need not be read by anyone; it is enough that it exists in some degree of freedom. That is decoherence: the environment records the path and the cross term vanishes. The quantitative version is the decay of off-diagonal density-matrix elements.',
        'Delayed-choice and quantum-eraser experiments show the fringes can be recovered by erasing the path record after detection — ruling out any picture where the particle “decides” at the slits.',
        'Gate version: H–(phase)–H is a two-path interferometer. H H|0⟩ = |0⟩ because the amplitudes to |1⟩ cancel; a Z between them moves the cancellation to |0⟩. Every interference-based algorithm (Deutsch–Jozsa, Grover, QFT) is this with more paths.',
        'Interference has been demonstrated with molecules above 2000 amu; the limit is decoherence rate versus flight time, not mass. The same trade-off — coherence time versus circuit depth — is the NISQ constraint.',
      ],
      math: ['\\rho \\to \\begin{pmatrix} |\\psi_1|^{2} & \\psi_1\\psi_2^{*}\\,e^{-t/T_2} \\\\ \\psi_1^{*}\\psi_2\\,e^{-t/T_2} & |\\psi_2|^{2}\\end{pmatrix}'],
    },
  },
];
