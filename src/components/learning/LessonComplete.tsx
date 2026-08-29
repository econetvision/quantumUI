'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Progress {
  signedIn: boolean;
  completedByTrack: Record<string, number[]>;
}

/**
 * Marks a lesson finished, and says what that opened.
 *
 * The labs for a track unlock when every lesson in it is done, so this control
 * is the only way through that gate — which is why it reports the remaining
 * count rather than just toggling a tick. A learner who cannot see how many
 * lessons stand between them and the labs has no reason to believe the labs
 * will ever open.
 *
 * Completion is recorded server-side. localStorage carries the streak and is
 * fine for that, but it cannot hold an access decision: anyone can edit it.
 */
export function LessonComplete({
  trackSlug,
  lessonId,
  totalLessons,
  trackTitle,
}: {
  trackSlug: string;
  lessonId: number;
  totalLessons: number;
  trackTitle: string;
}) {
  const { status } = useSession();
  const [done, setDone] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    void fetch('/api/lessons/progress')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Progress | null) => {
        if (!cancelled && d?.signedIn) setDone(d.completedByTrack[trackSlug] ?? []);
      })
      .catch(() => {
        // Offline or the database is unavailable. The lesson still reads; only
        // the tick is unavailable, and the next save retries.
      });
    return () => {
      cancelled = true;
    };
  }, [status, trackSlug]);

  const complete = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackSlug, lessonId }),
      });
      if (res.ok) {
        const d = (await res.json()) as { unlockedTopics?: string[] };
        setDone((prev) => (prev?.includes(lessonId) ? prev : [...(prev ?? []), lessonId]));
        if (d.unlockedTopics?.length) setJustUnlocked(true);
      }
    } catch {
      // Same reasoning as above: a failed save must not interrupt the lesson.
    } finally {
      setSaving(false);
    }
  }, [trackSlug, lessonId]);

  if (status !== 'authenticated') return null;

  const isDone = done?.includes(lessonId) ?? false;
  const count = done?.length ?? 0;
  const remaining = Math.max(0, totalLessons - count);

  return (
    <div className="mt-8 rounded-xl border border-line bg-surface-raised p-5">
      {justUnlocked || (isDone && remaining === 0) ? (
        <div>
          <p className="font-mono text-sm font-bold text-success">
            ✓ {trackTitle} complete — the labs for this track are open.
          </p>
          <Link
            href="/labs"
            className="quantum-btn mt-3 inline-flex"
          >
            Open the labs
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-content">
              {isDone ? 'Lesson complete.' : 'Finished this lesson?'}
            </p>
            <p className="mt-0.5 font-mono text-xs text-content-subtle">
              {count}/{totalLessons} lessons done ·{' '}
              {remaining === 1
                ? '1 more opens the labs for this track'
                : `${remaining} more open the labs for this track`}
            </p>
          </div>
          <button
            type="button"
            onClick={complete}
            disabled={saving || isDone}
            className="quantum-btn disabled:opacity-50"
          >
            {isDone ? '✓ Completed' : saving ? 'Saving…' : 'Mark complete'}
          </button>
        </div>
      )}
    </div>
  );
}
