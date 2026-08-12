import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';
import StreakBadge from '@/components/StreakBadge';
import { Badge, Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description:
    'Track student progress, assign tracks and lab question sets, and monitor streaks and XP.',
};

export default function AdminPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Instructor tools"
        title="Admin dashboard"
        description="Track student progress, assign tracks and lab question sets, and monitor streaks and XP. Demo mode reads local data; it switches to the Assignment model once the database is reachable."
        actions={
          <div className="flex items-center gap-2">
            <StreakBadge />
            <Badge tone="accent">Demo mode</Badge>
          </div>
        }
      />

      <div className="mt-10">
        <AdminDashboard />
      </div>
    </Container>
  );
}
