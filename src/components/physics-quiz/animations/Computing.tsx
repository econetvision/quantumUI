'use client';

import { Axes, Figure, polyline, useAnimate, useLoop } from '../Figure';
import { decay, groverIterations, repetitionLogicalError } from '@/lib/physics';
import { GATES, applyGate, controlled, probabilities, rx, ry, rz, swap, toffoli, zeroState, type State } from '@/lib/quantum-sim';

/**
 * Figures for Modules 08 and 09: circuits, algorithms, hardware and noise.
 *
 * The circuit figure runs the gates through the simulator step by step, so
 * the bars under a Deutsch–Jozsa or Grover circuit are the real output of
 * the real gates — the same circuits Qlaude returned as templates, checked
 * against its 1000-shot simulations while this module was written.
 */

const W = 320;
const H = 180;
const MONO = 'monospace';

// --- 08.x circuits -----------------------------------------------------------------

interface Op { name: string; targets: number[]; angle?: number }

/** "H0;CX0,1;RZ1:0.785" → ops. */
function parse(program: string): Op[] {
  return program.split(';').filter(Boolean).map((tok) => {
    const m = tok.trim().match(/^([A-Z]+)([\d,]+)(?::([-\d.]+))?$/);
    if (!m) throw new Error(`bad gate token: ${tok}`);
    return { name: m[1], targets: m[2].split(',').map(Number), angle: m[3] !== undefined ? Number(m[3]) : undefined };
  });
}

function run(ops: Op[], qubits: number, upTo: number): State {
  let s = zeroState(qubits);
  for (const op of ops.slice(0, upTo)) {
    const [a, b, c] = op.targets;
    switch (op.name) {
      case 'H': case 'X': case 'Y': case 'Z': case 'S': case 'T': case 'I': s = applyGate(s, GATES[op.name], a); break;
      case 'RX': s = applyGate(s, rx(op.angle ?? 0), a); break;
      case 'RY': s = applyGate(s, ry(op.angle ?? 0), a); break;
      case 'RZ': s = applyGate(s, rz(op.angle ?? 0), a); break;
      case 'CX': s = controlled(s, GATES.X, a, b); break;
      case 'CZ': s = controlled(s, GATES.Z, a, b); break;
      case 'SWAP': s = swap(s, a, b); break;
      case 'CCX': s = toffoli(s, a, b, c); break;
      default: throw new Error(`unknown gate ${op.name}`);
    }
  }
  return s;
}

