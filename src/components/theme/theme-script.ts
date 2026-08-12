import { THEME_STORAGE_KEY } from './constants';

/**
 * Inline script that resolves the theme *before* first paint.
 *
 * Without this the page renders with the server-default (dark) and then snaps
 * to the stored preference once React hydrates — the classic theme flash. It is
 * injected synchronously in <head> so it runs ahead of any rendering.
 *
 * Kept dependency-free and wrapped in try/catch: if localStorage is blocked,
 * the `data-theme` attribute simply stays at the dark default rather than
 * throwing and blocking the parser.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`.trim();
