'use client';

import './globals.css';
import { SUPPORT_EMAIL, supportMailto } from '@/lib/site';

/**
 * Last-resort boundary: this renders only when the root layout itself threw,
 * which means the header, footer and every provider are gone — including the
 * footer's contact link. It is therefore the one page that most needs to name
 * the support address, and the one that cannot rely on anything else to do it.
 *
 * Per the Next.js file convention this file *replaces* the root layout, so it
 * supplies its own <html> and <body> and imports the global stylesheet. It does
 * not pull in next/font: the layout's font variables are not applied here and
 * a monospace fallback is the right trade for a page that must always render.
 *
 * The theme init script is likewise absent, so `:root` — the dark palette — is
 * what paints. That is the intended default rather than an accident.
 *
 * `metadata` is not supported in a Client Component, hence the <title> element.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 text-content">
        <title>Something went wrong — QuantumUI</title>
        <div className="w-full max-w-md rounded-xl border border-dashed border-line-strong p-8 text-center">
          <h1 className="font-mono text-base font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">
            QuantumUI failed to load. Trying again may be enough; if not, we
            would like to know.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-xs text-content-subtle">
              Reference: {error.digest}
            </p>
          )}

          <p className="mt-3 text-sm text-content-muted">
            <a
              href={supportMailto({
                subject: 'QuantumUI — site failed to load',
                body: [
                  'What I was doing:',
                  '',
                  'Page:',
                  `Reference: ${error.digest ?? 'none'}`,
                ].join('\n'),
              })}
              className="underline underline-offset-4 transition-colors hover:text-accent"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>

          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
