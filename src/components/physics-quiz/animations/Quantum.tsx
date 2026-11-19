'use client';

import { Axes, Figure, polyline, useAnimate, useLoop } from '../Figure';
import {
  COMPTON_WAVELENGTH,
  ELECTRON_MASS,
  ELECTRON_VOLT,
  HBAR,
  boxEnergy,
  boxWavefunction,
  comptonShift,
  deBroglieWavelength,
  minMomentumSpread,
  sci,
  tunnelProbability,
} from '@/lib/physics';
import { GATES, applyGate, blochVector, stateFromAngles, type State } from '@/lib/quantum-sim';

/**
 * Figures for Modules 03–06: the quantum revolution, the core principles, the
 * formal framework and the first solvable systems.
 *
 * Same rule as everywhere else in this folder: numbers are computed, not
 * drawn. The box energies come from n²h²/8mL², the Bloch vector from the
 * statevector, the tunnelling fraction from e^{−2κL}. A figure can therefore
 * disagree with a lesson only if the lesson is wrong.
 */

const W = 320;
const H = 180;
const MONO = 'monospace';
const hash = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

// --- 03.08 Compton effect -----------------------------------------------------

export function Compton({ deg = 90 }: { deg?: number }) {
  const t = useLoop(3600, useAnimate());
  const theta = (deg * Math.PI) / 180;
  const shift = comptonShift(theta);
  const ex = 150;
  const ey = 96;
  const inX = 20 + Math.min(1, t * 2) * (ex - 20);
  const out = Math.max(0, t - 0.5) * 2;
  const ox = ex + out * 110 * Math.cos(theta);
  const oy = ey - out * 110 * Math.sin(theta);
  const rx = ex + out * 70 * Math.cos(-theta / 2.4);
  const ry = ey - out * 70 * Math.sin(-theta / 2.4);
  const wave = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const n = 40; const dx = x1 - x0; const dy = y1 - y0; const len = Math.hypot(dx, dy) || 1;
    return polyline(Array.from({ length: n }, (_, i) => { const u = i / (n - 1); const s = 5 * Math.sin(u * k * 2 * Math.PI - t * 12); return { x: x0 + dx * u - (dy / len) * s, y: y0 + dy * u + (dx / len) * s }; }));
  };
  return (
    <Figure width={W} height={H} label={`A photon scatters off an electron at ${deg} degrees. Its wavelength grows by ${(shift / 1e-12).toFixed(2)} picometres and the electron recoils.`}
      caption={`θ = ${deg}° · Δλ = λ_C(1 − cos θ) = ${(shift / 1e-12).toFixed(2)} pm · λ_C = ${(COMPTON_WAVELENGTH / 1e-12).toFixed(2)} pm`}>
      <path d={wave(20, ey, inX, ey, 6)} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      <circle cx={out > 0 ? rx : ex} cy={out > 0 ? ry : ey} r={7} fill="currentColor" opacity={0.8} />
      <text x={ex} y={ey + 26} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7}>electron</text>
      {out > 0 && (
        <g>
          <path d={wave(ex, ey, ox, oy, 4.5)} fill="none" stroke="var(--color-danger)" strokeWidth={2} />
          <text x={ox + 6} y={oy - 4} fontSize={9} fill="var(--color-danger)" fontFamily={MONO}>λ′ = λ + Δλ</text>
          <line x1={ex} y1={ey} x2={rx} y2={ry} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
        </g>
      )}
      <path d={`M${ex + 26},${ey} A26,26 0 0 0 ${ex + 26 * Math.cos(theta)},${ey - 26 * Math.sin(theta)}`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.5} />
      <text x={ex + 32} y={ey - 10} fontSize={9} fill="currentColor" opacity={0.7}>θ</text>
      <text x={24} y={ey - 14} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>λ in</text>
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>photon loses energy to the electron → longer wavelength</text>
    </Figure>
  );
}

// --- 03.10 electron diffraction ----------------------------------------------

export function ElectronDiffraction({ energyEv = 54 }: { energyEv?: number }) {
  const t = useLoop(5000, useAnimate());
  const p = Math.sqrt(2 * ELECTRON_MASS * energyEv * ELECTRON_VOLT);
  const lambda = deBroglieWavelength(p);
  const d = 0.215e-9; // a typical lattice spacing
  const rings = [1, 2, 3].map((n) => Math.asin(Math.min(0.99, (n * lambda) / d)));
  const cx = 110;
  const cy = 92;
  const dots = Math.floor(t * 300);
  return (
    <Figure width={W} height={H} label={`Electrons of ${energyEv} electronvolts, de Broglie wavelength ${(lambda / 1e-9).toFixed(3)} nanometres, build diffraction rings on a screen.`}
      caption={`E = ${energyEv} eV → λ = h/√(2mE) = ${(lambda / 1e-9).toFixed(3)} nm · rings where d sin θ = nλ`}>
      <circle cx={cx} cy={cy} r={78} fill="currentColor" opacity={0.06} />
      {rings.map((th, i) => (
        <circle key={i} cx={cx} cy={cy} r={Math.tan(th) * 60} fill="none" stroke="var(--color-accent)" strokeWidth={1} opacity={0.35} />
      ))}
      {Array.from({ length: dots }, (_, i) => {
        const ring = Math.floor(hash(i) * 3);
        const r = Math.tan(rings[ring]) * 60 + (hash(i + 500) - 0.5) * 5;
        const a = hash(i + 1000) * 2 * Math.PI;
        return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={1.3} fill="var(--color-accent)" opacity={0.8} />;
      })}
      <circle cx={cx} cy={cy} r={3} fill="currentColor" />
      <text x={214} y={40} fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>{dots} electrons</text>
      <text x={214} y={60} fontSize={10} fill="currentColor" opacity={0.7} fontFamily={MONO}>one dot each,</text>
      <text x={214} y={74} fontSize={10} fill="currentColor" opacity={0.7} fontFamily={MONO}>rings together</text>
      <text x={214} y={104} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>d = {(d / 1e-9).toFixed(3)} nm</text>
      <text x={214} y={120} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>λ = {(lambda / 1e-9).toFixed(3)} nm</text>
      <text x={214} y={150} fontSize={9} fill="currentColor" opacity={0.65}>particles arriving,</text>
      <text x={214} y={162} fontSize={9} fill="currentColor" opacity={0.65}>a wave deciding where</text>
    </Figure>
  );
}

