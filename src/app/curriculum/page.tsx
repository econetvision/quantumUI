import type { Metadata } from 'next';
import CurriculumPath from '@/components/CurriculumPath';
import StreakBadge from '@/components/StreakBadge';
import { Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  // Stated explicitly so a link arriving with tracking parameters
  // (?utm_source=..., ?ref=...) consolidates onto one indexable URL instead of
  // splitting this page's ranking across every variant that ever gets shared.
  alternates: { canonical: '/curriculum' },
  title: 'Curriculum',
  description:
    'A certification-aligned path from classical foundations to quantum algorithms, built from QWorld materials.',
};

export default function CurriculumPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Learning path"
        title="Zero to quantum champion"
        description="Eight levels from classical foundations to certification, each with hands-on labs drawn from QWorld's open course material."
        actions={<StreakBadge />}
      />

      <div className="mt-10">
        <CurriculumPath />
      </div>
    </Container>
  );
}
