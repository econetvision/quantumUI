import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader } from '@/components/ui/primitives';
import { QuizRunner } from '@/components/physics-quiz/QuizRunner';
import { CONSTANTS_NOTE, questionsForLevel } from '@/lib/physics-mcq';

/**
 * The four levels of the foundations bank, in the order a learner meets them.
 *
 * The descriptions say who each level is for rather than what it contains,
 * because that is the question a visitor is actually asking when they pick.
 */
const LEVELS = [
  {
    level: 1,
    name: 'Level 1 — first look',
    audience: 'No physics assumed. Scientific notation, waves, the first quantum ideas as pictures.',
  },
  {
    level: 2,
    name: 'Level 2 — school physics',
    audience: 'Comfortable with sin, slopes and powers of ten. Photoelectric effect and Bohr levels with numbers.',
  },
  {
    level: 3,
    name: 'Level 3 — calculating',
    audience: 'Stopping potentials, de Broglie wavelengths, matrices on state vectors, orbital counting.',
  },
  {
    level: 4,
    name: 'Level 4 — reasoning',
    audience: 'Two-step problems, amplitudes that cancel, and spotting the one rule a quantum number breaks.',
  },
] as const;

type Level = (typeof LEVELS)[number]['level'];

function parseLevel(raw: string | undefined): Level {
  const n = Number(raw);
  return n === 2 || n === 3 || n === 4 ? n : 1;
}

type Props = { searchParams: Promise<{ level?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const level = parseLevel((await searchParams).level);
  const meta = LEVELS[level - 1];
  return {
    title: `Quantum Physics Foundations — ${meta.name}`,
    description: `Twenty-five mixed questions on maths, classical physics and early quantum theory. ${meta.audience} Every figure is computed from the physics it illustrates.`,
    alternates: { canonical: '/learn/physics-foundations' },
  };
}

/**
 * Public, like Track 0: this is the on-ramp for someone who has not decided
 * whether to make an account, and a sign-in form in front of question 1 would
 * lose exactly the reader it is written for.
 *
 * The level is a query parameter rather than a route segment so the four sets
 * share one page, one canonical URL and one set of components; `key` on the
 * runner resets its progress when the level changes.
 */
export default async function PhysicsFoundationsPage({ searchParams }: Props) {
  const level = parseLevel((await searchParams).level);
  const current = LEVELS[level - 1];
  const questions = questionsForLevel(level);

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Quantum Physics Foundations"
        title={current.name}
        description={`${current.audience} Every figure is plotted from the physics it illustrates, so the numbers in the walkthrough and the shape of the curve come from the same calculation.`}
      />

      <p className="mt-4 text-sm text-content-muted">
        These questions assess the{' '}
        <Link href="/learn/foundations" className="text-accent hover:underline">
          Quantum Physics Foundations syllabus
        </Link>
        ; each lesson there lists the questions that belong to it.
      </p>

      <nav aria-label="Level" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LEVELS.map((l) => {
          const active = l.level === level;
          return (
            <Link
              key={l.level}
              href={l.level === 1 ? '/learn/physics-foundations' : `/learn/physics-foundations?level=${l.level}`}
              aria-current={active ? 'page' : undefined}
              className={`min-h-11 rounded-lg border px-3 py-2 text-center font-mono text-sm transition-colors ${
                active
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-line text-content-muted hover:border-accent hover:text-accent'
              }`}
            >
              Level {l.level}
            </Link>
          );
        })}
      </nav>

      <QuizRunner key={level} questions={questions} />

      <p className="mt-10 border-t border-line pt-4 font-mono text-xs text-content-subtle">
        Constants used: {CONSTANTS_NOTE} Animations loop; they hold still if your
        device prefers reduced motion.
      </p>
    </Container>
  );
}
