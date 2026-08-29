import type { ReactNode } from 'react';
import { formatCount } from '@/lib/format';

/**
 * A headline number with its period-over-period change.
 *
 * A single number is a hero number, not a chart — there is nothing to plot, so
 * this deliberately has no sparkline. The delta is the only comparison it
 * makes, and it is stated in words as well as colour ("+12% vs previous 30
 * days"), because a green arrow alone is colour-carrying-meaning.
 */
export function MetricCard({
  label,
  value,
  delta,
  deltaLabel,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  value: number;
  /** Percentage change, or null when there is no comparable prior window. */
  delta?: number | null;
  deltaLabel?: string;
  hint?: ReactNode;
  selected?: boolean;
  /** Present only in the client wrapper that uses these as a chart selector. */
  onSelect?: () => void;
}) {
  const rising = typeof delta === 'number' && delta > 0;
  const falling = typeof delta === 'number' && delta < 0;

  const body = (
    <>
      <p className="font-mono text-xs uppercase tracking-wider text-content-subtle">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-content sm:text-3xl">
        {formatCount(value)}
      </p>

      {typeof delta === 'number' ? (
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs ${
            rising ? 'text-success' : falling ? 'text-danger' : 'text-content-subtle'
          }`}
        >
          {/* The glyph is decorative; the sign in the number carries the
              meaning, so a screen reader and a monochrome print both work. */}
          <span aria-hidden="true">{rising ? '▲' : falling ? '▼' : '■'}</span>
          <span className="tabular-nums">
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
          <span className="text-content-subtle">{deltaLabel}</span>
        </p>
      ) : delta === null ? (
        /* `null` means a comparison was wanted and the prior window was empty —
           a real "we cannot tell yet". `undefined` means this measure has no
           prior period by nature (a lifetime total), so it says nothing rather
           than implying data is missing. */
        <p className="mt-1.5 text-xs text-content-subtle">
          {hint ?? 'No prior period to compare'}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-content-subtle">{hint}</p>
      ) : null}
    </>
  );

  if (!onSelect) {
    return <div className="quantum-card p-4 sm:p-5">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`quantum-card p-4 text-left transition-colors sm:p-5 ${
        selected
          ? 'border-accent/60 bg-accent-soft'
          : 'hover:border-line-strong focus-visible:border-accent'
      }`}
    >
      {body}
    </button>
  );
}
