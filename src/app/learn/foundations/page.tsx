import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Container, PageHeader } from '@/components/ui/primitives';
import { hasLesson, FOUNDATION_LESSONS } from '@/lib/foundations-lessons';
import { ALL_TOPICS, SYLLABUS, questionIdsForTopic, topicPath } from '@/lib/foundations-syllabus';
import { FOUNDATION_MCQS } from '@/lib/foundations-mcq';

export const metadata: Metadata = {
  title: 'Quantum Physics Foundations — the syllabus',
  description:
    'Nine modules and 106 topics from scientific notation to quantum advantage, each taught for a kid, a student and a professional, with figures computed from the physics.',
  alternates: { canonical: '/learn/foundations' },
};

/**
 * The syllabus, as printed, with the state of each row.
 *
 * Every topic is listed whether or not its lesson exists yet. A learner can
 * see the whole road, and the gaps are a to-do list in public rather than a
 * silent omission — which is also how the author keeps us honest.
 */
export default function FoundationsIndexPage() {
  const lessons = FOUNDATION_LESSONS.length;
  const assessed = ALL_TOPICS.filter((t) => questionIdsForTopic(t.id).length > 0).length;
  const extra = FOUNDATION_MCQS.length;
  const parts = [...new Set(SYLLABUS.map((m) => m.part))];

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Quantum Physics Foundations"
        title="The syllabus"
        description={`Nine modules, ${ALL_TOPICS.length} topics, in the order the syllabus prints them. ${lessons} lessons written so far, ${assessed} topics with questions — the paper's hundred plus ${extra} written for the rest. Each lesson reads three ways — pick Kid, Student or Pro at the top of any page.`}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((level) => (
          <Link
            key={level}
            href={level === 1 ? '/learn/physics-foundations' : `/learn/physics-foundations?level=${level}`}
            className="rounded-lg border border-line px-3 py-2 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
          >
            Quiz · Level {level}
          </Link>
        ))}
      </div>

      {parts.map((part) => {
        const modules = SYLLABUS.filter((m) => m.part === part);
        return (
          <section key={part} className="mt-10">
            <h2 className="text-xl font-bold">{part}</h2>
            <p className="mt-1 text-sm text-content-muted">{modules[0].partBlurb}</p>
            {modules.map((m) => (
              <div key={m.id} className="mt-5 overflow-hidden rounded-xl border border-line">
                <div className="flex items-baseline gap-3 border-b border-line bg-surface-raised px-4 py-3">
                  <span className="font-mono text-xs font-bold text-accent">{m.id}</span>
                  <h3 className="font-mono text-base font-bold">{m.title}</h3>
                </div>
                <ol>
                  {m.topics.map((t) => {
                    const nQ = questionIdsForTopic(t.id).length;
                    const ready = hasLesson(t.id);
                    return (
                      <li key={t.id} className="border-b border-line last:border-b-0">
                        <Link
                          href={topicPath(m.slug, t.slug)}
                          className="flex min-h-11 items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-surface-overlay"
                        >
                          <span className="w-8 shrink-0 font-mono text-xs text-content-subtle">{String(t.n).padStart(2, '0')}</span>
                          <span className="flex-1 text-content">{t.title}</span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            {ready && <Badge tone="accent">lesson</Badge>}
                            {nQ > 0 && <Badge tone="neutral">{nQ} Q</Badge>}
                            {!ready && nQ === 0 && <span className="font-mono text-[0.65rem] text-content-subtle">soon</span>}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </section>
        );
      })}
    </Container>
  );
}