// --- Bloch sphere: 04.01, 04.05, 04.06, 05.01, 05.02, 07.03–07.05, 08.03, 08.05–08.08, 09.07

type Axis = [number, number, number];
const GATE_ROTATIONS: Record<string, { axis: Axis; angle: number; label: string }> = {
  X: { axis: [1, 0, 0], angle: Math.PI, label: 'X: half-turn about x' },
  Y: { axis: [0, 1, 0], angle: Math.PI, label: 'Y: half-turn about y' },
  Z: { axis: [0, 0, 1], angle: Math.PI, label: 'Z: half-turn about z — a phase of π' },
  S: { axis: [0, 0, 1], angle: Math.PI / 2, label: 'S: quarter-turn about z — phase π/2' },
  T: { axis: [0, 0, 1], angle: Math.PI / 4, label: 'T: eighth-turn about z — phase π/4' },
  H: { axis: [Math.SQRT1_2, 0, Math.SQRT1_2], angle: Math.PI, label: 'H: half-turn about the x+z diagonal' },
  RX: { axis: [1, 0, 0], angle: Math.PI / 2, label: 'Rx(π/2): quarter-turn about x' },
  RY: { axis: [0, 1, 0], angle: Math.PI / 2, label: 'Ry(π/2): quarter-turn about y' },
};

/** Rodrigues rotation of v about unit axis k by angle a. */
function rotate(v: Axis, k: Axis, a: number): Axis {
  const [vx, vy, vz] = v; const [kx, ky, kz] = k;
  const cos = Math.cos(a); const sin = Math.sin(a);
  const dot = kx * vx + ky * vy + kz * vz;
  const cross: Axis = [ky * vz - kz * vy, kz * vx - kx * vz, kx * vy - ky * vx];
  return [
    vx * cos + cross[0] * sin + kx * dot * (1 - cos),
    vy * cos + cross[1] * sin + ky * dot * (1 - cos),
    vz * cos + cross[2] * sin + kz * dot * (1 - cos),
  ];
}

