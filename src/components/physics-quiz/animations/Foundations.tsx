'use client';

import { Axes, Figure, piLabel, polyline, useAnimate, useLoop } from '../Figure';
import {
  combineAmplitudes,
  complexMagnitude,
  orbitalCount,
  phaseForSeparation,
  photonEnergyEv,
  powerLawFactor,
  sci,
  shellCapacity,
  shellOrbitals,
  sinDeg,
  stoppingPotential,
  subshellCapacity,
  waveSpeed,
  wavelengthFromSpeed,
} from '@/lib/physics';
import { arithmeticSteps, type ArithmeticOp } from '@/lib/physics-steps';

/**
 * Figures introduced for Levels 1, 3 and 4.
 *
 * Same rule as the Level 2 set: every number drawn here is computed by the
 * function the answer-key test calls, so the picture and the walkthrough
 * cannot disagree. Each figure takes its inputs as props, because several
 * questions share one figure with different numbers — the energy ledger
 * serves Q16, Q58, Q83 and Q85 with four different photons.
 */

const W = 320;
const H = 180;
const MONO = 'monospace';

// --- worked arithmetic: Q18, Q26, Q41, Q42, Q51, Q57, Q59, Q61, Q62, Q64, Q86

export function Arithmetic({ op, a, b }: { op: ArithmeticOp; a: number; b?: number }) {
  const t = useLoop(3600, useAnimate());
  const stage = t < 0.35 ? 0 : t < 0.7 ? 1 : 2;
  const { formula, substitution, result, note } = arithmeticSteps(op, a, b);
  const noteLines = note ? note.split(' — ') : [];
  return (
    <Figure width={W} height={H} label={`${formula}: ${substitution}, giving ${result}.`}
      caption="formula → numbers → result">
      <text x={W / 2} y={44} textAnchor="middle" fontSize={17} fill="currentColor" fontFamily={MONO}>{formula}</text>
      <text x={W / 2} y={78} textAnchor="middle" fontSize={12} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily={MONO}>
        {substitution}
      </text>
      <text x={W / 2} y={116} textAnchor="middle" fontSize={19} fontWeight={700} fontFamily={MONO}
        fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.2}>
        {result}
      </text>
      {noteLines.map((line, i) => (
        <text key={line} x={W / 2} y={144 + i * 14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
          {line}
        </text>
      ))}
    </Figure>
  );
}

// --- Q1 ---------------------------------------------------------------------

export function DecimalShift({ value, places }: { value: string; places: number }) {
  const t = useLoop(3800, useAnimate());
  // Hold on the final frame for the last third of the loop.
  const k = Math.min(places, Math.floor(t * 1.5 * (places + 1)));
  const digits = value.replace('.', '');
  const p0 = value.indexOf('.');
  const pos = p0 + k;
  const shown = `${digits.slice(0, pos)}.${digits.slice(pos)}`;
  const firstSignificant = digits.search(/[1-9]/);
  const done = k === places;
  const target = sci(Number(value), 1);
  return (
    <Figure width={W} height={H} label={`The decimal point in ${value} moves ${places} places right to give ${target}.`}
      caption={done ? `${places} places → ${target}` : `moved ${k} place${k === 1 ? '' : 's'}`}>
      {shown.split('').map((ch, i) => {
        const digitIndex = i < pos ? i : i - 1; // position in `digits`, ignoring the point
        const faded = ch !== '.' && done && digitIndex < firstSignificant;
        return (
          <text key={i} x={38 + i * 24} y={82} textAnchor="middle" fontSize={ch === '.' ? 30 : 24} fontFamily={MONO}
            fill={ch === '.' ? 'var(--color-accent)' : 'currentColor'} opacity={faded ? 0.15 : 1} fontWeight={ch === '.' ? 700 : 400}>
            {ch}
          </text>
        );
      })}
      {Array.from({ length: k }, (_, i) => (
        <path key={i} d={`M${38 + (p0 + i) * 24 + 12},100 q12,14 24,0`} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} opacity={0.6} />
      ))}
      <text x={W / 2} y={140} textAnchor="middle" fontSize={16} fontWeight={700} fontFamily={MONO}
        fill={done ? 'var(--color-success)' : 'currentColor'} opacity={done ? 1 : 0.25}>
        {target}
      </text>
      <text x={W / 2} y={162} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
        one non-zero digit before the point · exponent = −places moved
      </text>
    </Figure>
  );
}

