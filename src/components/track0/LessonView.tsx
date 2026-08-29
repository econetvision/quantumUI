'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics-client';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { ModeToggle } from '@/components/learning/ModeToggle';
import type { LessonTier, Track0Lesson } from '@/lib/track0-lessons';
import { BinaryNameTag } from './BinaryNameTag';
import { MiniQuiz } from './MiniQuiz';
import { SortingGame } from './SortingGame';
import { SpinningCoinQubit } from './SpinningCoinQubit';

/**
 * Mode-aware lesson shell.
 *
 * Tiers fall back down the chain, so a lesson that has no professional layer
 * still shows the student one rather than an empty page — depth is cumulative,
 * not three parallel rewrites.
 *
 * The maths is passed in as pre-rendered HTML from the server, where KaTeX
 * runs. Keeping the engine server-side means this client component costs
 * nothing extra to ship.
 */
export function LessonView({
  lesson,
  mathHtml,
  previous,
  next,
}: {
  lesson: Track0Lesson;
  /** tier -> index -> rendered KaTeX */
  mathHtml: Record<string, string[]>;
  previous?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  const { mode } = useLearningMode();

  const tier: LessonTier =
    (mode === 'professional' && lesson.professional) ||
    (mode !== 'kid' && lesson.student) ||
    lesson.kid;
  const tierKey =
    tier === lesson.professional ? 'professional' : tier === lesson.student ? 'student' : 'kid';
  const equations = mathHtml[tierKey] ?? [];

  /*
   * Which lesson, and which tier it was read at.
   *
   * AnalyticsTracker already records a page view for this route, but a page
   * view cannot answer the two questions Track 0 exists to answer: how far
   * along the sequence people get before they stop, and whether anybody moves
   * up from the kid tier once they are here. `lesson.order` makes the first a
   * single grouped query; `tierKey` makes the second one.
   *
   * Keyed on both so switching mode mid-lesson records the new tier — that is
   * the moment worth counting, not just the arrival.
   */
  useEffect(() => {
    trackEvent('lesson_open', {
      path: `/learn/track-0/${lesson.slug}`,
      meta: { track: 'track-0', lesson: lesson.slug, order: lesson.order, tier: tierKey },
    });
  }, [lesson.slug, lesson.order, tierKey]);

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/learn/track-0" className="font-mono text-sm text-accent hover:underline">
            ← Quantum for Everyone
          </Link>
          <ModeToggle />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-content-subtle">
            Lesson {lesson.order} · {lesson.minutes} min
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            <span aria-hidden="true">{lesson.emoji}</span> {lesson.title}
          </h1>
          <p className="mt-1 text-content-muted">{lesson.tagline}</p>
        </div>
      </header>

      <section className="rounded-xl border border-line bg-surface-raised p-5">
        <p className="text-[1.05rem] leading-relaxed text-content">{tier.intro}</p>
        <ul className="mt-4 space-y-2">
          {tier.points.map((p, i) => (
            <li key={i} className="flex gap-2 text-content-muted">
              <span aria-hidden="true" className="text-accent">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {equations.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            {equations.map((html, i) => (
              <div key={i} className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>
        )}
      </section>

      {lesson.interactive !== 'none' && (
        <section>
          <h2 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
            {mode === 'kid' ? 'Try it' : 'Interactive'}
          </h2>
          {lesson.interactive === 'binary-name-tag' && <BinaryNameTag />}
          {lesson.interactive === 'spinning-coin' && <SpinningCoinQubit />}
          {lesson.interactive === 'sorting-game' && <SortingGame />}
        </section>
      )}

      <MiniQuiz questions={lesson.quiz} lessonSlug={lesson.slug} />

      {mode !== 'kid' && lesson.bridge && (
        <Link
          href={lesson.bridge.href}
          className="block rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm hover:border-accent"
        >
          <span className="font-medium text-content">{lesson.bridge.label} →</span>
          <span className="mt-0.5 block text-content-muted">
            Run this on real hardware-grade simulation in the full curriculum.
          </span>
        </Link>
      )}

      <nav className="flex items-center justify-between gap-3 border-t border-line pt-5">
        {previous ? (
          <Link href={`/learn/track-0/${previous.slug}`} className="text-sm text-accent hover:underline">
            ← {previous.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/learn/track-0/${next.slug}`} className="quantum-btn">
            {next.title} →
          </Link>
        ) : (
          <Link href="/tracks" className="quantum-btn">Explore the full curriculum →</Link>
        )}
      </nav>
    </article>
  );
}
