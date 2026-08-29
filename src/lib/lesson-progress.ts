/**
 * Per-lesson completion and sequential track unlocking.
 *
 * Follows the same shape as `streak.ts`: localStorage is the source of truth on
 * the device so anonymous learners are fully supported, and signed-in learners
 * mirror to the server (`/api/progress/lessons`) so progress survives a new
 * browser.
 *
 * Unlock rule: the first track is always open; every later track opens once the
 * learner has completed the FIRST lesson of the track before it. Completing a
 * lesson means pressing "Next" / "Complete" at the bottom of the lesson page.
 */

import { useSyncExternalStore } from 'react';

export const LESSON_PROGRESS_EVENT = 'lesson-progress-updated';

const STORAGE_KEY = 'quantumui-lesson-progress';

function subscribeToProgress(callback: () => void): () => void {
  window.addEventListener(LESSON_PROGRESS_EVENT, callback);
  // Another tab completing a lesson updates localStorage; 'storage' fires here.
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LESSON_PROGRESS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/**
 * The raw stored progress as a version string, or null during server render
 * and hydration. Null is the "not ready" state — treat everything as unlocked
 * so the client's first paint matches the server HTML. Strings compare by
 * value, so returning `getItem()` fresh each time is referentially stable for
 * useSyncExternalStore.
 */
export function useLessonProgressVersion(): string | null {
  return useSyncExternalStore(
    subscribeToProgress,
    () => window.localStorage.getItem(STORAGE_KEY) ?? '',
    () => null,
  );
}

/**
 * Track order for unlocking. Deliberately a plain list rather than an import
 * of TRACK_CONFIGS: that module pulls in `@prisma/client` for the difficulty
 * enum, which does not belong in a client bundle. Keep in step with
 * `src/lib/track-mapping.ts`.
 */
export const TRACK_UNLOCK_ORDER: string[] = [
  'quantum-fundamentals',
  'quantum-gates',
  'qiskit-sdk-deep-dive',
  'quantum-entanglement',
  'quantum-algorithms',
  'quantum-teleportation-protocols',
  'quantum-error-correction',
  'quantum-cryptography-qkd',
  'variational-quantum-algorithms',
  'quantum-machine-learning',
  'advanced-qiskit-topics',
  'ibm-cert-exam-prep',
];

export interface LessonProgressData {
  /** trackSlug -> completed lesson numbers (1-based). */
  completed: Record<string, number[]>;
}

const DEFAULT_DATA: LessonProgressData = { completed: {} };

export function getLessonProgress(): LessonProgressData {
  if (typeof window === 'undefined') return { completed: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {} };
    const parsed = JSON.parse(raw) as Partial<LessonProgressData>;
    return { completed: parsed.completed ?? {} };
  } catch {
    return { ...DEFAULT_DATA, completed: {} };
  }
}

function save(data: LessonProgressData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(LESSON_PROGRESS_EVENT, { detail: data }));
}

export function isLessonComplete(trackSlug: string, lessonId: number): boolean {
  return (getLessonProgress().completed[trackSlug] ?? []).includes(lessonId);
}

export function completedLessonCount(trackSlug: string): number {
  return (getLessonProgress().completed[trackSlug] ?? []).length;
}

/** Idempotent. Mirrors to the server for signed-in learners, best-effort. */
export function markLessonComplete(trackSlug: string, lessonId: number): void {
  if (typeof window === 'undefined') return;
  const data = getLessonProgress();
  const list = data.completed[trackSlug] ?? [];
  if (list.includes(lessonId)) return;
  data.completed[trackSlug] = [...list, lessonId].sort((a, b) => a - b);
  save(data);

  void fetch('/api/progress/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackSlug, lessonId }),
    keepalive: true,
  }).catch(() => {
    // Signed out or offline — the local copy stands.
  });
}

/**
 * The first track is open to everyone; each later one needs the first lesson
 * of its predecessor. A slug not in the ordering (never the case today) is
 * treated as open rather than permanently locked.
 */
export function isTrackUnlocked(trackSlug: string): boolean {
  const index = TRACK_UNLOCK_ORDER.indexOf(trackSlug);
  if (index <= 0) return true;
  return isLessonComplete(TRACK_UNLOCK_ORDER[index - 1], 1);
}

/** The track whose first lesson unlocks `trackSlug`, or null if none needed. */
export function unlockRequirement(trackSlug: string): string | null {
  const index = TRACK_UNLOCK_ORDER.indexOf(trackSlug);
  if (index <= 0) return null;
  return TRACK_UNLOCK_ORDER[index - 1];
}

/**
 * Two-way sync with the server, once per page load. Pulls server-side
 * completions into localStorage (union merge), then pushes any local
 * completions the server lacks — the case of a learner who worked through
 * lessons anonymously and signed in afterwards. Signed-out and offline are
 * both silent no-ops.
 */
let hydrated = false;

export async function hydrateLessonProgress(): Promise<LessonProgressData | null> {
  if (typeof window === 'undefined' || hydrated) return null;
  hydrated = true;
  try {
    const res = await fetch('/api/progress/lessons');
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      signedIn?: boolean;
      completed?: Record<string, number[]> | null;
    };
    if (!payload.signedIn) return null;
    const remote = payload.completed ?? {};

    const local = getLessonProgress();
    let changed = false;
    for (const [slug, ids] of Object.entries(remote)) {
      const merged = new Set([...(local.completed[slug] ?? []), ...ids]);
      if (merged.size !== (local.completed[slug] ?? []).length) changed = true;
      local.completed[slug] = [...merged].sort((a, b) => a - b);
    }
    if (changed) save(local);

    // Backfill: anything completed on this device before signing in.
    for (const [slug, ids] of Object.entries(local.completed)) {
      const remoteIds = new Set(remote[slug] ?? []);
      for (const lessonId of ids) {
        if (remoteIds.has(lessonId)) continue;
        void fetch('/api/progress/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackSlug: slug, lessonId }),
        }).catch(() => {});
      }
    }

    return local;
  } catch {
    return null;
  }
}