export function Circuit({ program, qubits = 2, note }: { program: string; qubits?: number; note?: string }) {
  const ops = parse(program);
  const t = useLoop(1400 * (ops.length + 2), useAnimate());
  const step = Math.min(ops.length, Math.floor(t * (ops.length + 1.6)));
  const s = run(ops, qubits, step);
  const probs = probabilities(s);
  const labels = probs.map((_, i) => i.toString(2).padStart(qubits, '0'));
  const wireY = (q: number) => 28 + q * (qubits > 3 ? 18 : 24);
  const colX = (i: number) => 44 + i * Math.min(30, (190 - 44) / Math.max(1, ops.length));
  const top = probs.map((p, i) => ({ p, i })).sort((x, y) => y.p - x.p)[0];
  const barArea = 110;
  const barW = Math.max(6, Math.min(26, barArea / probs.length - 2));
  const done = step === ops.length;
  return (
    <Figure width={W} height={H} label={`A ${qubits}-qubit circuit of ${ops.length} gates, run step by step; after it, the most likely outcome is ${labels[top.i]} with probability ${top.p.toFixed(2)}.`}
      caption={done ? `done: P(|${labels[top.i]}⟩) = ${top.p.toFixed(2)}${note ? ` — ${note}` : ''}` : step === 0 ? `start: all qubits |0⟩` : `after gate ${step}/${ops.length} (${ops[step - 1].name})`}>
      {Array.from({ length: qubits }, (_, q) => (
        <g key={q}>
          <text x={22} y={wireY(q) + 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>q{q}</text>
          <line x1={32} y1={wireY(q)} x2={196} y2={wireY(q)} stroke="currentColor" strokeWidth={1} opacity={0.35} />
        </g>
      ))}
      {ops.map((op, i) => {
        const x = colX(i);
        const active = i === step - 1;
        const dim = i >= step;
        const isCtrl = op.name === 'CX' || op.name === 'CZ' || op.name === 'CCX';
        if (isCtrl) {
          const ctrls = op.targets.slice(0, -1);
          const tgt = op.targets[op.targets.length - 1];
          const ys = op.targets.map(wireY);
          return (
            <g key={i} opacity={dim ? 0.3 : 1}>
              <line x1={x} y1={Math.min(...ys)} x2={x} y2={Math.max(...ys)} stroke={active ? 'var(--color-accent)' : 'currentColor'} strokeWidth={1.5} />
              {ctrls.map((q) => <circle key={q} cx={x} cy={wireY(q)} r={3.5} fill={active ? 'var(--color-accent)' : 'currentColor'} />)}
              {op.name === 'CZ' ? <circle cx={x} cy={wireY(tgt)} r={3.5} fill={active ? 'var(--color-accent)' : 'currentColor'} /> : (
                <g>
                  <circle cx={x} cy={wireY(tgt)} r={6} fill="none" stroke={active ? 'var(--color-accent)' : 'currentColor'} strokeWidth={1.5} />
                  <line x1={x - 6} y1={wireY(tgt)} x2={x + 6} y2={wireY(tgt)} stroke={active ? 'var(--color-accent)' : 'currentColor'} strokeWidth={1.5} />
                </g>
              )}
            </g>
          );
        }
        if (op.name === 'SWAP') {
          return (
            <g key={i} opacity={dim ? 0.3 : 1} stroke={active ? 'var(--color-accent)' : 'currentColor'} strokeWidth={1.5}>
              <line x1={x} y1={wireY(op.targets[0])} x2={x} y2={wireY(op.targets[1])} />
              {op.targets.map((q) => <g key={q}><line x1={x - 4} y1={wireY(q) - 4} x2={x + 4} y2={wireY(q) + 4} /><line x1={x - 4} y1={wireY(q) + 4} x2={x + 4} y2={wireY(q) - 4} /></g>)}
            </g>
          );
        }
        const label = op.angle !== undefined ? `${op.name[1]}${op.angle === Math.PI / 2 ? 'π/2' : ''}` : op.name;
        return (
          <g key={i} opacity={dim ? 0.3 : 1}>
            <rect x={x - 9} y={wireY(op.targets[0]) - 9} width={18} height={18} rx={3} fill={active ? 'var(--color-accent)' : 'var(--color-surface)'} stroke={active ? 'var(--color-accent)' : 'currentColor'} strokeWidth={1.2} />
            <text x={x} y={wireY(op.targets[0]) + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} fill={active ? 'var(--color-accent-contrast)' : 'currentColor'} fontFamily={MONO}>{label}</text>
          </g>
        );
      })}
      {probs.map((p, i) => {
        const x = 206 + i * (barW + 2);
        const hgt = p * 100;
        return (
          <g key={i}>
            <rect x={x} y={134 - hgt} width={barW} height={hgt} rx={1.5} fill={p > 1e-9 ? 'var(--color-accent)' : 'currentColor'} opacity={p > 1e-9 ? 0.85 : 0.1} />
            {probs.length <= 8 && <text x={x + barW / 2} y={148} textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.7} fontFamily={MONO}>{labels[i]}</text>}
          </g>
        );
      })}
      {probs.length > 8 && <text x={206} y={148} fontSize={7} fill="currentColor" opacity={0.6} fontFamily={MONO}>|{labels[0]}⟩ … |{labels[labels.length - 1]}⟩</text>}
      <text x={206} y={22} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>P(outcome)</text>
    </Figure>
  );
}

// --- 08.01 classical gates --------------------------------------------------------------