export function BlochSphere({
  theta = 0,
  phi = 0,
  gate,
  spin = false,
  decohere,
}: {
  theta?: number;
  phi?: number;
  gate?: string;
  spin?: boolean;
  /** 'dephase' shrinks the equatorial components; 'relax' pulls toward |0⟩. */
  decohere?: 'dephase' | 'relax';
}) {
  const t = useLoop(gate || decohere ? 4200 : 3000, useAnimate());
  const start = blochVector(stateFromAngles(theta, phi));
  let v: Axis = [start.x, start.y, start.z];
  const rot = gate ? GATE_ROTATIONS[gate.toUpperCase()] : undefined;
  const progress = Math.min(1, t * 1.5);
  if (rot) v = rotate(v, rot.axis, rot.angle * progress);
  if (decohere === 'dephase') v = [v[0] * Math.exp(-3 * t), v[1] * Math.exp(-3 * t), v[2]];
  if (decohere === 'relax') v = [v[0] * Math.exp(-3 * t), v[1] * Math.exp(-3 * t), 1 - (1 - v[2]) * Math.exp(-3 * t)];
  const cx = 110; const cy = 92; const R = 62;
  const proj = ([x, y, z]: Axis) => ({ x: cx + x * R * 0.95 + y * R * 0.38, y: cy - z * R + y * R * 0.22 });
  const tip = proj(v);
  const len = Math.hypot(...v);
  const th = Math.acos(Math.max(-1, Math.min(1, v[2] / (len || 1))));
  const ph = Math.atan2(v[1], v[0]);
  const p0 = Math.cos(th / 2) ** 2 * (decohere ? 1 : 1);
  const deg = (r: number) => `${((r * 180) / Math.PI).toFixed(0)}°`;
  const up = spin ? '↑' : '|0⟩'; const down = spin ? '↓' : '|1⟩';
  const caption = rot
    ? `${rot.label} · ${(progress * 100).toFixed(0)}% done`
    : decohere === 'dephase'
      ? `dephasing: phase information fading, |${up.replace(/[|⟩]/g, '')}|² unchanged · length ${len.toFixed(2)}`
      : decohere === 'relax'
        ? `relaxation: energy leaking out, state falling to ${up} · length ${len.toFixed(2)}`
        : `θ = ${deg(th)}, φ = ${deg(ph)} · P(${up}) = cos²(θ/2) = ${p0.toFixed(2)}`;
  return (
    <Figure width={W} height={H} label={`Bloch sphere with the state vector at polar angle ${deg(th)} and azimuth ${deg(ph)}. ${caption}.`} caption={caption}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <ellipse cx={cx} cy={cy} rx={R * 0.95} ry={R * 0.22} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} strokeDasharray="3 3" />
      <line x1={cx} y1={cy + R} x2={cx} y2={cy - R} stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <text x={cx} y={cy - R - 6} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>{up}</text>
      <text x={cx} y={cy + R + 14} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>{down}</text>
      <text x={cx + R + 4} y={cy + 4} fontSize={10} fill="currentColor" opacity={0.6} fontFamily={MONO}>{spin ? '→' : '|+⟩'}</text>
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="var(--color-accent)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={5} fill="var(--color-accent)" />
      <line x1={tip.x} y1={tip.y} x2={tip.x} y2={cy - 0 + (tip.y - cy) * 0} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="2 3" opacity={0} />
      <text x={214} y={44} fontSize={11} fill="currentColor" opacity={0.85} fontFamily={MONO}>θ = {deg(th)}</text>
      <text x={214} y={62} fontSize={11} fill="currentColor" opacity={0.85} fontFamily={MONO}>φ = {deg(ph)}</text>
      <text x={214} y={92} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>P({up}) = {p0.toFixed(2)}</text>
      <text x={214} y={108} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>P({down}) = {(1 - p0).toFixed(2)}</text>
      {decohere && <text x={214} y={138} fontSize={10} fill="var(--color-danger)" fontFamily={MONO}>|r| = {len.toFixed(2)}</text>}
      {!decohere && <text x={214} y={138} fontSize={9} fill="currentColor" opacity={0.6}>north pole {up}, south {down},</text>}
      {!decohere && <text x={214} y={150} fontSize={9} fill="currentColor" opacity={0.6}>equator: equal mixtures</text>}
    </Figure>
  );
}

// --- Measurement: 04.08, 04.09, 08.04, 09.05 -----------------------------------

export function MeasurementCollapse({ theta = Math.PI / 2, phi = 0, basis = 'z', shots = 40 }: { theta?: number; phi?: number; basis?: 'z' | 'x'; shots?: number }) {
  const t = useLoop(5200, useAnimate());
  let state: State = stateFromAngles(theta, phi);
  if (basis === 'x') state = applyGate(state, GATES.H, 0); // measure X by rotating into Z
  const p0 = state.amplitudes[0].re ** 2 + state.amplitudes[0].im ** 2;
  const n = Math.min(shots, Math.floor(t * 1.3 * (shots + 1)));
  let c0 = 0;
  for (let i = 0; i < n; i += 1) if (hash(i + 7) < p0) c0 += 1;
  const c1 = n - c0;
  const last = n > 0 ? (hash(n - 1 + 7) < p0 ? 0 : 1) : null;
  const lab = basis === 'z' ? ['|0⟩', '|1⟩'] : ['|+⟩', '|−⟩'];
  const base = H - 40;
  return (
    <Figure width={W} height={H} label={`Repeated measurement of one prepared state in the ${basis.toUpperCase()} basis. Each shot gives one definite outcome; the tally approaches the predicted probabilities ${p0.toFixed(2)} and ${(1 - p0).toFixed(2)}.`}
      caption={n === 0 ? 'prepare the same state, measure, repeat' : `after ${n} shots: ${lab[0]} ${c0} (${((c0 / n) * 100).toFixed(0)}%) · ${lab[1]} ${c1} · predicted ${p0.toFixed(2)} / ${(1 - p0).toFixed(2)}`}>
      <text x={24} y={28} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>state before: superposition</text>
      <rect x={24} y={38} width={100 * p0} height={10} fill="var(--color-accent)" opacity={0.8} />
      <rect x={24 + 100 * p0} y={38} width={100 * (1 - p0)} height={10} fill="currentColor" opacity={0.3} />
      <text x={24} y={62} fontSize={9} fill="currentColor" opacity={0.65} fontFamily={MONO}>|α|² = {p0.toFixed(2)} · |β|² = {(1 - p0).toFixed(2)}</text>
      <text x={24} y={88} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>this shot → {last === null ? '…' : lab[last]}</text>
      <rect x={24} y={96} width={100} height={10} fill={last === 0 ? 'var(--color-accent)' : 'currentColor'} opacity={last === null ? 0.15 : 0.85} />
      <text x={24} y={122} fontSize={9} fill="currentColor" opacity={0.65} fontFamily={MONO}>after: definite, no longer a superposition</text>
      {[c0, c1].map((cnt, i) => {
        const hgt = n ? (cnt / n) * 90 : 0;
        return (
          <g key={i}>
            <rect x={200 + i * 50} y={base - hgt} width={36} height={hgt} rx={2} fill={i === 0 ? 'var(--color-accent)' : 'currentColor'} opacity={0.8} />
            <text x={218 + i * 50} y={base + 14} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.8} fontFamily={MONO}>{lab[i]}</text>
            <text x={218 + i * 50} y={base - hgt - 5} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.8} fontFamily={MONO}>{cnt}</text>
          </g>
        );
      })}
      <line x1={196} y1={base - p0 * 90} x2={240} y2={base - p0 * 90} stroke="var(--color-success)" strokeWidth={1} strokeDasharray="3 2" />
      <text x={200} y={base + 30} fontSize={9} fill="var(--color-success)" fontFamily={MONO}>dashed: prediction</text>
    </Figure>
  );
}

