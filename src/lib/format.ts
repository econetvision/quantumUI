/**
 * Formatting shared by the admin dashboard.
 *
 * Every function here is deterministic given its inputs — no `Date.now()`, no
 * ambient locale, no ambient timezone. That is not fussiness: these run during
 * server rendering *and* again during hydration, and anything that reads the
 * wall clock or the machine's locale produces different text in the two passes
 * and a hydration mismatch. Relative times take an explicit `now`, which the
 * page captures once on the server and passes down.
 */

const NUMBER = new Intl.NumberFormat('en-GB');

const COMPACT = new Intl.NumberFormat('en-GB', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** `1234` -> `1,234`. */
export function formatCount(value: number): string {
  return NUMBER.format(value);
}

/** `1234` -> `1.2K`. For axis labels and tight tiles only. */
export function formatCompact(value: number): string {
  return value < 1000 ? NUMBER.format(value) : COMPACT.format(value);
}

/**
 * `2026-08-29T11:54:00Z` -> `29 Aug 2026, 11:54`.
 *
 * Pinned to UTC so it matches the UTC day buckets the charts are grouped into —
 * a dashboard where the table says "30 Aug" and the chart counts it under
 * "29 Aug" is worse than one that is honestly in UTC throughout.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(date);
}

/** `2026-08-29` -> `29 Aug`. Chart axis ticks. */
export function formatDayShort(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDay;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * "3 days ago", measured against an explicit `now` rather than the clock.
 *
 * Returns `null` for a missing timestamp so callers can render their own
 * placeholder — "never signed in" and "signed in at an unknown time" are
 * different statements and the dashboard makes that distinction.
 */
export function relativeTime(iso: string | null | undefined, nowIso: string): string | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  const now = new Date(nowIso).getTime();
  if (Number.isNaN(then) || Number.isNaN(now)) return null;

  const seconds = Math.round((now - then) / 1000);
  if (seconds < 60) return 'just now';

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86_400],
    ['week', 604_800],
    ['month', 2_629_800],
    ['year', 31_557_600],
  ];

  const formatter = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

  let chosen: [Intl.RelativeTimeFormatUnit, number] = units[0];
  for (const unit of units) {
    if (Math.abs(seconds) >= unit[1]) chosen = unit;
  }

  return formatter.format(-Math.round(seconds / chosen[1]), chosen[0]);
}

/** Trims a long path for display without losing which route it is. */
export function truncateMiddle(value: string, max = 42): string {
  if (value.length <= max) return value;
  const half = Math.floor((max - 1) / 2);
  return `${value.slice(0, half)}…${value.slice(-half)}`;
}