export function ClassicalGates() {
  const t = useLoop(4800, useAnimate());
  const row = Math.floor(t * 4) % 4;
  const a = (row >> 1) & 1; const b = row & 1;
  const gates = [
    { name: 'AND', out: a & b },
    { name: 'OR', out: a | b },
    { name: 'XOR', out: a ^ b },
    { name: 'NAND', out: 1 - (a & b) },
  ];
  return (
    <Figure width={W} height={H} label={`Truth tables for AND, OR, XOR and NAND stepping through the four inputs; currently ${a}, ${b}.`}
      caption={`inputs a = ${a}, b = ${b} · AND ${a & b} · OR ${a | b} · XOR ${a ^ b} · NAND ${1 - (a & b)} — one output bit from two: the input cannot be recovered`}>
      {[0, 1, 2, 3].map((r) => {
        const ra = (r >> 1) & 1; const rb = r & 1;
        return (
          <g key={r} opacity={r === row ? 1 : 0.4}>
            <text x={40} y={48 + r * 24} fontSize={12} fill="currentColor" fontFamily={MONO}>{ra} {rb}</text>
            {gates.map((g, i) => (
              <text key={g.name} x={120 + i * 48} y={48 + r * 24} textAnchor="middle" fontSize={12} fontWeight={r === row ? 700 : 400} fill={r === row ? 'var(--color-accent)' : 'currentColor'} fontFamily={MONO}>
                {g.name === 'AND' ? ra & rb : g.name === 'OR' ? ra | rb : g.name === 'XOR' ? ra ^ rb : 1 - (ra & rb)}
              </text>
            ))}
          </g>
        );
      })}
      <text x={40} y={26} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>a b</text>
      {gates.map((g, i) => <text key={g.name} x={120 + i * 48} y={26} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>{g.name}</text>)}
      <text x={W / 2} y={158} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>NAND alone builds every classical circuit</text>
      <text x={W / 2} y={172} textAnchor="middle" fontSize={9} fill="var(--color-danger)" opacity={0.85}>AND of 0,0 / 0,1 / 1,0 all give 0: information erased, heat released</text>
    </Figure>
  );
}

// --- 08.19 Shor: period finding ---------------------------------------------------------

export function PeriodFinding({ base = 7, modulus = 15 }: { base?: number; modulus?: number }) {
  const t = useLoop(5000, useAnimate());
  const xs = Array.from({ length: 8 }, (_, x) => x);
  const vals = xs.map((x) => { let v = 1; for (let k = 0; k < x; k += 1) v = (v * base) % modulus; return v; });
  let r = 1; while (vals[r] !== 1 && r < 8) r += 1;
  const shown = Math.min(8, Math.floor(t * 1.3 * 9));
  const half = Math.pow(base, r / 2);
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const f1 = gcd(half - 1, modulus); const f2 = gcd(half + 1, modulus);
  return (
    <Figure width={W} height={H} label={`The sequence ${base} to the x modulo ${modulus} repeats with period ${r}. From the period, the factors ${f1} and ${f2} of ${modulus} follow.`}
      caption={shown < 8 ? `f(x) = ${base}ˣ mod ${modulus}: ${vals.slice(0, shown).join(', ')}` : `period r = ${r} → gcd(${base}^${r / 2} ± 1, ${modulus}) = ${f1}, ${f2} — the factors of ${modulus}`}>
      <Axes x0={36} y0={120} x1={W - 20} y1={30} xLabel="x" yLabel="f(x)" />
      {xs.slice(0, shown).map((x) => (
        <g key={x}>
          <rect x={44 + x * 33} y={120 - vals[x] * 6} width={20} height={vals[x] * 6} rx={2} fill={x % r === 0 ? 'var(--color-success)' : 'var(--color-accent)'} opacity={0.8} />
          <text x={54 + x * 33} y={116 - vals[x] * 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.8} fontFamily={MONO}>{vals[x]}</text>
          <text x={54 + x * 33} y={134} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65} fontFamily={MONO}>{x}</text>
        </g>
      ))}
      <text x={W / 2} y={160} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>quantum part: find r · classical part: gcd</text>
      <text x={W / 2} y={174} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>the QFT reads the period out of a superposition of all x at once</text>
    </Figure>
  );
}

// --- 08.17 Grover iteration count (used alongside the circuit) ---------------------------

