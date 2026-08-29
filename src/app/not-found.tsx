import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, EmptyState } from '@/components/ui/primitives';
import { SUPPORT_EMAIL, supportMailto } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Page not found',
};

/**
 * The root 404, which Next also serves for any URL that matches no route at
 * all — not only for an explicit `notFound()` call.
 *
 * Tracks and labs are offered rather than only "go home" because most 404s
 * here are a mistyped or renamed lesson URL, and the nearest useful page is
 * the index of the thing they were looking for.
 */
export default function NotFound() {
  return (
    <Container size="narrow" className="py-20">
      <EmptyState
        title="404 — page not found"
        description={
          <>
            That page does not exist. It may have been renamed, or the link that
            brought you here may be out of date.
            <span className="mt-3 block">
              If a link inside QuantumUI led you here, tell us where it was and
              we will fix it:{' '}
              <a
                href={supportMailto({
                  subject: 'QuantumUI — broken link (404)',
                  body: 'Which page linked here:',
                })}
                className="underline underline-offset-4 transition-colors hover:text-accent"
              >
                {SUPPORT_EMAIL}
              </a>
            </span>
          </>
        }
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
