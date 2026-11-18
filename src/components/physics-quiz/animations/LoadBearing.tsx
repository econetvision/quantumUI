'use client';

import { useEffect, useState } from 'react';
import { Axes, Figure, polyline, useAnimate } from '../Figure';
import {
  bohrLevel,
  interfere,
  planckRadiance,
  transitionEnergy,
  wienPeak,
} from '@/lib/physics';

/**
 * The five figures a question cannot be answered without.
 *
 * Q28, Q29, Q36, Q39 and Q44 all say "shown" or "displayed" — the paper
 * assumes a diagram that the text alone does not contain. For these the figure
 * is the question, so each is drawn from the real function rather than sketched
 * to look right: a reader who measures the blackbody curve and a reader who
 * trusts the caption have to reach the same answer.
 */

/** A slow loop driving the reveal animations. Returns 0→1, or 1 at once. */
function useProgress(durationMs: number, enabled: boolean): number {
  const [raw, setRaw] = useState(0);
  // Derived rather than written: setting state synchronously inside the effect
  // for the reduced-motion case triggers a cascading render, and the value is
  // a pure function of `enabled` anyway.
  const t = enabled ? raw : 1;
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setRaw(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, enabled]);
  return t;
}

// ---------------------------------------------------------------------------
// Q28 — two curves a phase difference apart
// ---------------------------------------------------------------------------

