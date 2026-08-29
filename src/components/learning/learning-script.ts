import { LEARNING_PREFS_KEY } from './constants';

/**
 * Applies learning preferences before first paint.
 *
 * Mode drives which half of every lesson renders, so resolving it after
 * hydration would show a child the equations for a moment, or a student the
 * cartoon — worse than a theme flash because the *content* changes, not just
 * the colours. Font scale is set here too so text does not reflow on load.
 *
 * Dependency-free and wrapped in try/catch: with localStorage blocked the
 * attributes stay at their defaults instead of throwing and stalling the parser.
 */
export const learningInitScript = `
(function() {
  try {
    var raw = localStorage.getItem('${LEARNING_PREFS_KEY}');
    var p = raw ? JSON.parse(raw) : {};
    var m = (p.mode === 'student' || p.mode === 'professional') ? p.mode : 'kid';
    document.documentElement.dataset.learningMode = m;
    var s = typeof p.fontScale === 'number' ? Math.min(1.3, Math.max(1, p.fontScale)) : 1;
    document.documentElement.style.setProperty('--font-scale', String(s));
    if (p.reducedMotion === true) document.documentElement.dataset.reducedMotion = 'true';
  } catch (e) {
    document.documentElement.dataset.learningMode = 'kid';
  }
})();
`.trim();
