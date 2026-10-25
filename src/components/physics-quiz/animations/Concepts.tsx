'use client';

import { useEffect, useState } from 'react';
import { Axes, Figure, polyline, useAnimate } from '../Figure';
import {
  apply2x2,
  checkQuantumNumbers,
  deBroglieWavelength,
  maxKineticEnergy,
  photonEnergy,
  photonMomentum,
  PLANCK,
  sci,
  shm,
} from '@/lib/physics';

/**
 * The remaining nineteen figures.
 *
 * Each one computes the quantity the question asks about rather than drawing a
 * picture of it. Where a figure shows a number — Kmax, a momentum, a level gap
 * — that number comes from src/lib/physics.ts, the same module the answer-key
 * test checks, so a figure cannot drift away from the answer it illustrates.
 */

/** Loops 0→1 forever. Returns 1 when motion is off. */
function useLoop(periodMs: number, enabled: boolean): number {
  const [raw, setRaw] = useState(0);
  const t = enabled ? raw : 1;
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setRaw((((now - start) % periodMs) / periodMs));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [periodMs, enabled]);
  return t;
}

const W = 320;
const H = 180;

// --- Q26 -------------------------------------------------------------------

export function ExponentDivision() {
  const t = useLoop(3200, useAnimate());
  const stage = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
  return (
    <Figure width={W} height={H} label="Dividing 6 times ten to the eight by 3 times ten squared: coefficients divide, exponents subtract."
      caption="coefficients divide · exponents subtract">
      <text x={W / 2} y={52} textAnchor="middle" fontSize={20} fill="currentColor" fontFamily="monospace">
        (6 × 10⁸) ÷ (3 × 10²)
      </text>
      <text x={W / 2} y={92} textAnchor="middle" fontSize={14} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily="monospace">
        6 ÷ 3 = 2
      </text>
      <text x={W / 2} y={116} textAnchor="middle" fontSize={14} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily="monospace">
        8 − 2 = 6
      </text>
      <text x={W / 2} y={150} textAnchor="middle" fontSize={20} fontWeight={700} fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.2} fontFamily="monospace">
        2 × 10⁶
      </text>
    </Figure>
  );
}

// --- Q27 -------------------------------------------------------------------

export function InverseProportion() {
  const t = useLoop(2600, useAnimate());
  // λ sweeps 1 → 0.5; the quantity is 1/λ, so it must double.
  const lambda = 1 - 0.5 * Math.min(1, t * 2);
  const q = 1 / lambda;
  const pts = Array.from({ length: 80 }, (_, i) => {
    const l = 0.35 + (i / 79) * 0.9;
    return { x: 36 + ((l - 0.35) / 0.9) * (W - 60), y: H - 34 - ((1 / l) / 3) * (H - 60) };
  });
  const cx = 36 + ((lambda - 0.35) / 0.9) * (W - 60);
  const cy = H - 34 - (q / 3) * (H - 60);
  return (
    <Figure width={W} height={H} label="A hyperbola. As wavelength halves the quantity doubles."
      caption={`λ = ${lambda.toFixed(2)} → quantity = ${q.toFixed(2)}`}>
      <Axes x0={36} y0={H - 34} x1={W - 16} y1={20} xLabel="λ" yLabel="quantity" />
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      <line x1={cx} y1={H - 34} x2={cx} y2={cy} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <circle cx={cx} cy={cy} r={5} fill="var(--color-accent)" />
      <text x={W - 20} y={32} textAnchor="end" fontSize={11} fill="var(--color-accent)" fontFamily="monospace">
        q × λ = {(q * lambda).toFixed(2)}
      </text>
    </Figure>
  );
}

// --- Q30 -------------------------------------------------------------------

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

// --- Q31 -------------------------------------------------------------------

