import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import katex from 'katex';
import { Container } from '@/components/ui/primitives';
import { LessonView } from '@/components/track0/LessonView';
import { getLesson, lessonNeighbours, TRACK0_LESSONS } from '@/lib/track0-lessons';

export function generateStaticParams() {
  return TRACK0_LESSONS.map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lesson: string }> },
): Promise<Metadata> {
  const { lesson: slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: 'Lesson · QuantumUI' };
  return { title: `${lesson.title} · Quantum for Everyone`, description: lesson.tagline };
}

const MACROS = {
  '\\ket': '\\left|#1\\right\\rangle',
  '\\bra': '\\left\\langle#1\\right|',
  '\\braket': '\\left\\langle#1\\middle|#2\\right\\rangle',
};

/**
 * KaTeX runs here, on the server, so the 4.3MB engine never reaches the
 * browser — the client gets HTML plus the stylesheet. Every tier is rendered
 * up front because switching mode must be instant and must not need a fetch.
 */
export default async function Track0LessonPage(
  { params }: { params: Promise<{ lesson: string }> },
) {
  const { lesson: slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const mathHtml: Record<string, string[]> = {};
  for (const key of ['kid', 'student', 'professional'] as const) {
    const tier = lesson[key];
    if (!tier?.math) continue;
    mathHtml[key] = tier.math.map((src) =>
      katex.renderToString(src, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        macros: MACROS,
      }),
    );
  }

  const { previous, next } = lessonNeighbours(slug);

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <LessonView
        lesson={lesson}
        mathHtml={mathHtml}
        previous={previous && { slug: previous.slug, title: previous.title }}
        next={next && { slug: next.slug, title: next.title }}
      />
    </Container>
  );
}
