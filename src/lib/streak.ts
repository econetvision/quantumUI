/**
 * Duolingo-style streak + XP system (client-side, localStorage-backed).
 * Works in demo mode without a database; mirrors the Prisma
 * UserProgress.currentStreak / longestStreak fields for later sync.
 */

export interface StreakData {
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  xp: number;
  xpToday: number;
  dailyGoal: number;
  completedQuestions: string[];
}

const STORAGE_KEY = 'quantumui-streak';
export const STREAK_EVENT = 'streak-updated';

const DEFAULT_DATA: StreakData = {
  streak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  xp: 0,
  xpToday: 0,
  dailyGoal: 50,
  completedQuestions: [],
};

/**
 * Local calendar date as YYYY-MM-DD.
 *
 * Deliberately not `toISOString().slice(0, 10)`, which is UTC. A learner in
 * IST (UTC+5:30) studying at 01:00 is still on the previous UTC day, so two
 * sessions the learner sees as consecutive nights landed on one UTC date and
 * the streak refused to advance — and a session either side of 05:30 IST could
 * skip a day and break it outright. The streak has to agree with the calendar
 * on the wall, whichever wall that is.
 */
function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function today(): string {
  return localDate(new Date());
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') return { ...DEFAULT_DATA };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const data = { ...DEFAULT_DATA, ...(JSON.parse(raw) as Partial<StreakData>) };
    // A missed day (not yesterday, not today) breaks the streak
    if (data.lastActiveDate && data.lastActiveDate !== today() && data.lastActiveDate !== yesterday()) {
      data.streak = 0;
    }
    // Reset daily XP on a new day
    if (data.lastActiveDate !== today()) {
      data.xpToday = 0;
    }
    return data;
  } catch {
    return { ...DEFAULT_DATA };
  }
}

/**
 * Push progress to the server for signed-in learners.
 *
 * localStorage remains the source of truth for the current device — it works
 * anonymously and offline. This mirrors it so progress survives a new browser,
 * which is the only reason to hold an account. Failures are ignored on purpose:
 * losing a sync must never interrupt a lesson, and the next save retries.
 */
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function syncToServer(data: StreakData) {
  if (typeof window === 'undefined') return;

  // Debounce: solving several questions in a row should produce one write, not
  // one per keystroke-triggered save.
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xp: data.xp,
        currentStreak: data.streak,
        longestStreak: data.longestStreak,
        completedQuestionIds: data.completedQuestions.slice(-500),
      }),
      keepalive: true,
    }).catch(() => {
      // Offline, signed out, or database down — all fine. The local copy stands.
    });
  }, 1_500);
}

function save(data: StreakData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(STREAK_EVENT, { detail: data }));
  syncToServer(data);
}

/**
 * Pull server-side progress back into localStorage, once per page load.
 *
 * The sync was one-way: POST /api/progress has been writing streak and XP to
 * the account since launch, and GET /api/progress has been able to return them
 * the whole time, but nothing ever called it. Signing in on a second browser
 * therefore showed a streak of 0 on top of a server record that still held the
 * real number — and because the server merges with Math.max, the account kept
 * a value the learner could no longer see.
 *
 * Merged rather than overwritten: whichever side is further along wins, so a
 * device that has been used offline is not rolled back by a stale account row.
 */
export async function hydrateFromServer(): Promise<StreakData | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) return null; // signed out, or the database is unavailable
    // The route nests the numbers under `progress`; reading them off the top
    // level yields undefined, and every Math.max below silently collapses to
    // the local value, which is exactly the no-op this function exists to fix.
    const payload = (await res.json()) as {
      signedIn?: boolean;
      progress?: { xp?: number; currentStreak?: number; longestStreak?: number };
    };
    if (!payload.signedIn || !payload.progress) return null;
    const remote = payload.progress;

    const local = getStreakData();
    const merged: StreakData = {
      ...local,
      xp: Math.max(local.xp, remote.xp ?? 0),
      streak: Math.max(local.streak, remote.currentStreak ?? 0),
      longestStreak: Math.max(
        local.longestStreak,
        remote.longestStreak ?? 0,
        local.streak,
        remote.currentStreak ?? 0,
      ),
    };

    // Nothing new — don't write, so we don't trigger a pointless sync back.
    if (
      merged.xp === local.xp &&
      merged.streak === local.streak &&
      merged.longestStreak === local.longestStreak
    ) {
      return local;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(STREAK_EVENT, { detail: merged }));
    return merged;
  } catch {
    return null; // offline — the local copy stands
  }
}

/** Record activity and award XP. Extends the streak on the first activity of each day. */
export function recordActivity(xpEarned: number): StreakData {
  const data = getStreakData();
  if (data.lastActiveDate !== today()) {
    data.streak = data.lastActiveDate === yesterday() ? data.streak + 1 : 1;
    data.longestStreak = Math.max(data.longestStreak, data.streak);
    data.lastActiveDate = today();
  }
  data.xp += xpEarned;
  data.xpToday += xpEarned;
  save(data);
  return data;
}

/** Mark a lab question as completed (idempotent) and award XP once. */
export function completeQuestion(questionId: string, xp: number): StreakData {
  const data = getStreakData();
  if (data.completedQuestions.includes(questionId)) return recordActivity(0);
  data.completedQuestions.push(questionId);
  save(data);
  return recordActivity(xp);
}

export function isQuestionCompleted(questionId: string): boolean {
  return getStreakData().completedQuestions.includes(questionId);
}

export const XP_REWARDS = { easy: 10, medium: 20, complex: 40, run: 2 } as const;