export function MatrixSwap() {
  const t = useLoop(2800, useAnimate());
  const flip = t > 0.5;
  const v: [number, number] = flip ? apply2x2([0, 1, 1, 0], [1, 0]) : [1, 0];
  return (
    <Figure width={W} height={H} label="The matrix with zeros on the diagonal and ones off it swaps the components of a vector. It is the Pauli-X gate."
      caption="[[0,1],[1,0]] swaps the components — this is Pauli-X">
      <text x={54} y={56} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6} fontFamily="monospace">0 1</text>
      <text x={54} y={76} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6} fontFamily="monospace">1 0</text>
      <rect x={28} y={38} width={52} height={54} rx={4} fill="none" stroke="currentColor" opacity={0.35} />
      <text x={100} y={70} fontSize={16} fill="currentColor" opacity={0.5}>×</text>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={126} y={38 + i * 27} width={34} height={25} rx={3} fill="currentColor" opacity={0.12} />
          <text x={143} y={55 + i * 27} textAnchor="middle" fontSize={13} fill="currentColor" fontFamily="monospace">
            {i === 0 ? 1 : 0}
          </text>
        </g>
      ))}
      <text x={178} y={70} fontSize={16} fill="currentColor" opacity={0.5}>=</text>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={206} y={38 + i * 27} width={34} height={25} rx={3}
            fill={v[i] ? 'var(--color-accent)' : 'currentColor'} opacity={v[i] ? 0.9 : 0.12} />
          <text x={223} y={55 + i * 27} textAnchor="middle" fontSize={13} fontWeight={700}
            fill={v[i] ? 'var(--color-accent-contrast)' : 'currentColor'} fontFamily="monospace">
            {v[i]}
          </text>
        </g>
      ))}
      <text x={W / 2} y={130} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7} fontFamily="monospace">
        top: 0·1 + 1·0 = 0 · bottom: 1·1 + 0·0 = 1
      </text>
      <text x={W / 2} y={152} textAnchor="middle" fontSize={11} fill="var(--color-accent)">
        |0⟩ becomes |1⟩
      </text>
    </Figure>
  );
}

// --- Q32 -------------------------------------------------------------------

export function TangentSlope() {
  const t = useLoop(3400, useAnimate());
  // A thrown ball: x(t) = 4t − t², turning point at t = 2 where slope is zero.
  const u = t * 4;
  const pts = Array.from({ length: 90 }, (_, i) => {
    const tt = (i / 89) * 4;
    return { x: 30 + (tt / 4) * (W - 54), y: H - 30 - (4 * tt - tt * tt) / 4 * (H - 64) };
  });
  const px = 30 + (u / 4) * (W - 54);
  const py = H - 30 - (4 * u - u * u) / 4 * (H - 64);
  const slope = 4 - 2 * u;
  const flat = Math.abs(slope) < 0.18;
  return (
    <Figure width={W} height={H} label="A position against time curve for a thrown ball. At the turning point the tangent is horizontal and velocity is zero."
      caption={`slope = velocity = ${slope.toFixed(2)}${flat ? '  ← horizontal tangent' : ''}`}>
      <Axes x0={30} y0={H - 30} x1={W - 16} y1={20} xLabel="t" yLabel="x" />
      <path d={polyline(pts)} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.45} />
      <line
        x1={px - 34} y1={py + slope * 8.5} x2={px + 34} y2={py - slope * 8.5}
        stroke={flat ? 'var(--color-success)' : 'var(--color-accent)'} strokeWidth={2.5}
      />
      <circle cx={px} cy={py} r={5} fill={flat ? 'var(--color-success)' : 'var(--color-accent)'} />
    </Figure>
  );
}

// --- Q33 -------------------------------------------------------------------

export function ShmRestoring() {
  const t = useLoop(2600, useAnimate());
  const { x, acceleration } = shm(2 * Math.PI, 1, t);
  const cx = W / 2 + x * 88;
  const cy = H / 2 + 6;
  const arrow = Math.sign(acceleration) * Math.min(42, Math.abs(acceleration) * 7);
  return (
    <Figure width={W} height={H} label="A mass oscillating about equilibrium. The acceleration arrow always points back toward the centre."
      caption={`x = ${x.toFixed(2)} · a = ${acceleration.toFixed(1)} — opposite signs, always`}>
      <line x1={24} y1={cy} x2={W - 24} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={W / 2} y1={cy - 34} x2={W / 2} y2={cy + 34} stroke="currentColor" strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />
      <text x={W / 2} y={cy + 50} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>x = 0</text>
      {Math.abs(arrow) > 2 && (
        <g>
          <line x1={cx} y1={cy - 30} x2={cx + arrow} y2={cy - 30} stroke="var(--color-accent)" strokeWidth={3} />
          <polygon
            points={`${cx + arrow},${cy - 30} ${cx + arrow - Math.sign(arrow) * 8},${cy - 35} ${cx + arrow - Math.sign(arrow) * 8},${cy - 25}`}
            fill="var(--color-accent)"
          />
          <text x={cx + arrow / 2} y={cy - 38} textAnchor="middle" fontSize={10} fill="var(--color-accent)">a</text>
        </g>
      )}
      <circle cx={cx} cy={cy} r={13} fill="currentColor" opacity={0.75} />
    </Figure>
  );
}

