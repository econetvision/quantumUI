import type { Metadata } from 'next';
import Image from 'next/image';
import { Badge, Callout, Card, Container, PageHeader } from '@/components/ui/primitives';
import { PHYSICS_VISUALS } from '@/lib/physics-visuals';

export const metadata: Metadata = {
  title: 'Physics Visualisations',
  description:
    'Animated walkthroughs of quantum tunnelling, the uncertainty principle, double-slit interference and Grover amplitude amplification — each computed by solving the physics, not illustrated.',
};

export default function VisualsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Computed, not illustrated"
        title="Physics visualisations"
        description="Every animation here is produced by numerically solving the equation it depicts. If the physics changed, the picture would change with it — so you can measure a number off a frame and trust it."
      />

      <div className="mt-8">
        <Callout tone="accent" title="Why this matters">
          A drawing of a wavefunction can look convincing and still be wrong. These
          frames come from a split-step integration of the Schrödinger equation and
          from applying real Grover operators to a real amplitude vector. Each card
          states a quantity that was checked against the generated data.
        </Callout>
      </div>

      <div className="mt-10 space-y-8">
        {PHYSICS_VISUALS.map((visual) => (
          <Card key={visual.id} className="!p-4 sm:!p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-mono text-lg font-bold">{visual.title}</h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-content-muted">
                  {visual.summary}
                </p>
              </div>
              <Badge tone="success">verified</Badge>
            </div>

            <figure className="mt-5">
              <Image
                src={visual.src}
                alt={visual.alt}
                width={900}
                height={500}
                unoptimized
                className="w-full rounded-lg border border-line"
              />
            </figure>

            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                  Watch for
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-content-muted">
                  {visual.watchFor}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                  Checked
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-success">
                  {visual.verified}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                  Method
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-content-muted">
                  {visual.method}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-content-subtle">
        Regenerate at any resolution with{' '}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-code-text">
          python3 scripts/generate_physics_animations.py --width 1200
        </code>
      </p>
    </Container>
  );
}
