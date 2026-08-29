'use client';

import Link from 'next/link';
import { isLessonComplete, markLessonComplete } from '@/lib/lesson-progress';
import { recordActivity } from '@/lib/streak';

const LESSON_COMPLETE_XP = 5;

/**
 * Prev / next lesson navigation.
 *
 * Pressing "Next" (or "Complete" on the last lesson) is what marks the current
 * lesson complete — the signal the sequential track unlock in
 * src/lib/lesson-progress.ts keys off. First completion also awards a little
 * XP so finishing a lesson counts as activity for the streak.
 */
export function LessonNav({
  slug,
  lessonNumber,
  lessonCount,
}: {
  slug: string;
  lessonNumber: number;
  lessonCount: number;
}) {
  const prevLesson = lessonNumber > 1 ? lessonNumber - 1 : null;
  const nextLesson = lessonNumber < lessonCount ? lessonNumber + 1 : null;

  const completeCurrent = () => {
    if (!isLessonComplete(slug, lessonNumber)) {
      markLessonComplete(slug, lessonNumber);
      recordActivity(LESSON_COMPLETE_XP);
    }
  };

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-10 grid gap-3 sm:grid-cols-3 sm:items-center"
    >
      {prevLesson !== null ? (
        <Link
          href={`/tracks/${slug}/lessons/${prevLesson}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
        >
          ← Previous
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      <Link
        href={`/tracks/${slug}`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 font-mono text-sm text-content-muted transition-colors hover:text-content"
      >
        Back to track
      </Link>

      <Link
        href={
          nextLesson !== null
            ? `/tracks/${slug}/lessons/${nextLesson}`
            : `/tracks/${slug}`
        }
        onClick={completeCurrent}
        className="quantum-btn"
      >
        {nextLesson !== null ? 'Complete & next →' : 'Complete track →'}
      </Link>
    </nav>
  );
}
