import Link from 'next/link';
import { Container, Section, Card, Badge, StatTile } from '@/components/ui/primitives';
import { TRACK_CONFIGS } from '@/lib/track-mapping';

const FEATURES = [
  {
    icon: '🔬',
    title: 'Run real circuits',
    href: '/playground',
    body: 'Write quantum code and execute it on the QpiAI statevector simulator — real amplitudes, real measurement statistics, no hand-waving.',
  },
  {
    icon: '🧮',
    title: 'Algorithm gallery',
    href: '/algorithms',
    body: "Grover, Shor, QFT, phase estimation, Deutsch-Jozsa and more — parameterise them and watch what actually comes back.",
  },
  {
    icon: '📚',
    title: '12 guided tracks',
    href: '/tracks',
    body: 'From qubits and superposition through error correction and variational algorithms, adapted from QWorld course material.',
  },
  {
    icon: '🧪',
    title: 'Hands-on labs',
    href: '/labs',
    body: 'Exercises pulled from QWorld notebooks, with a persistent REPL shell so your variables survive between cells.',
  },
  {
    icon: '🌐',
    title: 'Bloch visualisation',
    href: '/playground',
    body: 'Per-qubit Bloch vectors computed from the real statevector — entangled qubits correctly collapse toward the centre.',
  },
  {
    icon: '🎓',
    title: 'Certification prep',
    href: '/exam',
    body: 'Timed practice aligned to the IBM Qiskit Developer blueprint, with explanations for every answer.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="circuit-bg relative overflow-hidden border-b border-line">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-float inline-block font-mono text-5xl text-accent sm:text-7xl">
              |ψ⟩
            </div>

            <h1 className="animate-fade-up mt-6 text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Learn quantum computing by{' '}
              <span className="gradient-text">running it</span>
            </h1>

            <p className="animate-fade-up-1 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
              A full curriculum built on real execution. Every circuit you write
              runs on the QpiAI Quantum SDK and returns genuine statevectors and
              measurement counts — not canned animations.
            </p>

            {/* Both hero buttons used to lead into material that assumes you
                already know what a qubit is — /tracks opens on Dirac notation,
                and the playground on an empty circuit editor. For a first-time
                visitor with no background that is a closed door, so the primary
                action is now Track 0 and the secondary is the track index. The
                playground is a tool for people who already know what to type;
                it stays one click away in the nav. */}
            <div className="animate-fade-up-2 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/learn/track-0" className="quantum-btn w-full sm:w-auto">
                Start from zero
              </Link>
              <Link
                href="/tracks"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent sm:w-auto"
              >
                Browse the 12 tracks
              </Link>
            </div>

            <p className="mt-4 font-mono text-xs text-content-subtle">
              Free · No registration required · No physics background needed
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
            <StatTile value="12" label="Learning tracks" href="/tracks" />
            <StatTile value="143" label="Lab questions" href="/labs" />
            <StatTile value="12" label="SDK algorithms" href="/algorithms" />
          </div>
        </Container>
      </section>

      {/* Features */}
      <Section muted>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Everything runs against a real SDK
            </h2>
            <p className="mt-3 text-sm text-content-muted sm:text-base">
              The platform talks to a Python executor running the QpiAI Quantum
              SDK, so results reflect actual quantum simulation.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} href={feature.href} className="h-full">
                <div aria-hidden="true" className="text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mt-3 font-mono text-base font-bold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">
                  {feature.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Curriculum */}
      <Section>
        <Container size="narrow">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Zero to <span className="gradient-text">quantum</span>
            </h2>
            <p className="mt-3 text-sm text-content-muted sm:text-base">
              Twelve tracks, ordered so each one builds on the last.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {TRACK_CONFIGS.map((track, index) => (
              <Card key={track.slug} href={`/tracks/${track.slug}`} className="!p-4">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-bold text-accent"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-mono text-sm font-bold sm:text-base">
                      {track.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-content-muted sm:text-sm">
                      {track.description}
                    </p>
                  </div>
                  <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
                    {track.estimatedHours}h
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section muted>
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Start with a single qubit
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-content-muted sm:text-base">
            No account, no setup. Open the playground and run a Hadamard gate in
            the next thirty seconds.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/playground" className="quantum-btn w-full sm:w-auto">
              Open the playground
            </Link>
            <Link
              href="/tracks"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent sm:w-auto"
            >
              Browse all tracks
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