// --- Q2, Q76 ------------------------------------------------------------------

export function PowerLaw({ k, from, to }: { k: number; from: number; to: number }) {
  const t = useLoop(3200, useAnimate());
  const u0 = from / to;
  const u = u0 + (1 - u0) * Math.min(1, t * 1.6);
  const y = (x: number) => x ** k;
  const xMax = 1.15;
  const yMax = y(xMax);
  const toXY = (x: number) => ({ x: 36 + (x / xMax) * (W - 60), y: H - 34 - (y(x) / yMax) * (H - 60) });
  const pts = Array.from({ length: 80 }, (_, i) => toXY((i / 79) * xMax));
  const p = toXY(u);
  const factor = powerLawFactor(from, to, k);
  const law = k === 2 ? 'x²' : k === 0.5 ? '√x' : k === 3 ? 'x³' : `x^${k}`;
  const ratio = y(u) / y(u0);
  return (
    <Figure width={W} height={H} label={`y proportional to ${law}. As x goes from ${sci(from, 1)} to ${sci(to, 1)}, y changes by a factor ${factor}.`}
      caption={`y ∝ ${law} · x × ${(u / u0).toFixed(2)} → y × ${ratio.toFixed(2)}`}>
      <Axes x0={36} y0={H - 34} x1={W - 16} y1={20} xLabel="x" yLabel="y" />
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      {[u0, u].map((xx, i) => {
        const q = toXY(xx);
        return (
          <g key={i}>
            <line x1={q.x} y1={H - 34} x2={q.x} y2={q.y} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            <line x1={36} y1={q.y} x2={q.x} y2={q.y} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          </g>
        );
      })}
      <circle cx={p.x} cy={p.y} r={5} fill="var(--color-accent)" />
      <text x={W - 20} y={32} textAnchor="end" fontSize={11} fontWeight={700} fontFamily={MONO}
        fill={Math.abs(ratio - factor) < 0.01 ? 'var(--color-success)' : 'var(--color-accent)'}>
        factor {factor}
      </text>
    </Figure>
  );
}

// --- Q3 ---------------------------------------------------------------------

