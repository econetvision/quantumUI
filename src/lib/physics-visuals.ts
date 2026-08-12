/**
 * Computed physics animations.
 *
 * Every GIF referenced here is produced by
 * `scripts/generate_physics_animations.py`, which numerically solves the
 * physics rather than illustrating it — the tunnelling frames come from a
 * split-step integration of the time-dependent Schrödinger equation, the
 * Grover frames from applying the real oracle and diffusion operators.
 *
 * The `verified` field records a claim that was checked against the generated
 * data, so the teaching text and the animation cannot silently drift apart.
 */

export interface PhysicsVisual {
  id: string;
  src: string;
  title: string;
  /** Screen-reader description of what is moving. */
  alt: string;
  summary: string;
  /** What the learner should watch for. */
  watchFor: string;
  /** A quantitative claim confirmed from the generated frame data. */
  verified: string;
  method: string;
  /** Track slugs this belongs to. */
  tracks: string[];
}

const gif = (name: string) => `/images/physics/${name}.gif`;

export const PHYSICS_VISUALS: PhysicsVisual[] = [
  {
    id: 'quantum-pioneers',
    src: gif('quantum-pioneers'),
    title: 'How quantum mechanics was built, 1900–1964',
    alt: 'A timeline advancing through ten discoveries from Planck in 1900 to Bell in 1964, each with the physicist, their equation and its significance',
    summary:
      'Ten steps from Planck’s desperate fix to Bell’s testable inequality — each with the equation that changed things.',
    watchFor:
      'The marker walks the timeline. Note how fast 1924–1928 moves: de Broglie to Dirac in four years.',
    verified:
      'Each entry carries the equation its author actually published, in that year.',
    method: 'Timeline rendered from the dated discovery list; equations typeset from LaTeX.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'planck-blackbody',
    src: gif('planck-blackbody'),
    title: 'The ultraviolet catastrophe',
    alt: 'Planck blackbody curve against the classical Rayleigh-Jeans prediction, which diverges at short wavelengths, as temperature rises from 3000K to 7000K',
    summary:
      'Classical physics predicted infinite energy at short wavelengths. Quantising energy was the only fix — and it started everything.',
    watchFor:
      'The dashed classical curve shoots off the top of the chart. The quantised curve turns over and peaks.',
    verified:
      'The numerical peak matches Wien’s displacement law to within 0.3% across 3000–7000 K.',
    method: 'Planck’s law evaluated directly against the Rayleigh–Jeans limit, SI constants.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'bohr-hydrogen-spectrum',
    src: gif('bohr-hydrogen-spectrum'),
    title: 'Bohr’s atom and the hydrogen spectrum',
    alt: 'Hydrogen energy level diagram with an electron dropping from n=6, 5, 4 and 3 down to n=2, each transition emitting a coloured spectral line onto a spectrum panel',
    summary:
      'An electron drops between fixed levels and emits a photon. The four visible Balmer lines build up as it goes.',
    watchFor:
      'Each drop emits one line at a specific colour. Bigger energy gaps give bluer light.',
    verified:
      'Wavelengths computed from the Rydberg formula land within 0.03% of the accepted Balmer values (656.11 vs 656.3 nm).',
    method: 'Eₙ = −13.606/n² eV; wavelengths from the Rydberg formula; colours from the visible spectrum.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'born-rule-convergence',
    src: gif('born-rule-convergence'),
    title: 'Born’s rule: probability from amplitude',
    alt: 'A histogram of repeated position measurements gradually converging onto the theoretical probability density curve',
    summary:
      'One measurement tells you almost nothing. Thousands reconstruct |Ψ|² exactly — which is all Ψ ever promised.',
    watchFor:
      'The L¹ error between measurement and theory, printed live, falls as samples accumulate.',
    verified:
      'Error drops from 1.21 to 0.16 over 2,475 samples, converging monotonically on the true density.',
    method: 'Sampling a two-peak |Ψ|², normalised identically to the theory curve for direct comparison.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'schrodinger-derivation',
    src: gif('schrodinger-derivation'),
    title: 'Deriving the Schrödinger equation',
    alt: 'Ten-step derivation building from classical energy through de Broglie and Planck to the time-dependent Schrödinger equation and the Born rule',
    summary:
      'Ten steps from the classical energy of a particle to iℏ ∂Ψ/∂t = ĤΨ, and on to what a quantum gate actually is.',
    watchFor:
      'Each step keeps the previous two on screen, so you can see the substitution that turns E and p² into operators.',
    verified: 'Ends at U = e^(−iĤt/ℏ) — the unitary a quantum gate implements.',
    method: 'Rendered from the derivation chain; each equation typeset from LaTeX.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'schrodinger-tunnelling',
    src: gif('schrodinger-tunnelling'),
    title: 'Quantum tunnelling',
    alt: 'A Gaussian wavepacket travelling right, striking a potential barrier, partly reflecting and partly passing through',
    summary:
      'A wavepacket meets a barrier taller than its energy. Classically nothing gets through. Part of it does.',
    watchFor:
      'The probability density splits at the barrier. The transmitted and reflected fractions are printed live.',
    verified:
      'Transmitted + reflected = 1.000 at every frame — probability is conserved. 4.6% tunnels through.',
    method:
      'Split-step Fourier integration of iℏ∂Ψ/∂t = ĤΨ, ħ = m = 1, 1024 grid points.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'heisenberg-uncertainty',
    src: gif('heisenberg-uncertainty'),
    title: 'Heisenberg uncertainty in motion',
    alt: 'A free Gaussian wavepacket spreading out over time while its momentum width stays constant',
    summary:
      'A free particle’s position spreads while its momentum spread stays fixed — the uncertainty product only grows.',
    watchFor:
      'σₓ climbs frame by frame; σₖ does not move. Their product is printed on screen.',
    verified:
      'σₓ·σₖ starts at exactly 0.500 — a minimum-uncertainty Gaussian — and never drops below it.',
    method:
      'Same TDSE solver with V = 0; σₖ measured from the Fourier transform of Ψ.',
    tracks: ['quantum-fundamentals'],
  },
  {
    id: 'double-slit-interference',
    src: gif('double-slit-interference'),
    title: 'Double slit, one detection at a time',
    alt: 'Individual particle detections accumulating on a screen until an interference fringe pattern emerges',
    summary:
      'Each detection is a single dot. The fringes are not in any one of them — they emerge from thousands.',
    watchFor:
      'The early frames look random. The predicted |Ψ₁+Ψ₂|² curve is overlaid so you can watch the data converge onto it.',
    verified:
      'Detections are sampled from the true two-slit intensity, including the single-slit envelope.',
    method:
      'Sampling from sinc²(β)·cos²(δ) — the exact two-slit intensity with finite slit width.',
    tracks: ['quantum-fundamentals', 'quantum-entanglement'],
  },
  {
    id: 'bloch-phase-precession',
    src: gif('bloch-phase-precession'),
    title: 'Phase precession on the Bloch sphere',
    alt: 'A Bloch vector rotating around the vertical axis at constant polar angle while measurement probabilities stay fixed',
    summary:
      'Phase evolution moves the state without changing any measurement probability in the computational basis.',
    watchFor:
      'The arrow sweeps a full circle. P(0) and P(1) never budge — which is exactly why phase is invisible until you interfere.',
    verified: 'Polar angle held fixed, so P(0) = cos²(θ/2) is constant by construction.',
    method: 'Bloch vector traced at fixed θ with φ advancing through 2π.',
    tracks: ['quantum-gates', 'quantum-fundamentals'],
  },
  {
    id: 'grover-amplitude-amplification',
    src: gif('grover-amplitude-amplification'),
    title: 'Grover: oracle and diffusion, step by step',
    alt: 'Amplitude bar chart across sixteen basis states; the oracle flips the target amplitude negative and diffusion reflects all amplitudes about their mean',
    summary:
      'Watch the two operations that make Grover work, on real amplitudes, one at a time.',
    watchFor:
      'The oracle only flips a sign — the bar heights are unchanged. Diffusion does the amplifying, reflecting about the dashed mean.',
    verified:
      'P(target) goes 6.25% → 47% → 91% → 96%. 1/N = 6.25% for N = 16, and ⌈π/4·√16⌉ = 3 iterations.',
    method:
      'Real amplitude vector; oracle applies a sign flip, diffusion applies 2⟨a⟩ − a.',
    tracks: ['quantum-algorithms'],
  },
];

export function visualsForTrack(slug: string): PhysicsVisual[] {
  return PHYSICS_VISUALS.filter((visual) => visual.tracks.includes(slug));
}