export function GroverScaling() {
  const t = useLoop(5000, useAnimate());
  const nBits = 4 + Math.floor(t * 17); // 4 … 20 bits
  const N = 2 ** nBits;
  const classical = N / 2;
  const quantum = groverIterations(N);
  const toY = (v: number) => 130 - (Math.log10(v) / 6.3) * 100;
  return (
    <Figure width={W} height={H} label={`Searching ${N.toLocaleString()} items: about ${classical.toLocaleString()} classical checks on average against ${quantum.toLocaleString()} Grover iterations.`}
      caption={`N = 2^${nBits} = ${N.toLocaleString()} · classical ≈ N/2 = ${classical.toLocaleString()} · Grover ⌊(π/4)√N⌋ = ${quantum.toLocaleString()}`}>
      <Axes x0={40} y0={130} x1={W - 20} y1={24} xLabel="bits" yLabel="log steps" />
      <path d={polyline(Array.from({ length: 17 }, (_, i) => ({ x: 40 + (i / 16) * (W - 60), y: toY(2 ** (i + 4) / 2) })))} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
      <path d={polyline(Array.from({ length: 17 }, (_, i) => ({ x: 40 + (i / 16) * (W - 60), y: toY(Math.max(1, groverIterations(2 ** (i + 4)))) })))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={40 + ((nBits - 4) / 16) * (W - 60)} cy={toY(classical)} r={4} fill="currentColor" opacity={0.6} />
      <circle cx={40 + ((nBits - 4) / 16) * (W - 60)} cy={toY(Math.max(1, quantum))} r={4.5} fill="var(--color-accent)" />
      <text x={110} y={36} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>classical: N/2</text>
      <text x={110} y={48} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>Grover: √N — quadratic, not exponential</text>
    </Figure>
  );
}

// --- 09.01–09.04 hardware ---------------------------------------------------------------

export function Hardware({ kind = 'overview' }: { kind?: 'overview' | 'transmon' | 'ion' | 'photon' }) {
  const t = useLoop(4000, useAnimate());
  const cards = [
    { name: 'superconducting', q: 'transmon circuit', T1: '~100 µs', gate: '20–40 ns', temp: '15 mK', colour: 'var(--color-accent)' },
    { name: 'trapped ion', q: 'single atom', T1: 'seconds+', gate: '1–100 µs', temp: 'laser-cooled', colour: 'var(--color-success)' },
    { name: 'photonic', q: 'one photon', T1: 'flight time', gate: 'linear optics', temp: 'room (sources cold)', colour: 'var(--color-danger)' },
  ];
  if (kind === 'overview') {
    return (
      <Figure width={W} height={H} label="Three ways to build a qubit — superconducting circuits, trapped ions and photons — with their typical coherence time, gate time and operating temperature." caption="every platform trades isolation against controllability; none has won">
        {cards.map((c, i) => (
          <g key={c.name}>
            <rect x={14 + i * 100} y={20} width={92} height={140} rx={6} fill="none" stroke={c.colour} strokeWidth={1.5} opacity={0.8} />
            <text x={60 + i * 100} y={40} textAnchor="middle" fontSize={10} fontWeight={700} fill={c.colour} fontFamily={MONO}>{c.name}</text>
            <text x={60 + i * 100} y={58} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.7}>{c.q}</text>
            <text x={22 + i * 100} y={84} fontSize={8} fill="currentColor" opacity={0.6} fontFamily={MONO}>T₁</text>
            <text x={98 + i * 100} y={84} textAnchor="end" fontSize={8} fill="currentColor" fontFamily={MONO}>{c.T1}</text>
            <text x={22 + i * 100} y={104} fontSize={8} fill="currentColor" opacity={0.6} fontFamily={MONO}>gate</text>
            <text x={98 + i * 100} y={104} textAnchor="end" fontSize={8} fill="currentColor" fontFamily={MONO}>{c.gate}</text>
            <text x={22 + i * 100} y={124} fontSize={8} fill="currentColor" opacity={0.6} fontFamily={MONO}>temp</text>
            <text x={98 + i * 100} y={124} textAnchor="end" fontSize={7.5} fill="currentColor" fontFamily={MONO}>{c.temp}</text>
            <text x={60 + i * 100} y={148} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>{i === 0 ? 'fast, needs a fridge' : i === 1 ? 'slow, very clean' : 'flies, hard to hold'}</text>
          </g>
        ))}
      </Figure>
    );
  }
  if (kind === 'transmon') {
    const levels = [0, 1, 1.96, 2.88]; // anharmonic ladder
    const drive = Math.sin(t * 2 * Math.PI * 3);
    return (
      <Figure width={W} height={H} label="A transmon: a capacitor and a Josephson junction forming a slightly anharmonic oscillator. The lowest two unequally spaced levels are the qubit; a microwave at their gap drives it."
        caption="levels unequally spaced (anharmonicity ≈ −200 MHz) so the 0→1 drive leaves 1→2 alone · f₀₁ ≈ 5 GHz">
        <rect x={40} y={60} width={6} height={40} fill="currentColor" opacity={0.6} />
        <rect x={54} y={60} width={6} height={40} fill="currentColor" opacity={0.6} />
        <text x={50} y={116} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.65}>capacitor</text>
        <line x1={60} y1={80} x2={110} y2={80} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
        <rect x={110} y={66} width={28} height={28} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} />
        <line x1={110} y1={66} x2={138} y2={94} stroke="var(--color-accent)" strokeWidth={1.5} />
        <line x1={110} y1={94} x2={138} y2={66} stroke="var(--color-accent)" strokeWidth={1.5} />
        <text x={124} y={116} textAnchor="middle" fontSize={8} fill="var(--color-accent)">Josephson junction</text>
        <line x1={138} y1={80} x2={160} y2={80} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
        <line x1={160} y1={80} x2={160} y2={120} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
        <line x1={40} y1={120} x2={160} y2={120} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
        <line x1={40} y1={120} x2={40} y2={100} stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
        {levels.map((e, i) => (
          <g key={i}>
            <line x1={210} y1={140 - e * 36} x2={290} y2={140 - e * 36} stroke={i < 2 ? 'var(--color-accent)' : 'currentColor'} strokeWidth={i < 2 ? 2.5 : 1} opacity={i < 2 ? 1 : 0.4} />
            <text x={296} y={143 - e * 36} fontSize={8} fill="currentColor" opacity={0.7} fontFamily={MONO}>|{i}⟩</text>
          </g>
        ))}
        <line x1={250} y1={140} x2={250} y2={140 - 36} stroke="var(--color-success)" strokeWidth={2} opacity={0.5 + 0.5 * Math.abs(drive)} />
        <text x={236} y={160} fontSize={8} fill="var(--color-success)" fontFamily={MONO}>microwave drive</text>
      </Figure>
    );
  }
  if (kind === 'ion') {
    const n = 5;
    return (
      <Figure width={W} height={H} label="A chain of five ions held in an electric trap, cooled and controlled by lasers. Each ion's internal state is a qubit; their shared motion couples them."
        caption="ions: identical by nature, long coherence, gates via lasers and shared motion — slower but cleaner">
        {[0, 1].map((i) => <rect key={i} x={30} y={i === 0 ? 40 : 132} width={260} height={8} rx={3} fill="currentColor" opacity={0.3} />)}
        <text x={160} y={32} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>RF trap electrodes</text>
        {Array.from({ length: n }, (_, i) => {
          const x = 80 + i * 40 + Math.sin(t * 2 * Math.PI * 2 + i) * 3;
          return <circle key={i} cx={x} cy={90} r={7} fill="var(--color-success)" opacity={0.9} />;
        })}
        <line x1={20} y1={90} x2={66} y2={90} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="4 3" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 6))} />
        <text x={20} y={108} fontSize={8} fill="var(--color-danger)">laser</text>
        <text x={160} y={160} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>T₁ ≈ seconds · gate ≈ 10–100 µs · fidelity &gt; 99.9%</text>
      </Figure>
    );
  }
  const ph = t * 2 * Math.PI;
  return (
    <Figure width={W} height={H} label="A single photon meets a beam splitter and takes both paths at once; which-path is the qubit. Linear optics and detectors act on it."
      caption="photonic qubit: path or polarisation of one photon · room temperature flight, 1550 nm in fibre · hard to make two photons interact">
      <line x1={20} y1={100} x2={150} y2={100} stroke="var(--color-danger)" strokeWidth={2} />
      <line x1={140} y1={110} x2={160} y2={90} stroke="currentColor" strokeWidth={3} opacity={0.6} />
      <line x1={150} y1={100} x2={290} y2={100} stroke="var(--color-danger)" strokeWidth={2} opacity={0.6} />
      <line x1={150} y1={100} x2={150} y2={30} stroke="var(--color-danger)" strokeWidth={2} opacity={0.6} />
      <circle cx={20 + ((ph / (2 * Math.PI)) % 1) * 130} cy={100} r={5} fill="var(--color-danger)" />
      <text x={150} y={126} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.65}>50/50 beam splitter</text>
      <text x={290} y={116} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.65}>|0⟩ path</text>
      <text x={156} y={30} fontSize={8} fill="currentColor" opacity={0.65}>|1⟩ path</text>
      <text x={160} y={160} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>(|0⟩ + |1⟩)/√2 after the splitter</text>
    </Figure>
  );
}