// --- Q34 -------------------------------------------------------------------

export function PeriodFrequency() {
  const t = useLoop(2400, useAnimate());
  const cycles = 3;
  const pts = Array.from({ length: 150 }, (_, i) => {
    const u = i / 149;
    return { x: 24 + u * (W - 48), y: H / 2 - 34 * Math.sin(u * cycles * 2 * Math.PI - t * 2 * Math.PI) };
  });
  const periodW = (W - 48) / cycles;
  return (
    <Figure width={W} height={H} label="One complete oscillation takes 0.020 seconds, so fifty cycles fit into one second."
      caption="T = 0.020 s → f = 1/T = 50 Hz">
      <path d={polyline(pts)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <line x1={24} y1={H - 42} x2={24 + periodW} y2={H - 42} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24} y1={H - 47} x2={24} y2={H - 37} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <line x1={24 + periodW} y1={H - 47} x2={24 + periodW} y2={H - 37} stroke="currentColor" strokeWidth={2} opacity={0.6} />
      <text x={24 + periodW / 2} y={H - 50} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.8}>
        T = 0.020 s
      </text>
      <text x={W - 24} y={H - 48} textAnchor="end" fontSize={13} fontWeight={700} fill="var(--color-accent)" fontFamily="monospace">
        f = 50 Hz
      </text>
    </Figure>
  );
}

// --- Q37 -------------------------------------------------------------------