// --- Box and oscillator: 05.09–05.11, 06.01–06.04, 06.08 --------------------------

const hermite = (n: number, u: number) => (n === 0 ? 1 : n === 1 ? 2 * u : 4 * u * u - 2);

export function WaveInBox({ n, mode = 'box', density = false }: { n?: number; mode?: 'box' | 'oscillator'; density?: boolean }) {
  const t = useLoop(6000, useAnimate());
  const level = n ?? 1 + (Math.floor(t * 3) % 3);
  const L = 1e-9;
  const x0 = 40; const x1 = 200; const base = 136; const amp = 30;
  const curve = Array.from({ length: 120 }, (_, i) => {
    const u = i / 119;
    let psi: number;
    if (mode === 'box') psi = boxWavefunction(level, u * L, L) / Math.sqrt(2 / L);
    else { const q = (u - 0.5) * 7; psi = hermite(level - 1, q) * Math.exp(-q * q / 2) / (level === 1 ? 1 : level === 2 ? 2.2 : 3.2); }
    const y = density ? psi * psi : psi;
    return { x: x0 + u * (x1 - x0), y: base - y * amp * (density ? 1.6 : 1) };
  });
  const energies = [1, 2, 3, 4].map((k) => (mode === 'box' ? boxEnergy(k, L) / ELECTRON_VOLT : k - 0.5));
  const eMax = energies[3] * 1.1;
  const yFor = (e: number) => 150 - (e / eMax) * 120;
  const e = energies[level - 1];
  const caption = mode === 'box'
    ? `n = ${level} · Eₙ = n²h²/8mL² → E${'₁₂₃'[level - 1]} = ${e.toFixed(2)} eV (electron, L = 1 nm) · ${level - 1} node${level === 2 ? '' : 's'}`
    : `n = ${level - 1} · Eₙ = ħω(n + ½) = ${e.toFixed(1)} ħω · levels equally spaced`;
  return (
    <Figure width={W} height={H} label={`${mode === 'box' ? 'Particle in a box' : 'Harmonic oscillator'}: the ${density ? 'probability density' : 'wavefunction'} for level ${level} and the ladder of allowed energies.`} caption={caption}>
      {mode === 'box' ? (
        <g>
          <line x1={x0} y1={30} x2={x0} y2={base + 36} stroke="currentColor" strokeWidth={3} opacity={0.6} />
          <line x1={x1} y1={30} x2={x1} y2={base + 36} stroke="currentColor" strokeWidth={3} opacity={0.6} />
          <text x={(x0 + x1) / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6} fontFamily={MONO}>V = 0 inside, ∞ at the walls</text>
        </g>
      ) : (
        <path d={polyline(Array.from({ length: 60 }, (_, i) => { const u = i / 59; return { x: x0 + u * (x1 - x0), y: base + 36 - ((u - 0.5) * 2) ** 2 * 120 }; }))} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
      )}
      <line x1={x0} y1={base} x2={x1} y2={base} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <path d={polyline(curve)} fill={density ? 'var(--color-accent)' : 'none'} fillOpacity={0.2} stroke="var(--color-accent)" strokeWidth={2.5} />
      <text x={x0} y={24} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>{density ? '|ψ|²' : 'ψ'}{'₁₂₃'[level - 1]}(x)</text>
      {energies.map((en, i) => (
        <g key={i}>
          <line x1={228} y1={yFor(en)} x2={300} y2={yFor(en)} stroke={i + 1 === level ? 'var(--color-accent)' : 'currentColor'} strokeWidth={i + 1 === level ? 2.5 : 1} opacity={i + 1 === level ? 1 : 0.4} />
          <text x={304} y={yFor(en) + 3} fontSize={8} fill="currentColor" opacity={0.7} fontFamily={MONO}>{mode === 'box' ? `${en.toFixed(2)}` : `${en.toFixed(1)}`}</text>
        </g>
      ))}
      <text x={264} y={22} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>{mode === 'box' ? 'E (eV) ∝ n²' : 'E / ħω'}</text>
    </Figure>
  );
}

// --- Barriers and tunnelling: 06.05–06.07 ---------------------------------------

