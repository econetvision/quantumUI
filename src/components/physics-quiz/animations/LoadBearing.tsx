'use client';

import { Axes, Figure, polyline, useAnimate, useLoop, useProgress } from '../Figure';
import {
  BOLTZMANN,
  LIGHT_SPEED,
  bohrLevel,
  interfere,
  planckRadiance,
  wavelengthNmFromEv,
  wienPeak,
} from '@/lib/physics';

/**
 * The figures a question cannot be answered without.
 *
 * Q28, Q29, Q36, Q39 and Q44 all say "shown" or "displayed" — the paper
 * assumes a diagram that the text alone does not contain. For these the figure
 * is the question, so each is drawn from the real function rather than sketched
 * to look right: a reader who measures the blackbody curve and a reader who
 * trusts the caption have to reach the same answer. The same figures serve
 * Levels 1, 3 and 4 with different inputs (a 90° phase, a cascade through an
 * intermediate level), passed in as props.
 */

const W = 320;
const H = 180;

// ---------------------------------------------------------------------------
// Q28, Q77 — two curves a phase difference apart
// ---------------------------------------------------------------------------

export function PhaseDifference({ deg = 180 }: { deg?: number }) {
  const t = useLoop(4000, useAnimate()) * 2 * Math.PI;
  const phase = (deg * Math.PI) / 180;
  const mid = H / 2;
  const amp = 46;
  // The curves travel; the phase difference between them never changes, which
  // is what makes the answer readable at any instant rather than only at one.
  const pts = (shift: number) =>
    Array.from({ length: 140 }, (_, i) => {
      const u = i / 139;
      return { x: 20 + u * (W - 40), y: mid - amp * Math.sin(u * 4 * Math.PI + shift + t) };
    });
  // Mark the point where curve 1 is at a crest and read curve 2 there.
  const uCrest = ((Math.PI / 2 - t) / (4 * Math.PI) + 10) % 0.5;
  const xc = 20 + uCrest * (W - 40);
  const y1 = mid - amp * Math.sin(uCrest * 4 * Math.PI + t);
  const v2 = Math.sin(uCrest * 4 * Math.PI + phase + t);
  const y2 = mid - amp * v2;
  const relation = deg === 180 ? 'at a trough' : Math.abs(v2) < 0.05 ? 'at zero' : `at ${v2.toFixed(2)} of its amplitude`;
  return (
    <Figure
      width={W}
      height={H}
      label={`Two sine curves of equal amplitude and frequency, ${deg} degrees apart; wherever one is at a crest the other is ${relation}.`}
      caption={`where x₁ is at a crest, x₂ is ${relation}`}
    >
      <Axes x0={20} y0={mid} x1={W - 20} y1={mid} />
      <path d={polyline(pts(0))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <path d={polyline(pts(phase))} fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.55} strokeDasharray="5 3" />
      <line x1={xc} y1={y1} x2={xc} y2={y2} stroke="currentColor" strokeWidth={1} opacity={0.4} strokeDasharray="2 2" />
      <circle cx={xc} cy={y1} r={3.5} fill="var(--color-accent)" />
      <circle cx={xc} cy={y2} r={3.5} fill="currentColor" opacity={0.6} />
      <text x={W - 24} y={22} textAnchor="end" fontSize={10} fill="var(--color-accent)">x₁</text>
      <text x={W - 24} y={34} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>x₂</text>
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q5, Q29 — a probability distribution being read off, or summed
// ---------------------------------------------------------------------------

const PAPER_DISTRIBUTION = [0.1, 0.25, 0.4, 0.25];

export function ProbabilityBars({
  values = PAPER_DISTRIBUTION,
  highlightMax = false,
  stack = false,
}: {
  values?: number[];
  highlightMax?: boolean;
  /** Reveal the bars one at a time with a running total — the sum is the question. */
  stack?: boolean;
}) {
  const animate = useAnimate();
  // Both hooks run every render (rules of hooks); only one is switched on.
  const loop = useLoop(4200, animate && stack);
  const grow = useProgress(700, animate && !stack);
  const t = stack ? loop : grow;
  const base = H - 32;
  const maxP = Math.max(...values);
  const shown = stack ? Math.min(values.length, Math.floor(t * 1.4 * (values.length + 1))) : values.length;
  const running = values.slice(0, shown).reduce((s, p) => s + p, 0);
  const complete = shown === values.length;
  return (
    <Figure
      width={W}
      height={H}
      label={`Bar chart of ${values.length} outcomes with probabilities ${values.map((p, i) => `${i + 1}: ${p}`).join(', ')}.${stack ? ` They sum to ${values.reduce((s, p) => s + p, 0).toFixed(2)}.` : ' Outcome 3 is tallest.'}`}
      caption={stack ? `${values.slice(0, shown).map((p) => p.toFixed(2)).join(' + ') || '…'}${complete ? ` = ${running.toFixed(2)}` : ''}` : `Probabilities sum to ${values.reduce((s, p) => s + p, 0).toFixed(2)}`}
    >
      <Axes x0={28} y0={base} x1={W - 16} y1={20} yLabel="P" />
      {values.map((p, i) => {
        const w = 44;
        const x = 48 + i * 62;
        const full = (p / maxP) * (base - 34);
        const h = stack ? (i < shown ? full : 0) : full * t;
        const isMax = p === maxP;
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h} rx={3}
              fill={highlightMax && isMax ? 'var(--color-accent)' : 'currentColor'}
              opacity={highlightMax && isMax ? 1 : 0.45} />
            <text x={x + w / 2} y={base + 14} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              {i + 1}
            </text>
            <text x={x + w / 2} y={base - h - 6} textAnchor="middle" fontSize={11} fontWeight={isMax && highlightMax ? 700 : 400}
              fill="currentColor" opacity={(stack ? i < shown : t > 0.9) ? 0.9 : 0}>
              {p.toFixed(2)}
            </text>
          </g>
        );
      })}
      {stack && (
        <text x={W - 20} y={36} textAnchor="end" fontSize={14} fontWeight={700} fontFamily="monospace"
          fill={complete ? 'var(--color-success)' : 'var(--color-accent)'}>
          Σ = {running.toFixed(2)}
        </text>
      )}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q14, Q36, Q82, Q100 — two blackbody curves, plotted from Planck's law
// ---------------------------------------------------------------------------

export function BlackbodyCurves({ markPeaks = false, classical = false }: { markPeaks?: boolean; classical?: boolean }) {
  const animate = useAnimate();
  const t = useProgress(900, animate);
  const base = H - 26;
  const COOL = 3200;
  const HOT = 4600;
  const LAMBDA_MAX = 2.2e-6;

  const sample = (temp: number) =>
    Array.from({ length: 120 }, (_, i) => {
      const u = (i + 1) / 120;
      const lambda = u * LAMBDA_MAX;
      return { lambda, r: planckRadiance(lambda, temp) };
    });

  const cool = sample(COOL);
  const hot = sample(HOT);
  // Both curves share one scale, or "higher everywhere" would be a drawing
  // choice rather than something the figure shows.
  const peak = Math.max(...hot.map((p) => p.r));

  const toPath = (pts: { lambda: number; r: number }[], reveal: number) =>
    polyline(
      pts.slice(0, Math.max(2, Math.floor(pts.length * reveal))).map((p) => ({
        x: 28 + (p.lambda / LAMBDA_MAX) * (W - 48),
        y: base - (p.r / peak) * (base - 24),
      })),
    );

  // Rayleigh–Jeans: 2ckT/λ⁴. Classical equipartition, which climbs without
  // limit toward short wavelengths — the ultraviolet catastrophe. Clipped at
  // the top of the frame because that is the point.
  const rj = Array.from({ length: 120 }, (_, i) => {
    const lambda = ((i + 1) / 120) * LAMBDA_MAX;
    const r = (2 * LIGHT_SPEED * BOLTZMANN * HOT) / lambda ** 4;
    return { x: 28 + (lambda / LAMBDA_MAX) * (W - 48), y: Math.max(22, base - (r / peak) * (base - 24)) };
  });

  const peakX = (temp: number) => 28 + (wienPeak(temp) / LAMBDA_MAX) * (W - 48);

  return (
    <Figure
      width={W}
      height={H}
      label={`Two blackbody spectra. The hotter curve lies above the cooler one at every wavelength and peaks at a shorter wavelength.${classical ? ' The classical prediction, shown dashed, rises without limit at short wavelengths.' : ''}`}
      caption={classical ? 'dashed: classical equipartition → infinite energy at short λ' : `${COOL} K and ${HOT} K, from Planck's law`}
    >
      <Axes x0={28} y0={base} x1={W - 16} y1={20} xLabel="λ" yLabel="intensity" />
      <path d={toPath(cool, t)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.5} />
      <path d={toPath(hot, t)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      {classical && t > 0.6 && (
        <g>
          <path d={polyline(rj.slice(0, Math.floor(rj.length * Math.min(1, (t - 0.6) / 0.4))))} fill="none" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 4" opacity={0.8} />
          <text x={70} y={34} fontSize={9} fill="var(--color-danger)" fontWeight={700}>classical: → ∞</text>
          <text x={70} y={46} fontSize={9} fill="var(--color-danger)" opacity={0.8}>ultraviolet catastrophe</text>
        </g>
      )}
      {markPeaks && t > 0.95 && (
        <g>
          {[
            { temp: COOL, colour: 'currentColor', op: 0.5 },
            { temp: HOT, colour: 'var(--color-accent)', op: 1 },
          ].map(({ temp, colour, op }) => (
            <line key={temp} x1={peakX(temp)} y1={base} x2={peakX(temp)} y2={26} stroke={colour} opacity={op * 0.6} strokeWidth={1} strokeDasharray="3 3" />
          ))}
          <text x={peakX(HOT)} y={18} textAnchor="middle" fontSize={9} fill="var(--color-accent)">
            peak moves left
          </text>
        </g>
      )}
      <text x={W - 20} y={44} textAnchor="end" fontSize={10} fill="var(--color-accent)">
        {HOT} K
      </text>
      <text x={W - 20} y={58} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.55}>
        {COOL} K
      </text>
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q17, Q39, Q60 — photocurrent against voltage at two intensities
// ---------------------------------------------------------------------------

export function PhotocurrentIntensity({ annotate = false, ratio = 1.7 }: { annotate?: boolean; ratio?: number }) {
  const animate = useAnimate();
  const t = useProgress(800, animate);
  const base = H - 30;
  const zeroX = 96; // where V = 0 sits
  const stopX = 52; // common stopping potential

  // Saturation current differs; the stopping potential does not. That pairing
  // is the whole question, so both curves are generated from one shape with
  // only the plateau scaled — by exactly the intensity ratio.
  const satB = 0.95;
  const satA = satB / ratio;
  const curve = (saturation: number) =>
    Array.from({ length: 100 }, (_, i) => {
      const x = stopX + (i / 99) * (W - 24 - stopX);
      const rise = Math.min(1, Math.max(0, (x - stopX) / (zeroX - stopX + 34)));
      return { x, y: base - saturation * rise * (base - 34) };
    });

  const reveal = (pts: { x: number; y: number }[]) =>
    polyline(pts.slice(0, Math.max(2, Math.floor(pts.length * t))));
  const ratioLabel = Number.isInteger(ratio) ? `${ratio}×` : `${ratio.toFixed(1)}×`;

  return (
    <Figure
      width={W}
      height={H}
      label={`Two photocurrent against voltage curves. Both reach zero current at the same stopping potential, but curve B, at ${ratioLabel} the intensity, saturates at ${ratioLabel} the current.`}
      caption={`same stopping potential · saturation current ×${Number.isInteger(ratio) ? ratio : ratio.toFixed(1)} for ×${Number.isInteger(ratio) ? ratio : ratio.toFixed(1)} intensity`}
    >
      <Axes x0={zeroX} y0={base} x1={W - 16} y1={20} xLabel="V" yLabel="current" />
      <line x1={stopX} y1={base} x2={W - 16} y2={base} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <path d={reveal(curve(satA))} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.55} />
      <path d={reveal(curve(satB))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <text x={W - 20} y={base - satB * (base - 34) - 6} textAnchor="end" fontSize={10} fill="var(--color-accent)">
        B ({ratioLabel} intensity)
      </text>
      <text x={W - 20} y={base - satA * (base - 34) - 6} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
        A
      </text>
      {annotate && t > 0.95 && (
        <g>
          <circle cx={stopX} cy={base} r={4} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} />
          <text x={stopX + 2} y={base + 16} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.75}>
            shared V₀
          </text>
        </g>
      )}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q19, Q20, Q44, Q63, Q88 — energy levels and the transitions between them
// ---------------------------------------------------------------------------

const HYDROGEN = [1, 2, 3, 4].map((n) => bohrLevel(n)); // index i ↔ n = i + 1

export function EnergyLevels({
  showPhoton = false,
  from = 3,
  to = 1,
  levels,
  path,
  spectrum = false,
  wavelength = false,
}: {
  showPhoton?: boolean;
  /** Hydrogen n of the upper and lower level (ignored when `levels` is given). */
  from?: number;
  to?: number;
  /** Arbitrary level energies in eV, lowest first — Q88's −13.6, −5.0, −3.4. */
  levels?: number[];
  /** Indices into `levels` the electron visits in order. */
  path?: number[];
  /** Draw the line spectrum the allowed gaps produce. */
  spectrum?: boolean;
  /** Also quote the emitted wavelength. */
  wavelength?: boolean;
}) {
  const animate = useAnimate();
  const energies = levels ?? HYDROGEN;
  const route = path ?? [from - 1, to - 1];
  const running = showPhoton && animate;
  const raw = useLoop(1800 * (route.length - 1), running);
  const phase = running ? raw : 1;

  const floor = Math.min(...energies);
  // Real scale: −13.6 eV at the bottom, 0 eV at the top, so the n = 3 to n = 1
  // gap genuinely looks like most of the ladder.
  const yFor = (ev: number) => 28 + ((0 - ev) / -floor) * (H - (spectrum ? 92 : 62));
  const segments = route.slice(1).map((idx, i) => ({ fromEv: energies[route[i]], toEv: energies[idx] }));
  const gaps = segments.map((s) => s.fromEv - s.toEv);
  // Which segment the dot is on, and how far along it.
  const seg = Math.min(segments.length - 1, Math.floor(phase * segments.length));
  const within = phase >= 1 ? 1 : phase * segments.length - seg;
  const dotY = yFor(segments[seg].fromEv) + (yFor(segments[seg].toEv) - yFor(segments[seg].fromEv)) * within;
  const label = (ev: number) => `${ev.toFixed(ev === Math.round(ev * 10) / 10 ? 1 : 2)} eV`;
  const total = gaps.reduce((s, g) => s + g, 0);
  const caption = spectrum
    ? 'each spectral line is one allowed energy gap'
    : segments.length > 1
      ? `two steps: ${gaps.map((g) => `${g.toFixed(1)} eV`).join(' then ')} (total ${total.toFixed(1)} eV)`
      : `${levels ? '' : `n = ${from} → n = ${to} `}emits ${gaps[0].toFixed(2)} eV${wavelength ? ` → λ = 1240/${gaps[0].toFixed(1)} ≈ ${Math.round(wavelengthNmFromEv(gaps[0]))} nm` : ''}`;
  // Spectrum strip: lines for every downward transition among the levels,
  // placed by wavelength so the pattern is the one a spectrometer shows.
  const lines = spectrum
    ? energies.flatMap((hi, i) => energies.slice(0, i).map((lo) => wavelengthNmFromEv(hi - lo)))
    : [];
  const lMin = 80;
  const lMax = 700;
  const xForNm = (nm: number) => 40 + ((Math.log(nm) - Math.log(lMin)) / (Math.log(lMax) - Math.log(lMin))) * (W - 80);
  return (
    <Figure
      width={W}
      height={H}
      label={`Energy level diagram. ${caption}.`}
      caption={caption}
    >
      {energies.map((ev, i) => {
        const onRoute = route.includes(i);
        return (
          <g key={i}>
            <line x1={70} y1={yFor(ev)} x2={W - 70} y2={yFor(ev)} stroke="currentColor"
              strokeWidth={onRoute ? 2 : 1} opacity={onRoute ? 0.8 : 0.3} />
            {!levels && (
              <text x={60} y={yFor(ev) + 3.5} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.75}>n={i + 1}</text>
            )}
            <text x={W - 62} y={yFor(ev) + 3.5} fontSize={10} fill="currentColor" opacity={0.6}>{label(ev)}</text>
          </g>
        );
      })}
      {segments.map((s, i) => (
        <line key={i} x1={W / 2} y1={yFor(s.fromEv)} x2={W / 2} y2={yFor(s.toEv)} stroke="var(--color-accent)" strokeWidth={1.5} opacity={0.35} strokeDasharray="3 3" />
      ))}
      <circle cx={W / 2} cy={dotY} r={5} fill="var(--color-accent)" />
      {showPhoton && segments.map((s, i) => (
        (phase >= 1 || seg > i || (seg === i && within > 0.92)) && (
          <text key={i} x={W / 2 + 12} y={(yFor(s.fromEv) + yFor(s.toEv)) / 2 + 4} fontSize={10} fill="var(--color-accent)" fontWeight={700}>
            γ = {gaps[i].toFixed(gaps[i] === Math.round(gaps[i] * 10) / 10 ? 1 : 2)} eV
          </text>
        )
      ))}
      {spectrum && (
        <g>
          <rect x={40} y={H - 46} width={W - 80} height={18} fill="currentColor" opacity={0.08} />
          {lines.filter((nm) => nm > lMin && nm < lMax).map((nm, i) => (
            <line key={i} x1={xForNm(nm)} y1={H - 46} x2={xForNm(nm)} y2={H - 28} stroke="var(--color-accent)" strokeWidth={2} opacity={0.3 + 0.7 * Math.min(1, phase * 1.2)} />
          ))}
          <text x={40} y={H - 14} fontSize={9} fill="currentColor" opacity={0.6}>{lMin} nm</text>
          <text x={W - 40} y={H - 14} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>{lMax} nm — discrete lines, nothing between</text>
        </g>
      )}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q4, Q11, Q12, Q35 — two waves and their sum
// ---------------------------------------------------------------------------

export function WaveCancellation({ holdDeg }: { holdDeg?: number }) {
  const animate = useAnimate();
  const sweep = useLoop(3600, animate && holdDeg === undefined) * 2 * Math.PI;
  // Sweeps the phase difference so a learner sees cancellation arrive at π
  // rather than being told it happens there. With a hold (or motion off) it
  // sits at the phase the question is about, which is the frame that carries
  // the answer.
  const phi = holdDeg !== undefined ? (holdDeg * Math.PI) / 180 : animate ? sweep : Math.PI;
  const mid = 64;
  const sumMid = 140;
  const pts = interfere(phi);
  const toXY = (v: number, i: number, centre: number, scale: number) => ({
    x: 20 + (i / (pts.length - 1)) * (W - 40),
    y: centre - v * scale,
  });
  const peak = Math.max(...pts.map((p) => Math.abs(p.sum)));
  const cancelled = peak < 0.02;
  const doubled = peak > 1.98;
  const verdict = cancelled ? 'cancels to zero' : doubled ? 'doubles' : `peaks at ${peak.toFixed(2)}`;
  return (
    <Figure
      width={W}
      height={H}
      label={`Two waves and their sum at a phase difference of ${((phi * 180) / Math.PI).toFixed(0)} degrees. The sum ${verdict}.`}
      caption={`phase difference ${((phi * 180) / Math.PI).toFixed(0)}° — sum ${verdict}`}
    >
      <path d={polyline(pts.map((p, i) => toXY(p.a, i, mid, 22)))} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      <path d={polyline(pts.map((p, i) => toXY(p.b, i, mid, 22)))} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.5} strokeDasharray="4 3" />
      <line x1={20} y1={sumMid} x2={W - 20} y2={sumMid} stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <path d={polyline(pts.map((p, i) => toXY(p.sum, i, sumMid, 22)))} fill="none"
        stroke={cancelled || doubled ? 'var(--color-success)' : 'currentColor'} strokeWidth={2.5} opacity={cancelled || doubled ? 1 : 0.8} />
      <text x={20} y={22} fontSize={10} fill="currentColor" opacity={0.6}>two waves</text>
      <text x={20} y={sumMid - 30} fontSize={10} fill="currentColor" opacity={0.6}>their sum (algebraic, point by point)</text>
    </Figure>
  );
}
