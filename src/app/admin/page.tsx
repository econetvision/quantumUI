import type { Metadata } from 'next';
import Link from 'next/link';
import AdminDashboard from '@/components/AdminDashboard';
import StreakBadge from '@/components/StreakBadge';
import { Badge, Container, PageHeader } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description:
    'Track student progress, assign tracks and lab question sets, and monitor streaks and XP.',
  // Instructor tooling: nothing here should ever appear in a search result.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Instructor tools"
        title="Admin dashboard"
        description="Track student progress, assign tracks and lab question sets, and monitor streaks and XP. Demo mode reads local data; it switches to the Assignment model once the database is reachable."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 font-mono text-xs text-content-muted transition-colors hover:border-line-strong hover:text-content"
            >
              Site analytics →
            </Link>
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
