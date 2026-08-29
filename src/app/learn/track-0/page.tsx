import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Container, PageHeader } from '@/components/ui/primitives';
import { TRACK0_LESSONS } from '@/lib/track0-lessons';

export const metadata: Metadata = {
  title: 'Quantum for Everyone · QuantumUI',
  description: 'Quantum computing explained so an eight-year-old can follow it — with the full maths one toggle away.',
};

export default function Track0Index() {
  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Track 0 · Free, no account needed"
        title="Quantum for Everyone"
        description="Start with a light switch and a spinning coin. Switch to Student or Pro at any time to see the same idea in Dirac notation, or what it costs on real hardware."
      />
      <ol className="mt-8 space-y-3">
        {TRACK0_LESSONS.map((l) => (
          <li key={l.slug}>
            <Link href={`/learn/track-0/${l.slug}`} className="block">
              <Card className="transition-colors hover:border-accent">
                <div className="flex items-start gap-4">
                  <span aria-hidden="true" className="text-3xl">{l.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs uppercase tracking-wider text-content-subtle">
                      Lesson {l.order} · {l.minutes} min
                    </p>
                    <h2 className="mt-0.5 font-bold text-content">{l.title}</h2>
                    <p className="mt-1 text-sm text-content-muted">{l.tagline}</p>
                  </div>
                  <span aria-hidden="true" className="text-accent">→</span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-content-muted">
        More lessons are on the way — gates, entanglement, measurement and the Bloch sphere.
      </p>
    </Container>
  );
}
