'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { THEME_STORAGE_KEY } from './constants';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export { THEME_STORAGE_KEY };

interface ThemeContextValue {
  /** What the user chose — may be 'system'. */
  preference: ThemePreference;
  /** What is actually rendered right now. */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Flip between light and dark, leaving 'system' behind. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* --------------------------------------------------------------------------
   External stores

   Both the stored preference and the OS setting are external to React, so they
   are read with useSyncExternalStore rather than mirrored into state by an
   effect. That keeps the resolved theme a *derived* value — no render-then-
   correct pass, and no setState inside an effect.
   -------------------------------------------------------------------------- */

const preferenceListeners = new Set<() => void>();

// getSnapshot must return a referentially stable value between changes, so the
// parsed preference is cached rather than re-read from localStorage each call.
let cachedPreference: ThemePreference | null = null;

function readPreference(): ThemePreference {
  if (cachedPreference !== null) return cachedPreference;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    cachedPreference =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system';
  } catch {
    // localStorage throws in some private-browsing modes.
    cachedPreference = 'system';
  }

  return cachedPreference;
}

function writePreference(next: ThemePreference) {
  cachedPreference = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Non-fatal: the theme still applies for this session.
  }
  preferenceListeners.forEach((listener) => listener());
}

function subscribePreference(onChange: () => void) {
  preferenceListeners.add(onChange);

  // Keep other tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      cachedPreference = null;
      onChange();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

const LIGHT_QUERY = '(prefers-color-scheme: light)';

function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function readSystem(): ResolvedTheme {
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

// Server snapshots must match what the pre-paint script assumes as its default
// and the `data-theme="dark"` on <html>, so hydration starts consistent.
const serverPreference = (): ThemePreference => 'system';
const serverSystem = (): ResolvedTheme => 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(
    subscribePreference,
    readPreference,
    serverPreference,
  );

  const system = useSyncExternalStore(
    subscribeSystem,
    readSystem,
    serverSystem,
  );

  const theme: ResolvedTheme = preference === 'system' ? system : preference;

  // Sync the resolved theme to the DOM. This writes to an external system only
  // — it sets no React state.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => {
    writePreference(next);
  }, []);

  const toggle = useCallback(() => {
    const current = readPreference();
    const resolved = current === 'system' ? readSystem() : current;
    writePreference(resolved === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