export function PhaseDifference() {
  const animate = useAnimate();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    const tick = () => {
      setT((prev) => prev + 0.02);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const W = 320;
  const H = 180;
  const mid = H / 2;
  const amp = 46;
  // The curves travel; the phase difference between them never changes, which
  // is what makes the answer readable at any instant rather than only at one.
  const pts = (phase: number) =>
    Array.from({ length: 140 }, (_, i) => {
      const u = i / 139;
      return { x: 20 + u * (W - 40), y: mid - amp * Math.sin(u * 4 * Math.PI + phase + t) };
    });

  return (
    <Figure
      width={W}
      height={H}
      label="Two sine curves of equal amplitude and frequency; wherever one is at a crest the other is at a trough."
      caption="Every crest on one curve sits above a trough on the other"
    >
      <Axes x0={20} y0={mid} x1={W - 20} y1={mid} />
      <path d={polyline(pts(0))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <path
        d={polyline(pts(Math.PI))}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        opacity={0.55}
        strokeDasharray="5 3"
      />
      {/* Markers at one crest/trough pair, so the relationship is pointed at. */}
      {[0.19].map((u) => {
        const x = 20 + u * (W - 40);
        const y1 = mid - amp * Math.sin(u * 4 * Math.PI + t);
        const y2 = mid - amp * Math.sin(u * 4 * Math.PI + Math.PI + t);
        return (
          <g key={u}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeWidth={1} opacity={0.4} strokeDasharray="2 2" />
            <circle cx={x} cy={y1} r={3.5} fill="var(--color-accent)" />
            <circle cx={x} cy={y2} r={3.5} fill="currentColor" opacity={0.6} />
          </g>
        );
      })}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q29 — the probability distribution being read off
// ---------------------------------------------------------------------------

const DISTRIBUTION = [
  { outcome: 1, p: 0.15 },
  { outcome: 2, p: 0.25 },
  { outcome: 3, p: 0.40 },
  { outcome: 4, p: 0.20 },
];

export function ProbabilityBars({ highlightMax = false }: { highlightMax?: boolean }) {
  const animate = useAnimate();
  const t = useProgress(700, animate);

  const W = 320;
  const H = 180;
  const base = H - 32;
  const maxP = Math.max(...DISTRIBUTION.map((d) => d.p));

  return (
    <Figure
      width={W}
      height={H}
      label={`Bar chart of four outcomes with probabilities ${DISTRIBUTION.map((d) => `${d.outcome}: ${d.p}`).join(', ')}. Outcome 3 is tallest.`}
      caption="Probabilities sum to 1.00"
    >
      <Axes x0={28} y0={base} x1={W - 16} y1={20} yLabel="P" />
      {DISTRIBUTION.map((d, i) => {
        const w = 44;
        const x = 48 + i * 62;
        const full = (d.p / maxP) * (base - 34);
        const h = full * t;
        const isMax = d.p === maxP;
        return (
          <g key={d.outcome}>
            <rect
              x={x}
              y={base - h}
              width={w}
              height={h}
              rx={3}
              fill={highlightMax && isMax ? 'var(--color-accent)' : 'currentColor'}
              opacity={highlightMax && isMax ? 1 : 0.45}
            />
            <text x={x + w / 2} y={base + 14} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              {d.outcome}
            </text>
            <text
              x={x + w / 2}
              y={base - h - 6}
              textAnchor="middle"
              fontSize={11}
              fontWeight={isMax ? 700 : 400}
              fill="currentColor"
              opacity={t > 0.9 ? 0.9 : 0}
            >
              {d.p.toFixed(2)}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Q36 — two blackbody curves, plotted from Planck's law
// ---------------------------------------------------------------------------

export function BlackbodyCurves({ markPeaks = false }: { markPeaks?: boolean }) {
  const animate = useAnimate();
  const t = useProgress(900, animate);

  const W = 320;
  const H = 180;
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

  const peakX = (temp: number) => 28 + (wienPeak(temp) / LAMBDA_MAX) * (W - 48);

  return (
    <Figure
      width={W}
      height={H}
      label="Two blackbody spectra. The hotter curve lies above the cooler one at every wavelength and peaks at a shorter wavelength."
      caption={`${COOL} K and ${HOT} K, from Planck's law`}
    >
      <Axes x0={28} y0={base} x1={W - 16} y1={20} xLabel="λ" yLabel="intensity" />
      <path d={toPath(cool, t)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.5} />
      <path d={toPath(hot, t)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      {markPeaks && t > 0.95 && (
        <g>
          {[
            { temp: COOL, colour: 'currentColor', op: 0.5 },
            { temp: HOT, colour: 'var(--color-accent)', op: 1 },
          ].map(({ temp, colour, op }) => (
            <line
              key={temp}
              x1={peakX(temp)}
              y1={base}
              x2={peakX(temp)}
              y2={26}
              stroke={colour}
              opacity={op * 0.6}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
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
// Q39 — photocurrent against voltage at two intensities
// ---------------------------------------------------------------------------

export function PhotocurrentIntensity({ annotate = false }: { annotate?: boolean }) {
  const animate = useAnimate();
  const t = useProgress(800, animate);

  const W = 320;
  const H = 180;
  const base = H - 30;
  const zeroX = 96; // where V = 0 sits
  const stopX = 52; // common stopping potential

  // Saturation current differs; the stopping potential does not. That pairing
  // is the whole question, so both curves are generated from one shape with
  // only the plateau scaled.
  const curve = (saturation: number) =>
    Array.from({ length: 100 }, (_, i) => {
      const x = stopX + (i / 99) * (W - 24 - stopX);
      const rise = Math.min(1, Math.max(0, (x - stopX) / (zeroX - stopX + 34)));
      return { x, y: base - saturation * rise * (base - 34) };
    });

  const reveal = (pts: { x: number; y: number }[]) =>
    polyline(pts.slice(0, Math.max(2, Math.floor(pts.length * t))));

  return (
    <Figure
      width={W}
      height={H}
      label="Two photocurrent against voltage curves. Both reach zero current at the same stopping potential, but curve B saturates at a higher current."
      caption="Same stopping potential, different saturation current"
    >
      <Axes x0={zeroX} y0={base} x1={W - 16} y1={20} xLabel="V" yLabel="current" />
      <line x1={stopX} y1={base} x2={W - 16} y2={base} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <path d={reveal(curve(0.55))} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.55} />
      <path d={reveal(curve(0.95))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <text x={W - 20} y={base - 0.95 * (base - 34) - 6} textAnchor="end" fontSize={10} fill="var(--color-accent)">
        B
      </text>
      <text x={W - 20} y={base - 0.55 * (base - 34) - 6} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
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
// Q44 — hydrogen energy levels and the transition
// ---------------------------------------------------------------------------

export function EnergyLevels({ showPhoton = false }: { showPhoton?: boolean }) {
  const animate = useAnimate();
  const [rawPhase, setRawPhase] = useState(0);
  const running = showPhoton && animate;
  const phase = running ? rawPhase : 1;

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setRawPhase(((now - start) / 1800) % 1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const W = 320;
  const H = 180;
  const levels = [1, 2, 3, 4];
  // −13.6 eV at the bottom, 0 eV at the top: the real scale, so the n = 3 to
  // n = 1 gap genuinely looks like most of the ladder.
  const yFor = (n: number) => 28 + ((0 - bohrLevel(n)) / 13.6) * (H - 62);

  const yTop = yFor(3);
  const yBottom = yFor(1);
  const dropY = yTop + (yBottom - yTop) * phase;

  return (
    <Figure
      width={W}
      height={H}
      label="Hydrogen energy level diagram. An electron drops from the −1.51 eV level to the −13.6 eV level, emitting a photon of 12.09 electronvolts."
      caption={`n = 3 → n = 1 emits ${transitionEnergy(3, 1).toFixed(2)} eV`}
    >
      {levels.map((n) => (
        <g key={n}>
          <line
            x1={70}
            y1={yFor(n)}
            x2={W - 70}
            y2={yFor(n)}
            stroke="currentColor"
            strokeWidth={n === 1 || n === 3 ? 2 : 1}
            opacity={n === 1 || n === 3 ? 0.8 : 0.3}
          />
          <text x={60} y={yFor(n) + 3.5} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.75}>
            n={n}
          </text>
          <text x={W - 62} y={yFor(n) + 3.5} fontSize={10} fill="currentColor" opacity={0.6}>
            {bohrLevel(n).toFixed(2)} eV
          </text>
        </g>
      ))}
      <line
        x1={W / 2}
        y1={yTop}
        x2={W / 2}
        y2={yBottom}
        stroke="var(--color-accent)"
        strokeWidth={1.5}
        opacity={0.35}
        strokeDasharray="3 3"
      />
      <circle cx={W / 2} cy={dropY} r={5} fill="var(--color-accent)" />
      {showPhoton && phase > 0.92 && (
        <text x={W / 2 + 12} y={yBottom - 8} fontSize={10} fill="var(--color-accent)" fontWeight={700}>
          γ = 12.09 eV
        </text>
      )}
    </Figure>
  );
}

// ---------------------------------------------------------------------------
// Shared by Q35 — used by the walkthrough for the cancellation question
// ---------------------------------------------------------------------------

export function WaveCancellation({ phase = Math.PI }: { phase?: number }) {
  const animate = useAnimate();
  const [sweep, setSweep] = useState(phase);
  // Sweeps the phase difference so a learner sees cancellation arrive at π
  // rather than being told it happens there. With motion off it holds at the
  // phase the question is about, which is the frame that carries the answer.
  const phi = animate ? sweep : phase;

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const u = (((now - start) / 3600) % 1) * 2 * Math.PI;
      setSweep(u);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, phase]);

  const W = 320;
  const H = 180;
  const mid = 64;
  const sumMid = 140;
  const pts = interfere(phi);
  const toXY = (v: number, i: number, centre: number, scale: number) => ({
    x: 20 + (i / (pts.length - 1)) * (W - 40),
    y: centre - v * scale,
  });

  const cancelled = Math.max(...pts.map((p) => Math.abs(p.sum))) < 0.02;

  return (
    <Figure
      width={W}
      height={H}
      label="Two waves and their sum. As the phase difference reaches 180 degrees the sum flattens to zero."
      caption={`phase difference ${((phi * 180) / Math.PI).toFixed(0)}° — sum ${cancelled ? 'cancels' : 'survives'}`}
    >
      <path d={polyline(pts.map((p, i) => toXY(p.a, i, mid, 22)))} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      <path
        d={polyline(pts.map((p, i) => toXY(p.b, i, mid, 22)))}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        opacity={0.5}
        strokeDasharray="4 3"
      />
      <line x1={20} y1={sumMid} x2={W - 20} y2={sumMid} stroke="currentColor" strokeWidth={1} opacity={0.25} />
      <path
        d={polyline(pts.map((p, i) => toXY(p.sum, i, sumMid, 22)))}
        fill="none"
        stroke={cancelled ? 'var(--color-success)' : 'currentColor'}
        strokeWidth={2.5}
        opacity={cancelled ? 1 : 0.8}
      />
      <text x={20} y={22} fontSize={10} fill="currentColor" opacity={0.6}>
        two waves
      </text>
      <text x={20} y={sumMid - 30} fontSize={10} fill="currentColor" opacity={0.6}>
        their sum
      </text>
    </Figure>
  );
}
