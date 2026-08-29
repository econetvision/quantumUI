import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/ui/primitives';
import { AlgorithmGallery } from '@/components/quantum/AlgorithmGallery';

export const metadata: Metadata = {
  // Stated explicitly so a link arriving with tracking parameters
  // (?utm_source=..., ?ref=...) consolidates onto one indexable URL instead of
  // splitting this page's ranking across every variant that ever gets shared.
  alternates: { canonical: '/algorithms' },
  title: 'Algorithm Gallery',
  description:
    "Run Grover's search, Shor's factoring, QFT, phase estimation and more on the QpiAI Quantum SDK, with live measurement statistics and Bloch vectors.",
};

export default function AlgorithmsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="QpiAI Quantum SDK"
        title="Algorithm gallery"
        description="Every algorithm here is executed by the SDK, not simulated in the browser. Change the parameters, run it, and read the measurement statistics that come back."
      />

      <div className="mt-10">
        <AlgorithmGallery />
      </div>
    </Container>
  );
}
