'use client';

import Link from 'next/link';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { ModeToggle } from '@/components/learning/ModeToggle';
import { figureForSpec } from '@/components/physics-quiz/registry';
import { QuizRunner } from '@/components/physics-quiz/QuizRunner';
import type { FoundationLesson } from '@/lib/foundations-types';
import type { SyllabusModule, SyllabusTopic } from '@/lib/foundations-syllabus';
import type { PhysicsMCQ } from '@/lib/physics-mcq';

/**
 * One syllabus topic, read at one of three tiers.
 *
 * No fallback between tiers: the mode picks the text written for that
 * audience and nothing else. Track 0 layers depth; here a child and an
 * engineer are reading different pages that happen to share a figure and
 * a quiz — which is the point of the figure and the quiz being computed
 * rather than written, since they are the one thing all three can trust in
 * common.
 */
export function FoundationLessonView({
  module,
  topic,
  lesson,
  questions,
  mathHtml,
  previous,
  next,
}: {
  module: SyllabusModule;
  topic: SyllabusTopic;
  lesson?: FoundationLesson;
  questions: PhysicsMCQ[];
  /** tier -> rendered KaTeX, prepared on the server. */
  mathHtml: Record<string, string[]>;
  previous?: { href: string; title: string; id: string };
  next?: { href: string; title: string; id: string };
}) {
  const { mode } = useLearningMode();
  const tier = lesson?.[mode];
  const equations = mathHtml[mode] ?? [];

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/learn/foundations" className="font-mono text-sm text-accent hover:underline">
            ← Syllabus · {module.id} {module.title}
          </Link>
          <ModeToggle />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-content-subtle">
            Topic {topic.id}{lesson ? ` · ${lesson.minutes} min` : ''}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{topic.title}</h1>
        </div>
      </header>

      {lesson && tier ? (
        <>
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

          <section>
            <h2 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
              {mode === 'kid' ? 'Watch it happen' : 'Computed figure'}
            </h2>
            {figureForSpec(lesson.figure.animation, lesson.figure.params, mode !== 'kid')}
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-line p-5 text-sm text-content-muted">
          The lesson for this topic is being written. It will have a kid, a student and a
          professional reading, a figure computed from the physics, and questions below.
          {questions.length > 0 && ' The questions are ready now.'}
        </section>
      )}

      {questions.length > 0 && (
        <section>
          <h2 className="mb-1 font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
            Check yourself · {questions.length} question{questions.length === 1 ? '' : 's'}
          </h2>
          <p className="text-xs text-content-subtle">
            Each comes with an animated figure and a worked answer.
          </p>
          <QuizRunner questions={questions} />
        </section>
      )}

      <nav className="flex items-center justify-between gap-3 border-t border-line pt-5">
        {previous ? (
          <Link href={previous.href} className="text-sm text-accent hover:underline">
            ← {previous.id} {previous.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={next.href} className="quantum-btn">
            {next.id} {next.title} →
          </Link>
        ) : (
          <Link href="/tracks" className="quantum-btn">Explore the full curriculum →</Link>
        )}
      </nav>
    </article>
  );
}
