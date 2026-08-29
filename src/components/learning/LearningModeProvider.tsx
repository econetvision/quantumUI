'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import {
  coercePreferences,
  DEFAULT_PREFERENCES,
  LEARNING_PREFS_KEY,
  type LearningMode,
  type LearningPreferences,
} from './constants';

export { LEARNING_PREFS_KEY };
export type { LearningMode, LearningPreferences };

interface LearningContextValue {
  prefs: LearningPreferences;
  mode: LearningMode;
  /** True when the OS asks for reduced motion, or the user did. */
  reducedMotion: boolean;
  setMode: (mode: LearningMode) => void;
  toggleMode: () => void;
  update: (patch: Partial<LearningPreferences>) => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

/* --------------------------------------------------------------------------
   External store

   Same shape as ThemeProvider: localStorage lives outside React, so it is read
   through useSyncExternalStore rather than mirrored into state by an effect.
   The snapshot is cached because getSnapshot must return a referentially
   stable value between changes — re-parsing the JSON on every call would hand
   React a new object each render and loop.
   -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let cached: LearningPreferences | null = null;

function readPrefs(): LearningPreferences {
  if (cached !== null) return cached;
  try {
    const raw = window.localStorage.getItem(LEARNING_PREFS_KEY);
    cached = coercePreferences(raw ? JSON.parse(raw) : null);
  } catch {
    cached = { ...DEFAULT_PREFERENCES };
  }
  return cached;
}

function writePrefs(next: LearningPreferences) {
  cached = next;
  try {
    window.localStorage.setItem(LEARNING_PREFS_KEY, JSON.stringify(next));
  } catch {
    // Private browsing: the in-memory value still drives this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changing preferences invalidates our cache.
  const onStorage = (e: StorageEvent) => {
    if (e.key === LEARNING_PREFS_KEY) {
      cached = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

// The server has no localStorage. Returning the shared default object (not a
// fresh copy) keeps the snapshot referentially stable across SSR renders.
const serverSnapshot = DEFAULT_PREFERENCES;

/* -------------------------------------------------------------------------- */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeMotion(listener: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}

export function LearningModeProvider({ children }: { children: React.ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, readPrefs, () => serverSnapshot);

  const osReducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  const update = useCallback((patch: Partial<LearningPreferences>) => {
    writePrefs(coercePreferences({ ...readPrefs(), ...patch }));
  }, []);

  const setMode = useCallback((mode: LearningMode) => update({ mode }), [update]);
  const toggleMode = useCallback(
    () => update({ mode: readPrefs().mode === 'kid' ? 'student' : 'kid' }),
    [update],
  );

  // Mirror onto <html> so CSS and the pre-paint script agree on one source of
  // truth, and so a lesson can style by mode without threading a prop through
  // every component.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.learningMode = prefs.mode;
    root.style.setProperty('--font-scale', String(prefs.fontScale));
    if (prefs.reducedMotion) root.dataset.reducedMotion = 'true';
    else delete root.dataset.reducedMotion;
  }, [prefs.mode, prefs.fontScale, prefs.reducedMotion]);

  const value = useMemo<LearningContextValue>(
    () => ({
      prefs,
      mode: prefs.mode,
      // The OS preference is a floor, not a default: a user who asked their
      // system for less motion should not have to ask again here.
      reducedMotion: prefs.reducedMotion || osReducedMotion,
      setMode,
      toggleMode,
      update,
    }),
    [prefs, osReducedMotion, setMode, toggleMode, update],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearningMode(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) {
    throw new Error('useLearningMode must be used inside <LearningModeProvider>');
  }
  return ctx;
}

/** Render one of two branches by mode. Keeps lessons declarative. */
export function ModeSwitch({ kid, student }: { kid: React.ReactNode; student: React.ReactNode }) {
  const { mode } = useLearningMode();
  return <>{mode === 'kid' ? kid : student}</>;
}
