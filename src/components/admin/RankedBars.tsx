import type { NamedCount } from '@/lib/analytics-stats';
import { formatCount, truncateMiddle } from '@/lib/format';

/**
 * A ranked list where the bar length *is* the comparison — top pages, top
 * referrers, interactions by type.
 *
 * One hue for every row, not a colour per category. Length already encodes the
 * magnitude; painting each bar a different colour would imply an identity
 * relationship between rows that do not have one, and would burn a categorical
 * palette on a chart that gains nothing from it.
 *
 * This renders as a real `<table>` rather than a stack of divs: the numbers are
 * the point, the bar is the illustration, and this way the data is reachable
 * without the illustration.
 */
export function RankedBars({
  title,
  caption,
  rows,
  emptyMessage,
  unit = 'total',
}: {
  title: string;
  caption?: string;
  rows: NamedCount[];
  emptyMessage: string;
  unit?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="quantum-card p-4 sm:p-5">
      <h3 className="font-mono text-sm font-bold text-content">{title}</h3>
      {caption && (
        <p className="mt-1 text-xs leading-relaxed text-content-subtle">{caption}</p>
      )}

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-content-subtle">{emptyMessage}</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th
                  scope="row"
                  className="w-full py-1.5 pr-3 text-left font-normal align-middle"
                >
                  <span
                    className="block truncate text-xs text-content-muted"
                    title={row.name}
                  >
                    {truncateMiddle(row.name)}
                  </span>
                  {/* 4px rounded end, anchored to the left baseline. The track
                      behind it makes the proportion readable at a glance even
                      for the short rows. */}
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-1.5 rounded-full bg-surface-sunken"
                  >
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `max(4px, ${(row.count / max) * 100}%)` }}
                    />
                  </span>
                </th>
                <td className="whitespace-nowrap py-1.5 pl-2 text-right align-top font-mono text-xs tabular-nums text-content">
                  {formatCount(row.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