export function Tunnelling({ barrierEv = 1, widthNm = 1, energyEv = 0.5, mode = 'barrier' }: { barrierEv?: number; widthNm?: number; energyEv?: number; mode?: 'barrier' | 'well' }) {
  const t = useLoop(3000, useAnimate());
  const T = tunnelProbability(energyEv * ELECTRON_VOLT, barrierEv * ELECTRON_VOLT, widthNm * 1e-9);
  const kappa = Math.sqrt(2 * ELECTRON_MASS * (barrierEv - energyEv) * ELECTRON_VOLT) / HBAR;
  const bx0 = mode === 'barrier' ? 140 : 100; const bx1 = mode === 'barrier' ? 140 + widthNm * 50 : 220;
  const mid = 100; const amp = 26;
  const pts = Array.from({ length: 200 }, (_, i) => {
    const x = 20 + (i / 199) * (W - 40);
    let y: number;
    if (mode === 'barrier') {
      if (x < bx0) y = amp * Math.sin((x - 20) / 7 - t * 2 * Math.PI);
      else if (x < bx1) y = amp * Math.exp(-kappa * ((x - bx0) / 50) * 1e-9) * Math.cos(-t * 2 * Math.PI);
      else y = amp * Math.max(0.12, Math.sqrt(T)) * Math.sin((x - bx1) / 7 - t * 2 * Math.PI);
    } else {
      const inside = x >= bx0 && x <= bx1;
      y = inside ? amp * Math.cos(((x - (bx0 + bx1) / 2) / (bx1 - bx0)) * Math.PI) : amp * Math.exp(-(x < bx0 ? bx0 - x : x - bx1) / 18) * 1;
      y *= Math.cos(t * 2 * Math.PI);
    }
    return { x, y: mid - y };
  });
  const caption = mode === 'barrier'
    ? `E = ${energyEv} eV, V₀ = ${barrierEv} eV, L = ${widthNm} nm → T ≈ e^{−2κL} = ${sci(T, 1)} (κ = ${(kappa * 1e-9).toFixed(1)} nm⁻¹)`
    : 'finite well: ψ leaks into the walls — the particle is found where it classically cannot be';
  return (
    <Figure width={W} height={H} label={mode === 'barrier' ? `A wave meets a barrier higher than its energy. Inside it decays exponentially; a fraction ${sci(T, 1)} gets through.` : 'A bound state in a finite well. The wavefunction decays into the walls instead of stopping at them.'} caption={caption}>
      <rect x={bx0} y={mode === 'barrier' ? 40 : 60} width={bx1 - bx0} height={mode === 'barrier' ? 100 : 0} fill="currentColor" opacity={0.12} />
      {mode === 'well' && (
        <g>
          <rect x={20} y={40} width={bx0 - 20} height={100} fill="currentColor" opacity={0.12} />
          <rect x={bx1} y={40} width={W - 20 - bx1} height={100} fill="currentColor" opacity={0.12} />
        </g>
      )}
      <line x1={20} y1={mid} x2={W - 20} y2={mid} stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <path d={polyline(pts)} fill="none" stroke="var(--color-accent)" strokeWidth={2.2} />
      {mode === 'barrier' && (
        <g>
          <text x={(bx0 + bx1) / 2} y={34} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>V₀ = {barrierEv} eV</text>
          <text x={60} y={34} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>E = {energyEv} eV</text>
          <text x={W - 24} y={34} textAnchor="end" fontSize={9} fill="var(--color-success)" fontFamily={MONO}>T = {sci(T, 1)}</text>
          <text x={(bx0 + bx1) / 2} y={158} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>e^(−κx) inside</text>
        </g>
      )}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>{mode === 'barrier' ? 'classically: reflected every time' : 'classically: never past the edge'}</text>
    </Figure>
  );
}

// --- Uncertainty: 04.10 ----------------------------------------------------------

export function Uncertainty() {
  const t = useLoop(5000, useAnimate());
  const dx = 0.35 + 1.45 * (0.5 - 0.5 * Math.cos(t * 2 * Math.PI)); // sweeps 0.35 → 1.8 → 0.35
  const dp = minMomentumSpread(dx * 1e-10) / HBAR * 1e-10; // in units of ħ/Å, so dx·dp = 0.5
  const gauss = (cx: number, width: number, y0: number, scale: number) =>
    polyline(Array.from({ length: 80 }, (_, i) => { const u = (i / 79 - 0.5) * 6; return { x: cx + u * 20, y: y0 - scale * Math.exp(-(u * u) / (2 * width * width)) / width }; }));
  return (
    <Figure width={W} height={H} label="A position wave packet and its momentum distribution. Squeezing one broadens the other; the product of their widths never drops below ħ/2."
      caption={`Δx = ${dx.toFixed(2)} Å · Δp = ${dp.toFixed(2)} ħ/Å · Δx·Δp = ${(dx * dp).toFixed(2)} ħ — the minimum, always`}>
      <text x={80} y={28} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>|ψ(x)|²</text>
      <path d={gauss(80, dx, 126, 42)} fill="var(--color-accent)" fillOpacity={0.2} stroke="var(--color-accent)" strokeWidth={2} />
      <line x1={20} y1={126} x2={140} y2={126} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <text x={80} y={142} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65} fontFamily={MONO}>Δx = {dx.toFixed(2)}</text>
      <text x={240} y={28} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>|φ(p)|²</text>
      <path d={gauss(240, dp, 126, 42)} fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeWidth={2} opacity={0.8} />
      <line x1={180} y1={126} x2={300} y2={126} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <text x={240} y={142} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65} fontFamily={MONO}>Δp = {dp.toFixed(2)}</text>
      <text x={W / 2} y={166} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>Δx · Δp ≥ ħ/2</text>
    </Figure>
  );
}

