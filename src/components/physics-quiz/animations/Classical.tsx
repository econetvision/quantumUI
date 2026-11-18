'use client';

import { Figure, polyline, useAnimate, useLoop } from '../Figure';
import { LIGHT_SPEED, ELECTRON_VOLT, photonEnergy, sci } from '@/lib/physics';

/**
 * Figures for Module 02, Classical Physics Foundations.
 *
 * Six topics in the syllabus have no question in the bank and so had no
 * figure: Newton's laws, energy conservation, electric fields, induction,
 * the electromagnetic spectrum and the scale of atoms. These are computed
 * like the rest — the field arrows come from Coulomb's law summed over the
 * charges, the induced current from the rate of change of a real flux
 * function — rather than drawn to look right.
 */

const W = 320;
const H = 180;
const MONO = 'monospace';

// --- 02.02 momentum, force, Newton's laws -----------------------------------

export function NewtonCart({ mass = 2, force = 4 }: { mass?: number; force?: number }) {
  const t = useLoop(3600, useAnimate());
  const a = force / mass; // Newton's second law
  const time = t * 2.2; // seconds within the loop
  const v = a * time;
  const x = 0.5 * a * time * time;
  const p = mass * v;
  const cx = 40 + Math.min(1, x / 10.9) * (W - 120);
  const cy = H - 62;
  return (
    <Figure width={W} height={H} label={`A ${mass} kilogram cart pushed by a ${force} newton force accelerates at ${a} metres per second squared; its momentum grows in proportion to its velocity.`}
      caption={`F = ma → a = ${force}/${mass} = ${a} m s⁻² · t = ${time.toFixed(1)} s · v = ${v.toFixed(1)} m s⁻¹ · p = mv = ${p.toFixed(1)} kg m s⁻¹`}>
      <line x1={20} y1={cy + 18} x2={W - 20} y2={cy + 18} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <rect x={cx} y={cy - 16} width={44} height={30} rx={4} fill="currentColor" opacity={0.75} />
      <circle cx={cx + 10} cy={cy + 16} r={5} fill="currentColor" opacity={0.6} />
      <circle cx={cx + 34} cy={cy + 16} r={5} fill="currentColor" opacity={0.6} />
      <text x={cx + 22} y={cy + 4} textAnchor="middle" fontSize={10} fill="var(--color-accent-contrast)" fontFamily={MONO}>{mass} kg</text>
      {/* force arrow: constant */}
      <line x1={cx - 8 - force * 8} y1={cy} x2={cx - 8} y2={cy} stroke="var(--color-accent)" strokeWidth={3} />
      <polygon points={`${cx - 6},${cy} ${cx - 14},${cy - 5} ${cx - 14},${cy + 5}`} fill="var(--color-accent)" />
      <text x={cx - 8 - force * 4} y={cy - 10} textAnchor="middle" fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>F = {force} N</text>
      {/* velocity arrow: grows */}
      {v > 0.05 && (
        <g>
          <line x1={cx + 48} y1={cy - 26} x2={cx + 48 + v * 9} y2={cy - 26} stroke="var(--color-success)" strokeWidth={3} />
          <polygon points={`${cx + 50 + v * 9},${cy - 26} ${cx + 42 + v * 9},${cy - 31} ${cx + 42 + v * 9},${cy - 21}`} fill="var(--color-success)" />
          <text x={cx + 48} y={cy - 32} fontSize={9} fill="var(--color-success)" fontFamily={MONO}>v</text>
        </g>
      )}
      <text x={24} y={28} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>same force → velocity keeps growing</text>
      <text x={24} y={44} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>a = F/m = {a} m s⁻², every second</text>
      <rect x={W - 92} y={60} width={Math.max(2, p * 3.2)} height={10} rx={2} fill="var(--color-accent)" opacity={0.8} />
      <text x={W - 92} y={56} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>p = mv</text>
    </Figure>
  );
}

// --- 02.03 work, energy and conservation --------------------------------------

