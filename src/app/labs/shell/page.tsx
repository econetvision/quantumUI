import type { Metadata } from 'next';
import LabShell from '@/components/LabShell';
import StreakBadge from '@/components/StreakBadge';
import { Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  // Session-gated: nothing here is useful in a search result, and the lab shell
  // spends executor capacity on anything that loads it.
  robots: { index: false, follow: false },
  title: 'Lab Shell',
  description:
    'A live Python REPL running the QpiAI local statevector simulator, paired with QWorld lab questions.',
};

export default function LabShellPage() {
  return (
    <Container size="wide" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="REPL"
        title="Lab shell"
        description="A live Python shell on the QpiAI local statevector simulator. Variables persist between runs, so you can build a circuit up step by step. Pick a QWorld lab question and solve it here."
        actions={<StreakBadge />}
      />

      <div className="mt-10">
        <LabShell />
      </div>
    </Container>
  );
}
