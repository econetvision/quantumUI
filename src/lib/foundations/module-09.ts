import type { FoundationLesson } from '@/lib/foundations-types';

/**
 * Module 09 — Real Quantum Computers.
 *
 * Hardware, noise and the frontier. The numbers (T₁ ≈ 100 µs, 15 mK,
 * 28 GHz/T, 0.2 dB/km, 2⁵⁰ amplitudes ≈ 18 PB) are the ones the figures
 * compute from, and were cross-checked while this module was written.
 */
export const MODULE_09: FoundationLesson[] = [
  {
    topic: '09.01', minutes: 7,
    figure: { animation: 'hardware', params: { kind: 'overview' } },
    kid: {
      intro: 'A qubit can be made out of many different things, as long as it has two states you can tell apart and control. Today three kinds lead: tiny electric circuits chilled almost to absolute zero, single atoms held in place by electric fields and lasers, and single particles of light.',
      points: [
        'Superconducting circuits: fast, made in chip factories, but need a fridge colder than deep space.',
        'Trapped ions: slow but extremely accurate, every ion identical by nature.',
        'Photons: travel through fibres at room temperature, but are hard to make interact.',
        'There is no winner yet. Each is good at something the others are bad at.',
      ],
    },
    student: {
      intro: 'Any two-level system with controllable coupling and readable states can be a qubit; the DiVincenzo criteria list the requirements. Leading platforms — superconducting transmons, trapped ions, neutral atoms, photons, semiconductor spins — trade gate speed, fidelity, coherence, connectivity and scalability differently.',
      points: [
        'Transmons: T₁ ~ 100 µs, gates 20–300 ns, fidelities 99.9% (1Q) / 99.5% (2Q), nearest-neighbour connectivity, 15 mK dilution fridge.',
        'Ions: coherence seconds+, gates 1–100 µs, fidelities 99.99% / 99.9%, all-to-all within a chain, laser-cooled in vacuum.',
        'Photons: no decoherence in flight, room-temperature propagation, probabilistic two-qubit gates (linear optics), 1550 nm in fibre with 0.2 dB/km loss.',
        'Spins in silicon: 10⁻⁸ m dots, CMOS-compatible, coherence ms with isotopic purification, gates ~µs; neutral atoms: optical tweezers, Rydberg gates, hundreds of qubits reconfigurable.',
      ],
      math: ['Q_{\\text{ops}} = \\frac{T_2}{t_{\\text{gate}}}: \\quad \\text{transmon} \\sim 10^{3}\\text{–}10^{4}, \\quad \\text{ion} \\sim 10^{4}\\text{–}10^{5}'],
    },
    professional: {
      intro: 'Platform choice is a systems trade: gate time against coherence, connectivity against crosstalk, fabrication yield against uniformity, and control wiring against qubit count. The metric that matters is logical qubits per dollar-year below threshold, and no platform has demonstrated it at scale yet.',
      points: [
        'Wiring: each transmon needs 1–3 coax lines into a fridge with ~kW cooling at 4 K and µW at 15 mK; a million physical qubits needs cryo-CMOS multiplexing or on-chip control. Ions multiplex optics; atoms multiplex tweezers.',
        'Uniformity: transmon frequencies scatter ~1% from junction fabrication, causing collisions in fixed-frequency lattices; ions and atoms are identical by physics, which is a decisive advantage in calibration.',
        'Connectivity cost: 2-D nearest-neighbour (transmons) multiplies two-qubit counts 3–10× via SWAPs; ion chains are all-to-all up to ~30 and then need shuttling (QCCD); atoms rearrange tweezers between layers.',
        'Error-correction fit: the surface code wants a 2-D grid with ~10⁻³ errors (transmons, atoms); ions with higher fidelity and flexible connectivity can use higher-rate codes (qLDPC) with fewer physical qubits per logical.',
      ],
      math: ['N_{\\text{phys}} \\approx \\frac{N_{\\text{logical}}\\cdot 2d^{2}}{\\text{yield}}, \\qquad d \\sim 2\\log_{p_{\\text{th}}/p}(1/p_L)'],
    },
  },
  {
    topic: '09.02', minutes: 8,
    figure: { animation: 'hardware', params: { kind: 'transmon' } },
    kid: {
      intro: 'A superconducting qubit is an electric circuit the size of a grain of rice, so cold that electricity flows without resistance. Current sloshes back and forth in it like a pendulum, and the two lowest sloshing energies are 0 and 1. Microwaves — the same kind as in your oven, but a billion times fainter — flip it.',
      points: [
        'The secret part is a Josephson junction: two superconductors separated by a wall so thin electrons tunnel through.',
        'That junction makes the sloshing “uneven”, so the 0→1 jump has a different size from 1→2. Otherwise the microwaves would climb the whole ladder.',
        'The chip sits at 0.015 degrees above absolute zero — colder than anywhere in nature.',
        'These are the qubits in Google’s and IBM’s machines: fast to operate, hard to keep cold and quiet.',
      ],
    },
    student: {
      intro: 'A transmon is an LC oscillator whose inductor is a Josephson junction, giving H = 4E_C n² − E_J cos φ. With E_J/E_C ≈ 50 the lowest levels form a weakly anharmonic ladder: ω₀₁ ≈ √(8E_JE_C) − E_C ≈ 2π × 5 GHz, anharmonicity α ≈ −E_C ≈ −2π × 250 MHz. The anharmonicity is what lets a resonant drive address 0→1 alone.',
      points: [
        'Photon energy at 5 GHz is 20.7 µeV; thermal energy at 15 mK is 1.3 µeV, so the ratio is 16 and thermal population is e^{−16} ≈ 10⁻⁷ in principle (≈1% in practice from stray photons).',
        'Gates: microwave pulses at ω₀₁ with ~20 ns Gaussian envelopes (Rabi rotations); two-qubit gates via tunable couplers (CZ, ~40 ns) or cross-resonance (~300 ns).',
        'Readout: dispersive coupling to a resonator shifts its frequency by ±χ (~1 MHz) depending on the qubit state; a probe tone’s phase reveals the state in ~500 ns.',
        'Coherence: T₁ ≈ 50–300 µs limited by dielectric loss (two-level systems in oxides) and quasiparticles; T₂ ≈ T₁ to 2T₁ with flux noise for tunable designs.',
      ],
      math: ['H = 4E_C\\hat n^{2} - E_J\\cos\\hat\\varphi, \\qquad \\omega_{01} \\approx \\sqrt{8E_JE_C} - E_C, \\quad \\alpha \\approx -E_C'],
    },
    professional: {
      intro: 'The transmon’s success is manufacturability: it is lithographically defined aluminium on silicon or sapphire, patterned with standard tools, and its control is commodity microwave electronics. Its limits are materials (TLS loss sets T₁), frequency crowding (fixed designs) or flux noise (tunable designs), and the wiring that scales linearly with qubit count.',
      points: [
        'Loss budget: Q = ωT₁ ≈ 10⁶–10⁷ today; the dominant loss is surface dielectrics (participation ratios ~10⁻³ with tan δ ~ 10⁻³), so geometry (large capacitor pads, low surface participation) and materials (tantalum, substrate treatment) drove the 10× T₁ gains of the last decade.',
        'Frequency allocation: cross-resonance needs ω_control − ω_target within ~100 MHz of specific windows and away from |2⟩ collisions; yield of collision-free lattices falls exponentially with size, motivating tunable couplers and laser annealing of junctions.',
        'Quasiparticles from cosmic rays and radioactivity cause correlated T₁ bursts across millimetres of chip — a failure mode that breaks the independence assumption of error correction and requires phonon traps and gap engineering.',
        'Scaling: a 1000-qubit fridge is possible; 10⁶ qubits for fault tolerance needs cryo-CMOS or photonic control, 3-D integration (through-silicon vias, flip-chip), and modular fridges linked by microwave-to-optical transducers — all active research.',
      ],
      math: ['\\frac{1}{T_1} = \\sum_i p_i\\,\\omega\\tan\\delta_i + \\Gamma_{\\text{qp}} + \\Gamma_{\\text{Purcell}}, \\qquad \\Gamma_{\\text{Purcell}} = \\kappa\\frac{g^{2}}{\\Delta^{2}}'],
    },
  },
  {
    topic: '09.03', minutes: 7,
    figure: { animation: 'hardware', params: { kind: 'ion' } },
    kid: {
      intro: 'A trapped-ion computer uses single charged atoms, floating in a vacuum, pinned in a line by electric fields. Lasers cool them until they almost stop, flip them between two energy states, and make neighbouring ions talk by nudging the whole line into a wobble.',
      points: [
        'Every atom of the same kind is exactly identical — no two chips are, but two calcium ions are.',
        'They stay quantum for seconds, thousands of times longer than circuits.',
        'The price is speed: each gate takes a few millionths of a second, hundreds of times slower than a circuit gate.',
        'Reading out is simple and beautiful: shine a laser and the ion either glows or stays dark.',
      ],
    },
    student: {
      intro: 'Ions (⁴⁰Ca⁺, ¹⁷¹Yb⁺, ⁹Be⁺) are confined in a Paul trap by oscillating electric fields, laser-cooled to the motional ground state, and encoded in two long-lived internal levels (hyperfine or optical). Single-qubit gates are laser or microwave rotations; two-qubit gates use the shared motional mode as a bus (Cirac–Zoller, Mølmer–Sørensen).',
      points: [
        'Coherence: hyperfine clock states have T₂ of seconds to minutes; optical qubits are limited by the ~1 s lifetime of the metastable level.',
        'Fidelities: 99.99% single-qubit, 99.9% two-qubit; gates take 1–100 µs. State-dependent fluorescence reads out at 99.9% in ~100 µs.',
        'Connectivity: any ion in a chain can be entangled with any other through the collective modes — all-to-all for chains of ~20–30 ions.',
        'Scaling routes: QCCD (shuttling ions between trap zones on a chip), photonic interconnects between traps, and 2-D ion crystals.',
      ],
      math: ['H_{\\text{MS}} \\propto \\Omega^{2}\\frac{\\eta^{2}}{\\delta}\\,\\sigma_x^{(1)}\\sigma_x^{(2)}, \\qquad \\eta = k\\sqrt{\\frac{\\hbar}{2m\\omega_{\\text{trap}}}} \\ll 1'],
    },
    professional: {
      intro: 'Ions hold the records for fidelity and coherence, and their all-to-all connectivity within a register lets them run higher-rate error-correcting codes than a 2-D grid allows. The engineering constraints are optical: laser power, beam pointing, and the number of independently addressed beams, plus the millisecond timescales of shuttling.',
      points: [
        'Mølmer–Sørensen gate: bichromatic drive detuned ±δ from a motional sideband; in the Lamb–Dicke regime (η ≪ 1) the motion is disentangled at the end of the gate, leaving σ_xσ_x entanglement independent of the motional state. Gate error floors at ~10⁻⁴ from motional heating and laser phase noise.',
        'Motional heating rates (quanta per second) set by electric-field noise from trap surfaces scale as ~d⁻⁴ with ion–electrode distance; surface-electrode traps at 50–100 µm require cryogenic operation or surface treatment.',
        'QCCD architecture (Quantinuum H-series): ions shuttled, split and merged between gate zones; mid-circuit measurement and reuse are native, enabling logical-qubit demonstrations with error rates below physical.',
        'Throughput versus fidelity: the ~100 µs gate means a 10⁴-gate circuit takes a second; speed-ups via faster gates (sub-µs with pulsed lasers) and parallel zones are the active frontier.',
      ],
      math: ['\\dot{\\bar n} \\propto S_E(\\omega)\\,\\propto d^{-4}, \\qquad \\varepsilon_{\\text{MS}} \\approx \\frac{\\dot{\\bar n}\\,t_{\\text{gate}}}{2} + \\ldots'],
    },
  },
  {
    topic: '09.04', minutes: 7,
    figure: { animation: 'hardware', params: { kind: 'photon' } },
    kid: {
      intro: 'A photonic qubit is a single particle of light. Its 0 and 1 can be two paths it might take, or two ways it can wiggle. Photons never sit still and barely notice their surroundings — perfect for sending qubits down a fibre, awkward for making them compute.',
      points: [
        'Send one photon at a half-silvered mirror and it takes both paths at once — a superposition made by a mirror.',
        'Photons do not bump into each other, so making two of them interact — the heart of computing — is the hard part.',
        'They travel at light speed through ordinary telecom fibre, which is why quantum networks will be photonic.',
        'Detecting a single photon needs special detectors, often cooled, that click once per photon.',
      ],
    },
    student: {
      intro: 'Photonic qubits encode in path (dual-rail), polarisation or time-bin. Single-qubit gates are beam splitters and phase shifters (linear optics); two-qubit gates are probabilistic without nonlinearity (KLM scheme) or use measurement-based schemes on large entangled cluster states. Loss is the dominant error.',
      points: [
        'A 50/50 beam splitter maps |1, 0⟩ → (|1, 0⟩ + |0, 1⟩)/√2 — a Hadamard on the path qubit. A phase shifter in one arm is Rz.',
        'Telecom photons at 1550 nm carry 0.80 eV and travel in fibre with 0.2 dB/km loss: 50 km costs 10 dB, i.e. 90% of photons.',
        'Hong–Ou–Mandel interference: two indistinguishable photons entering a beam splitter from opposite ports always exit together — the bosonic interference that KLM gates and boson sampling exploit.',
        'Detectors: superconducting nanowire single-photon detectors reach >95% efficiency with ~10 ps jitter; they are the photonic equivalent of qubit readout.',
      ],
      math: ['\\text{BS}: \\ \\ket{1,0} \\to \\frac{\\ket{1,0} + \\ket{0,1}}{\\sqrt2}, \\qquad P_{\\text{survive}}(L) = 10^{-0.02\\,L/\\text{km}}'],
    },
    professional: {
      intro: 'Photonics is the undisputed medium for quantum communication and a contender for computing via measurement-based architectures (fusion-based quantum computing), where the challenge shifts from making photons interact to making enough identical photons and detecting them efficiently. Loss tolerance, not gate fidelity, is the design axis.',
      points: [
        'Fusion-based QC (PsiQuantum): small entangled resource states (GHZ of a few photons) are generated and fused by Bell measurements; the architecture tolerates ~10% loss per photon with error correction, but needs 10⁶+ identical sources and detectors on silicon photonic chips.',
        'Source quality: deterministic single-photon sources (quantum dots) reach >90% indistinguishability; heralded SPDC sources are probabilistic and need multiplexing. Source brightness × indistinguishability × detector efficiency is the figure of merit.',
        'Networking: entanglement distribution over 1200 km by satellite (Micius) and over 100s of km in fibre; repeaters need quantum memories (atomic ensembles, ions) and frequency conversion to 1550 nm.',
        'Boson sampling (Jiuzhang, 2020–23) demonstrated a computational task hard for classical computers with ~100 photons — advantage without universality, and a benchmark of photon indistinguishability at scale.',
      ],
      math: ['\\text{HOM: } \\ket{1,1} \\xrightarrow{\\text{BS}} \\frac{\\ket{2,0} - \\ket{0,2}}{\\sqrt2}, \\qquad \\text{no } \\ket{1,1} \\text{ term}'],
    },
  },
  {
    topic: '09.05', minutes: 7,
    figure: { animation: 'measurement-collapse', params: { theta: 1.5708, shots: 60 } },
    kid: {
      intro: 'Every computation starts by setting all qubits to 0 and ends by reading each as 0 or 1. Both steps sound trivial and both are hard: resetting means draining every last bit of energy, and reading means amplifying a signal a billion times smaller than a whisper without disturbing the neighbours.',
      points: [
        'Reset: let the qubit cool to 0, or measure it and flip it if it was 1. Even then, about one in a hundred starts wrong.',
        'Readout: the qubit nudges a tiny antenna, and a chain of amplifiers makes the nudge big enough to see.',
        'Readout is the slowest, least accurate step of all — a few per cent of readings are wrong.',
        'Errors at the start and the end are lumped together and called SPAM: state preparation and measurement.',
      ],
    },
    student: {
      intro: 'State preparation initialises qubits to |0⟩ (thermal relaxation, optical pumping, or measure-and-reset); readout measures Z and reports 0/1. Both are imperfect: residual |1⟩ population after reset and assignment errors P(1|0), P(0|1) in readout. Together they form SPAM error, typically 1–3%, characterised separately from gates.',
      points: [
        'Thermal reset: P(|1⟩) = e^{−ħω/kT}, ~10⁻⁷ ideally at 15 mK; stray photons raise it to ~1%. Active reset (measure, conditional π pulse) reaches 10⁻³ in µs.',
        'Dispersive readout: integrate the resonator response for ~500 ns, threshold the integrated quadrature; fidelity 97–99.5%. Ions: fluorescence for ~100 µs, 99.9%.',
        'Assignment matrix [[P(0|0), P(0|1)], [P(1|0), P(1|1)]] is measured by preparing |0⟩ and |1⟩; its inverse corrects histograms (readout mitigation).',
        'QND-ness: a readout that leaves the qubit in the measured state can be repeated to boost fidelity and reused for reset; destructive readout (photon detection) cannot.',
      ],
      math: ['F_{\\text{readout}} = 1 - \\tfrac12\\big[P(1|0) + P(0|1)\\big], \\qquad \\text{SPAM} \\approx \\varepsilon_{\\text{prep}} + \\varepsilon_{\\text{meas}}'],
    },
    professional: {
      intro: 'Readout is on the critical path of error correction: each syndrome round needs a fast, QND, low-crosstalk measurement of many qubits in parallel, and the decoder must consume the result before the next round. Readout speed and fidelity, not gate fidelity, are often the binding constraint on logical error rates.',
      points: [
        'Dispersive readout budget: SNR ∝ √(n̄ κ τ) with χ ≈ κ/2 optimal; raising photon number n̄ speeds readout but above a critical n̄_crit = Δ²/4g² the qubit is ionised to higher levels (measurement-induced state transitions). Josephson parametric amplifiers at the quantum limit are what make 99% in 500 ns possible.',
        'Multiplexed readout: 4–8 resonators per feedline with distinct frequencies; crosstalk and feedline bandwidth cap the multiplexing factor, and the wiring count scales accordingly.',
        'Readout-induced dephasing of neighbours and leakage of the measured qubit are correlated errors that decoders must model; measurement leakage reduction (reset to |0⟩ via |2⟩ draining) is standard.',
        'Ion readout at 99.9% in 100 µs is slow relative to gates; schemes using ancilla-mediated detection and parallel imaging (cameras) are the path to fast syndrome extraction in QCCD devices.',
      ],
      math: ['\\text{SNR} \\propto \\sqrt{\\bar n\\,\\kappa\\,\\tau}\\,\\frac{2\\chi}{\\kappa}, \\qquad \\bar n_{\\text{crit}} = \\frac{\\Delta^{2}}{4g^{2}}'],
    },
  },
  {
    topic: '09.06', minutes: 7,
    figure: { animation: 'bloch-sphere', params: { theta: 3.1416, decohere: 'relax' } },
    kid: {
      intro: 'A qubit is never perfectly alone. Heat, stray radio waves, vibrations and tiny defects in the chip all jostle it. That jostling is quantum noise, and it does two kinds of damage: it drains the qubit’s energy, and it scrambles the delicate twist that interference depends on.',
      points: [
        'Energy loss: a 1 slowly falls back to 0, like a ball rolling downhill. The time this takes is called T₁.',
        'Twist loss: the arrow’s hidden phase wanders randomly, so the blend turns into a mere coin flip. That time is T₂.',
        'Noise cannot be switched off; it can be slowed down by cold, shielding and clean materials.',
        'Every error-correction scheme exists because noise is unavoidable.',
      ],
    },
    student: {
      intro: 'Quantum noise is uncontrolled interaction with the environment. The two canonical channels are amplitude damping (energy relaxation, rate 1/T₁), which drives the Bloch vector toward |0⟩, and dephasing (rate 1/T_φ), which shrinks its equatorial components. Depolarising noise, which shrinks the whole vector, is the symmetric model used in analysis.',
      points: [
        'Amplitude damping Kraus operators: K₀ = |0⟩⟨0| + √(1−γ)|1⟩⟨1|, K₁ = √γ|0⟩⟨1|, with γ = 1 − e^{−t/T₁}.',
        'Pure dephasing: ρ₀₁ → ρ₀₁ e^{−t/T_φ}; populations unchanged. Combined, the off-diagonal decays at 1/T₂ = 1/2T₁ + 1/T_φ, hence T₂ ≤ 2T₁.',
        'Sources: dielectric two-level systems (transmon T₁), flux noise (tunable transmons T_φ), magnetic field noise (spins), laser phase noise and motional heating (ions), thermal photons in resonators (transmon T_φ).',
        'A depolarising channel with probability p maps ρ → (1 − p)ρ + p I/2; it is the standard error model for threshold calculations.',
      ],
      math: ['\\frac{1}{T_2} = \\frac{1}{2T_1} + \\frac{1}{T_\\varphi}, \\qquad \\rho \\to (1-p)\\rho + p\\frac{I}{2}'],
    },
    professional: {
      intro: 'Noise is characterised, not eliminated: T₁, T₂*, T₂ᵉᶜʰᵒ, gate errors from randomised benchmarking, and increasingly the full noise spectrum via dynamical-decoupling spectroscopy. The distinction that matters for error correction is between Markovian, uncorrelated Pauli noise (correctable at threshold) and the coherent, correlated, non-Markovian noise real devices also have.',
      points: [
        'Lindblad master equation with jump operators √(1/T₁) σ₋ and √(1/2T_φ) σ_z reproduces T₁/T₂ decay; it assumes Markovian noise. 1/f flux and charge noise are not Markovian and show up as Gaussian rather than exponential Ramsey decay.',
        'Coherent errors (systematic over/under-rotation) add in amplitude across gates — worst-case error ∝ Nε rather than √N — and are converted to stochastic errors by randomised compiling, which makes them correctable at their average rate.',
        'Correlated errors (cosmic-ray bursts, crosstalk, leakage) break the independence assumption of threshold theorems; their rates, not the average Pauli error, often set the achievable logical error.',
        'Noise spectroscopy: the coherence under a CPMG sequence of N pulses is a filter function of the noise PSD at frequency ~N/2τ; sweeping N maps S(ω), which identifies TLS defects and flux noise and guides materials work.',
      ],
      math: ['\\dot\\rho = -\\frac{i}{\\hbar}[H,\\rho] + \\frac{1}{T_1}\\mathcal{D}[\\sigma_-]\\rho + \\frac{1}{2T_\\varphi}\\mathcal{D}[\\sigma_z]\\rho'],
    },
  },
  {
    topic: '09.07', minutes: 7,
    figure: { animation: 'decoherence', params: { mode: 't2' } },
    kid: {
      intro: 'Decoherence is the slow leak of quantum-ness. A fresh superposition is like a spinning coin; the environment keeps peeking at it, and each peek pushes it a little closer to a coin that has already landed. After the coherence time, nothing quantum is left to compute with.',
      points: [
        'The environment “measures” the qubit without anyone reading the answer — and that is enough to kill interference.',
        'Bigger things decohere faster, because more of the world can peek at them. That is why cats do not stay in superpositions.',
        'Coherence time ranges from millionths of a second for circuits to whole seconds for trapped ions.',
        'A computation must finish, or be error-corrected, well within that time.',
      ],
    },
    student: {
      intro: 'Decoherence is the loss of phase coherence between components of a superposition through entanglement with the environment: off-diagonal density-matrix elements decay while populations may persist. It is measured by a Ramsey experiment (T₂*), a Hahn echo (T₂) and dynamical-decoupling sequences; the ratio of these reveals the noise spectrum.',
      points: [
        'Ramsey: π/2 – τ – π/2 gives fringes cos(Δτ) with envelope e^{−τ/T₂*}; T₂* includes slow (quasi-static) noise. Echo refocuses the static part: T₂ᵉᶜʰᵒ > T₂*.',
        'In the figure, the fringe contrast falls to 1/e at T₂ = 100 µs; the oscillation itself is the detuning Δ.',
        'Decoherence is measurement by the environment: a qubit entangled with an environmental state |e₀⟩ or |e₁⟩ has coherence ⟨e₀|e₁⟩, which → 0 as the environment learns which.',
        'Size matters: a GHZ state of n qubits decoheres n× faster under independent dephasing; a Schrödinger-cat state of amplitude α decoheres ∝ |α|² faster than a single photon.',
      ],
      math: ['\\rho_{01}(t) = \\rho_{01}(0)\\,e^{-t/T_2}\\,e^{-i\\Delta t}, \\qquad T_2^{*} \\le T_2^{\\text{echo}} \\le 2T_1'],
    },
    professional: {
      intro: 'Decoherence budgets translate directly into circuit limits: with T₂ = 100 µs and 50 ns gates, a qubit idles through ~2000 gate times before its coherence is 1/e — and in a parallel circuit most qubits idle most of the time. Scheduling, dynamical decoupling on idle qubits, and T₂-aware compilation are the levers before error correction.',
      points: [
        'Idle error dominates deep circuits: a qubit waiting for τ accumulates dephasing error ≈ τ/T₂ (Markovian) or (τ/T₂*)² (quasi-static); inserting X–X or XY4 sequences during idles converts the latter to the former and can cut error 10×.',
        'Decoherence-free subspaces and sweet spots: encode in states insensitive to the dominant noise (clock states for magnetic noise, flux sweet spots for tunable transmons); the dual-rail encoding in resonators converts photon loss into a detectable erasure.',
        'Erasure conversion: if the dominant decoherence can be flagged (an ion leaving the qubit manifold, a lost photon), the error-correction threshold rises from ~1% to ~5% because erasures are easier to correct than Pauli errors.',
        'Fundamentally, decoherence time per gate time Q is the resource; architectures that improve it (fluxonium with T₂ ~ ms, ions with T₂ ~ s) buy circuit depth even before error correction.',
      ],
      math: ['\\varepsilon_{\\text{idle}} \\approx \\frac{\\tau}{T_2} \\ \\text{(white)}, \\qquad \\varepsilon_{\\text{idle}} \\approx \\left(\\frac{\\tau}{T_2^{*}}\\right)^{2} \\ \\text{(quasi-static)}'],
    },
  },
  {
    topic: '09.08', minutes: 7,
    figure: { animation: 'decoherence', params: { mode: 't1' } },
    kid: {
      intro: 'Each gate is a pulse that turns the arrow by a planned amount. Real pulses are slightly too long or too short, slightly off-axis, and the qubit decays a little while they run. Each gate is therefore slightly wrong — about one time in a thousand for the best machines — and reading out is wrong about one time in a hundred.',
      points: [
        'A thousand gates at one-in-a-thousand error means, roughly, one error somewhere. Big programs need millions of gates.',
        'Two-qubit gates are the clumsiest: five to ten times worse than one-qubit gates.',
        'Readout errors are the worst of all per step, but there is only one readout per qubit at the end.',
        'Error rates are measured by running long random sequences and seeing how fast the right answer fades.',
      ],
    },
    student: {
      intro: 'Gate errors have coherent parts (over-rotation, axis tilt, phase error) and incoherent parts (decoherence during the gate, ≈ t_gate/T₁ and t_gate/T₂). Typical figures: single-qubit 10⁻⁴–10⁻³, two-qubit 10⁻³–10⁻², readout 10⁻²; all are measured by randomised benchmarking or its variants, which separate gate error from SPAM.',
      points: [
        'T₁ floor: a 20 ns gate on a T₁ = 100 µs qubit has decay probability ≈ 20 ns/100 µs = 2 × 10⁻⁴ for a qubit in |1⟩ during the gate — the figure’s curve at t = 20 ns.',
        'Randomised benchmarking: random Clifford sequences of length m ending in the inverse; survival P(m) = Ap^m + B; error per Clifford ε = (1 − p)(1 − 1/2ⁿ). Interleaving a target gate isolates its error.',
        'Readout error ~1–3% dominates per-shot error in shallow circuits; mitigation by assignment-matrix inversion is standard.',
        'Leakage to non-computational levels (transmon |2⟩, ion D-states) is a distinct error type with its own benchmarks and its own mitigation (leakage reduction units).',
      ],
      math: ['\\varepsilon_{T_1} \\approx \\frac{t_{\\text{gate}}}{T_1}, \\qquad P(m) = Ap^{m} + B, \\quad \\varepsilon_{\\text{Cl}} = (1-p)\\left(1 - 2^{-n}\\right)'],
    },
    professional: {
      intro: 'Average gate error from RB is a convenient scalar but hides the structure decoders care about: coherent versus stochastic, Pauli channel versus leakage, independent versus correlated. Gate-set tomography, cycle benchmarking and Pauli-noise learning are the characterisation tools that feed realistic noise models into decoders and compilers.',
      points: [
        'Pulse-level errors: amplitude noise (over-rotation, ∝ ε), detuning (axis tilt, ∝ Δ/Ω), and leakage from spectral overlap with the 1→2 transition — DRAG corrects the last; composite pulses correct the first two at the cost of duration.',
        'Two-qubit gate error budgets (tunable-coupler CZ at ~5 × 10⁻³): ~40% decoherence during the gate, ~30% leakage, ~30% coherent control error; each term has a different fix, which is why the budget is measured, not assumed.',
        'Crosstalk: driving one qubit rotates its neighbours (classical crosstalk) or shifts their frequency (ZZ coupling); simultaneous RB versus isolated RB quantifies it. Below ~10⁻³ it must be actively cancelled.',
        'Randomised compiling tailors arbitrary noise into Pauli noise at the same average rate, which both lowers worst-case error and matches decoder assumptions — a software fix for a hardware characterisation problem.',
      ],
      math: ['\\varepsilon_{\\text{worst}} \\le \\sqrt{d(d+1)\\,\\varepsilon_{\\text{avg}}} \\ \\text{(coherent)}, \\qquad \\varepsilon_{\\text{worst}} \\approx \\tfrac{d+1}{d}\\varepsilon_{\\text{avg}} \\ \\text{(Pauli)}'],
    },
  },
  {
    topic: '09.09', minutes: 8,
    figure: { animation: 'repetition-code', params: { p: 0.1 } },
    kid: {
      intro: 'A single physical qubit is too error-prone to trust. The fix is to spread one logical qubit — the one your program thinks it has — across many physical ones, in a pattern where errors show up as disagreements that can be spotted and fixed. One good qubit from many shaky ones.',
      points: [
        'The simplest pattern: three copies that should always agree. If one disagrees with the other two, it is the odd one out — fix it.',
        'You never ask “is it 0 or 1?” — that would collapse the quantum state. You only ask “do these two agree?”.',
        'Real codes use hundreds or thousands of physical qubits per logical one, and catch twists as well as flips.',
        'This is why “a thousand-qubit machine” and “a thousand logical qubits” are very different claims.',
      ],
    },
    student: {
      intro: 'A logical qubit is a two-dimensional subspace of many physical qubits chosen so that likely errors move the state out of the subspace in detectable ways. The three-qubit repetition code encodes α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩; parity measurements Z₁Z₂ and Z₂Z₃ reveal a single bit flip without revealing α or β.',
      points: [
        'Encoding is entangling, not copying: α|000⟩ + β|111⟩ is not three copies of α|0⟩ + β|1⟩, consistent with no-cloning.',
        'Syndrome: a flip on qubit 2 makes Z₁Z₂ = −1 and Z₂Z₃ = −1; on qubit 1, only Z₁Z₂ = −1. Each single error has a unique signature and is corrected by flipping back.',
        'Logical error occurs when two or more qubits flip: p_L = 3p² − 2p³, which is below p only for p < ½. At p = 0.1, p_L = 0.028.',
        'The repetition code catches bit flips only; phase flips need a code in the X basis too — the Shor code (9 qubits) and the surface code do both.',
      ],
      math: ['\\alpha\\ket{0}+\\beta\\ket{1} \\to \\alpha\\ket{000}+\\beta\\ket{111}, \\qquad p_L = 3p^{2} - 2p^{3}'],
    },
    professional: {
      intro: 'Physical-to-logical overhead is the central number of fault-tolerant quantum computing: surface-code distance d uses ~2d² physical qubits per logical and suppresses error as (p/p_th)^{(d+1)/2}. At p = 10⁻³ and p_th ≈ 10⁻², reaching 10⁻¹² needs d ≈ 25–30 — roughly 1500 physical qubits per logical qubit, before magic-state factories.',
      points: [
        'The 2023–24 milestones: logical qubits with error below the best physical qubit (Quantinuum ions, Harvard/QuEra atoms, Google transmons with d = 3 → 5 → 7 showing the expected exponential suppression). Break-even, not yet scale.',
        'Code choice depends on connectivity: surface code needs only nearest-neighbour 2-D coupling (transmons); qLDPC codes (e.g. bivariate bicycle) cut overhead ~10× but need long-range connections (ions, atoms, or modular transmons).',
        'Logical gates: transversal Cliffords are cheap; T needs magic-state distillation; lattice surgery performs two-logical-qubit operations by merging and splitting patches over d rounds — logical gate time ≈ d × syndrome cycle ≈ 25 µs for transmons.',
        'The decoder must keep up: a d = 25 surface code produces ~600 syndrome bits per µs per logical qubit; real-time decoding on FPGAs/ASICs with latency below the cycle time is an unsolved engineering problem at full scale.',
      ],
      math: ['p_L \\approx 0.1\\left(\\frac{p}{p_{\\text{th}}}\\right)^{(d+1)/2}, \\qquad N_{\\text{phys}} \\approx 2d^{2}'],
    },
  },
  {
    topic: '09.10', minutes: 8,
    figure: { animation: 'repetition-code', params: { p: 0.05 } },
    kid: {
      intro: 'Quantum error correction is the trick that turns many unreliable qubits into a few reliable ones, by constantly checking for disagreements and fixing them — without ever looking at the answer itself. It is the reason large quantum computers are possible at all, and the reason they need so many qubits.',
      points: [
        'Check, fix, check, fix — thousands of times a second, for the whole run.',
        'Below a certain error rate — about one in a hundred — adding more qubits makes things better. Above it, more qubits only add more errors.',
        'The best machines crossed that line recently, for a single logical qubit. Scaling up is the next decade’s work.',
        'Error correction costs a lot: perhaps a thousand physical qubits for each one you can actually use.',
      ],
    },
    student: {
      intro: 'A stabiliser code is defined by commuting Pauli operators (stabilisers) whose joint +1 eigenspace is the code space. Measuring the stabilisers gives a syndrome that identifies the most likely error without revealing the encoded state; a decoder maps syndromes to corrections. The threshold theorem: if physical error p is below a threshold p_th, the logical error can be made arbitrarily small with polylogarithmic overhead.',
      points: [
        'Repetition code stabilisers: Z₁Z₂, Z₂Z₃; the code space is spanned by |000⟩ and |111⟩. Logical operators: X_L = X₁X₂X₃, Z_L = Z₁ (or any Zᵢ).',
        'Surface code: qubits on a 2-D lattice with X-type and Z-type plaquette stabilisers; distance d means any error of weight < d/2 is corrected; threshold ≈ 1% under circuit-level noise.',
        'Decoding: minimum-weight perfect matching pairs syndrome defects along the least-weight path; union-find is faster with slightly lower threshold.',
        'At p = 0.05 the repetition code gives p_L = 0.0073 — a 7× improvement; at p = 0.3 it gives 0.216, barely better. Threshold ½ for this toy code, ~1% for real codes under realistic noise.',
      ],
      math: ['S_i\\ket{\\psi_L} = +\\ket{\\psi_L}\\ \\forall i, \\qquad [S_i, S_j] = 0, \\qquad p < p_{\\text{th}} \\Rightarrow p_L \\to 0'],
    },
    professional: {
      intro: 'Fault tolerance is a protocol, not a code: syndrome extraction circuits must not spread single errors into uncorrectable ones, measurements are themselves noisy and repeated d times, and the decoder must run in real time. The resource estimate for any algorithm is dominated by these overheads and by magic-state distillation for non-Clifford gates.',
      points: [
        'Circuit-level thresholds (~0.5–1% for the surface code) are lower than code-capacity thresholds (~10%) because the extraction circuit adds locations for errors; flag qubits and careful CNOT ordering are what keep extraction fault-tolerant.',
        'Overhead for Shor-2048 or useful chemistry: ~10⁶ physical qubits at p = 10⁻³ (surface code) or ~10⁵ with qLDPC codes at the same p; each 10× reduction in p roughly halves d and quarters the qubit count.',
        'Logical clock: one syndrome round per ~1 µs (transmons) to ~1 ms (ions); logical operations take ~d rounds. Ions’ slower clock is partially compensated by higher fidelity (smaller d).',
        'Bosonic and biased-noise codes (cat qubits, dual-rail) exploit hardware noise structure to raise the threshold or reduce overhead — the main alternative to the surface-code baseline, with 2024 demonstrations of bit-flip times of seconds.',
      ],
      math: ['\\text{logical gate time} \\approx d\\cdot t_{\\text{cycle}}, \\qquad \\text{T count} \\times \\text{distillation cost} \\gg \\text{data qubits}'],
    },
  },
  {
    topic: '09.11', minutes: 7,
    figure: { animation: 'decoherence', params: { mode: 'nisq' } },
    kid: {
      intro: 'Today’s quantum computers are called NISQ: Noisy, Intermediate-Scale, Quantum. Noisy because every gate is slightly wrong and there is no error correction; intermediate because they have tens to a few hundred qubits — too many to simulate classically in general, too few and too noisy to run the famous algorithms.',
      points: [
        'A program of a few hundred gates mostly works; a program of ten thousand gates returns noise.',
        'NISQ machines are used for experiments, benchmarks and small simulations of molecules and materials.',
        'The hope was to find useful tasks that tolerate noise. So far, nothing beats classical computers at anything commercially useful.',
        'NISQ is a stage, not a destination. The destination is error-corrected machines.',
      ],
    },
    student: {
      intro: 'NISQ (Preskill, 2018) describes devices with 50–1000 qubits and gate error rates ~10⁻³–10⁻² without error correction. The total circuit error grows roughly as the number of gates times the per-gate error, so useful depth is limited to ~1/ε — a few hundred two-qubit gates — and algorithms must be shallow, variational and error-mitigated.',
      points: [
        'Success probability of a depth-d circuit ≈ f^d: at f = 0.999, depth 1000 gives 0.37; at f = 0.99, depth 100 gives 0.37. The figure plots these curves.',
        'NISQ algorithms: VQE (chemistry), QAOA (optimisation), quantum machine learning, random-circuit sampling (supremacy experiments). All are heuristic; none has a proven speed-up on noisy hardware.',
        'Error mitigation (zero-noise extrapolation, probabilistic error cancellation, symmetry verification) trades more shots for less bias; its cost grows exponentially with circuit size, which bounds its reach.',
        'Random-circuit sampling (Google 2019, 53 qubits, depth 20) and boson sampling demonstrated tasks classically hard in practice — beyond-classical, but not useful.',
      ],
      math: ['P_{\\text{success}} \\approx f^{\\,d} = e^{-\\varepsilon d}, \\qquad d_{\\max} \\sim \\frac{1}{\\varepsilon}'],
    },
    professional: {
      intro: 'The NISQ era’s honest scorecard: beyond-classical sampling demonstrated and repeatedly challenged by classical algorithms; variational algorithms hampered by barren plateaus and shot budgets; error mitigation extending reach by small constant factors at exponential cost. The transition to early fault tolerance — a few logical qubits with error < 10⁻⁶ — is where the field now aims.',
      points: [
        'Barren plateaus: for generic parameterised circuits the gradient variance vanishes exponentially in qubit number, so training cost explodes; problem-informed ansätze and local cost functions mitigate but do not remove it.',
        'Mitigation cost: probabilistic error cancellation requires sampling overhead γ^{2n_gates} with γ ≈ 1 + 2ε per gate — ~e^{4εN}; at ε = 10⁻³ and N = 10⁴ gates that is e⁴⁰. Mitigation is a bridge over hundreds, not thousands, of gates.',
        'Utility experiments (IBM 2023, 127-qubit Ising dynamics with ZNE) showed mitigated results beyond brute-force simulation; tensor-network methods then reproduced them, illustrating the moving classical frontier.',
        'Early fault tolerance: algorithms designed for ~100 logical qubits at 10⁻⁶–10⁻⁹ logical error (quantum phase estimation variants, Hamiltonian simulation of small models) are the credible first applications; resource estimates, not demos, drive the roadmap.',
      ],
      math: ['\\mathrm{Var}[\\partial_\\theta C] \\sim 2^{-n} \\ \\text{(barren plateau)}, \\qquad \\text{PEC overhead} \\sim \\gamma^{2N} \\approx e^{4\\varepsilon N}'],
    },
  },
  {
    topic: '09.12', minutes: 8,
    figure: { animation: 'decoherence', params: { mode: 'advantage' } },
    kid: {
      intro: 'Quantum advantage means a quantum computer doing something useful that no ordinary computer can do in a reasonable time. It has been shown for artificial puzzles. For real problems — new medicines, better batteries, breaking codes — it has not happened yet, and honest estimates say it needs machines a thousand times bigger and far less noisy.',
      points: [
        'The promise is real: for a few specific problems, the quantum speed-up is enormous and mathematically proven.',
        'The limitations are real too: noise, tiny machine sizes, and the huge overhead of error correction.',
        'Classical computers keep improving as well, and clever classical algorithms have erased several claimed quantum wins.',
        'The right attitude: not “when will it replace my laptop” (never) but “which few problems will it crack, and when”.',
      ],
    },
    student: {
      intro: 'Quantum advantage is a quantum computer outperforming the best classical method on a task. Proven exponential advantages exist for specific problems (factoring, simulating quantum systems, some linear-algebra tasks with caveats); quadratic ones for search. Demonstrated advantages are so far on contrived sampling tasks; useful advantage requires error correction at scale.',
      points: [
        'Why classical simulation fails: 2ⁿ amplitudes — 2⁵⁰ × 16 bytes ≈ 18 PB — but structured circuits (low entanglement, Clifford, shallow) are simulable far beyond n = 50, so advantage needs depth and entanglement, not just qubits.',
        'Shor: exponential advantage, needs ~10⁶ physical qubits (today: ~10³). Quantum simulation of chemistry: polynomial but large constants; the first useful instances are estimated at 10⁵–10⁶ physical qubits.',
        'Grover: quadratic only, and the oracle must run coherently √N times; the fault-tolerant overhead typically erases the gain for realistic N.',
        'Dequantisation: several claimed exponential speed-ups (recommendation systems, some ML) were matched by classical algorithms once the same access assumptions were granted — advantage claims must be checked against the best classical competitor under the same model.',
      ],
      math: ['\\text{memory}(n) = 2^{n}\\times 16\\ \\text{B}, \\quad 2^{50} \\to 18\\ \\text{PB}; \\qquad \\text{Shor: } O((\\log N)^{3}) \\ \\text{vs GNFS } e^{O((\\log N)^{1/3}(\\log\\log N)^{2/3})}'],
    },
    professional: {
      intro: 'The credible near-term path to advantage is narrow: quantum simulation of strongly correlated systems and specific optimisation subroutines, run on early fault-tolerant machines, compared honestly against classical tensor-network and Monte Carlo methods that are themselves improving. The field’s key risk is overclaiming; its key asset is that the physics has never failed.',
      points: [
        'Resource estimation is now the discipline: end-to-end counts of logical qubits, T gates and runtime for FeMoco, cytochrome P450, lattice models — typically 10⁵–10⁶ physical qubits and hours to days, with 10–100× improvements from algorithmic progress in the last five years.',
        'Classical competition is not static: tensor networks, neural quantum states and improved sampling have matched several “beyond-classical” experiments within months. Advantage must be demonstrated against the state of the art at the time of the claim, under matched assumptions.',
        'Present limitations in order of severity: two-qubit error rates (10⁻³ versus 10⁻⁴ needed for manageable overhead), qubit count (10³ versus 10⁶), control scaling (wiring, cryogenics, lasers), and decoder latency.',
        'Where to stand: factoring and discrete logs will fall to a CRQC eventually, hence post-quantum cryptography now; quantum simulation of materials and chemistry is the most defensible scientific advantage; broad speed-ups for machine learning or generic optimisation are unsupported by current theory.',
      ],
      math: ['\\text{advantage} \\iff T_{\\text{quantum}}(n) \\ll \\min_{\\text{classical}} T(n) \\ \\text{under matched access and precision}'],
    },
  },
];
