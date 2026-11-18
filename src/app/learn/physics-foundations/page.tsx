import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/ui/primitives';
import { QuizRunner } from '@/components/physics-quiz/QuizRunner';
import { CONSTANTS_NOTE, questionsForLevel } from '@/lib/physics-mcq';

export const metadata: Metadata = {
  title: 'Quantum Physics Foundations — Level 2',
  description:
    'Twenty-five mixed questions on maths, classical physics and early quantum theory, each with a figure computed from the physics it illustrates.',
  alternates: { canonical: '/learn/physics-foundations' },
};

/**
 * Level 2 of the foundations bank.
 *
 * Public, like Track 0: this is the on-ramp for someone who has not decided
 * whether to make an account, and a sign-in form in front of question 26 would
 * lose exactly the reader it is written for.
 */
export default function PhysicsFoundationsPage() {
  const questions = questionsForLevel(2);

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Quantum Physics Foundations"
        title="Level 2 — mixed questions"
        description="Twenty-five questions spanning scientific notation to quantum numbers. Every figure is plotted from the physics it illustrates, so the numbers in the walkthrough and the shape of the curve come from the same calculation."
      />

      <QuizRunner questions={questions} />

      <p className="mt-10 border-t border-line pt-4 font-mono text-xs text-content-subtle">
        Constants used: {CONSTANTS_NOTE} Animations loop; they hold still if your
        device prefers reduced motion.
      </p>
    </Container>
  );
}