// --- 09.06–09.08, 09.11, 09.12 noise, decoherence, NISQ, advantage -------------------------

export function Decoherence({ mode = 't1' }: { mode?: 't1' | 't2' | 'nisq' | 'advantage' }) {
  const t = useLoop(5000, useAnimate());
  if (mode === 't1' || mode === 't2') {
    const T = 100; // µs
    const tt = t * 300;
    const curve = Array.from({ length: 100 }, (_, i) => { const x = (i / 99) * 300; const v = mode === 't1' ? decay(x, T) : 0.5 + 0.5 * decay(x, T) * Math.cos(x / 9); return { x: 40 + (x / 300) * (W - 60), y: 130 - v * 90 }; });
    const now = mode === 't1' ? decay(tt, T) : 0.5 + 0.5 * decay(tt, T) * Math.cos(tt / 9);
    return (
      <Figure width={W} height={H} label={mode === 't1' ? 'Energy relaxation: the probability of still finding the qubit excited decays exponentially with time constant T one.' : 'Dephasing: a Ramsey fringe whose oscillation amplitude decays with time constant T two, as the phase is lost.'}
        caption={mode === 't1' ? `P(|1⟩) = e^{−t/T₁} · t = ${tt.toFixed(0)} µs, T₁ = ${T} µs → ${now.toFixed(2)} · a 20 ns gate costs ≈ 2×10⁻⁴` : `Ramsey: contrast e^{−t/T₂} · t = ${tt.toFixed(0)} µs → signal ${now.toFixed(2)} · phase, not energy, is what is lost`}>
        <Axes x0={40} y0={130} x1={W - 20} y1={30} xLabel="t (µs)" yLabel={mode === 't1' ? 'P(1)' : 'P(0)'} />
        <path d={polyline(curve)} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.45} />
        <path d={polyline(curve.slice(0, Math.max(2, Math.floor(curve.length * t))))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
        <circle cx={40 + (tt / 300) * (W - 60)} cy={130 - now * 90} r={4.5} fill="var(--color-accent)" />
        <line x1={40 + (T / 300) * (W - 60)} y1={130} x2={40 + (T / 300) * (W - 60)} y2={34} stroke="var(--color-danger)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
        <text x={44 + (T / 300) * (W - 60)} y={44} fontSize={9} fill="var(--color-danger)" fontFamily={MONO}>{mode.toUpperCase()} = {T} µs</text>
        {mode === 't1' && <text x={44 + (T / 300) * (W - 60)} y={56} fontSize={8} fill="currentColor" opacity={0.6}>1/e = 0.37 left</text>}
      </Figure>
    );
  }
  if (mode === 'nisq') {
    const depth = Math.floor(t * 2000);
    const fs = [0.99, 0.999, 0.9999];
    return (
      <Figure width={W} height={H} label="Circuit success probability against depth for per-gate fidelities of ninety-nine, ninety-nine point nine and ninety-nine point ninety-nine percent. Without error correction, depth is capped by the error rate."
        caption={`depth ${depth}: success ≈ f^d = ${fs.map((f) => (f ** depth).toFixed(2)).join(' / ')} for f = 0.99 / 0.999 / 0.9999`}>
        <Axes x0={40} y0={130} x1={W - 20} y1={30} xLabel="depth" yLabel="P(ok)" />
        {fs.map((f, i) => (
          <path key={f} d={polyline(Array.from({ length: 80 }, (_, k) => { const d = (k / 79) * 2000; return { x: 40 + (d / 2000) * (W - 60), y: 130 - f ** d * 95 }; }))} fill="none" stroke={i === 0 ? 'var(--color-danger)' : i === 1 ? 'var(--color-accent)' : 'var(--color-success)'} strokeWidth={2} />
        ))}
        <line x1={40 + (depth / 2000) * (W - 60)} y1={130} x2={40 + (depth / 2000) * (W - 60)} y2={34} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
        <text x={W - 24} y={44} textAnchor="end" fontSize={9} fill="var(--color-success)" fontFamily={MONO}>0.9999</text>
        <text x={W - 24} y={70} textAnchor="end" fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>0.999</text>
        <text x={W - 24} y={120} textAnchor="end" fontSize={9} fill="var(--color-danger)" fontFamily={MONO}>0.99</text>
        <text x={44} y={160} fontSize={9} fill="currentColor" opacity={0.65}>NISQ: noisy, intermediate scale — hundreds of gates, not millions</text>
      </Figure>
    );
  }
  const n = 2 + Math.floor(t * 50);
  const toY = (v: number) => 130 - (Math.log10(v) / 16) * 100;
  return (
    <Figure width={W} height={H} label="Classical cost of simulating n qubits grows as two to the n, against polynomial costs. Past about fifty qubits the exponential curve leaves every computer behind — in principle; in practice noise decides."
      caption={`n = ${n} qubits · 2ⁿ = ${n <= 52 ? (2 ** n).toExponential(1) : '…'} amplitudes · n³ = ${(n ** 3).toLocaleString()} — advantage needs the gap and low enough noise`}>
      <Axes x0={40} y0={130} x1={W - 20} y1={30} xLabel="n" yLabel="log cost" />
      <path d={polyline(Array.from({ length: 51 }, (_, k) => ({ x: 40 + (k / 50) * (W - 60), y: toY(2 ** (k + 2)) })))} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <path d={polyline(Array.from({ length: 51 }, (_, k) => ({ x: 40 + (k / 50) * (W - 60), y: toY((k + 2) ** 3) })))} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
      <circle cx={40 + ((n - 2) / 50) * (W - 60)} cy={toY(2 ** n)} r={4.5} fill="var(--color-accent)" />
      <text x={110} y={40} fontSize={9} fill="var(--color-accent)" fontFamily={MONO}>2ⁿ — statevector memory</text>
      <text x={110} y={52} fontSize={9} fill="currentColor" opacity={0.7} fontFamily={MONO}>n³ — a polynomial, for comparison</text>
      <text x={44} y={160} fontSize={9} fill="currentColor" opacity={0.65}>2⁵⁰ amplitudes × 16 bytes ≈ 18 petabytes</text>
    </Figure>
  );
}