export function UnitCircle({ deg }: { deg: number }) {
  const t = useLoop(3200, useAnimate());
  const d = deg * Math.min(1, t * 1.5);
  const rad = (d * Math.PI) / 180;
  const r = 56;
  const cx = 100;
  const cy = H / 2 + 6;
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);
  const s = sinDeg(Math.round(d));
  return (
    <Figure width={W} height={H} label={`On the unit circle the point at ${deg} degrees has height sin ${deg}° = ${sinDeg(deg)}.`}
      caption={`θ = ${d.toFixed(0)}° · sin θ = height = ${s.toFixed(2)}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <line x1={cx - r - 12} y1={cy} x2={cx + r + 12} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy - r - 12} x2={cx} y2={cy + r + 12} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <path d={`M${cx + 18},${cy} A18,18 0 0 0 ${cx + 18 * Math.cos(rad)},${cy - 18 * Math.sin(rad)}`} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} opacity={0.7} />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="currentColor" strokeWidth={2} opacity={0.7} />
      <line x1={px} y1={cy} x2={px} y2={py} stroke="var(--color-accent)" strokeWidth={3} />
      <circle cx={px} cy={py} r={4.5} fill="var(--color-accent)" />
      <text x={px + 8} y={(cy + py) / 2 + 4} fontSize={11} fill="var(--color-accent)" fontFamily={MONO}>sin θ</text>
      <text x={200} y={70} fontSize={12} fill="currentColor" opacity={0.75} fontFamily={MONO}>radius = 1</text>
      <text x={200} y={94} fontSize={12} fill="currentColor" opacity={0.75} fontFamily={MONO}>height = sin θ</text>
      <text x={200} y={126} fontSize={17} fontWeight={700} fontFamily={MONO}
        fill={Math.abs(d - deg) < 0.5 ? 'var(--color-success)' : 'currentColor'} opacity={Math.abs(d - deg) < 0.5 ? 1 : 0.35}>
        sin {deg}° = {sinDeg(deg)}
      </text>
    </Figure>
  );
}

// --- Q6 ---------------------------------------------------------------------

export function ComplexMagnitude({ re, im }: { re: number; im: number }) {
  const t = useLoop(3600, useAnimate());
  const stage = t < 0.3 ? 0 : t < 0.6 ? 1 : 2;
  const unit = 22;
  const ox = 60;
  const oy = H - 40;
  const px = ox + re * unit;
  const py = oy - im * unit;
  const mag = complexMagnitude(re, im);
  return (
    <Figure width={W} height={H} label={`The point ${re} + ${im}i on the complex plane. Legs ${re} and ${im} give a hypotenuse of ${mag}.`}
      caption={`|${re} + ${im}i| = √(${re}² + ${im}²) = √${re * re + im * im} = ${mag}`}>
      <line x1={ox - 10} y1={oy} x2={ox + 120} y2={oy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={ox} y1={oy + 10} x2={ox} y2={oy - 120} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <text x={ox + 122} y={oy + 4} fontSize={10} fill="currentColor" opacity={0.5}>Re</text>
      <text x={ox + 4} y={oy - 122} fontSize={10} fill="currentColor" opacity={0.5}>Im</text>
      <line x1={ox} y1={oy} x2={px} y2={oy} stroke="var(--color-accent)" strokeWidth={3} opacity={stage >= 1 ? 1 : 0.2} />
      <line x1={px} y1={oy} x2={px} y2={py} stroke="var(--color-accent)" strokeWidth={3} opacity={stage >= 1 ? 1 : 0.2} />
      <text x={(ox + px) / 2} y={oy + 14} textAnchor="middle" fontSize={11} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily={MONO}>{re}</text>
      <text x={px + 8} y={(oy + py) / 2 + 4} fontSize={11} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily={MONO}>{im}</text>
      <line x1={ox} y1={oy} x2={px} y2={py} stroke={stage >= 2 ? 'var(--color-success)' : 'currentColor'} strokeWidth={2.5} />
      <circle cx={px} cy={py} r={5} fill="currentColor" />
      <text x={px + 8} y={py - 6} fontSize={12} fill="currentColor" fontFamily={MONO}>{re} + {im}i</text>
      <text x={200} y={70} fontSize={12} fill="currentColor" opacity={stage >= 1 ? 0.85 : 0.25} fontFamily={MONO}>{re}² + {im}² = {re * re + im * im}</text>
      <text x={200} y={100} fontSize={17} fontWeight={700} fontFamily={MONO}
        fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.25}>
        √{re * re + im * im} = {mag}
      </text>
    </Figure>
  );
}

// --- Q10, Q54 -----------------------------------------------------------------

export function WaveSpeed({ f, lambda, v, ask }: { f: number; lambda?: number; v?: number; ask: 'v' | 'lambda' }) {
  const t = useLoop(2400, useAnimate());
  const wavelength = lambda ?? wavelengthFromSpeed(v ?? 0, f);
  const speed = v ?? waveSpeed(f, wavelength);
  const cycles = 3;
  const pts = Array.from({ length: 150 }, (_, i) => {
    const u = i / 149;
    return { x: 24 + u * (W - 48), y: 70 - 30 * Math.sin(u * cycles * 2 * Math.PI - t * 2 * Math.PI) };
  });
  const lamW = (W - 48) / cycles;
  const crestX = 24 + ((0.25 + t) % 1) * lamW + lamW;
  const caption = ask === 'v'
    ? `v = fλ = ${f} × ${wavelength} = ${speed} m s⁻¹`
    : `λ = v/f = ${speed}/${f} = ${wavelength} m`;
  return (
    <Figure width={W} height={H} label={`A travelling wave. Frequency ${f} hertz, wavelength ${wavelength} metres, speed ${speed} metres per second.`}
      caption={caption}>
      <path d={polyline(pts)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={crestX} cy={40} r={4} fill="currentColor" opacity={0.8} />
      <line x1={24 + lamW} y1={112} x2={24 + 2 * lamW} y2={112} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24 + lamW} y1={107} x2={24 + lamW} y2={117} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24 + 2 * lamW} y1={107} x2={24 + 2 * lamW} y2={117} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <text x={24 + 1.5 * lamW} y={128} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.8} fontFamily={MONO}>λ = {wavelength} m</text>
      <text x={24} y={150} fontSize={11} fill="currentColor" opacity={0.7} fontFamily={MONO}>f = {f} Hz → {f} wavelengths pass per second</text>
      <text x={W - 24} y={168} textAnchor="end" fontSize={13} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>
        {ask === 'v' ? `v = ${speed} m s⁻¹` : `λ = ${wavelength} m`}
      </text>
    </Figure>
  );
}

// --- Q56, Q78 -----------------------------------------------------------------

export function PhaseSeparation({ d, lambda, v, f }: { d: number; lambda: number; v?: number; f?: number }) {
  const t = useLoop(3000, useAnimate());
  const phase = phaseForSeparation(d, lambda);
  const frac = d / lambda;
  const cycles = 2;
  const pxPerLambda = (W - 48) / cycles;
  const yAt = (u: number) => 74 - 32 * Math.sin(u * cycles * 2 * Math.PI - t * 2 * Math.PI);
  const pts = Array.from({ length: 150 }, (_, i) => ({ x: 24 + (i / 149) * (W - 48), y: yAt(i / 149) }));
  const u1 = 0.5;
  const u2 = u1 + frac / cycles;
  const x1 = 24 + u1 * (W - 48);
  const x2 = 24 + u2 * (W - 48);
  const prefix = v !== undefined && f !== undefined ? `λ = v/f = ${v}/${f} = ${lambda} m · ` : '';
  return (
    <Figure width={W} height={H} label={`Two points on a wave separated by ${frac} of a wavelength have a phase difference of ${piLabel(phase)}.`}
      caption={`${prefix}d/λ = ${frac.toFixed(2)} → Δφ = 2π × ${frac.toFixed(2)} = ${piLabel(phase)}`}>
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      <line x1={x1} y1={30} x2={x1} y2={118} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <line x1={x2} y1={30} x2={x2} y2={118} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <circle cx={x1} cy={yAt(u1)} r={5} fill="var(--color-accent)" />
      <circle cx={x2} cy={yAt(u2)} r={5} fill="currentColor" />
      <line x1={x1} y1={128} x2={x2} y2={128} stroke="var(--color-accent)" strokeWidth={2} />
      <text x={(x1 + x2) / 2} y={142} textAnchor="middle" fontSize={11} fill="var(--color-accent)" fontFamily={MONO}>d = {d} m</text>
      <line x1={24 + u1 * (W - 48)} y1={160} x2={24 + u1 * (W - 48) + pxPerLambda} y2={160} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
      <text x={24 + u1 * (W - 48) + pxPerLambda / 2} y={173} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7} fontFamily={MONO}>λ = {lambda} m ↔ 2π</text>
    </Figure>
  );
}

// --- Q55 ----------------------------------------------------------------------

export function DisplacementSum({ a, b, amplitude }: { a: number; b: number; amplitude: number }) {
  const t = useLoop(3600, useAnimate());
  const stage = t < 0.3 ? 0 : t < 0.6 ? 1 : 2;
  const unit = 26;
  const base = H / 2 + 20;
  const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}`;
  const sum = a + b;
  const arrow = (x: number, from: number, to: number, colour: string, opacity: number) => {
    const y1 = base - from * unit;
    const y2 = base - to * unit;
    const dir = Math.sign(to - from);
    return (
      <g opacity={opacity}>
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={colour} strokeWidth={4} />
        <polygon points={`${x},${y2} ${x - 6},${y2 + dir * 9} ${x + 6},${y2 + dir * 9}`} fill={colour} />
      </g>
    );
  };
  return (
    <Figure width={W} height={H} label={`Displacements ${fmt(a)} and ${fmt(b)} centimetres add tip to tail to ${fmt(sum)} centimetres.`}
      caption={`(${fmt(a)}) + (${fmt(b)}) = ${fmt(sum)} cm · the ${amplitude} cm amplitudes are not what you add`}>
      <line x1={30} y1={base} x2={W - 30} y2={base} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      {[-amplitude, amplitude].map((v) => (
        <line key={v} x1={30} y1={base - v * unit} x2={W - 30} y2={base - v * unit} stroke="currentColor" strokeWidth={1} strokeDasharray="2 4" opacity={0.2} />
      ))}
      <text x={32} y={base - amplitude * unit - 4} fontSize={9} fill="currentColor" opacity={0.5}>+{amplitude} cm (amplitude)</text>
      {arrow(90, 0, a, 'var(--color-accent)', 1)}
      <text x={100} y={base - (a * unit) / 2 + 4} fontSize={11} fill="var(--color-accent)" fontFamily={MONO}>{fmt(a)}</text>
      {arrow(170, a, a + b, 'currentColor', stage >= 1 ? 0.8 : 0.15)}
      <text x={180} y={base - (a + b / 2) * unit + 4} fontSize={11} fill="currentColor" opacity={stage >= 1 ? 0.9 : 0.2} fontFamily={MONO}>{fmt(b)}</text>
      {arrow(250, 0, sum, 'var(--color-success)', stage >= 2 ? 1 : 0.15)}
      <text x={260} y={base - sum * unit - 8} fontSize={13} fontWeight={700} fill="var(--color-success)" opacity={stage >= 2 ? 1 : 0.2} fontFamily={MONO}>{fmt(sum)}</text>
      <text x={90} y={H - 10} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>wave 1</text>
      <text x={170} y={H - 10} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>+ wave 2</text>
      <text x={250} y={H - 10} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>= resultant</text>
    </Figure>
  );
}

// --- Q16, Q58, Q83, Q85 -------------------------------------------------------

export function EnergyLedger({
  phiEv,
  photonNm,
  photonEv,
  compareNm,
  intensity,
  define = false,
}: {
  phiEv: number;
  photonNm?: number;
  photonEv?: number;
  compareNm?: number;
  intensity?: number;
  define?: boolean;
}) {
  const t = useLoop(3800, useAnimate());
  const stage = t < 0.3 ? 0 : t < 0.65 ? 1 : 2;
  const energyOf = (nm?: number, ev?: number) => ev ?? photonEnergyEv(nm ?? 0);
  const photons = compareNm !== undefined ? [compareNm, photonNm ?? 0] : [photonNm];
  const bars = photons.map((nm) => {
    const e = energyOf(nm, photonEv);
    const k = nm !== undefined && photonEv === undefined ? stoppingPotential(nm, phiEv) : Math.max(0, e - phiEv);
    return { nm, e, k };
  });
  const eMax = Math.max(...bars.map((b) => b.e)) * 1.15;
  const scale = (ev: number) => (ev / eMax) * (H - 70);
  const base = H - 36;
  const barW = 54;
  const x0 = bars.length > 1 ? 70 : 92;
  const gap = 110;
  const caption = compareNm !== undefined
    ? `V₀ rises from ${bars[0].k.toFixed(2)} V to ${bars[1].k.toFixed(2)} V — by ${(bars[1].k - bars[0].k).toFixed(2)} V`
    : intensity
      ? `Kₘₐₓ = ${bars[0].e.toFixed(1)} − ${phiEv.toFixed(1)} = ${bars[0].k.toFixed(1)} eV · ×${intensity} intensity → ×${intensity} electrons, same Kₘₐₓ`
      : define
        ? 'Φ is spent leaving the surface; only the remainder becomes motion'
        : `E = ${bars[0].e.toFixed(2)} eV − Φ ${phiEv.toFixed(1)} eV → Kₘₐₓ = ${bars[0].k.toFixed(2)} eV = eV₀ · V₀ = ${bars[0].k.toFixed(2)} V`;
  return (
    <Figure width={W} height={H} label={`Energy ledger for the photoelectric effect. Photon energy ${bars.map((b) => b.e.toFixed(2)).join(' and ')} eV, work function ${phiEv} eV, leaving ${bars.map((b) => b.k.toFixed(2)).join(' and ')} eV of kinetic energy.`}
      caption={caption}>
      <line x1={30} y1={base} x2={W - 16} y2={base} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      {bars.map((b, i) => {
        const x = x0 + i * gap;
        const hPhi = scale(Math.min(b.e, phiEv)) * Math.min(1, t * 2.4);
        const hK = scale(b.k) * (stage >= 1 ? Math.min(1, (t - 0.3) * 4) : 0);
        return (
          <g key={i}>
            <rect x={x} y={base - hPhi} width={barW} height={hPhi} fill="currentColor" opacity={0.3} />
            <rect x={x} y={base - hPhi - hK} width={barW} height={hK} fill="var(--color-accent)" opacity={0.9} />
            <text x={x + barW / 2} y={base + 14} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>
              {b.nm !== undefined && photonEv === undefined ? `${b.nm} nm` : `${b.e.toFixed(1)} eV photon`}
            </text>
            <text x={x + barW + 6} y={base - hPhi / 2 + 4} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>
              Φ = {phiEv.toFixed(1)} eV
            </text>
            {stage >= 1 && (
              <text x={x + barW + 6} y={base - hPhi - hK / 2 + 4} fontSize={10} fontWeight={700} fill="var(--color-accent)" fontFamily={MONO}>
                Kₘₐₓ {b.k.toFixed(2)} eV
              </text>
            )}
            <text x={x + barW / 2} y={base - scale(b.e) - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7} fontFamily={MONO}>
              hν = {b.e.toFixed(2)} eV
            </text>
          </g>
        );
      })}
      {intensity && (
        <g opacity={stage >= 2 ? 1 : 0.2}>
          {Array.from({ length: intensity * 3 }, (_, i) => (
            <circle key={i} cx={236 + (i % 3) * 16} cy={44 + Math.floor(i / 3) * 16} r={4} fill="var(--color-accent)" opacity={0.7} />
          ))}
          <text x={260} y={44 + intensity * 16 + 10} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7}>×{intensity} photons/s</text>
          <text x={260} y={44 + intensity * 16 + 24} textAnchor="middle" fontSize={9} fill="var(--color-success)" fontWeight={700}>current ×{intensity}</text>
        </g>
      )}
      {define && (
        <text x={W - 16} y={40} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.7}>
          Φ = minimum energy to free an electron
        </text>
      )}
    </Figure>
  );
}