export function EnergyConservation() {
  const t = useLoop(4000, useAnimate());
  const theta0 = 0.9; // release angle, rad
  const theta = theta0 * Math.cos(t * 2 * Math.PI);
  const L = 84;
  const px = 110;
  const py = 26;
  const bx = px + L * Math.sin(theta);
  const by = py + L * Math.cos(theta);
  // Energies relative to the lowest point, in units of mgL.
  const pe = 1 - Math.cos(theta);
  const total = 1 - Math.cos(theta0);
  const ke = total - pe;
  const bar = (v: number) => (v / total) * 90;
  return (
    <Figure width={W} height={H} label="A pendulum swings. Its kinetic and potential energy trade places, but their sum never changes."
      caption={`PE = ${(pe / total * 100).toFixed(0)}% · KE = ${(ke / total * 100).toFixed(0)}% · PE + KE = 100% at every instant`}>
      <line x1={px - 60} y1={py} x2={px + 60} y2={py} stroke="currentColor" strokeWidth={2} opacity={0.5} />
      <line x1={px} y1={py} x2={bx} y2={by} stroke="currentColor" strokeWidth={1.5} opacity={0.6} />
      <circle cx={bx} cy={by} r={9} fill="var(--color-accent)" />
      <line x1={px - 70} y1={py + L} x2={px + 70} y2={py + L} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
      <text x={px + 72} y={py + L + 4} fontSize={9} fill="currentColor" opacity={0.6}>lowest point</text>
      {[
        { label: 'PE', v: pe, colour: 'currentColor' },
        { label: 'KE', v: ke, colour: 'var(--color-accent)' },
        { label: 'PE+KE', v: total, colour: 'var(--color-success)' },
      ].map((b, i) => (
        <g key={b.label}>
          <rect x={216 + i * 32} y={130 - bar(b.v)} width={22} height={bar(b.v)} rx={2} fill={b.colour} opacity={0.8} />
          <text x={227 + i * 32} y={146} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.75} fontFamily={MONO}>{b.label}</text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>
        energy is moved around, never made or lost
      </text>
    </Figure>
  );
}

// --- 02.04 electric charge, field and potential --------------------------------

const CHARGES = [
  { x: 96, y: 92, q: 1 },
  { x: 224, y: 92, q: -1 },
];

/** Coulomb field at a point, summed over the charges (arbitrary units). */
function fieldAt(x: number, y: number) {
  let ex = 0;
  let ey = 0;
  for (const c of CHARGES) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < 1) continue;
    ex += (c.q * dx) / (r2 * r);
    ey += (c.q * dy) / (r2 * r);
  }
  return { ex, ey };
}

export function ElectricField() {
  const t = useLoop(5000, useAnimate());
  // A positive test charge released near the + charge follows the field.
  let tx = 112;
  let ty = 70;
  const steps = Math.floor(t * 180);
  for (let i = 0; i < steps; i += 1) {
    const { ex, ey } = fieldAt(tx, ty);
    const n = Math.hypot(ex, ey) || 1;
    tx += (ex / n) * 1.4;
    ty += (ey / n) * 1.4;
  }
  const grid: { x: number; y: number; ex: number; ey: number }[] = [];
  for (let gx = 40; gx <= 280; gx += 30) {
    for (let gy = 32; gy <= 152; gy += 30) {
      const { ex, ey } = fieldAt(gx, gy);
      grid.push({ x: gx, y: gy, ex, ey });
    }
  }
  const maxMag = Math.max(...grid.map((g) => Math.hypot(g.ex, g.ey)));
  return (
    <Figure width={W} height={H} label="Field arrows computed from Coulomb's law around a positive and a negative charge. A test charge released near the positive one is pushed along the field toward the negative one."
      caption="arrows: direction and strength of the push on a + test charge · it rolls downhill in potential">
      {grid.map((g, i) => {
        const mag = Math.hypot(g.ex, g.ey);
        const len = 6 + 10 * Math.sqrt(mag / maxMag);
        const ux = (g.ex / (mag || 1)) * len;
        const uy = (g.ey / (mag || 1)) * len;
        return (
          <g key={i} opacity={0.3 + 0.6 * Math.sqrt(mag / maxMag)}>
            <line x1={g.x - ux / 2} y1={g.y - uy / 2} x2={g.x + ux / 2} y2={g.y + uy / 2} stroke="currentColor" strokeWidth={1.2} />
            <circle cx={g.x + ux / 2} cy={g.y + uy / 2} r={1.6} fill="currentColor" />
          </g>
        );
      })}
      {CHARGES.map((c) => (
        <g key={c.x}>
          <circle cx={c.x} cy={c.y} r={12} fill={c.q > 0 ? 'var(--color-danger)' : 'var(--color-accent)'} opacity={0.9} />
          <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--color-accent-contrast)">{c.q > 0 ? '+' : '−'}</text>
        </g>
      ))}
      <circle cx={tx} cy={ty} r={5} fill="var(--color-success)" />
      <text x={24} y={H - 8} fontSize={10} fill="currentColor" opacity={0.7} fontFamily={MONO}>high potential near +  →  low potential near −</text>
    </Figure>
  );
}

