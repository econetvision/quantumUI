import { getAllLessons } from '@/lib/lesson-loader';

/**
 * Which track's lessons unlock which bank of labs.
 *
 * Every entry is the identity, because the lab topic slugs are named after the
 * track they belong to. That is the point of keeping the constant: it states
 * the rule — a lab bank is opened by the track of the same name — and names the
 * two exceptions, rather than encoding a translation somebody has to maintain.
 *
 * It used to be a real translation. Four banks were named differently from
 * their track (`error-correction` against `quantum-error-correction`,
 * `qiskit-sdk` against `qiskit-sdk-deep-dive`, and two more), and the cost was
 * not hypothetical: src/app/labs/page.tsx still carried a comment recording
 * that two of those slugs had been used as track slugs and 404'd. Anything
 * joining the two lists by name found nothing for those four and would have
 * locked their labs permanently.
 *
 * `null` means no track teaches this topic. Those banks are open to any
 * signed-in learner, because gating them behind lessons that do not exist would
 * lock them forever.
 *
 * Keep this exhaustive. lab-access.test.ts fails when a bank in the question
 * file is missing here or names a track that does not exist, so a new bank
 * cannot ship silently ungated.
 */
export const LAB_TOPIC_TRACK: Record<string, string | null> = {
  'quantum-fundamentals': 'quantum-fundamentals',
  'quantum-gates': 'quantum-gates',
  'quantum-entanglement': 'quantum-entanglement',
  'quantum-algorithms': 'quantum-algorithms',
  'quantum-machine-learning': 'quantum-machine-learning',
  'variational-quantum-algorithms': 'variational-quantum-algorithms',
  'quantum-error-correction': 'quantum-error-correction',
  'qiskit-sdk-deep-dive': 'qiskit-sdk-deep-dive',
  'quantum-cryptography-qkd': 'quantum-cryptography-qkd',
  'quantum-teleportation-protocols': 'quantum-teleportation-protocols',

  // No track covers either SDK, so there is nothing to complete first.
  'cirq-sdk': null,
  'qpiai-sdk': null,
};

export interface TopicGate {
  topicSlug: string;
  /** Track whose lessons unlock it, or null when nothing gates it. */
  trackSlug: string | null;
  /** Lessons in that track. 0 when ungated. */
  lessonsTotal: number;
  /** How many of them this learner has finished. */
  lessonsDone: number;
  unlocked: boolean;
}

/**
 * Decide whether a signed-in learner may open one bank of labs.
 *
 * Deliberately not "how far through the curriculum are you" — a learner picks
 * whichever topic they like and finishes that track's lessons to open its labs.
 * Tracks are independent, so completing lesson 1 of every track unlocks
 * nothing, and finishing one track unlocks exactly that track's labs.
 *
 * `completedByTrack` is the learner's own completions, keyed by track slug.
 */
export function gateForTopic(
  topicSlug: string,
  completedByTrack: Record<string, number[]>,
): TopicGate {
  const trackSlug = LAB_TOPIC_TRACK[topicSlug] ?? null;

  if (!trackSlug) {
    return { topicSlug, trackSlug: null, lessonsTotal: 0, lessonsDone: 0, unlocked: true };
  }

  const lessons = getAllLessons(trackSlug);
  const lessonIds = new Set(lessons.map((l) => l.id));

  // A track whose lessons are still an outline cannot gate anything: there is
  // nothing to complete, so requiring completion would lock it forever.
  if (lessonIds.size === 0) {
    return { topicSlug, trackSlug, lessonsTotal: 0, lessonsDone: 0, unlocked: true };
  }

  // Count only completions that still correspond to a lesson that exists.
  // Rows can outlive a renumbering, and stale ids must not unlock anything.
  const done = (completedByTrack[trackSlug] ?? []).filter((id) => lessonIds.has(id));
  const lessonsDone = new Set(done).size;

  return {
    topicSlug,
    trackSlug,
    lessonsTotal: lessonIds.size,
    lessonsDone,
    unlocked: lessonsDone >= lessonIds.size,
  };
}

/** Human sentence for a locked bank, e.g. on a disabled card. */
export function lockReason(gate: TopicGate, trackTitle?: string): string | null {
  if (gate.unlocked) return null;
  const remaining = gate.lessonsTotal - gate.lessonsDone;
  const name = trackTitle ?? gate.trackSlug ?? 'this track';
  return `Finish ${remaining} more ${remaining === 1 ? 'lesson' : 'lessons'} in ${name} to open these labs (${gate.lessonsDone}/${gate.lessonsTotal} done).`;
}
