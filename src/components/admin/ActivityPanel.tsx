'use client';

import { useMemo, useState } from 'react';
import type { DailyPoint } from '@/lib/analytics-stats';
import { formatCompact, formatCount, formatDayShort } from '@/lib/format';
import { MetricCard } from './MetricCard';

/**
 * The four headline measures and the daily chart underneath them.
 *
 * The tiles double as the chart's selector — one measure is plotted at a time.
 * That is a deliberate choice over drawing all four together: page views run
 * two orders of magnitude above sign-ups, so on a shared axis the three smaller
 * series would be flat lines on the baseline. Small multiples would work too,
 * but four charts of the same shape is a lot of ink for a comparison nobody
 * makes; switching keeps one readable axis and never invents a second one.
 */

type MeasureKey = 'pageViews' | 'visitors' | 'signIns' | 'signUps';

const MEASURES: { key: MeasureKey; label: string; noun: string }[] = [
  { key: 'pageViews', label: 'Page views', noun: 'page views' },
  { key: 'visitors', label: 'Unique visitors', noun: 'visitors' },
  { key: 'signIns', label: 'Sign-ins', noun: 'sign-ins' },
  { key: 'signUps', label: 'New sign-ups', noun: 'sign-ups' },
];

export function ActivityPanel({
  daily,
  totals,
  deltas,
  rangeDays,
}: {
  daily: DailyPoint[];
  totals: Record<MeasureKey, number>;
  deltas: Record<MeasureKey, number | null>;
  rangeDays: number;
}) {
  const [measure, setMeasure] = useState<MeasureKey>('pageViews');
  const active = MEASURES.find((m) => m.key === measure) ?? MEASURES[0];
  const deltaLabel = `vs previous ${rangeDays} days`;

  return (
    <section aria-labelledby="activity-heading" className="space-y-5">
      <h2 id="activity-heading" className="sr-only">
        Traffic and sign-in activity
      </h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MEASURES.map((m) => (
          <MetricCard
            key={m.key}
            label={m.label}
            value={totals[m.key]}
            delta={deltas[m.key]}
            deltaLabel={deltaLabel}
            selected={measure === m.key}
            onSelect={() => setMeasure(m.key)}
          />
        ))}
      </div>

      <DailyBars
        points={daily}
        measure={measure}
        title={`${active.label} per day`}
        noun={active.noun}
      />
    </section>
  );
}

function DailyBars({
  points,
  measure,
  title,
  noun,
}: {
  points: DailyPoint[];
  measure: MeasureKey;
  title: string;
  noun: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const { values, max, total, peakIndex } = useMemo(() => {
    const values = points.map((p) => p[measure]);
    const max = Math.max(1, ...values);
    return {
      values,
      max,
      total: values.reduce((sum, v) => sum + v, 0),
      peakIndex: values.indexOf(Math.max(...values)),
    };
  }, [points, measure]);

  // Four recessive reference lines. Rounding the top of the scale to something
  // human keeps the labels from reading "37, 25, 12" on an axis nobody asked
  // to be precise.
  const ceiling = niceCeiling(max);
  const gridValues = [ceiling, ceiling * 0.75, ceiling * 0.5, ceiling * 0.25];

  const hoveredPoint = hovered === null ? null : points[hovered];

  return (
    <div className="quantum-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {/* One series, so the title names it and no legend box is needed. */}
        <h3 className="font-mono text-sm font-bold text-content">{title}</h3>
        <p className="font-mono text-xs text-content-subtle tabular-nums">
          {formatCount(total)} total · peak {formatCount(values[peakIndex] ?? 0)}
        </p>
      </div>

      <div className="relative mt-5">
        {/* Grid sits behind the bars and stays recessive — hairline borders in
            the line token, never a solid rule competing with the data. */}
        <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
          {gridValues.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-content-subtle tabular-nums">
                {formatCompact(Math.round(value))}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-content-subtle">
              0
            </span>
            <span className="h-px flex-1 bg-line-strong" />
          </div>
        </div>

        {/* The bars themselves. `role="img"` with a summary label rather than
            90 focusable elements: the table below is the accessible route into
            the individual numbers, and it is always present. */}
        <div
          role="img"
          aria-label={`${title}. ${formatCount(total)} ${noun} across ${points.length} days, peaking at ${formatCount(values[peakIndex] ?? 0)} on ${formatDayShort(points[peakIndex]?.day ?? '')}.`}
          className="relative ml-10 flex h-52 items-end gap-[2px]"
          onMouseLeave={() => setHovered(null)}
        >
          {points.map((p, index) => {
            const value = values[index];
            const heightPct = (value / ceiling) * 100;
            const isHovered = hovered === index;

            return (
              <div
                key={p.day}
                onMouseEnter={() => setHovered(index)}
                // A 2px gap of surface between neighbours, and a full-height
                // hit target so a 1-unit bar is still hoverable.
                className="relative flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  className={`w-full rounded-t transition-colors ${
                    isHovered ? 'bg-accent-hover' : 'bg-accent'
                  } ${value === 0 ? 'opacity-30' : ''}`}
                  style={{
                    // A zero day still draws a 2px stub so the reader can see
                    // the day exists and was measured, rather than guessing
                    // whether it is zero or missing.
                    height: value === 0 ? '2px' : `max(3px, ${heightPct}%)`,
                  }}
                />
              </div>
            );
          })}

          {hoveredPoint !== null && hovered !== null && (
            <div
              // Follows the hovered bar horizontally, clamped inside the plot.
              className="pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-lg border border-line-strong bg-surface-overlay px-3 py-2 shadow-md"
              style={{
                left: `${clamp(((hovered + 0.5) / points.length) * 100, 8, 92)}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="font-mono text-[11px] text-content-subtle">
                {formatDayShort(hoveredPoint.day)}
              </p>
              <p className="font-mono text-sm font-bold tabular-nums text-content">
                {formatCount(hoveredPoint[measure])}{' '}
                <span className="font-normal text-content-muted">{noun}</span>
              </p>
            </div>
          )}
        </div>

        {/* Only the ends are labelled. A tick under every one of 90 bars is
            unreadable, and the tooltip covers "which day is this one". */}
        <div className="ml-10 mt-2 flex justify-between font-mono text-[10px] text-content-subtle">
          <span>{formatDayShort(points[0]?.day ?? '')}</span>
          <span>{formatDayShort(points[points.length - 1]?.day ?? '')} (UTC)</span>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-mono text-xs text-content-muted hover:text-content">
          View as table
        </summary>
        <div className="mt-3 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{title}, one row per day</caption>
            <thead className="sticky top-0 bg-surface-raised">
              <tr className="text-content-subtle">
                <th scope="col" className="px-2 py-1.5 font-mono font-normal">
                  Day (UTC)
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-mono font-normal">
                  {noun}
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.day} className="border-t border-line">
                  <td className="px-2 py-1.5 text-content-muted">{formatDayShort(p.day)}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums text-content">
                    {formatCount(p[measure])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Round a maximum up to a readable axis top: 37 -> 40, 412 -> 500. */
function niceCeiling(max: number): number {
  if (max <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalised = max / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return step * magnitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type { MeasureKey };
