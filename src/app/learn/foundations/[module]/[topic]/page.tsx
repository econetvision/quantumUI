import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import katex from 'katex';
import { Container } from '@/components/ui/primitives';
import { FoundationLessonView } from '@/components/foundations/FoundationLessonView';
import { getLessonForTopic } from '@/lib/foundations-lessons';
import {
  SYLLABUS,
  findTopicBySlugs,
  questionIdsForTopic,
  topicNeighbours,
} from '@/lib/foundations-syllabus';
import { getAnyQuestion } from '@/lib/foundations-mcq';

type Params = Promise<{ module: string; topic: string }>;

/** Every row of the syllabus has a page, lesson written or not. */
export function generateStaticParams() {
  return SYLLABUS.flatMap((m) => m.topics.map((t) => ({ module: m.slug, topic: t.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { module: m, topic: t } = await params;
  const hit = findTopicBySlugs(m, t);
  if (!hit) return { title: 'Foundations · QuantumUI' };
  return {
    title: `${hit.topic.id} ${hit.topic.title} · ${hit.module.title}`,
    description: `${hit.topic.title}, taught three ways — kid, student and professional — with a figure computed from the physics.`,
  };
}

const MACROS = {
  '\\ket': '\\left|#1\\right\\rangle',
  '\\bra': '\\left\\langle#1\\right|',
  '\\braket': '\\left\\langle#1\\middle|#2\\right\\rangle',
};

/**
 * KaTeX runs here, on the server, so the engine never ships to the browser.
 * All three tiers are rendered up front: switching mode must be instant.
 */
export default async function FoundationTopicPage({ params }: { params: Params }) {
  const { module: m, topic: t } = await params;
  const hit = findTopicBySlugs(m, t);
  if (!hit) notFound();

  const lesson = getLessonForTopic(hit.topic.id);
  const mathHtml: Record<string, string[]> = {};
  if (lesson) {
    for (const key of ['kid', 'student', 'professional'] as const) {
      const math = lesson[key].math;
      if (!math) continue;
      mathHtml[key] = math.map((src) =>
        katex.renderToString(src, { displayMode: true, throwOnError: false, strict: false, macros: MACROS }),
      );
    }
  }

  const questions = questionIdsForTopic(hit.topic.id)
    .map((id) => getAnyQuestion(id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined);
  const { previous, next } = topicNeighbours(hit.topic.id);

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <FoundationLessonView
        module={hit.module}
        topic={hit.topic}
        lesson={lesson}
        questions={questions}
        mathHtml={mathHtml}
        previous={previous && { href: previous.href, title: previous.topic.title, id: previous.topic.id }}
        next={next && { href: next.href, title: next.topic.title, id: next.topic.id }}
      />
    </Container>
  );
}
