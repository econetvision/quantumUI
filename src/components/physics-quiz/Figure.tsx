'use client';

import type { ReactNode } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';

/**
 * The frame every quiz figure draws inside.
 *
 * One component rather than per-figure SVG boilerplate, so twenty-four figures
 * share a viewBox, a caption position and the same axis styling — and so the
 * reduced-motion decision is made once. A learner who has that preference set
 * gets the final frame of every animation rather than a still of the first,
 * which for a figure like the wave cancellation is the difference between
 * seeing the answer and seeing nothing.
 */
export function Figure({
  children,
  caption,
  width = 320,
  height = 180,
  label,
}: {
  children: ReactNode;
  caption?: string;
  width?: number;
  height?: number;
  /** Describes the figure for anyone who cannot see it. */
  label: string;
}) {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label={label}
        >
          {children}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-1.5 text-center font-mono text-xs text-content-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Whether animation should run at all. Figures read this, never the media query. */
export function useAnimate(): boolean {
  const { reducedMotion } = useLearningMode();
  return !reducedMotion;
}

/** Axes with an origin, used by every plotted figure. */
export function Axes({
  x0,
  y0,
  x1,
  y1,
  xLabel,
  yLabel,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  xLabel?: string;
  yLabel?: string;
}) {
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="currentColor" strokeWidth={1} opacity={0.35} />
      {xLabel && (
        <text x={x1} y={y0 + 14} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={x0 - 4} y={y1 + 10} textAnchor="start" fontSize={10} fill="currentColor" opacity={0.6}>
          {yLabel}
        </text>
      )}
    </g>
  );
}

/** Turn sampled points into an SVG path. */
export function polyline(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}
