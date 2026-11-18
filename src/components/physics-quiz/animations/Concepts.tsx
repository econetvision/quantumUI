'use client';

import { Axes, Figure, polyline, useAnimate, useLoop } from '../Figure';
import {
  apply2x2,
  checkQuantumNumbers,
  deBroglieWavelength,
  maxKineticEnergy,
  PAULI_X,
  PAULI_Z,
  PLANCK,
  sci,
  shm,
} from '@/lib/physics';

/**
 * The concept figures: one per idea, reused across levels by changing inputs.
 *
 * Each one computes the quantity the question asks about rather than drawing a
 * picture of it. Where a figure shows a number — Kmax, a level gap, a matrix
 * product — that number comes from src/lib/physics.ts, the same module the
 * answer-key tests check, so a figure cannot drift away from the answer it
 * illustrates. Props carry the per-question numbers; defaults are the Level 2
 * question each figure was first drawn for.
 */

const W = 320;
const H = 180;
const MONO = 'monospace';

// --- Q27, Q87 -----------------------------------------------------------------

export function InverseProportion({ from = 1, to = 0.5, quantity = 'quantity' }: { from?: number; to?: number; quantity?: string }) {
  const t = useLoop(2600, useAnimate());
  const lambda = from + (to - from) * Math.min(1, t * 2);
  const q = 1 / lambda;
  const lo = Math.min(from, to) * 0.7;
  const hi = Math.max(from, to) * 1.25;
  const qMax = 1 / lo;
  const toXY = (l: number) => ({ x: 36 + ((l - lo) / (hi - lo)) * (W - 60), y: H - 34 - ((1 / l) / qMax) * (H - 60) });
  const pts = Array.from({ length: 80 }, (_, i) => toXY(lo + (i / 79) * (hi - lo)));
  const p = toXY(lambda);
  const factor = from / to;
  return (
    <Figure width={W} height={H} label={`A hyperbola. As the wavelength goes from ${from} to ${to}, the ${quantity} rises by a factor ${factor.toFixed(2)}.`}
      caption={`λ = ${lambda.toFixed(2)} → ${quantity} = ${q.toFixed(2)}  (×${(q * from).toFixed(2)})`}>
      <Axes x0={36} y0={H - 34} x1={W - 16} y1={20} xLabel="λ" yLabel={quantity} />
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      <line x1={p.x} y1={H - 34} x2={p.x} y2={p.y} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <circle cx={p.x} cy={p.y} r={5} fill="var(--color-accent)" />
      <text x={W - 20} y={32} textAnchor="end" fontSize={11} fill="var(--color-accent)" fontFamily={MONO}>
        {quantity} × λ = {(q * lambda).toFixed(2)} — constant
      </text>
      <text x={W - 20} y={48} textAnchor="end" fontSize={11} fontWeight={700} fontFamily={MONO}
        fill={Math.abs(lambda - to) < 1e-6 ? 'var(--color-success)' : 'currentColor'} opacity={Math.abs(lambda - to) < 1e-6 ? 1 : 0.35}>
        λ × {to / from} → {quantity} × {factor.toFixed(2)}
      </text>
    </Figure>
  );
}

// --- Q30 ----------------------------------------------------------------------