// --- 09.09, 09.10 repetition code ---------------------------------------------------------

export function RepetitionCode({ p = 0.1 }: { p?: number }) {
  const t = useLoop(5200, useAnimate());
  const stage = Math.floor(t * 4) % 4; // encode, error, syndrome, correct
  const flipped = 1; // the middle copy flips in this story
  const bits = stage >= 1 && stage < 3 ? [0, 1, 0] : [0, 0, 0];
  const logical = repetitionLogicalError(p);
  const curve = Array.from({ length: 60 }, (_, i) => { const q = (i / 59) * 0.5; return { x: 190 + (q / 0.5) * 110, y: 130 - repetitionLogicalError(q) * 180 }; });
  const names = ['encode 0 → 000', `noise flips copy ${flipped + 1}`, 'majority vote: 0 0 ≠ 1 → copy 2 is odd one out', 'corrected back to 000'];
  return (
    <Figure width={W} height={H} label={`Three-qubit repetition code: one copy flips, the majority vote finds it, the logical bit survives. Logical error ${logical.toFixed(3)} for a physical error rate ${p}.`}
      caption={`${names[stage]} · physical p = ${p} → logical 3p² − 2p³ = ${logical.toFixed(3)}`}>
      {bits.map((b, i) => (
        <g key={i}>
          <rect x={30 + i * 44} y={60} width={34} height={34} rx={4} fill={b ? 'var(--color-danger)' : 'var(--color-success)'} opacity={0.85} />
          <text x={47 + i * 44} y={83} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--color-accent-contrast)" fontFamily={MONO}>{b}</text>
        </g>
      ))}
      <text x={96} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75} fontFamily={MONO}>logical |0⟩ = |000⟩</text>
      <text x={96} y={114} textAnchor="middle" fontSize={9} fill={stage === 2 ? 'var(--color-accent)' : 'currentColor'} opacity={0.8}>{stage === 2 ? 'syndrome: (0≠1, 1≠0) → flip the middle' : stage === 3 ? '✓ no information read, only the difference' : ''}</text>
      <Axes x0={190} y0={130} x1={W - 16} y1={40} xLabel="p" yLabel="p_L" />
      <path d={polyline([{ x: 190, y: 130 }, { x: 300, y: 130 - 0.5 * 180 }])} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
      <path d={polyline(curve)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
      <circle cx={190 + (p / 0.5) * 110} cy={130 - logical * 180} r={4} fill="var(--color-accent)" />
      <text x={194} y={50} fontSize={8} fill="currentColor" opacity={0.65} fontFamily={MONO}>below p = ½ the code helps</text>
      <text x={W / 2} y={168} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>real codes (surface code) also catch phase flips; threshold ≈ 1%</text>
    </Figure>
  );
}
