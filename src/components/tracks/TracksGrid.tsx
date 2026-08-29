'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Card, Badge } from '@/components/ui/primitives';
import {
  hydrateLessonProgress,
  isTrackUnlocked,
  unlockRequirement,
  useLessonProgressVersion,
} from '@/lib/lesson-progress';

/**
 * The /tracks card grid with sequential unlocking.
 *
 * Client-side because unlock state lives in localStorage (and, for signed-in
 * learners, is hydrated from the server). Until mount every track renders in
 * its unlocked look — the page is server-rendered and localStorage does not
 * exist there — and locks are applied after hydration. Locked is soft-gating:
 * a nudge to follow the intended order, not an entitlement wall.
 */

export interface TrackCardData {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  labCount: number;
  estimatedHours: number;
  icon: string;
  tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

function TrackCard({
  track,
  index,
  locked,
  requiredTitle,
}: {
  track: TrackCardData;
  index: number;
  locked: boolean;
  requiredTitle: string | null;
}) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-overlay text-xl"
        >
          {locked ? '🔒' : track.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-content-subtle">
              #{index + 1}
            </span>
            <Badge tone={locked ? 'neutral' : track.tone}>
              {locked ? 'locked' : track.difficulty.toLowerCase()}
            </Badge>
          </div>
          <h2 className="mt-1 font-mono text-sm font-bold leading-tight">
            {track.title}
          </h2>
        </div>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-content-muted">
        {track.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-3 font-mono text-xs text-content-subtle">
        <span className="flex gap-3">
          <span>{track.labCount} labs</span>
          <span>{track.estimatedHours}h</span>
        </span>
        {locked ? (
          <span>🔒 Locked</span>
        ) : (
          <span className="text-accent">Start →</span>
        )}
      </div>
    </>
  );

  if (locked) {
    return (
      <Card as="div" className="flex h-full flex-col gap-3 opacity-60">
        {body}
        {requiredTitle && (
          <p className="rounded-lg bg-surface-overlay px-3 py-2 text-xs text-content-muted">
            Complete the first lesson of{' '}
            <span className="font-semibold text-content">{requiredTitle}</span>{' '}
            to unlock this track.
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card href={`/tracks/${track.slug}`} className="flex h-full flex-col gap-3">
      {body}
    </Card>
  );
}

export function TracksGrid({ tracks }: { tracks: TrackCardData[] }) {
  // Null during server render and hydration — everything renders unlocked so
  // the first client paint matches the server HTML; re-renders on progress.
  const version = useLessonProgressVersion();
  const ready = version !== null;

  useEffect(() => {
    void hydrateLessonProgress();
  }, []);

  const titleBySlug = new Map(tracks.map((track) => [track.slug, track.title]));

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track, index) => {
        const locked = ready && !isTrackUnlocked(track.slug);
        const required = unlockRequirement(track.slug);
        return (
          <TrackCard
            key={track.slug}
            track={track}
            index={index}
            locked={locked}
            requiredTitle={required ? (titleBySlug.get(required) ?? required) : null}
          />
        );
      })}
    </div>
  );
}

/**
 * Full-page gate for a locked track's detail and lesson pages.
 *
 * Wraps the server-rendered content; after mount, if the track is locked the
 * content is replaced by an explanation and a link to the track that unlocks
 * it. Before mount (and for crawlers) the real content renders — the lock is
 * a learning-order rail, not access control, and cloaking lesson text from
 * search engines would hurt the site for no security gain.
 */
export function TrackAccessGate({
  slug,
  trackTitle,
  children,
}: {
  slug: string;
  trackTitle: string;
  children: React.ReactNode;
}) {
  const version = useLessonProgressVersion();
  const ready = version !== null;

  useEffect(() => {
    void hydrateLessonProgress();
  }, []);

  if (!ready || isTrackUnlocked(slug)) return <>{children}</>;

  const required = unlockRequirement(slug);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
      <div aria-hidden="true" className="text-5xl">
        🔒
      </div>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        {trackTitle} is locked
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-content-muted">
        Tracks unlock in order so each one builds on the last. Complete the
        first lesson of the previous track and this one opens automatically.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {required && (
          <Link href={`/tracks/${required}/lessons/1`} className="quantum-btn">
            Go to the previous track →
          </Link>
        )}
        <Link
          href="/tracks"
          className="inline-flex min-h-11 items-center rounded-lg border border-line-strong px-5 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
        >
          All tracks
        </Link>
      </div>
    </div>
  );
}