export function ComplexRotation() {
  const t = useLoop(3000, useAnimate());
  const steps = Math.floor(t * 4) % 4; // 1 → i → −1 → −i
  const angle = (steps * Math.PI) / 2;
  const r = 52;
  const cx = W / 2;
  const cy = H / 2 + 6;
  const px = cx + r * Math.cos(angle);
  const py = cy - r * Math.sin(angle);
  const labels = ['1', 'i', '−1', '−i'];
  return (
    <Figure width={W} height={H} label="Multiplying by i rotates a point 90 degrees on the complex plane. Twice lands on minus one."
      caption={`×i applied ${steps} time${steps === 1 ? '' : 's'} → ${labels[steps]}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.2} />
      <line x1={cx - r - 16} y1={cy} x2={cx + r + 16} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy - r - 16} x2={cx} y2={cy + r + 16} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <text x={cx + r + 20} y={cy + 4} fontSize={10} fill="currentColor" opacity={0.5}>Re</text>
      <text x={cx + 4} y={cy - r - 20} fontSize={10} fill="currentColor" opacity={0.5}>Im</text>
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={px} cy={py} r={5} fill="var(--color-accent)" />
      <text x={px + (Math.cos(angle) >= 0 ? 10 : -16)} y={py - 8} fontSize={13} fontWeight={700} fill="var(--color-accent)">
        {labels[steps]}
      </text>
    </Figure>
  );
}

// --- Q7, Q31, Q67, Q92 --------------------------------------------------------

/** Shows a component as the paper writes it: "1/√2", "−1/√2", "0", "1". */
function componentLabel(value: number, label?: string): string {
  if (label) return value < 0 ? `−${label.replace(/^[−-]/, '')}` : label.replace(/^[−-]/, '');
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? '0' : String(rounded).replace('-', '−');
}

export function MatrixAction({
  matrix = 'X',
  vector = [1, 0],
  labels,
  repeat = 1,
  emphasis,
}: {
  matrix?: 'X' | 'Z';
  vector?: number[];
  /** Comma-separated display labels for the input components, e.g. "1/√2,1/√2". */
  labels?: string;
  repeat?: number;
  emphasis?: 'shape';
}) {
  const t = useLoop(repeat > 1 ? 4200 : 2800, useAnimate());
  const M = matrix === 'Z' ? PAULI_Z : PAULI_X;
  const applied = Math.min(repeat, Math.floor(t * (repeat + 1.4)));
  const input: [number, number] = [vector[0], vector[1]];
  let v: [number, number] = input;
  for (let i = 0; i < applied; i += 1) v = apply2x2(M, v);
  const inLabels = labels ? labels.split(',') : [undefined, undefined];
  const shown = (val: number, i: number) =>
    componentLabel(val, inLabels[i] && Math.abs(Math.abs(val) - Math.abs(input[i])) < 1e-6 ? inLabels[i] : inLabels[1 - i] && Math.abs(Math.abs(val) - Math.abs(input[1 - i])) < 1e-6 ? inLabels[1 - i] : undefined);
  const entries = M.map((m) => (m < 0 ? '−1' : String(m)));
  const caption = emphasis === 'shape'
    ? 'two rows × one column → two numbers: a column vector again'
    : repeat > 1
      ? `${matrix} applied ${applied} time${applied === 1 ? '' : 's'}${applied === repeat ? ' — back where it started, X² = I' : ''}`
      : matrix === 'Z'
        ? 'Z keeps the first component and flips the sign of the second'
        : '[[0,1],[1,0]] swaps the components — this is Pauli-X';
  const back = repeat > 1 && applied === repeat;
  return (
    <Figure width={W} height={H} label={`The matrix ${matrix === 'Z' ? '[[1,0],[0,−1]]' : '[[0,1],[1,0]]'} acting on the vector. ${caption}.`} caption={caption}>
      <text x={54} y={56} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6} fontFamily={MONO}>{entries[0]} {entries[1]}</text>
      <text x={54} y={76} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6} fontFamily={MONO}>{entries[2]} {entries[3]}</text>
      <rect x={24} y={38} width={60} height={54} rx={4} fill="none" stroke="currentColor" opacity={0.35} />
      {repeat > 1 && <text x={88} y={44} fontSize={10} fill="currentColor" opacity={0.6}>×{repeat}</text>}
      <text x={102} y={70} fontSize={16} fill="currentColor" opacity={0.5}>×</text>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={124} y={38 + i * 27} width={44} height={25} rx={3} fill="currentColor" opacity={0.12} />
          <text x={146} y={55 + i * 27} textAnchor="middle" fontSize={12} fill="currentColor" fontFamily={MONO}>
            {componentLabel(input[i], inLabels[i])}
          </text>
        </g>
      ))}
      <text x={180} y={70} fontSize={16} fill="currentColor" opacity={0.5}>=</text>
      {[0, 1].map((i) => {
        const changed = Math.abs(v[i] - input[i]) > 1e-6;
        return (
          <g key={i}>
            <rect x={204} y={38 + i * 27} width={44} height={25} rx={3}
              fill={back ? 'var(--color-success)' : changed ? 'var(--color-accent)' : 'currentColor'} opacity={back || changed ? 0.9 : 0.12} />
            <text x={226} y={55 + i * 27} textAnchor="middle" fontSize={12} fontWeight={700}
              fill={back || changed ? 'var(--color-accent-contrast)' : 'currentColor'} fontFamily={MONO}>
              {shown(v[i], i)}
            </text>
          </g>
        );
      })}
      {emphasis === 'shape' && (
        <g>
          <text x={54} y={112} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>2 × 2</text>
          <text x={146} y={112} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>2 × 1</text>
          <text x={226} y={112} textAnchor="middle" fontSize={9} fill="var(--color-accent)" fontWeight={700}>2 × 1</text>
        </g>
      )}
      {emphasis !== 'shape' && (
        <text x={W / 2} y={130} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7} fontFamily={MONO}>
          top: {entries[0]}·{componentLabel(input[0], inLabels[0])} + {entries[1]}·{componentLabel(input[1], inLabels[1])} · bottom: {entries[2]}·{componentLabel(input[0], inLabels[0])} + {entries[3]}·{componentLabel(input[1], inLabels[1])}
        </text>
      )}
      <text x={W / 2} y={152} textAnchor="middle" fontSize={11} fill={back ? 'var(--color-success)' : 'var(--color-accent)'}>
        {emphasis === 'shape' ? 'a gate turns one qubit state into another' : matrix === 'Z' ? '|+⟩ becomes |−⟩' : repeat > 1 ? (back ? 'original state restored' : 'components exchanged') : '|0⟩ becomes |1⟩'}
      </text>
    </Figure>
  );
}

// --- Q8, Q32, Q52 -------------------------------------------------------------

export function TangentSlope({ curve = 'throw', at }: { curve?: 'throw' | 'quadratic'; at?: number }) {
  const t = useLoop(3400, useAnimate());
  // throw: x = 4t − t² (turning point at t = 2). quadratic: x = 3t², v = 6t.
  const tMax = curve === 'throw' ? 4 : 3;
  const pos = (tt: number) => (curve === 'throw' ? 4 * tt - tt * tt : 3 * tt * tt);
  const vel = (tt: number) => (curve === 'throw' ? 4 - 2 * tt : 6 * tt);
  const xMax = curve === 'throw' ? 4 : pos(tMax);
  // With a target time, sweep to it and hold there for the rest of the loop.
  const u = at !== undefined ? Math.min(at, t * 1.6 * tMax) : t * tMax;
  const toXY = (tt: number) => ({ x: 30 + (tt / tMax) * (W - 54), y: H - 30 - (pos(tt) / xMax) * (H - 64) });
  const pts = Array.from({ length: 90 }, (_, i) => toXY((i / 89) * tMax));
  const p = toXY(u);
  const slope = vel(u);
  const flat = curve === 'throw' && Math.abs(slope) < 0.18;
  const held = at !== undefined && Math.abs(u - at) < 1e-9;
  // Tangent direction in screen pixels.
  const dxPx = (W - 54) / tMax;
  const dyPx = (H - 64) / xMax;
  const len = 34;
  const norm = Math.hypot(dxPx, slope * dyPx);
  const tx = (dxPx / norm) * len;
  const ty = (slope * dyPx / norm) * len;
  const colour = flat || held ? 'var(--color-success)' : 'var(--color-accent)';
  const caption = curve === 'quadratic'
    ? `x = 3t² · v = dx/dt = 6t · at t = ${u.toFixed(1)} s, v = ${slope.toFixed(1)} m s⁻¹`
    : `slope = velocity = ${slope.toFixed(2)}${flat ? '  ← horizontal tangent' : ''}`;
  return (
    <Figure width={W} height={H} label={curve === 'quadratic' ? `Position x equals 3 t squared. The tangent at t = ${at} seconds has slope ${vel(at ?? 0)} metres per second.` : 'A position against time curve for a thrown ball. At the turning point the tangent is horizontal and velocity is zero.'}
      caption={caption}>
      <Axes x0={30} y0={H - 30} x1={W - 16} y1={20} xLabel="t" yLabel="x" />
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      <line x1={p.x - tx} y1={p.y + ty} x2={p.x + tx} y2={p.y - ty} stroke={colour} strokeWidth={2.5} />
      <circle cx={p.x} cy={p.y} r={5} fill={colour} />
      {curve === 'quadratic' && (
        <text x={W - 20} y={34} textAnchor="end" fontSize={13} fontWeight={700} fontFamily={MONO} fill={held ? 'var(--color-success)' : 'currentColor'} opacity={held ? 1 : 0.4}>
          v = 6 × {at} = {vel(at ?? 0)} m s⁻¹
        </text>
      )}
    </Figure>
  );
}

// --- Q33, Q99 -----------------------------------------------------------------

export function ShmRestoring({ trace = false }: { trace?: boolean }) {
  const t = useLoop(trace ? 4000 : 2600, useAnimate());
  // x = A cos ωt: starts at +A, at rest — the release point Q99 describes.
  const { x, acceleration } = shm(2 * Math.PI, 1, t);
  const cy = trace ? 52 : H / 2 + 6;
  const cx = W / 2 + x * 88;
  const arrow = Math.sign(acceleration) * Math.min(42, Math.abs(acceleration) * 7);
  const gx0 = 40;
  const gw = W - 70;
  const gy = 128;
  const graph = Array.from({ length: 120 }, (_, i) => ({ x: gx0 + (i / 119) * gw, y: gy - 26 * Math.cos((i / 119) * 2 * Math.PI) }));
  const quarter = Math.abs(t - 0.25) < 0.03;
  return (
    <Figure width={W} height={H}
      label={trace ? 'A mass released from +A. A quarter of a period later it passes through x = 0.' : 'A mass oscillating about equilibrium. The acceleration arrow always points back toward the centre.'}
      caption={trace ? `t = ${t.toFixed(2)} T · x = A cos ωt = ${x.toFixed(2)} A${quarter ? '  ← quarter period: x = 0' : ''}` : `x = ${x.toFixed(2)} · a = ${acceleration.toFixed(1)} — opposite signs, always`}>
      <line x1={24} y1={cy} x2={W - 24} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={W / 2} y1={cy - 24} x2={W / 2} y2={cy + 24} stroke="currentColor" strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />
      <text x={W / 2} y={cy + 38} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>x = 0</text>
      {!trace && Math.abs(arrow) > 2 && (
        <g>
          <line x1={cx} y1={cy - 30} x2={cx + arrow} y2={cy - 30} stroke="var(--color-accent)" strokeWidth={3} />
          <polygon points={`${cx + arrow},${cy - 30} ${cx + arrow - Math.sign(arrow) * 8},${cy - 35} ${cx + arrow - Math.sign(arrow) * 8},${cy - 25}`} fill="var(--color-accent)" />
          <text x={cx + arrow / 2} y={cy - 38} textAnchor="middle" fontSize={10} fill="var(--color-accent)">a</text>
        </g>
      )}
      <circle cx={cx} cy={cy} r={trace ? 10 : 13} fill={quarter && trace ? 'var(--color-success)' : 'currentColor'} opacity={0.8} />
      {trace && (
        <g>
          <Axes x0={gx0} y0={gy} x1={gx0 + gw + 10} y1={gy - 40} xLabel="t" yLabel="x" />
          <path d={polyline(graph)} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {[0.25, 0.5, 0.75, 1].map((q) => (
            <text key={q} x={gx0 + q * gw} y={gy + 24} textAnchor="middle" fontSize={9} fill={q === 0.25 ? 'var(--color-success)' : 'currentColor'} opacity={q === 0.25 ? 1 : 0.5} fontFamily={MONO}>
              {q === 1 ? 'T' : `${q === 0.5 ? '' : q === 0.25 ? '¼' : '¾'}${q === 0.5 ? '½' : ''}T`}
            </text>
          ))}
          <line x1={gx0 + 0.25 * gw} y1={gy - 30} x2={gx0 + 0.25 * gw} y2={gy + 4} stroke="var(--color-success)" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
          <circle cx={gx0 + t * gw} cy={gy - 26 * Math.cos(t * 2 * Math.PI)} r={5} fill={quarter ? 'var(--color-success)' : 'var(--color-accent)'} />
        </g>
      )}
    </Figure>
  );
}

// --- Q9, Q34, Q53 -------------------------------------------------------------

export function PeriodFrequency({ cycles = 1, seconds = 0.02, ask = 'frequency' }: { cycles?: number; seconds?: number; ask?: 'frequency' | 'cycles' }) {
  const t = useLoop(2400, useAnimate());
  const f = cycles / seconds;
  const period = seconds / cycles;
  const drawn = Math.min(cycles, 5);
  const pts = Array.from({ length: 150 }, (_, i) => {
    const u = i / 149;
    return { x: 24 + u * (W - 48), y: H / 2 - 34 * Math.sin(u * drawn * 2 * Math.PI - t * 2 * Math.PI) };
  });
  const periodW = (W - 48) / drawn;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(v < 1 ? 3 : 1).replace(/0+$/, '').replace(/\.$/, ''));
  const caption = ask === 'cycles'
    ? `f = ${fmt(f)} Hz for ${fmt(seconds)} s → ${fmt(f)} × ${fmt(seconds)} = ${cycles} cycles`
    : cycles === 1
      ? `T = ${fmt(period)} s → f = 1/T = ${fmt(f)} Hz`
      : `${cycles} cycles in ${fmt(seconds)} s → f = ${cycles}/${fmt(seconds)} = ${fmt(f)} Hz`;
  return (
    <Figure width={W} height={H} label={`${cycles} complete oscillation${cycles === 1 ? '' : 's'} in ${seconds} seconds, a frequency of ${f} hertz.`} caption={caption}>
      <path d={polyline(pts)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <line x1={24} y1={H - 42} x2={24 + periodW} y2={H - 42} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24} y1={H - 47} x2={24} y2={H - 37} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24 + periodW} y1={H - 47} x2={24 + periodW} y2={H - 37} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <text x={24 + periodW / 2} y={H - 50} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.8}>
        T = {fmt(period)} s
      </text>
      {cycles > drawn && (
        <text x={W - 24} y={30} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>… {cycles} cycles in all</text>
      )}
      <text x={W - 24} y={H - 48} textAnchor="end" fontSize={13} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>
        {ask === 'cycles' ? `${cycles} cycles` : `f = ${fmt(f)} Hz`}
      </text>
    </Figure>
  );
}

// --- Q13, Q37 -----------------------------------------------------------------

export function PlanckQuanta() {
  const t = useLoop(3200, useAnimate());
  const quantised = t > 0.5;
  return (
    <Figure width={W} height={H} label="Continuous energy exchange allows unlimited high-frequency emission; quantised packets of h nu do not."
      caption={quantised ? 'quantised: E = hν packets — high ν rarely affordable' : 'continuous: every mode takes energy'}>
      <text x={W / 2} y={26} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.65}>
        energy available to each mode
      </text>
      {Array.from({ length: 9 }, (_, i) => {
        const x = 30 + i * 32;
        // Continuous: every mode fills. Quantised: cost rises with frequency,
        // so the high-frequency end empties out — the catastrophe disappearing.
        const h = quantised ? Math.max(0, 62 * Math.exp(-i / 2.1)) : 62;
        return (
          <g key={i}>
            <rect x={x} y={H - 46 - h} width={20} height={h} rx={2}
              fill={quantised && i > 5 ? 'currentColor' : 'var(--color-accent)'}
              opacity={quantised && i > 5 ? 0.18 : 0.85} />
            {quantised && Array.from({ length: Math.max(1, i + 1) }, (_, k) => (
              <line key={k} x1={x} y1={H - 46 - h + (k * h) / Math.max(1, i + 1)} x2={x + 20}
                y2={H - 46 - h + (k * h) / Math.max(1, i + 1)}
                stroke="var(--color-surface)" strokeWidth={0.8} opacity={0.8} />
            ))}
          </g>
        );
      })}
      <line x1={24} y1={H - 46} x2={W - 16} y2={H - 46} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <text x={W - 16} y={H - 32} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>frequency →</text>
    </Figure>
  );
}

// --- Q15, Q38 -----------------------------------------------------------------

export function PhotoelectricThreshold({ sweep = false }: { sweep?: boolean }) {
  const animate = useAnimate();
  const t = useLoop(sweep ? 4200 : 2600, animate);
  const THRESHOLD = 5.0e14;
  // Fixed below threshold for Q38; for Q15 the frequency climbs through ν₀.
  const nu = sweep ? 3.0e14 + 4.0e14 * Math.min(1, t * 1.3) : 4.0e14;
  const { emits } = maxKineticEnergy(nu, THRESHOLD);
  const photons = sweep ? 6 : 3 + Math.floor(t * 9);
  const caption = sweep
    ? `ν = ${(nu / 1e14).toFixed(1)}×10¹⁴ Hz ${emits ? '≥' : '<'} ν₀ = 5.0×10¹⁴ Hz → ${emits ? 'emission begins' : 'nothing yet'}`
    : `ν = 4.0×10¹⁴ Hz < ν₀ = 5.0×10¹⁴ Hz · ${photons} photons · electrons emitted: 0`;
  return (
    <Figure width={W} height={H} label={sweep ? 'Photon frequency rises. Emission starts exactly when it reaches the threshold frequency.' : 'Photons below the threshold frequency strike a metal. However many arrive, no electron is emitted.'}
      caption={caption}>
      <rect x={20} y={H - 54} width={W - 40} height={30} rx={3} fill="currentColor" opacity={0.25} />
      <text x={W / 2} y={H - 34} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>metal · Φ = hν₀</text>
      {Array.from({ length: photons }, (_, i) => {
        const x = 30 + ((i * 37) % (W - 60));
        const drop = ((t * 1.6 + i * 0.13) % 1) * (H - 92);
        return (
          <g key={i}>
            <circle cx={x} cy={24 + drop} r={4} fill="var(--color-accent)" opacity={0.75} />
            <line x1={x} y1={24 + drop - 9} x2={x} y2={24 + drop - 3} stroke="var(--color-accent)" strokeWidth={1.5} opacity={0.5} />
          </g>
        );
      })}
      {emits && Array.from({ length: 3 }, (_, i) => (
        <circle key={i} cx={70 + i * 90} cy={H - 64 - ((t * 3 + i * 0.3) % 1) * 40} r={3.5} fill="var(--color-success)" />
      ))}
      {sweep && (
        <g>
          <rect x={20} y={14} width={W - 40} height={6} rx={3} fill="currentColor" opacity={0.15} />
          <rect x={20} y={14} width={(W - 40) * ((nu - 3e14) / 4e14)} height={6} rx={3} fill={emits ? 'var(--color-success)' : 'var(--color-accent)'} opacity={0.8} />
          <line x1={20 + (W - 40) * 0.5} y1={10} x2={20 + (W - 40) * 0.5} y2={24} stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
          <text x={20 + (W - 40) * 0.5} y={34} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7}>ν₀</text>
        </g>
      )}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={emits ? 'var(--color-success)' : 'var(--color-danger)'}>
        {emits ? 'emission' : sweep ? 'below threshold — no emission' : 'no emission at any intensity'}
      </text>
    </Figure>
  );
}

// --- Q40, Q84 -----------------------------------------------------------------

export function KmaxVsFrequency({ secondThreshold }: { secondThreshold?: number }) {
  const t = useLoop(3000, useAnimate());
  const THRESHOLD = 5.0e14;
  const nuMax = 1.1e15;
  const line = (threshold: number) =>
    Array.from({ length: 60 }, (_, i) => {
      const nu = (i / 59) * nuMax;
      return { nu, kMax: maxKineticEnergy(nu, threshold).kMax };
    });
  const pts = line(THRESHOLD);
  const peak = Math.max(...pts.map((p) => p.kMax));
  const toXY = (p: { nu: number; kMax: number }) => ({
    x: 34 + (p.nu / nuMax) * (W - 54),
    y: H - 36 - (p.kMax / peak) * (H - 70),
  });
  const reveal = (ps: { nu: number; kMax: number }[]) => ps.slice(0, Math.max(2, Math.floor(ps.length * Math.min(1, t * 1.4))));
  const probe = 9.5e14;
  const kB = maxKineticEnergy(probe, THRESHOLD).kMax;
  const kA = secondThreshold ? maxKineticEnergy(probe, secondThreshold).kMax : 0;
  return (
    <Figure width={W} height={H}
      label={secondThreshold ? 'Two parallel Kmax against frequency lines. The metal with the larger threshold has the smaller Kmax at any shared frequency.' : "Maximum kinetic energy against frequency is a straight line whose gradient is Planck's constant."}
      caption={secondThreshold ? `same slope h · at ν = 9.5×10¹⁴ Hz: B ${sci(kB)} J, A ${sci(kA)} J — A smaller` : `gradient = h = ${sci(PLANCK, 2)} J s`}>
      <Axes x0={34} y0={H - 36} x1={W - 16} y1={20} xLabel="ν" yLabel="Kₘₐₓ" />
      <path d={polyline(reveal(pts).map(toXY))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={34 + (THRESHOLD / nuMax) * (W - 54)} cy={H - 36} r={4} fill="var(--color-accent)" opacity={0.8} />
      <text x={34 + (THRESHOLD / nuMax) * (W - 54)} y={H - 20} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>{secondThreshold ? 'ν₀ (B)' : 'ν₀'}</text>
      {secondThreshold && (
        <g>
          <path d={polyline(reveal(line(secondThreshold)).map(toXY))} fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.6} />
          <circle cx={34 + (secondThreshold / nuMax) * (W - 54)} cy={H - 36} r={4} fill="currentColor" opacity={0.6} />
          <text x={34 + (secondThreshold / nuMax) * (W - 54)} y={H - 20} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>ν₀ (A)</text>
          <line x1={toXY({ nu: probe, kMax: 0 }).x} y1={H - 36} x2={toXY({ nu: probe, kMax: 0 }).x} y2={toXY({ nu: probe, kMax: kB }).y} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          <circle cx={toXY({ nu: probe, kMax: kB }).x} cy={toXY({ nu: probe, kMax: kB }).y} r={4} fill="var(--color-accent)" />
          <circle cx={toXY({ nu: probe, kMax: kA }).x} cy={toXY({ nu: probe, kMax: kA }).y} r={4} fill="currentColor" />
          <text x={toXY({ nu: probe, kMax: kB }).x - 8} y={toXY({ nu: probe, kMax: kB }).y - 6} textAnchor="end" fontSize={10} fill="var(--color-accent)">B</text>
          <text x={toXY({ nu: probe, kMax: kA }).x + 8} y={toXY({ nu: probe, kMax: kA }).y + 4} fontSize={10} fill="currentColor" opacity={0.8}>A</text>
        </g>
      )}
      <text x={W - 20} y={44} textAnchor="end" fontSize={11} fill="var(--color-accent)" fontFamily={MONO}>
        slope = h
      </text>
    </Figure>
  );
}

// --- Q43 ----------------------------------------------------------------------

export function BohrStability() {
  const t = useLoop(4200, useAnimate());
  const stable = t > 0.5;
  const cx = W / 2;
  const cy = H / 2 + 4;
  const angle = t * 14;
  // Classical: the orbit decays. Bohr: it does not. Same clock drives both.
  const r = stable ? 48 : 48 - ((t % 0.5) / 0.5) * 34;
  return (
    <Figure width={W} height={H} label={stable ? 'In a Bohr stationary state the electron orbits without radiating.' : 'A classical orbiting charge radiates and spirals into the nucleus.'}
      caption={stable ? 'Bohr: allowed orbit — no radiation, atom survives' : 'classical: radiates, spirals in within nanoseconds'}>
      <circle cx={cx} cy={cy} r={54} fill="none" stroke="currentColor" strokeWidth={1}
        opacity={stable ? 0.35 : 0.12} strokeDasharray={stable ? undefined : '3 3'} />
      <circle cx={cx} cy={cy} r={7} fill="var(--color-accent)" opacity={0.85} />
      <circle cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r={4.5} fill="currentColor" />
      {!stable && (
        <g opacity={0.5}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx} cy={cy} r={58 + i * 9 + (t % 0.5) * 30} fill="none"
              stroke="var(--color-danger)" strokeWidth={1} opacity={0.4 - i * 0.12} />
          ))}
        </g>
      )}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={stable ? 'var(--color-success)' : 'var(--color-danger)'}>
        {stable ? 'does not radiate' : 'radiating energy away'}
      </text>
    </Figure>
  );
}

// --- Q21, Q45, Q89 ------------------------------------------------------------

export function DeBroglieRatio({ ratio = 2, frequency = false }: { ratio?: number; frequency?: boolean }) {
  const t = useLoop(2800, useAnimate());
  const p1 = 1e-27;
  const p2 = ratio * p1;
  const l1 = deBroglieWavelength(p1);
  const l2 = deBroglieWavelength(p2);
  const wave = (cycles: number, y: number) =>
    polyline(
      Array.from({ length: 120 }, (_, i) => {
        const u = i / 119;
        return { x: 24 + u * (W - 48), y: y - 17 * Math.sin(u * cycles * 2 * Math.PI - t * 2 * Math.PI * (cycles / 2)) };
      }),
    );
  const caption = frequency
    ? `λ₂ = λ₁/${ratio} · at fixed v = fλ, f₂ = ${ratio} f₁`
    : `λ₁ : λ₂ = ${(l1 / l2).toFixed(0)} : 1`;
  return (
    <Figure width={W} height={H} label={`A particle with ${ratio} times the momentum has a de Broglie wavelength ${ratio} times shorter.`} caption={caption}>
      <text x={24} y={28} fontSize={11} fill="currentColor" opacity={0.7} fontFamily={MONO}>momentum p</text>
      <path d={wave(2, 54)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <text x={24} y={104} fontSize={11} fill="currentColor" opacity={0.7} fontFamily={MONO}>momentum {ratio}p</text>
      <path d={wave(2 * ratio, 130)} fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.6} />
      <text x={W - 24} y={28} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6} fontFamily={MONO}>
        λ = h/p{frequency ? ' · f = v/λ' : ''}
      </text>
      <text x={W - 24} y={104} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6} fontFamily={MONO}>
        λ = h/{ratio}p — {ratio === 2 ? 'half' : `1/${ratio}`} as long{frequency ? ` · f × ${ratio}` : ''}
      </text>
    </Figure>
  );
}

// --- Q22, Q46, Q74, Q90 -------------------------------------------------------

/** Deterministic pseudo-random in [0,1) so the dot pattern is stable between renders. */
const hash = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function WhichPath({ mode = 'toggle' }: { mode?: 'toggle' | 'build' }) {
  const t = useLoop(mode === 'build' ? 6000 : 4400, useAnimate());
  const watching = mode === 'toggle' && t > 0.5;
  const screenX = W - 44;
  const fringe = (y: number) => {
    const d = (y - 90) / 26;
    return Math.cos(d * 2.4) ** 2 * Math.exp(-(d ** 2) / 4.2);
  };
  // Build mode: dots land one by one, accepted by rejection sampling against
  // the fringe intensity, so the pattern that emerges is the cos² pattern.
  const landed = mode === 'build'
    ? Array.from({ length: 400 }, (_, i) => ({ y: 30 + hash(i) * 120, u: hash(i + 1000), x: hash(i + 2000) }))
        .filter((d) => d.u < fringe(d.y))
        .slice(0, Math.floor(t * 1.2 * 160))
    : [];
  return (
    <Figure width={W} height={H}
      label={mode === 'build' ? 'Single particles arrive one at a time; the accumulated dots form interference fringes.' : watching ? 'With a which-path detector the fringes vanish, leaving two overlapping blobs.' : 'With no detector the two paths interfere and fringes appear.'}
      caption={mode === 'build' ? `${landed.length} detections — one dot each, fringes emerging` : watching ? 'detector on: paths distinguishable — fringes gone' : 'detector off: amplitudes add — fringes'}>
      {mode === 'build' && <circle cx={22} cy={90} r={4} fill="var(--color-accent)" />}
      <rect x={52} y={26} width={6} height={128} fill="currentColor" opacity={0.4} />
      <rect x={52} y={62} width={6} height={16} fill="var(--color-surface)" />
      <rect x={52} y={102} width={6} height={16} fill="var(--color-surface)" />
      {[70, 110].map((y) => (
        <path key={y} d={`M58,${y} Q${(58 + screenX) / 2},${y + (y === 70 ? 26 : -26)} ${screenX},90`}
          fill="none" stroke="var(--color-accent)" strokeWidth={1.4} opacity={watching ? 0.25 : mode === 'build' ? 0.3 : 0.6}
          strokeDasharray={watching ? '3 3' : undefined} />
      ))}
      {watching && (
        <g>
          <circle cx={74} cy={70} r={7} fill="none" stroke="var(--color-danger)" strokeWidth={1.6} />
          <text x={74} y={54} textAnchor="middle" fontSize={9} fill="var(--color-danger)">detector</text>
        </g>
      )}
      <rect x={screenX} y={26} width={8} height={128} fill="currentColor" opacity={0.2} />
      {mode === 'build'
        ? landed.map((d, i) => (
            <circle key={i} cx={screenX + 10 + d.x * 20} cy={d.y} r={1.4} fill="var(--color-accent)" opacity={0.85} />
          ))
        : Array.from({ length: 30 }, (_, i) => {
            const y = 30 + i * 4.2;
            // Fringes: cos² pattern. Blobs: two Gaussians, no interference term.
            const intensity = watching
              ? Math.exp(-((y - 72) ** 2) / 300) + Math.exp(-((y - 108) ** 2) / 300)
              : fringe(y);
            return (
              <rect key={i} x={screenX + 9} y={y} width={Math.max(0.5, intensity * 22)} height={3.4}
                fill="var(--color-accent)" opacity={0.3 + intensity * 0.6} />
            );
          })}
    </Figure>
  );
}

// --- Q23, Q47 -----------------------------------------------------------------

export function BornRule({ rotate = false }: { rotate?: boolean }) {
  const t = useLoop(3200, useAnimate());
  const stage = rotate ? 2 : t < 0.4 ? 0 : t < 0.75 ? 1 : 2;
  const cx = 86;
  const cy = H / 2;
  const r = 44;
  const modulus = 0.6;
  // Q47 fixes the amplitude at 0.6i; Q23 lets its phase turn to show |ψ|² does not care.
  const phase = rotate ? t * 2 * Math.PI : Math.PI / 2;
  const px = cx + r * 1.6 * modulus * Math.cos(phase);
  const py = cy - r * 1.6 * modulus * Math.sin(phase);
  const prob = modulus * modulus;
  return (
    <Figure width={W} height={H}
      label={rotate ? 'An amplitude of fixed length 0.6 turns through every phase; its squared modulus stays 0.36.' : 'An amplitude of 0.6i has modulus 0.6, and squaring it gives a probability of 0.36.'}
      caption={rotate ? `phase ${((phase * 180) / Math.PI).toFixed(0)}° — |ψ|² = ${prob.toFixed(2)} regardless` : 'probability is |amplitude|², which is why the i disappears'}>
      <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      {rotate && <circle cx={cx} cy={cy} r={r * 1.6 * modulus} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" opacity={0.3} />}
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={px} cy={py} r={5} fill="var(--color-accent)" />
      <text x={px + 10} y={py - 6} fontSize={12} fill="var(--color-accent)" fontFamily={MONO}>{rotate ? 'ψ' : '0.6i'}</text>
      <text x={190} y={62} fontSize={13} fill="currentColor" opacity={stage >= 1 ? 0.9 : 0.25} fontFamily={MONO}>{rotate ? '|ψ| = 0.6' : '|0.6i| = 0.6'}</text>
      <text x={190} y={92} fontSize={13} fill="currentColor" opacity={stage >= 1 ? 0.9 : 0.25} fontFamily={MONO}>0.6² = 0.36</text>
      <text x={190} y={126} fontSize={17} fontWeight={700} fontFamily={MONO}
        fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.25}>
        {rotate ? '|ψ|² = 0.36' : 'P = 0.36'}
      </text>
    </Figure>
  );
}

// --- Q24, Q48, Q65, Q79, Q81 --------------------------------------------------

const PAIRS: [number, number][] = [[0.5, 0.5], [0.6, 0.8], [0.7, 0.7], [0.8, 0.8]];

export function Normalisation({
  known,
  solve = false,
  amplitudes = false,
  knownLabel,
}: {
  /** Known probabilities (solve) or known amplitudes (amplitudes); omit for the Q48 tour. */
  known?: number[];
  solve?: boolean;
  amplitudes?: boolean;
  knownLabel?: string;
}) {
  const t = useLoop(known ? 3600 : 5200, useAnimate());
  if (known && (solve || amplitudes)) {
    const stage = t < 0.35 ? 0 : t < 0.7 ? 1 : 2;
    const probs = amplitudes ? known.map((a) => a * a) : known;
    const used = probs.reduce((s, p) => s + p, 0);
    const rest = Math.max(0, 1 - used);
    const amp = Math.sqrt(rest);
    const scale = 220;
    const fmt = (v: number) => (Math.abs(v - Math.SQRT1_2) < 1e-3 ? '1/√2' : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
    const caption = amplitudes
      ? `|${knownLabel ?? fmt(known[0])}|² = ${fmt(probs[0])} → a² = 1 − ${fmt(probs[0])} = ${fmt(rest)} → a = ${fmt(amp)}`
      : `1 − (${probs.map(fmt).join(' + ')}) = 1 − ${fmt(used)} = ${fmt(rest)}`;
    // Left edge of each known segment: the running sum of what came before.
    const starts = probs.map((_, i) => 50 + probs.slice(0, i).reduce((acc, q) => acc + q, 0) * scale * Math.min(1, t * 3));
    return (
      <Figure width={W} height={H} label={`Probabilities must total one. ${caption}.`} caption={caption}>
        <text x={W / 2} y={34} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7} fontFamily={MONO}>
          {amplitudes ? '|a|² + |b|² = 1' : 'all probabilities sum to 1'}
        </text>
        <rect x={50} y={70} width={scale} height={28} rx={3} fill="none" stroke="currentColor" opacity={0.35} />
        {probs.map((p, i) => {
          const w = p * scale * Math.min(1, t * 3);
          const x = starts[i];
          return (
            <g key={i}>
              <rect x={x} y={70} width={w} height={28} fill="currentColor" opacity={0.3} />
              <text x={x + w / 2} y={112} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.8} fontFamily={MONO}>{amplitudes ? `|${knownLabel ?? fmt(known[i])}|² = ` : ''}{fmt(p)}</text>
            </g>
          );
        })}
        {stage >= 1 && (
          <g>
            <rect x={50 + used * scale} y={70} width={rest * scale} height={28} fill="var(--color-success)" opacity={0.85} />
            <text x={50 + used * scale + (rest * scale) / 2} y={112} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>
              {amplitudes ? `a² = ${fmt(rest)}` : `P = ${fmt(rest)}`}
            </text>
          </g>
        )}
        <text x={W / 2} y={150} textAnchor="middle" fontSize={16} fontWeight={700} fontFamily={MONO}
          fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.25}>
          {amplitudes ? `a = √${fmt(rest)} = ${fmt(amp)}` : `P = ${fmt(rest)}`}
        </text>
      </Figure>
    );
  }
  const idx = Math.floor(t * PAIRS.length) % PAIRS.length;
  const [a, b] = PAIRS[idx];
  const total = a * a + b * b;
  const ok = Math.abs(total - 1) < 1e-9;
  return (
    <Figure width={W} height={H} label="Only the pair 0.6 and 0.8 has squared values summing to exactly one."
      caption={`${a} and ${b}: ${a}² + ${b}² = ${total.toFixed(2)}${ok ? ' ✓' : ''}`}>
      <text x={W / 2} y={34} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7} fontFamily={MONO}>a² + b² = 1 ?</text>
      {[a, b].map((v, i) => (
        <g key={i}>
          <rect x={46 + i * 118} y={H - 54 - v * v * 76} width={70} height={v * v * 76} rx={3}
            fill={ok ? 'var(--color-success)' : 'var(--color-accent)'} opacity={0.8} />
          <text x={81 + i * 118} y={H - 36} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75} fontFamily={MONO}>
            {v}² = {(v * v).toFixed(2)}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily={MONO}
        fill={ok ? 'var(--color-success)' : 'var(--color-danger)'}>
        {total.toFixed(2)} {ok ? '— normalised' : '— not 1'}
      </text>
    </Figure>
  );
}

// --- Q25, Q49, Q96 ------------------------------------------------------------

const DEFAULT_SETS = '2,2,0,0.5;3,1,2,-0.5;3,2,-1,0.5;1,0,0,1';

export function QuantumNumbers({ sets = DEFAULT_SETS }: { sets?: string }) {
  const parsed = sets.split(';').map((row) => row.split(',').map(Number) as [number, number, number, number]);
  const t = useLoop(1500 * parsed.length, useAnimate());
  const idx = Math.floor(t * parsed.length) % parsed.length;
  const [n, l, ml, ms] = parsed[idx];
  const { allowed, rules } = checkQuantumNumbers(n, l, ml, ms);
  const failing = rules.filter((r) => !r.ok);
  const fmt = (v: number) => (v === 0.5 ? '+½' : v === -0.5 ? '−½' : String(v).replace('-', '−'));
  const caption = allowed ? 'every rule satisfied — allowed' : `fails ${failing.length === 1 ? 'only' : ''} ${failing.map((r) => r.rule).join(' and ')} — not allowed`;
  return (
    <Figure width={W} height={H} label="Each set of quantum numbers is checked against the rules in turn." caption={caption}>
      <text x={W / 2} y={30} textAnchor="middle" fontSize={15} fontWeight={700} fill="currentColor" fontFamily={MONO}>
        ({n}, {fmt(l)}, {fmt(ml)}, {fmt(ms)})
      </text>
      {rules.map((r, i) => (
        <g key={r.rule}>
          <text x={54} y={58 + i * 24} fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>{r.rule}</text>
          <text x={W - 54} y={58 + i * 24} textAnchor="end" fontSize={13} fontWeight={700}
            fill={r.ok ? 'var(--color-success)' : 'var(--color-danger)'}>
            {r.ok ? '✓' : '✗'}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={allowed ? 'var(--color-success)' : 'var(--color-danger)'}>
        {allowed ? `allowed — a ${n}${'spdf'[l] ?? '?'} electron` : 'not allowed'}
      </text>
    </Figure>
  );
}

// --- Q50, Q75, Q98 ------------------------------------------------------------

export function ElectronHolePairs({ cooling = false }: { cooling?: boolean }) {
  const t = useLoop(3800, useAnimate());
  const pairs = cooling ? 5 - Math.floor(t * 4.99) : 1 + Math.floor(t * 5);
  return (
    <Figure width={W} height={H}
      label={cooling ? 'As an intrinsic semiconductor cools, fewer electrons cross the gap and fewer holes remain; conductivity falls.' : 'In an intrinsic semiconductor each thermal excitation creates one conduction electron and leaves one hole, so the counts are always equal.'}
      caption={`${cooling ? 'cooling' : 'heating'}: ${pairs} electron${pairs === 1 ? '' : 's'} · ${pairs} hole${pairs === 1 ? '' : 's'} — ${cooling ? 'conductivity falling' : 'created in pairs'}`}>
      <rect x={24} y={26} width={W - 48} height={34} rx={3} fill="var(--color-accent)" opacity={0.12} />
      <text x={32} y={46} fontSize={10} fill="currentColor" opacity={0.7}>conduction band</text>
      <rect x={24} y={H - 64} width={W - 48} height={34} rx={3} fill="currentColor" opacity={0.14} />
      <text x={32} y={H - 42} fontSize={10} fill="currentColor" opacity={0.7}>valence band</text>
      {Array.from({ length: pairs }, (_, i) => {
        const x = 62 + i * 44;
        return (
          <g key={i}>
            <circle cx={x} cy={43} r={5} fill="var(--color-accent)" />
            <circle cx={x} cy={H - 47} r={5} fill="none" stroke="currentColor" strokeWidth={1.8} opacity={0.75} />
            <line x1={x} y1={52} x2={x} y2={H - 56} stroke="currentColor" strokeWidth={1} opacity={0.25} strokeDasharray="2 3" />
          </g>
        );
      })}
      <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>
        n = p = nᵢ{cooling ? ' ↓' : ''}
      </text>
      <text x={W - 28} y={H / 2 + 4} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>{cooling ? 'T ↓' : 'T ↑'}</text>
    </Figure>
  );
}
