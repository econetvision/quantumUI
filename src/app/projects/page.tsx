import type { Metadata } from 'next';
import ProjectsWorkspace from '@/components/ProjectsWorkspace';
import StreakBadge from '@/components/StreakBadge';
import { Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Quantum Projects',
  description:
    'Build and execute quantum circuits on the local statevector simulator, then deploy to QpiAI cloud simulators or the Indus-1 QPU.',
};

export default function ProjectsPage() {
  return (
    <Container size="wide" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Workspace"
        title="Quantum projects"
        description="Compose circuits and run them on the local QpiAI statevector simulator. With an API key configured you can also target the cloud simulators or the Indus-1 QPU."
        actions={<StreakBadge />}
      />

      <div className="mt-10">
        <ProjectsWorkspace />
      </div>
    </Container>
  );
}
