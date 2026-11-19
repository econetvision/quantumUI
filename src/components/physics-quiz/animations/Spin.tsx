'use client';

import { Axes, Figure, polyline, useAnimate, useLoop } from '../Figure';
import { chsh, singletCorrelation, spinUpProbability } from '@/lib/physics';
import { GATES, applyGate, cnot, probabilities, zeroState, type State } from '@/lib/quantum-sim';

/**
 * Figures for Module 07, spin and entanglement.
 *
 * Two-qubit amplitudes come from the same statevector simulator the Track 0
 * interactives use, so "the Bell state has no |01⟩ component" is something
 * the figure computes rather than asserts. The CHSH curve is −cos(a − b).
 */

const W = 320;
const H = 180;
const MONO = 'monospace';
const hash = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

// --- 07.01, 07.02, 07.04 Stern–Gerlach --------------------------------------------

export function SternGerlach({ sequence = 'z' }: { sequence?: 'z' | 'zx' | 'zxz' }) {
  const t = useLoop(5000, useAnimate());
  const stages = sequence.split('') as ('z' | 'x')[];
  const n = Math.floor(t * 60);
  // Each stage splits the beam it receives 50/50 unless the previous stage
  // measured the same axis, in which case it passes 100% one way.
  const splits = stages.map((axis, i) => (i === 0 ? 0.5 : stages[i - 1] === axis ? 1 : spinUpProbability(Math.PI / 2)));
  const stageX = (i: number) => 60 + i * (stages.length === 1 ? 120 : 90);
  const counts = stages.map((_, i) => { let up = 0; for (let k = 0; k < n; k += 1) if (hash(k * 7 + i) < splits[i]) up += 1; return { up, down: n - up }; });
  const caption = sequence === 'z'
    ? `a beam of atoms splits into exactly two spots — spin is quantised: ↑ ${counts[0].up} · ↓ ${counts[0].down}`
    : sequence === 'zx'
      ? `take the ↑ beam from Z into an X magnet: it splits 50/50 again (→ ${counts[1].up} · ← ${counts[1].down})`
      : `Z, then X, then Z again: the X measurement erased the Z result — Z splits 50/50 once more (↑ ${counts[2].up} · ↓ ${counts[2].down})`;
  return (
    <Figure width={W} height={H} label={`Stern–Gerlach apparatus with ${stages.length} magnet${stages.length === 1 ? '' : 's'}. ${caption}.`} caption={caption}>
      <circle cx={20} cy={92} r={4} fill="currentColor" opacity={0.7} />
      <text x={20} y={112} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>oven</text>
      {stages.map((axis, i) => {
        const x = stageX(i);
        const upP = splits[i];
        return (
          <g key={i}>
            <line x1={i === 0 ? 24 : stageX(i - 1) + 44} y1={i === 0 ? 92 : 72} x2={x} y2={i === 0 ? 92 : 72} stroke="var(--color-accent)" strokeWidth={2} opacity={0.6} />
            <rect x={x} y={56} width={44} height={70} rx={4} fill="currentColor" opacity={0.15} />
            <text x={x + 22} y={96} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.8} fontFamily={MONO}>{axis.toUpperCase()}</text>
            <line x1={x + 44} y1={92} x2={x + 80} y2={72} stroke="var(--color-accent)" strokeWidth={Math.max(0.8, 3 * upP)} opacity={0.8} />
            <line x1={x + 44} y1={92} x2={x + 80} y2={112} stroke="currentColor" strokeWidth={Math.max(0.8, 3 * (1 - upP))} opacity={1 - upP < 0.01 ? 0.15 : 0.6} />
            <text x={x + 84} y={70} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>{axis === 'z' ? '↑' : '→'} {(upP * 100).toFixed(0)}%</text>
            <text x={x + 84} y={118} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>{axis === 'z' ? '↓' : '←'} {((1 - upP) * 100).toFixed(0)}%</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>classical magnets would smear a continuous band; these make two dots</text>
    </Figure>
  );
}

// --- 07.06–07.10, 08.09–08.12 two-qubit states -----------------------------------------

type TwoQubitMode = 'product' | 'bell' | 'ghz' | 'cnot' | 'superdense';

function build(mode: TwoQubitMode, step: number, encode: number): State {
  if (mode === 'ghz') {
    let s = zeroState(3);
    if (step >= 1) s = applyGate(s, GATES.H, 0);
    if (step >= 2) s = cnot(s, 0, 1);
    if (step >= 3) s = cnot(s, 0, 2);
    return s;
  }
  let s = zeroState(2);
  if (mode === 'product') { if (step >= 1) s = applyGate(s, GATES.H, 0); return s; }
  if (mode === 'cnot') {
    // cycle the four basis inputs
    if (encode & 2) s = applyGate(s, GATES.X, 0);
    if (encode & 1) s = applyGate(s, GATES.X, 1);
    if (step >= 1) s = cnot(s, 0, 1);
    return s;
  }
  if (step >= 1) s = applyGate(s, GATES.H, 0);
  if (step >= 2) s = cnot(s, 0, 1);
  if (mode === 'superdense') {
    if (step >= 3) { if (encode & 1) s = applyGate(s, GATES.X, 0); if (encode & 2) s = applyGate(s, GATES.Z, 0); }
    if (step >= 4) { s = cnot(s, 0, 1); s = applyGate(s, GATES.H, 0); }
  }
  return s;
}

export function TwoQubit({ mode = 'bell' }: { mode?: TwoQubitMode }) {
  const t = useLoop(mode === 'superdense' ? 7000 : 5000, useAnimate());
  const steps = mode === 'product' ? 1 : mode === 'bell' ? 2 : mode === 'ghz' ? 3 : mode === 'cnot' ? 1 : 4;
  const cycle = mode === 'cnot' || mode === 'superdense' ? 4 : 1;
  const encode = Math.floor(t * cycle) % 4;
  const local = (t * cycle) % 1;
  const step = Math.min(steps, Math.floor(local * (steps + 1.5)));
  const s = build(mode, step, encode);
  const probs = probabilities(s);
  const n = s.qubits;
  const labels = probs.map((_, i) => i.toString(2).padStart(n, '0'));
  const barW = n === 3 ? 26 : 44;
  const x0 = n === 3 ? 44 : 60;
  const gap = n === 3 ? 34 : 60;
  const nonzero = labels.filter((_, i) => probs[i] > 1e-9);
  const stepName = mode === 'product' ? ['|00⟩', 'H on qubit 0 → |+⟩|0⟩'][step]
    : mode === 'bell' ? ['|00⟩', 'H on qubit 0', 'CNOT → (|00⟩ + |11⟩)/√2'][step]
    : mode === 'ghz' ? ['|000⟩', 'H', 'CNOT 0→1', 'CNOT 0→2 → GHZ'][step]
    : mode === 'cnot' ? [`input |${(encode >> 1) & 1}${encode & 1}⟩`, `CNOT → |${(encode >> 1) & 1}${((encode >> 1) & 1) ^ (encode & 1)}⟩`][step]
    : ['|00⟩', 'H', 'CNOT: shared Bell pair', `Alice encodes bits ${(encode >> 1) & 1}${encode & 1} with ${['I', 'X', 'Z', 'ZX'][encode]}`, `Bob decodes: CNOT, H → reads ${labels[probs.findIndex((p) => p > 0.5)] ?? '…'}`][step];
  const caption = mode === 'bell' && step === 2 ? `${stepName} · outcomes always match: 00 or 11, never 01 or 10`
    : mode === 'product' && step === 1 ? `${stepName} · measuring qubit 0 says nothing about qubit 1`
    : mode === 'ghz' && step === 3 ? `${stepName}: (|000⟩ + |111⟩)/√2 — three qubits, one fact`
    : stepName;
  return (
    <Figure width={W} height={H} label={`Probabilities of the ${n}-qubit basis states, computed from the statevector. ${caption}.`} caption={caption}>
      {probs.map((p, i) => {
        const hgt = p * 100;
        return (
          <g key={i}>
            <rect x={x0 + i * gap} y={130 - hgt} width={barW} height={hgt} rx={2} fill={p > 1e-9 ? 'var(--color-accent)' : 'currentColor'} opacity={p > 1e-9 ? 0.85 : 0.12} />
            <text x={x0 + i * gap + barW / 2} y={146} textAnchor="middle" fontSize={n === 3 ? 8 : 10} fill="currentColor" opacity={0.8} fontFamily={MONO}>|{labels[i]}⟩</text>
            {p > 1e-9 && <text x={x0 + i * gap + barW / 2} y={126 - hgt} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.8} fontFamily={MONO}>{p.toFixed(2)}</text>}
          </g>
        );
      })}
      <text x={24} y={22} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>step {step}/{steps}: {stepName.length > 40 ? stepName.slice(0, 40) + '…' : stepName}</text>
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={9} fill={nonzero.length === 2 && mode !== 'product' && mode !== 'cnot' ? 'var(--color-success)' : 'currentColor'} opacity={0.75}>
        {mode === 'bell' && step === 2 ? 'cannot be written as (state of A) × (state of B): entangled' : mode === 'product' && step === 1 ? '= (|0⟩ + |1⟩)/√2 ⊗ |0⟩: a product state' : mode === 'cnot' ? 'flips the target only when the control is 1' : mode === 'superdense' ? 'two classical bits carried by one qubit, with a shared pair' : ''}
      </text>
    </Figure>
  );
}

// --- 07.11, 07.12 Bell test and no-signalling --------------------------------------------

export function BellTest({ mode = 'chsh' }: { mode?: 'chsh' | 'marginals' }) {
  const t = useLoop(6000, useAnimate());
  const angle = t * Math.PI; // Bob's angle relative to Alice's, 0 → 180°
  const deg = (angle * 180) / Math.PI;
  if (mode === 'marginals') {
    const pUp = 0.5; // Alice's marginal never depends on Bob's setting
    return (
      <Figure width={W} height={H} label="Alice's probability of spin-up stays at one half whatever angle Bob chooses, so Bob cannot send her a message by choosing. The correlation changes; the marginal does not."
        caption={`Bob's angle ${deg.toFixed(0)}° · Alice sees ↑ with P = ${pUp.toFixed(2)} regardless · E(a,b) = ${singletCorrelation(0, angle).toFixed(2)} changes`}>
        <Axes x0={40} y0={120} x1={W - 20} y1={30} xLabel="Bob's angle" yLabel="P" />
        <line x1={40} y1={120 - 0.5 * 80} x2={W - 20} y2={120 - 0.5 * 80} stroke="var(--color-success)" strokeWidth={3} />
        <text x={W - 24} y={120 - 0.5 * 80 - 6} textAnchor="end" fontSize={9} fill="var(--color-success)" fontFamily={MONO}>Alice: P(↑) = 0.50, flat</text>
        <path d={polyline(Array.from({ length: 60 }, (_, i) => { const a = (i / 59) * Math.PI; return { x: 40 + (i / 59) * (W - 60), y: 120 - (0.5 - 0.5 * singletCorrelation(0, a)) * 80 }; }))} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} opacity={0.6} strokeDasharray="4 3" />
        <text x={70} y={44} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>dashed: P(both agree) — needs both results</text>
        <circle cx={40 + t * (W - 60)} cy={120 - 40} r={4} fill="var(--color-success)" />
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>correlations are not communication: nothing travels</text>
      </Figure>
    );
  }
  const q = singletCorrelation(0, angle);
  const classical = 1 - (2 * angle) / Math.PI; // the straight-line correlation of a local hidden-variable model
  const S = chsh(0, Math.PI / 2, Math.PI / 4, (3 * Math.PI) / 4);
  return (
    <Figure width={W} height={H} label="Correlation between two entangled spins against the angle between the detectors: quantum mechanics gives minus cosine, a local hidden-variable model a straight line. The CHSH combination reaches two root two."
      caption={`angle ${deg.toFixed(0)}°: quantum E = −cos θ = ${q.toFixed(2)} · local-realist line = ${(-classical).toFixed(2)} · CHSH S = ${Math.abs(S).toFixed(2)} > 2`}>
      <Axes x0={40} y0={95} x1={W - 20} y1={30} xLabel="θ" yLabel="E" />
      <path d={polyline(Array.from({ length: 60 }, (_, i) => { const a = (i / 59) * Math.PI; return { x: 40 + (i / 59) * (W - 60), y: 95 - singletCorrelation(0, a) * 55 }; }))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <path d={polyline([{ x: 40, y: 95 + 55 }, { x: W - 20, y: 95 - 55 }])} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
      <circle cx={40 + t * (W - 60)} cy={95 - q * 55} r={4.5} fill="var(--color-accent)" />
      <circle cx={40 + t * (W - 60)} cy={95 + classical * 55} r={3.5} fill="currentColor" opacity={0.6} />
      <text x={70} y={44} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>quantum: −cos θ</text>
      <text x={70} y={56} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>dashed: any local hidden variables</text>
      <text x={W - 24} y={H - 8} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--color-success)" fontFamily={MONO}>S = 2√2 = {Math.abs(S).toFixed(2)} · classical ≤ 2</text>
      <text x={44} y={H - 24} fontSize={9} fill="currentColor" opacity={0.65}>biggest gap at 22.5° and 67.5°</text>
    </Figure>
  );
}

// --- 07.13 no-cloning ------------------------------------------------------------------

export function CloningAttempt() {
  const t = useLoop(6000, useAnimate());
  const idx = Math.floor(t * 3) % 3;
  const inputs = [
    { label: '|0⟩', prep: (s: State) => s },
    { label: '|1⟩', prep: (s: State) => applyGate(s, GATES.X, 0) },
    { label: '|+⟩', prep: (s: State) => applyGate(s, GATES.H, 0) },
  ];
  const inp = inputs[idx];
  const copied = cnot(inp.prep(zeroState(2)), 0, 1);
  const probs = probabilities(copied);
  // What a true copy would look like: |ψ⟩⊗|ψ⟩
  const single = probabilities(inp.prep(zeroState(1)));
  const wanted = [single[0] * single[0], single[0] * single[1], single[1] * single[0], single[1] * single[1]];
  const ok = probs.every((p, i) => Math.abs(p - wanted[i]) < 1e-9);
  const labels = ['00', '01', '10', '11'];
  return (
    <Figure width={W} height={H} label={`A CNOT copier tried on ${inp.label}. It copies the basis states but not the superposition: the output is a Bell state, not two copies of plus.`}
      caption={`copy ${inp.label} with CNOT: ${ok ? 'works — a basis state' : 'fails — gives (|00⟩+|11⟩)/√2, not |+⟩|+⟩'}`}>
      <text x={24} y={24} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>CNOT output</text>
      <text x={184} y={24} fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>a true copy |ψ⟩|ψ⟩</text>
      {probs.map((p, i) => (
        <g key={i}>
          <rect x={24 + i * 34} y={120 - p * 80} width={26} height={p * 80} rx={2} fill={ok ? 'var(--color-success)' : 'var(--color-danger)'} opacity={0.8} />
          <text x={37 + i * 34} y={134} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.75} fontFamily={MONO}>{labels[i]}</text>
          <rect x={184 + i * 34} y={120 - wanted[i] * 80} width={26} height={wanted[i] * 80} rx={2} fill="currentColor" opacity={0.35} />
          <text x={197 + i * 34} y={134} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.75} fontFamily={MONO}>{labels[i]}</text>
        </g>
      ))}
      <text x={W / 2} y={160} textAnchor="middle" fontSize={11} fontWeight={700} fill={ok ? 'var(--color-success)' : 'var(--color-danger)'} fontFamily={MONO}>{ok ? '✓ basis states copy fine' : '✗ no unitary copies every state'}</text>
      <text x={W / 2} y={174} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>linearity: a copier for |0⟩ and |1⟩ must entangle |0⟩ + |1⟩</text>
    </Figure>
  );
}
