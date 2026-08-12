'use client';

import { useMemo, useState } from 'react';

/**
 * Measurement-outcome histogram.
 *
 * One measure (shot count) across basis-state categories, so it is a
 * single-series magnitude chart: one hue for every bar, no legend (the caption
 * names the series), and identity carried by the axis labels rather than by
 * colour. Bars are horizontal because basis-state labels grow with qubit count
 * and would otherwise collide on a phone.
 */
export function MeasurementHistogram({
  counts,
  shots,
  caption = 'Measurement outcomes',
  maxBars = 16,
}: {
  counts: Record<string, number>;
  shots?: number;
  caption?: string;
  maxBars?: number;
}) {
  const [showTable, setShowTable] = useState(false);

  const { bars, hidden, total, peak } = useMemo(() => {
    const entries = Object.entries(counts).sort((a, b) => {
      // Highest count first, then lexicographically for a stable order.
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    const sum = entries.reduce((acc, [, value]) => acc + value, 0);
    return {
      bars: entries.slice(0, maxBars),
      hidden: Math.max(0, entries.length - maxBars),
      total: sum,
      peak: entries.length ? entries[0][1] : 0,
    };
  }, [counts, maxBars]);

  if (!bars.length) return null;

  const denominator = shots ?? total;

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-sm font-bold">{caption}</span>
        <span className="text-xs text-content-subtle">
          {denominator.toLocaleString()} shots
        </span>
      </figcaption>

      <ul className="mt-3 space-y-1.5">
        {bars.map(([state, count]) => {
          const share = denominator ? count / denominator : 0;
          // Scale to the tallest bar so small distributions stay readable.
          const width = peak ? Math.max(1.5, (count / peak) * 100) : 0;

          return (
            <li key={state} className="flex items-center gap-2 sm:gap-3">
              <code className="w-[5.5rem] shrink-0 truncate text-right font-mono text-xs text-content-muted sm:w-24 sm:text-sm">
                |{state}⟩
              </code>

              <div className="h-6 min-w-0 flex-1 rounded bg-surface-sunken">
                <div
                  className="h-full rounded bg-[var(--q-zero)] transition-[width] duration-500 ease-out"
                  style={{ width: `${width}%` }}
                />
              </div>

              <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums text-content-muted sm:w-24">
                {count.toLocaleString()}
                <span className="ml-1 text-content-subtle">
                  {(share * 100).toFixed(1)}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <p className="mt-2 text-xs text-content-subtle">
          {hidden} further outcome{hidden === 1 ? '' : 's'} with lower counts not
          shown.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowTable((value) => !value)}
        className="mt-3 font-mono text-xs text-accent underline underline-offset-4"
      >
        {showTable ? 'Hide' : 'Show'} data table
      </button>

      {showTable && (
        <div className="scroll-x mt-3 rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              {caption} — measurement counts per basis state
            </caption>
            <thead className="bg-surface-sunken">
              <tr>
                <th scope="col" className="px-3 py-2 font-mono">State</th>
                <th scope="col" className="px-3 py-2 text-right font-mono">Count</th>
                <th scope="col" className="px-3 py-2 text-right font-mono">Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([state, count]) => (
                  <tr key={state} className="border-t border-line">
                    <td className="px-3 py-1.5 font-mono">|{state}⟩</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      {count.toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-content-muted">
                      {denominator
                        ? ((count / denominator) * 100).toFixed(2)
                        : '0.00'}
                      %
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
