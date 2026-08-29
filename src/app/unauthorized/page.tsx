import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, EmptyState } from '@/components/ui/primitives';

export const metadata: Metadata = {
  // Session-gated: nothing here is useful in a search result, and the lab shell
  // spends executor capacity on anything that loads it.
  robots: { index: false, follow: false },
  title: 'Access denied',
};

export default function UnauthorizedPage() {
  return (
    <Container size="narrow" className="py-20">
      <EmptyState
        title="Access denied"
        description="You don't have permission to view this page. If you think that's wrong, check which account you're signed in with."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/tracks" className="quantum-btn">
              Browse tracks
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
            >
              Go home
            </Link>
          </div>
        }
      />
    </Container>
  );
}
