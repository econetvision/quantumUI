import { getAllLessons } from '@/lib/lesson-loader';

/**
 * Which track's lessons unlock which bank of labs.
 *
 * The two lists were named independently and only six of the twelve slugs
 * happen to match, so the mapping is written out rather than inferred. An
 * inferred join would silently unlock nothing for the six that differ, which
 * is the kind of gate failure nobody notices until a learner is stuck.
 *
 * `null` means no track teaches this topic. Those banks are reachable by any
 * signed-in learner: gating them behind lessons that do not exist would lock
 * them permanently.
 */
export const LAB_TOPIC_TRACK: Record<string, string | null> = {
  'quantum-fundamentals': 'quantum-fundamentals',
  'quantum-gates': 'quantum-gates',
  'quantum-entanglement': 'quantum-entanglement',
  'quantum-algorithms': 'quantum-algorithms',
  'quantum-machine-learning': 'quantum-machine-learning',
  'variational-quantum-algorithms': 'variational-quantum-algorithms',
  'error-correction': 'quantum-error-correction',
  'qiskit-sdk': 'qiskit-sdk-deep-dive',
  'quantum-cryptography': 'quantum-cryptography-qkd',
  'quantum-teleportation': 'quantum-teleportation-protocols',
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
