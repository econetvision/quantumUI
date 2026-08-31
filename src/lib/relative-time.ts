/**
 * "3m ago" timestamps for the community board.
 *
 * Hand-rolled rather than Intl.RelativeTimeFormat because the board wants the
 * compact single-unit form ("2h ago", not "2 hours ago") at font sizes where
 * the long form wraps, and because the same string must render on server and
 * client without a locale mismatch hydration warning.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.floor((now.getTime() - then) / 1000));
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}