// --- Q68–72, Q93–95, Q97 ------------------------------------------------------

const SUBSHELL = ['s', 'p', 'd', 'f'];

export function ShellCounting({
  n,
  l,
  ml,
  highlight,
}: {
  n: number;
  l?: number;
  ml?: number;
  highlight: 'subshells' | 'orbitals' | 'electrons' | 'pairing' | 'ml';
}) {
  const t = useLoop(5200, useAnimate());
  const rows = l === undefined ? Array.from({ length: n }, (_, i) => i) : [l];
  const boxW = 18;
  const gap = 5;
  const rowY = (i: number) => 38 + i * (rows.length > 2 ? 30 : 40);
  const rowX = 70;
  // Everything the question counts is revealed in sequence, then held.
  const total = highlight === 'subshells' ? n
    : highlight === 'orbitals' || highlight === 'ml' ? orbitalCount(l ?? 0)
    : highlight === 'pairing' ? 3
    : l === undefined ? shellCapacity(n) : subshellCapacity(l);
  const step = Math.min(total, Math.floor(t * 1.4 * (total + 1)));
  const done = step >= total;
  let electronsSoFar = 0;
  const caption = highlight === 'subshells'
    ? `ℓ = 0 … n − 1 → ${n} subshells (${rows.map((r) => `${n}${SUBSHELL[r]}`).join(', ')})`
    : highlight === 'orbitals'
      ? `ℓ = ${l}: mℓ = −${l} … +${l} → ${orbitalCount(l ?? 0)} orbitals`
      : highlight === 'ml'
        ? `mℓ for ℓ = ${l}: ${Array.from({ length: orbitalCount(l ?? 0) }, (_, i) => i - (l ?? 0)).map((m) => (m > 0 ? `+${m}` : `${m}`)).join(', ')}`
        : highlight === 'pairing'
          ? `one orbital (n=${n}, ℓ=${l}, mℓ=${ml}) · ↑ then ↓ · a third electron is refused`
          : l === undefined
            ? `n = ${n}: ${shellOrbitals(n)} orbitals × 2 spins = ${shellCapacity(n)} electrons`
            : `ℓ = ${l}: ${orbitalCount(l)} orbitals × 2 spins = ${subshellCapacity(l)} electrons`;
  return (
    <Figure width={W} height={H} label={`Orbital boxes for the n = ${n} shell. ${caption}.`} caption={caption}>
      {rows.map((ll, ri) => {
        const count = orbitalCount(ll);
        const rowVisible = highlight !== 'subshells' || ri < step;
        return (
          <g key={ll} opacity={rowVisible ? 1 : 0.15}>
            <text x={rowX - 12} y={rowY(ri) + 13} textAnchor="end" fontSize={12} fill="currentColor" opacity={0.8} fontFamily={MONO}>
              {n}{SUBSHELL[ll]}
            </text>
            {Array.from({ length: count }, (_, bi) => {
              const m = bi - ll;
              const x = rowX + bi * (boxW + gap);
              const y = rowY(ri);
              const isTarget = highlight === 'pairing' && m === (ml ?? 0);
              const boxVisible = highlight === 'orbitals' || highlight === 'ml' ? bi < step : true;
              const ups = highlight === 'electrons' ? (electronsSoFar < step ? 1 : 0) : 0;
              if (highlight === 'electrons') electronsSoFar += 1;
              const downs = highlight === 'electrons' ? (electronsSoFar < step ? 1 : 0) : 0;
              if (highlight === 'electrons') electronsSoFar += 1;
              const pairUp = isTarget && step >= 1;
              const pairDown = isTarget && step >= 2;
              const refused = isTarget && step >= 3;
              return (
                <g key={bi} opacity={boxVisible ? 1 : 0.15}>
                  <rect x={x} y={y} width={boxW} height={18} rx={2} fill={isTarget ? 'var(--color-accent)' : 'currentColor'} opacity={isTarget ? 0.2 : 0.1} stroke="currentColor" strokeOpacity={0.35} />
                  {(ups > 0 || pairUp) && <text x={x + 5} y={y + 14} fontSize={12} fill="var(--color-accent)" fontWeight={700}>↑</text>}
                  {(downs > 0 || pairDown) && <text x={x + 10} y={y + 14} fontSize={12} fill="var(--color-accent)" fontWeight={700}>↓</text>}
                  {refused && <text x={x + boxW + 4} y={y + 14} fontSize={12} fill="var(--color-danger)" fontWeight={700}>✗</text>}
                  {(highlight === 'ml' || highlight === 'orbitals' || highlight === 'pairing') && (
                    <text x={x + boxW / 2} y={y + 30} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.65} fontFamily={MONO}>
                      {m > 0 ? `+${m}` : m}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      <text x={W - 16} y={H - 10} textAnchor="end" fontSize={14} fontWeight={700} fontFamily={MONO}
        fill={done ? 'var(--color-success)' : 'var(--color-accent)'}>
        {highlight === 'pairing' ? (done ? 'max 2' : `${Math.min(step, 2)} electron${step === 1 ? '' : 's'}`) : `${step} / ${total}`}
      </text>
    </Figure>
  );
}

// --- Q66, Q73, Q80, Q91 -------------------------------------------------------

export function AmplitudeSum({
  a = [Math.SQRT1_2, 0],
  b = [Math.SQRT1_2, 0],
  mode,
  labelA,
  labelB,
}: {
  a?: number[];
  b?: number[];
  mode: 'distinguishable' | 'indistinguishable' | 'sweep';
  labelA?: string;
  labelB?: string;
}) {
  const t = useLoop(4000, useAnimate());
  const phi = mode === 'sweep' ? t * 2 * Math.PI : 0;
  const A = { re: a[0], im: a[1] };
  const B = mode === 'sweep'
    ? { re: Math.SQRT1_2 * Math.cos(phi), im: Math.SQRT1_2 * Math.sin(phi) }
    : { re: b[0], im: b[1] };
  const { indistinguishable, distinguishable } = combineAmplitudes(A, B);
  const stage = mode === 'sweep' ? 2 : t < 0.35 ? 0 : t < 0.7 ? 1 : 2;
  const cx = 78;
  const cy = 92;
  const unit = 56;
  const fmt = (z: { re: number; im: number }) => {
    const parts: string[] = [];
    if (Math.abs(z.re) > 1e-9) parts.push(z.re.toFixed(2).replace(/\.?0+$/, ''));
    if (Math.abs(z.im) > 1e-9) parts.push(`${z.im < 0 ? '−' : parts.length ? '+' : ''}${Math.abs(z.im).toFixed(2).replace(/\.?0+$/, '')}i`);
    return parts.join(' ') || '0';
  };
  const arrow = (from: { re: number; im: number }, to: { re: number; im: number }, colour: string, opacity = 1) => (
    <line x1={cx + from.re * unit} y1={cy - from.im * unit} x2={cx + to.re * unit} y2={cy - to.im * unit}
      stroke={colour} strokeWidth={3} opacity={opacity} strokeLinecap="round" />
  );
  const sum = { re: A.re + B.re, im: A.im + B.im };
  const headline = mode === 'distinguishable'
    ? `|a|² + |b|² = ${distinguishable.toFixed(2)}`
    : mode === 'indistinguishable'
      ? `|a + b|² = ${indistinguishable.toFixed(2)}`
      : `superposition ${indistinguishable.toFixed(2)} · mixture ${distinguishable.toFixed(2)}`;
  const caption = mode === 'distinguishable'
    ? `distinguishable: square first, then add → ${distinguishable.toFixed(2)}`
    : mode === 'indistinguishable'
      ? `indistinguishable: add first, then square → ${indistinguishable.toFixed(2)}`
      : `relative phase ${((phi * 180) / Math.PI).toFixed(0)}° — the mixture never moves`;
  return (
    <Figure width={W} height={H} label={`Two amplitudes ${labelA ?? fmt(A)} and ${labelB ?? fmt(B)} on the complex plane. ${caption}.`} caption={caption}>
      <line x1={cx - 64} y1={cy} x2={cx + 64} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy - 64} x2={cx} y2={cy + 64} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      {arrow({ re: 0, im: 0 }, A, 'var(--color-accent)')}
      <text x={cx + A.re * unit + 6} y={cy - A.im * unit - 6} fontSize={10} fill="var(--color-accent)" fontFamily={MONO}>{labelA ?? fmt(A)}</text>
      {mode === 'distinguishable' ? arrow({ re: 0, im: 0 }, B, 'currentColor', 0.7) : arrow(A, sum, 'currentColor', stage >= 1 ? 0.8 : 0.2)}
      <text x={cx + (mode === 'distinguishable' ? B.re : sum.re) * unit + 6} y={cy - (mode === 'distinguishable' ? B.im : sum.im) * unit + 12}
        fontSize={10} fill="currentColor" opacity={0.8} fontFamily={MONO}>{labelB ?? fmt(B)}</text>
      {mode !== 'distinguishable' && stage >= 1 && (
        <circle cx={cx + sum.re * unit} cy={cy - sum.im * unit} r={5} fill={Math.hypot(sum.re, sum.im) < 1e-6 ? 'var(--color-danger)' : 'var(--color-success)'} />
      )}
      {/* probability bars */}
      {(mode === 'sweep' ? [
        { label: 'superposition |a+b|²', v: indistinguishable, colour: 'var(--color-accent)' },
        { label: 'mixture |a|²+|b|²', v: distinguishable, colour: 'currentColor' },
      ] : mode === 'distinguishable' ? [
        { label: '|a|²', v: A.re ** 2 + A.im ** 2, colour: 'var(--color-accent)' },
        { label: '|b|²', v: B.re ** 2 + B.im ** 2, colour: 'currentColor' },
        { label: 'sum', v: distinguishable, colour: 'var(--color-success)' },
      ] : [
        { label: '|a + b|²', v: indistinguishable, colour: indistinguishable < 1e-6 ? 'var(--color-danger)' : 'var(--color-success)' },
      ]).map((bar, i) => (
        <g key={bar.label} opacity={stage >= 2 || mode === 'sweep' ? 1 : 0.2}>
          <rect x={176} y={40 + i * 34} width={Math.max(1, bar.v * 110)} height={14} rx={2} fill={bar.colour} opacity={0.85} />
          <text x={176} y={36 + i * 34} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>{bar.label} = {bar.v.toFixed(2)}</text>
        </g>
      ))}
      <text x={176} y={H - 14} fontSize={12} fontWeight={700} fontFamily={MONO} fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.3}>
        {headline}
      </text>
    </Figure>
  );
}