// --- Compatible and incompatible observables: 04.11 --------------------------------

export function IncompatibleObservables() {
  const t = useLoop(6000, useAnimate());
  const step = Math.floor(t * 12);
  // Sequence A: Z, Z, Z on |0⟩ — always 0. Sequence B: Z, X, Z — the middle X
  // measurement randomises the final Z.
  const rows = Array.from({ length: Math.min(6, Math.floor(step / 2)) }, (_, i) => {
    const xResult = hash(i + 3) < 0.5 ? '+' : '−';
    const zAfter = hash(i + 40) < 0.5 ? '0' : '1';
    return { i, a: ['0', '0', '0'], b: ['0', xResult, zAfter] };
  });
  const mismatches = rows.filter((r) => r.b[2] === '1').length;
  return (
    <Figure width={W} height={H} label="Two measurement sequences on a qubit prepared in zero. Measuring Z repeatedly always returns zero; inserting an X measurement in between makes the final Z measurement random."
      caption={rows.length ? `Z,Z,Z: identical every run · Z,X,Z: final Z flipped in ${mismatches} of ${rows.length} runs` : 'compatible observables share eigenstates; incompatible ones do not'}>
      <text x={24} y={26} fontSize={11} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>Z → Z → Z</text>
      <text x={176} y={26} fontSize={11} fontWeight={700} fill="var(--color-danger)" fontFamily={MONO}>Z → X → Z</text>
      {rows.map((r) => (
        <g key={r.i}>
          {r.a.map((v, k) => (
            <text key={k} x={30 + k * 34} y={50 + r.i * 18} fontSize={12} fill="var(--color-success)" fontFamily={MONO}>{v}</text>
          ))}
          {r.b.map((v, k) => (
            <text key={k} x={182 + k * 34} y={50 + r.i * 18} fontSize={12} fill={k === 2 && v === '1' ? 'var(--color-danger)' : 'currentColor'} fontWeight={k === 2 && v === '1' ? 700 : 400} fontFamily={MONO}>{v}</text>
          ))}
        </g>
      ))}
      <text x={24} y={H - 10} fontSize={9} fill="currentColor" opacity={0.65}>[Z, Z] = 0: knowing one costs nothing</text>
      <text x={176} y={H - 10} fontSize={9} fill="currentColor" opacity={0.65}>[Z, X] ≠ 0: knowing X erases Z</text>
    </Figure>
  );
}

// --- Operators: 05.03–05.06 ------------------------------------------------------------