export function PlanckQuanta() {
  const t = useLoop(3200, useAnimate());
  const quantised = t > 0.5;
  return (
    <Figure width={W} height={H} label="Continuous energy exchange allows unlimited high-frequency emission; quantised packets of h nu do not."
      caption={quantised ? 'quantised: hν packets — high ν rarely affordable' : 'continuous: every mode takes energy'}>
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

// --- Q38 -------------------------------------------------------------------

export function PhotoelectricThreshold() {
  const animate = useAnimate();
  const t = useLoop(2600, animate);
  const THRESHOLD = 5.0e14;
  const NU = 4.0e14; // below threshold
  const { emits } = maxKineticEnergy(NU, THRESHOLD);
  // Intensity rises over the loop; emission still never happens.
  const photons = 3 + Math.floor(t * 9);
  return (
    <Figure width={W} height={H} label="Photons below the threshold frequency strike a metal. However many arrive, no electron is emitted."
      caption={`ν = 4.0×10¹⁴ Hz < ν₀ = 5.0×10¹⁴ Hz · ${photons} photons · electrons emitted: 0`}>
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
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={emits ? 'var(--color-success)' : 'var(--color-danger)'}>
        {emits ? 'emission' : 'no emission at any intensity'}
      </text>
    </Figure>
  );
}

// --- Q40 -------------------------------------------------------------------

export function KmaxVsFrequency() {
  const t = useLoop(3000, useAnimate());
  const THRESHOLD = 5.0e14;
  const nuMax = 1.1e15;
  const pts = Array.from({ length: 60 }, (_, i) => {
    const nu = (i / 59) * nuMax;
    const { kMax } = maxKineticEnergy(nu, THRESHOLD);
    return { nu, kMax };
  });
  const peak = Math.max(...pts.map((p) => p.kMax));
  const toXY = (p: { nu: number; kMax: number }) => ({
    x: 34 + (p.nu / nuMax) * (W - 54),
    y: H - 36 - (p.kMax / peak) * (H - 70),
  });
  const shown = pts.slice(0, Math.max(2, Math.floor(pts.length * Math.min(1, t * 1.4))));
  return (
    <Figure width={W} height={H} label="Maximum kinetic energy against frequency is a straight line whose gradient is Planck's constant."
      caption={`gradient = h = ${sci(PLANCK, 2)} J s`}>
      <Axes x0={34} y0={H - 36} x1={W - 16} y1={20} xLabel="ν" yLabel="Kₘₐₓ" />
      <path d={polyline(shown.map(toXY))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={34 + (THRESHOLD / nuMax) * (W - 54)} cy={H - 36} r={4} fill="currentColor" opacity={0.6} />
      <text x={34 + (THRESHOLD / nuMax) * (W - 54)} y={H - 20} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>ν₀</text>
      <text x={W - 20} y={44} textAnchor="end" fontSize={11} fill="var(--color-accent)" fontFamily="monospace">
        slope = h
      </text>
    </Figure>
  );
}

// --- Q41, Q42 --------------------------------------------------------------

export function PhotonArithmetic({ mode = 'energy' }: { mode?: 'energy' | 'momentum' }) {
  const t = useLoop(3600, useAnimate());
  const stage = t < 0.35 ? 0 : t < 0.7 ? 1 : 2;

  if (mode === 'momentum') {
    const lambda = 500e-9;
    const p = photonMomentum(lambda);
    return (
      <Figure width={W} height={H} label={`A 500 nanometre photon has momentum h divided by lambda, which is ${sci(p)} kilogram metres per second.`}
        caption="momentum is h/λ — not h, and not the energy">
        <text x={W / 2} y={48} textAnchor="middle" fontSize={17} fill="currentColor" fontFamily="monospace">p = h / λ</text>
        <text x={W / 2} y={82} textAnchor="middle" fontSize={13} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily="monospace">
          {sci(PLANCK)} ÷ {sci(lambda)}
        </text>
        <text x={W / 2} y={120} textAnchor="middle" fontSize={19} fontWeight={700} fontFamily="monospace"
          fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.2}>
          {sci(p)} kg m s⁻¹
        </text>
        <text x={W / 2} y={152} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
          the photon&apos;s energy is {sci(photonEnergy(3e8 / lambda))} J — a different quantity
        </text>
      </Figure>
    );
  }

  const nu = 7.0e14;
  const nu0 = 5.0e14;
  const { kMax, workFunction } = maxKineticEnergy(nu, nu0);
  return (
    <Figure width={W} height={H} label={`Maximum kinetic energy is h times the frequency excess, giving ${sci(kMax)} joules.`}
      caption="only the excess over the work function reaches the electron">
      <text x={W / 2} y={44} textAnchor="middle" fontSize={16} fill="currentColor" fontFamily="monospace">Kₘₐₓ = h(ν − ν₀)</text>
      <text x={W / 2} y={74} textAnchor="middle" fontSize={12} fill="var(--color-accent)" opacity={stage >= 1 ? 1 : 0.2} fontFamily="monospace">
        {sci(PLANCK)} × 2.0 × 10¹⁴
      </text>
      <text x={W / 2} y={110} textAnchor="middle" fontSize={19} fontWeight={700} fontFamily="monospace"
        fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.2}>
        {sci(kMax)} J
      </text>
      <text x={W / 2} y={140} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
        work function Φ = {sci(workFunction)} J · whole photon = {sci(photonEnergy(nu))} J
      </text>
      <text x={W / 2} y={158} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.45}>
        those two are the distractors
      </text>
    </Figure>
  );
}

// --- Q43 -------------------------------------------------------------------

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

// --- Q45 -------------------------------------------------------------------

