import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader, Card, Badge } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Interactive Labs',
  description:
    'Hands-on quantum computing labs covering Bloch spheres, entanglement, Grover, Shor, teleportation and more.',
};

// Track slugs must match src/data/lessons/*.json and the /tracks/[slug] route.
// `qiskit-sdk` and `quantum-teleportation` were previously used here and both
// 404'd — the real slugs carry the `-deep-dive` / `-protocols` suffix.
const LABS_BY_TRACK = [
  {
    trackName: 'Quantum Fundamentals',
    trackSlug: 'quantum-fundamentals',
    icon: '⚛️',
    labs: [
      { id: 3, title: 'The Bloch Sphere', difficulty: 'Beginner' },
      { id: 5, title: 'Quantum Measurement', difficulty: 'Beginner' },
      { id: 7, title: 'Your First Qiskit Circuit', difficulty: 'Beginner' },
    ],
  },
  {
    trackName: 'Quantum Gates & Circuits',
    trackSlug: 'quantum-gates',
    icon: '🔀',
    labs: [
      { id: 3, title: 'The Hadamard Gate', difficulty: 'Beginner' },
      { id: 6, title: 'CNOT Gate & Entanglement', difficulty: 'Intermediate' },
      { id: 8, title: 'Circuit Composition', difficulty: 'Intermediate' },
    ],
  },
  {
    trackName: 'Qiskit SDK Deep Dive',
    trackSlug: 'qiskit-sdk-deep-dive',
    icon: '🛠️',
    labs: [
      { id: 2, title: 'QuantumCircuit & QuantumRegister', difficulty: 'Beginner' },
      { id: 3, title: 'The Aer Simulator', difficulty: 'Beginner' },
      { id: 5, title: 'Optimization Levels', difficulty: 'Intermediate' },
      { id: 7, title: 'Error Mitigation Techniques', difficulty: 'Advanced' },
      { id: 8, title: 'Statevector vs QASM Simulation', difficulty: 'Intermediate' },
      { id: 9, title: 'Visualization Tools', difficulty: 'Beginner' },
      { id: 10, title: 'Primitives: Sampler & Estimator', difficulty: 'Advanced' },
    ],
  },
  {
    trackName: 'Quantum Entanglement',
    trackSlug: 'quantum-entanglement',
    icon: '🔗',
    labs: [
      { id: 2, title: 'Bell States', difficulty: 'Intermediate' },
      { id: 5, title: 'GHZ States', difficulty: 'Intermediate' },
      { id: 6, title: 'Entanglement in Real Circuits', difficulty: 'Advanced' },
    ],
  },
  {
    trackName: 'Quantum Algorithms',
    trackSlug: 'quantum-algorithms',
    icon: '🧮',
    labs: [
      { id: 2, title: 'Deutsch-Jozsa Algorithm', difficulty: 'Intermediate' },
      { id: 3, title: "Grover's Search Algorithm", difficulty: 'Advanced' },
      { id: 5, title: "Shor's Factoring Algorithm", difficulty: 'Advanced' },
      { id: 6, title: 'Bernstein-Vazirani Algorithm', difficulty: 'Intermediate' },
      { id: 7, title: "Simon's Algorithm", difficulty: 'Advanced' },
    ],
  },
  {
    trackName: 'Quantum Teleportation',
    trackSlug: 'quantum-teleportation-protocols',
    icon: '🌀',
    labs: [
      { id: 2, title: 'Teleportation Protocol', difficulty: 'Advanced' },
      { id: 3, title: 'Superdense Coding', difficulty: 'Intermediate' },
    ],
  },
] as const;

const DIFFICULTY_TONE = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
} as const;

export default function LabsPage() {
  const totalLabs = LABS_BY_TRACK.reduce(
    (sum, track) => sum + track.labs.length,
    0,
  );

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Hands-on"
        title="Interactive labs"
        description={`${totalLabs} guided exercises where you write and run circuits yourself. Every lab executes against the QpiAI SDK.`}
        actions={
          <>
            <Link href="/labs/shell" className="quantum-btn">
              Open lab shell
            </Link>
            <Link
              href="/playground"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-4 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
            >
              Playground
            </Link>
          </>
        }
      />

      <div className="mt-12 space-y-10">
        {LABS_BY_TRACK.map((track) => (
          <section key={track.trackSlug}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-overlay text-lg"
              >
                {track.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-mono text-base font-bold sm:text-lg">
                  {track.trackName}
                </h2>
                <p className="text-xs text-content-subtle">
                  {track.labs.length} labs
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {track.labs.map((lab) => (
                <Card
                  key={`${track.trackSlug}-${lab.id}`}
                  href={`/tracks/${track.trackSlug}/lessons/${lab.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs text-content-muted"
                    >
                      {lab.id}
                    </span>
                    <Badge tone={DIFFICULTY_TONE[lab.difficulty]}>
                      {lab.difficulty}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug">
                    {lab.title}
                  </h3>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-14 text-center">
        <h2 className="font-mono text-lg font-bold">
          Prefer a blank canvas?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-content-muted">
          The playground gives you an editor and a live SDK backend with no
          guardrails — write any circuit and inspect the statevector it produces.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/playground" className="quantum-btn">
            Open the playground
          </Link>
          <Link
            href="/algorithms"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            Browse algorithms
          </Link>
        </div>
      </Card>
    </Container>
  );
}