// --- 02.05 magnetic fields and induction ----------------------------------------

export function Induction() {
  const t = useLoop(4000, useAnimate());
  // Magnet position: in, pause, out, pause. Flux through the coil falls off
  // with distance; the induced emf is minus its rate of change.
  const phase = t * 4;
  const seg = Math.floor(phase) % 4;
  const u = phase - Math.floor(phase);
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
  const d = seg === 0 ? 1 - ease(u) : seg === 1 ? 0 : seg === 2 ? ease(u) : 1; // 1 = far, 0 = inside
  const flux = (dist: number) => 1 / (1 + 9 * dist * dist);
  const dd = seg === 0 ? -(Math.PI / 2) * Math.sin(Math.PI * u) : seg === 2 ? (Math.PI / 2) * Math.sin(Math.PI * u) : 0;
  const dFlux = (-18 * d) / (1 + 9 * d * d) ** 2 * dd;
  const emf = -dFlux; // Faraday + Lenz
  const magnetX = 40 + d * 110;
  const needle = Math.max(-1, Math.min(1, emf / 2.2));
  const state = seg === 0 ? 'magnet moving in' : seg === 2 ? 'magnet moving out' : 'magnet still';
  return (
    <Figure width={W} height={H} label="A bar magnet moves into and out of a coil. The meter deflects only while the magnet is moving, and in opposite directions for in and out."
      caption={`${state} · Φ = ${flux(d).toFixed(2)} · emf ∝ −dΦ/dt = ${emf.toFixed(2)}${Math.abs(emf) < 0.02 ? ' — no current' : ''}`}>
      {/* coil */}
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={176 + i * 9} cy={92} rx={5} ry={26} fill="none" stroke="var(--color-accent)" strokeWidth={1.6} opacity={0.8} />
      ))}
      {/* magnet */}
      <rect x={magnetX} y={78} width={34} height={28} rx={3} fill="var(--color-danger)" opacity={0.85} />
      <rect x={magnetX + 34} y={78} width={34} height={28} rx={3} fill="currentColor" opacity={0.5} />
      <text x={magnetX + 17} y={96} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--color-accent-contrast)">N</text>
      <text x={magnetX + 51} y={96} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--color-accent-contrast)">S</text>
      {/* meter */}
      <path d="M254,150 A34,34 0 0 1 306,150" fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
      <line x1={280} y1={150} x2={280 + 30 * Math.sin(needle * 1.1)} y2={150 - 30 * Math.cos(needle * 1.1)} stroke={Math.abs(needle) > 0.05 ? 'var(--color-success)' : 'currentColor'} strokeWidth={2.5} />
      <text x={280} y={168} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>current</text>
      <text x={24} y={28} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>changing flux through the coil → current</text>
      <text x={24} y={44} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>steady flux, however strong → none</text>
    </Figure>
  );
}

// --- 02.09 electromagnetic waves and spectrum -----------------------------------

const BANDS = [
  { name: 'radio', from: 1e-1, to: 1e3 },
  { name: 'microwave', from: 1e-3, to: 1e-1 },
  { name: 'infrared', from: 7e-7, to: 1e-3 },
  { name: 'visible', from: 4e-7, to: 7e-7 },
  { name: 'ultraviolet', from: 1e-8, to: 4e-7 },
  { name: 'X-ray', from: 1e-11, to: 1e-8 },
  { name: 'gamma', from: 1e-13, to: 1e-11 },
];
const LOG_MIN = Math.log10(1e-13);
const LOG_MAX = Math.log10(1e3);