export function DeBroglieRatio() {
  const t = useLoop(2800, useAnimate());
  const p1 = 1e-27;
  const p2 = 2e-27;
  const l1 = deBroglieWavelength(p1);
  const l2 = deBroglieWavelength(p2);
  const wave = (cycles: number, y: number) =>
    polyline(
      Array.from({ length: 120 }, (_, i) => {
        const u = i / 119;
        return { x: 24 + u * (W - 48), y: y - 17 * Math.sin(u * cycles * 2 * Math.PI - t * 2 * Math.PI) };
      }),
    );
  return (
    <Figure width={W} height={H} label="A particle with twice the momentum has half the de Broglie wavelength, so the wavelengths are in the ratio two to one."
      caption={`λ₁ : λ₂ = ${(l1 / l2).toFixed(0)} : 1`}>
      <text x={24} y={28} fontSize={11} fill="currentColor" opacity={0.7} fontFamily="monospace">momentum p</text>
      <path d={wave(2, 54)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <text x={24} y={104} fontSize={11} fill="currentColor" opacity={0.7} fontFamily="monospace">momentum 2p</text>
      <path d={wave(4, 130)} fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.6} />
      <text x={W - 24} y={28} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6} fontFamily="monospace">
        λ = h/p
      </text>
      <text x={W - 24} y={104} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6} fontFamily="monospace">
        λ = h/2p — half as long
      </text>
    </Figure>
  );
}

// --- Q46 -------------------------------------------------------------------

export function WhichPath() {
  const t = useLoop(4400, useAnimate());
  const watching = t > 0.5;
  const screenX = W - 44;
  return (
    <Figure width={W} height={H} label={watching ? 'With a which-path detector the fringes vanish, leaving two overlapping blobs.' : 'With no detector the two paths interfere and fringes appear.'}
      caption={watching ? 'detector on: paths distinguishable — fringes gone' : 'detector off: amplitudes add — fringes'}>
      <rect x={52} y={26} width={6} height={128} fill="currentColor" opacity={0.4} />
      <rect x={52} y={62} width={6} height={16} fill="var(--color-surface)" />
      <rect x={52} y={102} width={6} height={16} fill="var(--color-surface)" />
      {[70, 110].map((y) => (
        <path key={y} d={`M58,${y} Q${(58 + screenX) / 2},${y + (y === 70 ? 26 : -26)} ${screenX},90`}
          fill="none" stroke="var(--color-accent)" strokeWidth={1.4} opacity={watching ? 0.25 : 0.6}
          strokeDasharray={watching ? '3 3' : undefined} />
      ))}
      {watching && (
        <g>
          <circle cx={74} cy={70} r={7} fill="none" stroke="var(--color-danger)" strokeWidth={1.6} />
          <text x={74} y={54} textAnchor="middle" fontSize={9} fill="var(--color-danger)">detector</text>
        </g>
      )}
      <rect x={screenX} y={26} width={8} height={128} fill="currentColor" opacity={0.2} />
      {Array.from({ length: 30 }, (_, i) => {
        const y = 30 + i * 4.2;
        const d = (y - 90) / 26;
        // Fringes: cos² pattern. Blobs: two Gaussians, no interference term.
        const intensity = watching
          ? Math.exp(-((y - 72) ** 2) / 300) + Math.exp(-((y - 108) ** 2) / 300)
          : Math.cos(d * 2.4) ** 2 * Math.exp(-(d ** 2) / 4.2);
        return (
          <rect key={i} x={screenX + 9} y={y} width={Math.max(0.5, intensity * 22)} height={3.4}
            fill="var(--color-accent)" opacity={0.3 + intensity * 0.6} />
        );
      })}
    </Figure>
  );
}

// --- Q47 -------------------------------------------------------------------

export function BornRule() {
  const t = useLoop(3200, useAnimate());
  const stage = t < 0.4 ? 0 : t < 0.75 ? 1 : 2;
  const cx = 86;
  const cy = H / 2;
  const r = 44;
  return (
    <Figure width={W} height={H} label="An amplitude of 0.6i has modulus 0.6, and squaring it gives a probability of 0.36."
      caption="probability is |amplitude|², which is why the i disappears">
      <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="currentColor" strokeWidth={1} opacity={0.3} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.6 * 1.6} stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={cx} cy={cy - r * 0.6 * 1.6} r={5} fill="var(--color-accent)" />
      <text x={cx + 10} y={cy - r * 0.6 * 1.6 - 6} fontSize={12} fill="var(--color-accent)" fontFamily="monospace">0.6i</text>
      <text x={190} y={62} fontSize={13} fill="currentColor" opacity={stage >= 1 ? 0.9 : 0.25} fontFamily="monospace">|0.6i| = 0.6</text>
      <text x={190} y={92} fontSize={13} fill="currentColor" opacity={stage >= 1 ? 0.9 : 0.25} fontFamily="monospace">0.6² = 0.36</text>
      <text x={190} y={126} fontSize={17} fontWeight={700} fontFamily="monospace"
        fill={stage >= 2 ? 'var(--color-success)' : 'currentColor'} opacity={stage >= 2 ? 1 : 0.25}>
        P = 0.36
      </text>
    </Figure>
  );
}