export function OperatorAction({ mode = 'eigen' }: { mode?: 'inner' | 'eigen' | 'expectation' }) {
  const t = useLoop(4000, useAnimate());
  const cx = 90; const cy = 100; const R = 60;
  const ang = t * 2 * Math.PI;
  if (mode === 'inner') {
    const a: [number, number] = [1, 0];
    const b: [number, number] = [Math.cos(ang), Math.sin(ang)];
    const dot = a[0] * b[0] + a[1] * b[1];
    return (
      <Figure width={W} height={H} label="Two unit vectors. Their inner product is the projection of one onto the other: one when parallel, zero when orthogonal."
        caption={`angle ${((ang * 180) / Math.PI).toFixed(0)}° · ⟨a|b⟩ = cos θ = ${dot.toFixed(2)}${Math.abs(dot) < 0.03 ? ' — orthogonal' : ''}`}>
        <line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1={cx} y1={cy + R + 8} x2={cx} y2={cy - R - 8} stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="currentColor" strokeWidth={3} opacity={0.7} />
        <line x1={cx} y1={cy} x2={cx + R * b[0]} y2={cy - R * b[1]} stroke="var(--color-accent)" strokeWidth={3} />
        <line x1={cx + R * b[0]} y1={cy - R * b[1]} x2={cx + R * dot} y2={cy} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
        <rect x={cx + Math.min(0, R * dot)} y={cy - 5} width={Math.abs(R * dot)} height={10} fill="var(--color-success)" opacity={0.6} />
        <text x={200} y={70} fontSize={12} fill="currentColor" fontFamily={MONO}>⟨a|b⟩ = Σ aᵢ* bᵢ</text>
        <text x={200} y={96} fontSize={14} fontWeight={700} fill={Math.abs(dot) < 0.03 ? 'var(--color-success)' : 'var(--color-accent)'} fontFamily={MONO}>= {dot.toFixed(2)}</text>
        <text x={200} y={124} fontSize={9} fill="currentColor" opacity={0.65}>|⟨a|b⟩|² = probability of</text>
        <text x={200} y={136} fontSize={9} fill="currentColor" opacity={0.65}>finding b when in a</text>
      </Figure>
    );
  }
  if (mode === 'eigen') {
    // Z on |0⟩ (eigenvector: unchanged) and on |+⟩ (not: flipped to |−⟩)
    const phase = Math.min(1, t * 1.4);
    const eigen: [number, number] = [0, 1];
    const plus: [number, number] = [Math.SQRT1_2 * Math.cos(Math.PI * phase), Math.SQRT1_2 * 0 + Math.SQRT1_2 * 0];
    const v2: [number, number] = [Math.SQRT1_2, Math.SQRT1_2 * Math.cos(Math.PI * phase)];
    void plus;
    return (
      <Figure width={W} height={H} label="The operator Z leaves its eigenvector zero where it is, scaled by eigenvalue plus one, and turns the non-eigenvector plus into minus."
        caption={`Z|0⟩ = +1·|0⟩ (eigenvector) · Z|+⟩ = |−⟩ (not an eigenvector) · ${(phase * 100).toFixed(0)}%`}>
        <text x={24} y={24} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>Z = [[1,0],[0,−1]]</text>
        {[{ x0: 80, v: eigen, label: '|0⟩', colour: 'var(--color-success)', note: 'eigenvalue +1' }, { x0: 230, v: v2, label: '|+⟩ → |−⟩', colour: 'var(--color-accent)', note: 'rotated: not an eigenvector' }].map((p) => (
          <g key={p.x0}>
            <line x1={p.x0 - 50} y1={cy} x2={p.x0 + 50} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
            <line x1={p.x0} y1={cy + 50} x2={p.x0} y2={cy - 50} stroke="currentColor" strokeWidth={1} opacity={0.3} />
            <line x1={p.x0} y1={cy} x2={p.x0 + p.v[1] * 46} y2={cy - p.v[0] * 46} stroke={p.colour} strokeWidth={3} strokeLinecap="round" />
            <text x={p.x0} y={cy + 66} textAnchor="middle" fontSize={11} fill={p.colour} fontFamily={MONO}>{p.label}</text>
            <text x={p.x0} y={cy + 80} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>{p.note}</text>
          </g>
        ))}
        <text x={24} y={40} fontSize={9} fill="currentColor" opacity={0.6}>axes: |0⟩ up, |1⟩ right</text>
      </Figure>
    );
  }
  // expectation: ⟨Z⟩ for a state at polar angle θ sweeping
  const theta = t * Math.PI;
  const p0 = Math.cos(theta / 2) ** 2;
  const expZ = p0 - (1 - p0);
  return (
    <Figure width={W} height={H} label="Expectation value of Z for a state swept from zero to one: the probability-weighted average of the outcomes plus one and minus one."
      caption={`θ = ${((theta * 180) / Math.PI).toFixed(0)}° · ⟨Z⟩ = (+1)·${p0.toFixed(2)} + (−1)·${(1 - p0).toFixed(2)} = ${expZ.toFixed(2)}`}>
      <Axes x0={40} y0={100} x1={W - 20} y1={30} xLabel="θ" yLabel="⟨Z⟩" />
      <path d={polyline(Array.from({ length: 60 }, (_, i) => { const th = (i / 59) * Math.PI; return { x: 40 + (i / 59) * (W - 70), y: 100 - Math.cos(th) * 60 }; }))} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
      <circle cx={40 + (theta / Math.PI) * (W - 70)} cy={100 - expZ * 60} r={5} fill="var(--color-accent)" />
      <line x1={40} y1={100 - 60} x2={W - 20} y2={100 - 60} stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" opacity={0.3} />
      <line x1={40} y1={100 + 60} x2={W - 20} y2={100 + 60} stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" opacity={0.3} />
      <text x={W - 22} y={36} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6} fontFamily={MONO}>+1 (always |0⟩)</text>
      <text x={W - 22} y={170} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6} fontFamily={MONO}>−1 (always |1⟩)</text>
      <text x={120} y={24} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>⟨Z⟩ = ⟨ψ|Z|ψ⟩ = cos θ</text>
    </Figure>
  );
}

// --- Time evolution: 05.07–05.09 ----------------------------------------------------

