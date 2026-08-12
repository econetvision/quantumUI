'use client';

import dynamic from 'next/dynamic';
import { Card, Container, PageHeader } from '@/components/ui/primitives';

// Monaco pulls in a large editor bundle and touches `window`, so it is loaded
// on the client only.
const QuantumCodePlayground = dynamic(
  () => import('@/components/QuantumCodePlayground'),
  {
    ssr: false,
    loading: () => (
      <p className="loading-quantum font-mono text-sm text-content-muted">
        Loading editor…
      </p>
    ),
  },
);

// The interactive θ/φ explorer previously lived on /interactive-demo; it is
// kept here so the redirect from that route loses nothing.
const BlochSphere = dynamic(() => import('@/components/BlochSphere2D'), {
  ssr: false,
});

export default function PlaygroundPage() {
  return (
    <Container size="wide" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Live execution"
        title="Quantum playground"
        description="Write a circuit and run it against the QpiAI Quantum SDK. You get the real statevector, real measurement counts and per-qubit Bloch vectors back."
      />

      <div className="mt-10">
        {/* The page header already says "Quantum playground"; name the widget
            for what it is so the title isn't printed twice. */}
        <QuantumCodePlayground title="Circuit editor" />
      </div>

      <section className="mt-14">
        <h2 className="font-mono text-lg font-bold">Bloch sphere explorer</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-content-muted">
          Drag θ and φ to move a single qubit around the sphere, or jump to the
          preset states. This one is driven by the angles you choose — the
          spheres above are computed from whatever your circuit actually
          produced.
        </p>
        <Card className="mt-5">
          <BlochSphere showControls />
        </Card>
      </section>
    </Container>
  );
}