export function EmSpectrum() {
  const t = useLoop(9000, useAnimate());
  const logLambda = LOG_MAX - t * (LOG_MAX - LOG_MIN);
  const lambda = 10 ** logLambda;
  const f = LIGHT_SPEED / lambda;
  const eEv = photonEnergy(f) / ELECTRON_VOLT;
  const xFor = (l: number) => 24 + ((Math.log10(l) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (W - 48);
  const band = BANDS.find((b) => lambda >= b.from && lambda < b.to)?.name ?? 'gamma';
  const cycles = 2 + 20 * (1 - t);
  const wave = polyline(Array.from({ length: 160 }, (_, i) => ({ x: 24 + (i / 159) * (W - 48), y: 52 - 16 * Math.sin((i / 159) * cycles * 2 * Math.PI) })));
  return (
    <Figure width={W} height={H} label={`The electromagnetic spectrum from radio to gamma rays on a logarithmic wavelength axis. At ${sci(lambda, 1)} metres the wave is ${band}, with frequency ${sci(f, 1)} hertz and photon energy ${sci(eEv, 1)} electronvolts.`}
      caption={`${band}: λ = ${sci(lambda, 1)} m · f = c/λ = ${sci(f, 1)} Hz · E = hf = ${eEv >= 0.01 && eEv < 1e4 ? eEv.toPrecision(2) : sci(eEv, 1)} eV`}>
      <path d={wave} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      {BANDS.map((b, i) => (
        <g key={b.name}>
          <rect x={xFor(b.from)} y={96} width={xFor(b.to) - xFor(b.from)} height={22} fill={b.name === band ? 'var(--color-accent)' : 'currentColor'} opacity={b.name === band ? 0.85 : 0.12 + (i % 2) * 0.06} />
          <text x={(xFor(b.from) + xFor(b.to)) / 2} y={b.name === 'visible' ? 130 : 110} textAnchor="middle" fontSize={b.name === 'visible' ? 8 : 8.5} fill={b.name === band && b.name !== 'visible' ? 'var(--color-accent-contrast)' : 'currentColor'} opacity={0.85}>{b.name}</text>
        </g>
      ))}
      <line x1={xFor(lambda)} y1={88} x2={xFor(lambda)} y2={124} stroke="var(--color-success)" strokeWidth={2} />
      <text x={24} y={150} fontSize={9} fill="currentColor" opacity={0.6} fontFamily={MONO}>long λ · low f · low E</text>
      <text x={W - 24} y={150} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6} fontFamily={MONO}>short λ · high f · high E</text>
      <text x={W / 2} y={168} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>all of it travels at c = 3.0 × 10⁸ m s⁻¹</text>
    </Figure>
  );
}

// --- 02.10 atoms, nuclei and microscopic scales ---------------------------------

const SCALES = [
  { name: 'you', m: 1 },
  { name: 'a cell', m: 1e-5 },
  { name: 'a molecule', m: 1e-9 },
  { name: 'an atom', m: 1e-10 },
  { name: 'a nucleus', m: 1e-14 },
  { name: 'a proton', m: 1e-15 },
];

export function ScaleLadder() {
  const t = useLoop(7000, useAnimate());
  const idx = Math.min(SCALES.length - 1, Math.floor(t * SCALES.length));
  const item = SCALES[idx];
  const xFor = (m: number) => 24 + ((Math.log10(m) - -15) / 15) * (W - 48);
  const ratio = SCALES[idx - 1] ? SCALES[idx - 1].m / item.m : 1;
  return (
    <Figure width={W} height={H} label={`A logarithmic ladder from one metre down to a femtometre. ${item.name} is about ${sci(item.m, 0)} metres across.`}
      caption={`${item.name}: ~${sci(item.m, 0)} m${idx > 0 ? ` — ${sci(ratio, 0)} times smaller than ${SCALES[idx - 1].name}` : ''}`}>
      <line x1={24} y1={100} x2={W - 24} y2={100} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
      {Array.from({ length: 16 }, (_, i) => {
        const m = 10 ** -(15 - i);
        return (
          <g key={i}>
            <line x1={xFor(m)} y1={96} x2={xFor(m)} y2={104} stroke="currentColor" strokeWidth={1} opacity={0.5} />
            {i % 5 === 0 && <text x={xFor(m)} y={118} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.65} fontFamily={MONO}>10{i === 15 ? '⁰' : `⁻${15 - i}`.replace(/[0-9]/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])} m</text>}
          </g>
        );
      })}
      {SCALES.map((s, i) => (
        <g key={s.name} opacity={i === idx ? 1 : 0.4}>
          <circle cx={xFor(s.m)} cy={100} r={i === idx ? 7 : 4} fill={i === idx ? 'var(--color-accent)' : 'currentColor'} />
          <text x={xFor(s.m)} y={i % 2 === 0 ? 80 : 66} textAnchor="middle" fontSize={9} fill="currentColor" fontFamily={MONO}>{s.name}</text>
        </g>
      ))}
      <text x={W / 2} y={150} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75} fontFamily={MONO}>each step left is ten times smaller</text>
      <text x={W / 2} y={168} textAnchor="middle" fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>an atom is 10⁵ nuclei wide — almost all empty</text>
    </Figure>
  );
}
