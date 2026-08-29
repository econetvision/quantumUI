/**
 * Learning-mode constants shared by server and client.
 *
 * No `'use client'` directive, for the same reason as the theme constants: the
 * key is interpolated into the pre-paint inline script rendered by the *server*
 * layout, and importing it from a client-only module makes Next substitute an
 * error stub for the value.
 */
export const LEARNING_PREFS_KEY = 'quantumui-learning';

export type LearningMode = 'kid' | 'student';

export interface LearningPreferences {
  /** Which layer of every lesson to show. */
  mode: LearningMode;
  soundOn: boolean;
  /** User override; the OS `prefers-reduced-motion` still wins when it is set. */
  reducedMotion: boolean;
  language: string;
  /** Body-text multiplier: 1 = A, 1.15 = A+, 1.3 = A++. */
  fontScale: number;
}

export const DEFAULT_PREFERENCES: LearningPreferences = {
  mode: 'kid',
  soundOn: true,
  reducedMotion: false,
  language: 'en',
  fontScale: 1,
};

/** Narrow unknown JSON (localStorage, the database, an API body) to a whole preference object. */
export function coercePreferences(raw: unknown): LearningPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFERENCES };
  const r = raw as Partial<LearningPreferences>;
  return {
    mode: r.mode === 'student' ? 'student' : 'kid',
    soundOn: typeof r.soundOn === 'boolean' ? r.soundOn : DEFAULT_PREFERENCES.soundOn,
    reducedMotion:
      typeof r.reducedMotion === 'boolean' ? r.reducedMotion : DEFAULT_PREFERENCES.reducedMotion,
    language: typeof r.language === 'string' && r.language ? r.language : DEFAULT_PREFERENCES.language,
    // Clamped: fontScale is multiplied into a CSS length, and a value from
    // localStorage is user-editable. An unbounded number here would let a
    // stored 400 blow the layout apart on next load.
    fontScale:
      typeof r.fontScale === 'number' && Number.isFinite(r.fontScale)
        ? Math.min(1.3, Math.max(1, r.fontScale))
        : DEFAULT_PREFERENCES.fontScale,
  };
}