// --- Q48 -------------------------------------------------------------------

const PAIRS: [number, number][] = [[0.5, 0.5], [0.6, 0.8], [0.7, 0.7], [0.8, 0.8]];

export function Normalisation() {
  const t = useLoop(5200, useAnimate());
  const idx = Math.floor(t * PAIRS.length) % PAIRS.length;
  const [a, b] = PAIRS[idx];
  const total = a * a + b * b;
  const ok = Math.abs(total - 1) < 1e-9;
  return (
    <Figure width={W} height={H} label="Only the pair 0.6 and 0.8 has squared values summing to exactly one."
      caption={`${a} and ${b}: ${a}² + ${b}² = ${total.toFixed(2)}${ok ? ' ✓' : ''}`}>
      <text x={W / 2} y={34} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7} fontFamily="monospace">a² + b² = 1 ?</text>
      {[a, b].map((v, i) => (
        <g key={i}>
          <rect x={46 + i * 118} y={H - 54 - v * v * 76} width={70} height={v * v * 76} rx={3}
            fill={ok ? 'var(--color-success)' : 'var(--color-accent)'} opacity={0.8} />
          <text x={81 + i * 118} y={H - 36} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75} fontFamily="monospace">
            {v}² = {(v * v).toFixed(2)}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily="monospace"
        fill={ok ? 'var(--color-success)' : 'var(--color-danger)'}>
        {total.toFixed(2)} {ok ? '— normalised' : '— not 1'}
      </text>
    </Figure>
  );
}

// --- Q49 -------------------------------------------------------------------

const SETS: [number, number, number, number][] = [
  [2, 2, 0, 0.5],
  [3, 1, 2, -0.5],
  [3, 2, -1, 0.5],
  [1, 0, 0, 1],
];

export function QuantumNumbers() {
  const t = useLoop(6000, useAnimate());
  const idx = Math.floor(t * SETS.length) % SETS.length;
  const [n, l, ml, ms] = SETS[idx];
  const { allowed, rules } = checkQuantumNumbers(n, l, ml, ms);
  const fmt = (v: number) => (v === 0.5 ? '+½' : v === -0.5 ? '−½' : String(v));
  return (
    <Figure width={W} height={H} label="Each set of quantum numbers is checked against the rules; only one passes all of them."
      caption={allowed ? 'every rule satisfied — allowed' : 'fails a rule — not allowed'}>
      <text x={W / 2} y={30} textAnchor="middle" fontSize={15} fontWeight={700} fill="currentColor" fontFamily="monospace">
        ({n}, {l}, {ml}, {fmt(ms)})
      </text>
      {rules.map((r, i) => (
        <g key={r.rule}>
          <text x={54} y={58 + i * 24} fontSize={11} fill="currentColor" opacity={0.8} fontFamily="monospace">{r.rule}</text>
          <text x={W - 54} y={58 + i * 24} textAnchor="end" fontSize={13} fontWeight={700}
            fill={r.ok ? 'var(--color-success)' : 'var(--color-danger)'}>
            {r.ok ? '✓' : '✗'}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={allowed ? 'var(--color-success)' : 'var(--color-danger)'}>
        {allowed ? 'allowed — a 3d electron' : 'not allowed'}
      </text>
    </Figure>
  );
}

// --- Q50 -------------------------------------------------------------------

export function ElectronHolePairs() {
  const t = useLoop(3800, useAnimate());
  const pairs = 1 + Math.floor(t * 5);
  return (
    <Figure width={W} height={H} label="In an intrinsic semiconductor each thermal excitation creates one conduction electron and leaves one hole, so the counts are always equal."
      caption={`${pairs} electron${pairs === 1 ? '' : 's'} · ${pairs} hole${pairs === 1 ? '' : 's'} — created in pairs`}>
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
      <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-success)" fontFamily="monospace">
        n = p = nᵢ
      </text>
    </Figure>
  );
}
