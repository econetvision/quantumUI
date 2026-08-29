'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, EmptyState } from '@/components/ui/primitives';
import { SUPPORT_EMAIL, supportMailto } from '@/lib/site';

/**
 * Fallback UI for an unhandled error anywhere below the root layout.
 *
 * Two details make the difference between a report we can act on and "the site
 * broke":
 *
 *  - `error.digest` is the only handle on the real error. In production the
 *    message is replaced with a generic one so server internals do not reach
 *    the browser; the digest is what matches the entry in the server logs. It
 *    is shown on the page and prefilled into the mail, because a user will not
 *    retype a hash they were merely shown.
 *  - The path is prefilled too — "it crashed" without a URL is unreproducible.
 *
 * `unstable_retry` rather than `reset`: as of Next 16.2 it re-fetches and
 * re-renders the segment, where `reset` only clears the boundary's state and
 * replays the same failed render.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Surfaces in the browser console and in Vercel's client logs; the server
    // side of the same failure is already recorded against the digest.
    console.error('[quantumui] unhandled error:', error);
  }, [error]);

  return (
    <Container size="narrow" className="py-20">
      <EmptyState
        title="Something went wrong"
        description={
          <>
            This page failed to load. Trying again often works — the cause is
            frequently a request that timed out.
            <span className="mt-3 block">
              If it keeps happening, send us this page and we will look into it:{' '}
              <a
                href={supportMailto({
                  subject: 'QuantumUI — error report',
                  body: [
                    'What I was doing:',
                    '',
                    `Page: ${pathname}`,
                    `Reference: ${error.digest ?? 'none'}`,
                  ].join('\n'),
                })}
                className="underline underline-offset-4 transition-colors hover:text-accent"
              >
                {SUPPORT_EMAIL}
              </a>
            </span>
            {error.digest && (
              <span className="mt-3 block font-mono text-xs text-content-subtle">
                Reference: {error.digest}
              </span>
            )}
          </>
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => unstable_retry()} className="quantum-btn">
              Try again
            </button>
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