export function TimeEvolution({ mode = 'eigenstate' }: { mode?: 'eigenstate' | 'superposition' | 'unitary' }) {
  const t = useLoop(5000, useAnimate());
  const w1 = 2 * Math.PI; const w2 = 3 * 2 * Math.PI; // E₁/ħ and E₂/ħ in loop units
  const ph1 = -w1 * t; const ph2 = -w2 * t;
  const phasor = (cx: number, ph: number, colour: string, label: string) => (
    <g>
      <circle cx={cx} cy={90} r={30} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <line x1={cx} y1={90} x2={cx + 30 * Math.cos(ph)} y2={90 - 30 * Math.sin(ph)} stroke={colour} strokeWidth={2.5} />
      <circle cx={cx + 30 * Math.cos(ph)} cy={90 - 30 * Math.sin(ph)} r={4} fill={colour} />
      <text x={cx} y={134} textAnchor="middle" fontSize={10} fill={colour} fontFamily={MONO}>{label}</text>
    </g>
  );
  if (mode === 'eigenstate') {
    return (
      <Figure width={W} height={H} label="An energy eigenstate evolves only by a rotating phase e to the minus i E t over h-bar. Its probability never changes: a stationary state."
        caption={`phase turns at rate E/ħ · |ψ|² constant = 1.00 — nothing observable moves`}>
        {phasor(90, ph1, 'var(--color-accent)', 'amplitude e^{−iEt/ħ}')}
        <rect x={190} y={60} width={100} height={14} rx={2} fill="var(--color-success)" opacity={0.8} />
        <text x={240} y={52} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>|ψ|² = 1.00</text>
        <text x={240} y={100} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>H|ψ⟩ = E|ψ⟩</text>
        <text x={240} y={114} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>the clock ticks, the picture stays</text>
      </Figure>
    );
  }
  if (mode === 'superposition') {
    const expX = Math.cos((w2 - w1) * t); // ⟨X⟩ beats at the difference frequency
    return (
      <Figure width={W} height={H} label="A superposition of two energy eigenstates: each phasor turns at its own rate, and their relative phase makes an observable oscillate at the difference frequency."
        caption={`two phases at E₁/ħ and E₂/ħ · ⟨X⟩ = cos((E₂−E₁)t/ħ) = ${expX.toFixed(2)} — motion comes from the gap`}>
        {phasor(60, ph1, 'var(--color-accent)', 'E₁')}
        {phasor(140, ph2, 'currentColor', 'E₂')}
        <Axes x0={200} y0={90} x1={305} y1={40} xLabel="t" yLabel="⟨X⟩" />
        <path d={polyline(Array.from({ length: 60 }, (_, i) => { const u = i / 59; return { x: 200 + u * 100, y: 90 - 40 * Math.cos((w2 - w1) * u) }; }))} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.4} />
        <circle cx={200 + t * 100} cy={90 - 40 * expX} r={4} fill="var(--color-success)" />
      </Figure>
    );
  }
  // unitary: a state vector rotating on the Bloch equator, length fixed
  const ang = 2 * Math.PI * t;
  return (
    <Figure width={W} height={H} label="Unitary evolution rotates the state vector without changing its length, so total probability stays exactly one."
      caption={`U(t) = e^{−iHt/ħ} rotates the state · ⟨ψ|ψ⟩ = 1.00 at every t — probability is conserved`}>
      <circle cx={90} cy={92} r={56} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={90} y1={92} x2={90 + 56 * Math.cos(ang)} y2={92 - 56 * Math.sin(ang)} stroke="var(--color-accent)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={90 + 56 * Math.cos(ang)} cy={92 - 56 * Math.sin(ang)} r={5} fill="var(--color-accent)" />
      <text x={200} y={70} fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>U†U = I</text>
      <rect x={200} y={84} width={100} height={12} rx={2} fill="var(--color-success)" opacity={0.8} />
      <text x={250} y={112} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>norm = 1.00</text>
      <text x={250} y={140} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>reversible: run U⁻¹ = U† to undo</text>
    </Figure>
  );
}

// --- 06.09 hydrogen orbitals -----------------------------------------------------------

const RADIAL: Record<string, { f: (r: number) => number; peak: number; nodes: number }> = {
  '1s': { f: (r) => 4 * r * r * Math.exp(-2 * r), peak: 1, nodes: 0 },
  '2s': { f: (r) => (r * r * (2 - r) ** 2 * Math.exp(-r)) / 8, peak: 5.24, nodes: 1 },
  '2p': { f: (r) => (r ** 4 * Math.exp(-r)) / 24, peak: 4, nodes: 0 },
};

export function HydrogenOrbital({ orbital }: { orbital?: '1s' | '2s' | '2p' }) {
  const t = useLoop(7500, useAnimate());
  const names: ('1s' | '2s' | '2p')[] = ['1s', '2s', '2p'];
  const name = orbital ?? names[Math.floor(t * 3) % 3];
  const { f, peak, nodes } = RADIAL[name];
  const rMax = 14;
  const pts = Array.from({ length: 120 }, (_, i) => ({ r: (i / 119) * rMax }));
  const pMax = Math.max(...pts.map((p) => f(p.r)));
  const toXY = (r: number) => ({ x: 36 + (r / rMax) * (W - 60), y: 140 - (f(r) / pMax) * 100 });
  return (
    <Figure width={W} height={H} label={`Radial probability density of the hydrogen ${name} orbital. Most probable radius ${peak} Bohr radii, ${nodes} radial node${nodes === 1 ? '' : 's'}.`}
      caption={`${name}: P(r) = r²|R(r)|² peaks at r = ${peak} a₀ = ${(peak * 0.0529).toFixed(3)} nm · ${nodes} radial node${nodes === 1 ? '' : 's'}`}>
      <Axes x0={36} y0={140} x1={W - 16} y1={30} xLabel="r / a₀" yLabel="P(r)" />
      <path d={polyline(pts.map((p) => toXY(p.r)))} fill="var(--color-accent)" fillOpacity={0.18} stroke="var(--color-accent)" strokeWidth={2.5} />
      <line x1={toXY(peak).x} y1={140} x2={toXY(peak).x} y2={toXY(peak).y} stroke="var(--color-success)" strokeWidth={1} strokeDasharray="3 3" />
      <text x={toXY(peak).x} y={154} textAnchor="middle" fontSize={9} fill="var(--color-success)" fontFamily={MONO}>{peak} a₀</text>
      {[1, 5, 10].map((r) => <text key={r} x={toXY(r).x} y={166} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.55} fontFamily={MONO}>{r}</text>)}
      <text x={W - 20} y={40} textAnchor="end" fontSize={14} fontWeight={700} fill="var(--color-accent)" fontFamily={MONO}>{name}</text>
      <text x={W - 20} y={56} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.65}>no orbit — a cloud of where</text>
    </Figure>
  );
}
