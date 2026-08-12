'use client';

import { useTheme } from './ThemeProvider';

/**
 * Light/dark switch.
 *
 * Renders a stable icon slot on the server and only reveals the real state
 * after mount (the provider starts at the dark default), so there is no
 * hydration mismatch and no visible icon swap.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-content-muted transition-colors hover:border-line-strong hover:text-content ${className}`}
    >
      {/* Both icons are always in the DOM; CSS picks one via the root
          data-theme attribute so the correct glyph is painted immediately. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden h-5 w-5 [[data-theme='dark']_&]:block"
      >
        {/* Sun — shown in dark mode, meaning "switch to light" */}
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden h-5 w-5 [[data-theme='light']_&]:block"
      >
        {/* Moon — shown in light mode, meaning "switch to dark" */}
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
