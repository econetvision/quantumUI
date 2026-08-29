'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/primitives';
import {
  completedLessonCount,
  hydrateLessonProgress,
  useLessonProgressVersion,
} from '@/lib/lesson-progress';

/**
 * "Claim your certificate" card on a track's detail page.
 *
 * Appears once every lesson of the track is complete locally; the claim
 * itself is re-verified server-side against synced LessonProgress rows, so a
 * signed-out learner (or one whose completions have not synced yet) gets a
 * clear message rather than a certificate.
 */
export function CertificateClaim({
  slug,
  trackTitle,
  lessonCount,
}: {
  slug: string;
  trackTitle: string;
  lessonCount: number;
}) {
  const version = useLessonProgressVersion();
  const [state, setState] = useState<
    | { phase: 'idle' }
    | { phase: 'claiming' }
    | { phase: 'done'; url: string }
    | { phase: 'error'; message: string }
  >({ phase: 'idle' });

  useEffect(() => {
    void hydrateLessonProgress();
  }, []);

  const completed = version !== null ? completedLessonCount(slug) : 0;
  if (lessonCount === 0 || completed < lessonCount) return null;

  const claim = async () => {
    setState({ phase: 'claiming' });
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackSlug: slug }),
      });
      const payload = (await res.json()) as { url?: string; error?: string };
      if (res.ok && payload.url) {
        setState({ phase: 'done', url: payload.url });
      } else {
        setState({
          phase: 'error',
          message: payload.error ?? 'Could not issue the certificate. Try again.',
        });
      }
    } catch {
      setState({ phase: 'error', message: 'Network error — try again.' });
    }
  };

  return (
    <Card className="mt-8 border-accent/40 text-center">
      <div aria-hidden="true" className="text-4xl">
        🏆
      </div>
      <h2 className="mt-3 font-mono text-lg font-bold">
        You completed {trackTitle}!
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
        All {lessonCount} lessons done. Claim your certificate of completion —
        we&apos;ll also email it to you.
      </p>

      {state.phase === 'done' ? (
        <Link href={state.url} className="quantum-btn mt-5">
          View your certificate →
        </Link>
      ) : (
        <button
          type="button"
          onClick={claim}
          disabled={state.phase === 'claiming'}
          className="quantum-btn mt-5 disabled:opacity-60"
        >
          {state.phase === 'claiming' ? 'Issuing…' : 'Claim certificate'}
        </button>
      )}

      {state.phase === 'error' && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}
    </Card>
  );
}
