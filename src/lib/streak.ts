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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
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
