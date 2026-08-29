'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { collapse, probabilityMap, stateFromAngles } from '@/lib/quantum-sim';

/**
 * Lesson 4: measurement, and the two things about it people get wrong.
 *
 * First, that you can peek without disturbing. Second, that a re-measurement
 * might give something different. Both are answered by letting the learner try:
 * "Look again" re-reads the collapsed state and always returns the same value,
 * because collapse actually replaced the state rather than hiding it.
 *
 * The tally converges on |α|² through real sampling, which is the point of
 * doing it rather than asserting it — a hundred clicks lands near the predicted
 * split but essentially never on it, and that gap is the lesson about shot
 * noise that lesson 11 depends on.
 */
export function MeasurementTally() {
  const { mode } = useLearningMode();
  const [bias, setBias] = useState(0.5);
  const [collapsed, setCollapsed] = useState<string | null>(null);
  const [tally, setTally] = useState<{ '0': number; '1': number }>({ '0': 0, '1': 0 });
  const [reReads, setReReads] = useState(0);

  // theta such that P(1) = bias.
  const state = useMemo(() => stateFromAngles(2 * Math.asin(Math.sqrt(bias)), 0), [bias]);
  const probs = probabilityMap(state);
  const total = tally['0'] + tally['1'];

  const look = useCallback(() => {
    const { outcome } = collapse(state);
    setCollapsed(outcome);
    setReReads(0);
    setTally((t) => ({ ...t, [outcome]: t[outcome as '0' | '1'] + 1 }));
  }, [state]);

  const lookAgain = useCallback(() => setReReads((n) => n + 1), []);

  const reset = useCallback(() => {
    setTally({ '0': 0, '1': 0 });
    setCollapsed(null);
    setReReads(0);
  }, []);

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
        {mode === 'kid' ? 'Looking makes it pick' : 'Measurement'}
      </h3>

      <div
        className={`mt-5 flex h-24 items-center justify-center rounded-xl border-2 text-4xl font-bold ${
          collapsed === null
            ? 'animate-pulse border-dashed border-accent/50 text-accent'
            : 'border-accent bg-accent-soft text-accent'
        }`}
      >
        {collapsed ?? (mode === 'kid' ? '🌀' : '?')}
      </div>

      <p className="mt-2 text-center text-sm text-content-muted">
        {collapsed === null
          ? mode === 'kid'
            ? 'Still spinning — both at once.'
            : `Superposition · P(0)=${(probs['0'] ?? 0).toFixed(2)} P(1)=${(probs['1'] ?? 0).toFixed(2)}`
          : reReads > 0
            ? mode === 'kid'
              ? `Still ${collapsed}. Looked ${reReads + 1} times — same answer every time.`
              : `Re-measured ${reReads + 1}× in the same basis: ${collapsed} each time.`
            : mode === 'kid'
              ? `It picked ${collapsed}. That is final.`
              : `Collapsed to |${collapsed}⟩.`}
      </p>

      <div className="mt-4">
        <label
          htmlFor="tally-bias"
          className="flex items-center justify-between font-mono text-xs text-content-subtle"
        >
          <span>{mode === 'kid' ? 'Tilt towards 1' : 'P(1)'}</span>
          <span>{bias.toFixed(2)}</span>
        </label>
        <input
          id="tally-bias"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={bias}
          onChange={(e) => {
            setBias(Number(e.target.value));
            reset();
          }}
          className="mt-1.5 w-full accent-[var(--color-accent)]"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={look} className="quantum-btn flex-1">
          {mode === 'kid' ? 'Look' : 'Measure'}
        </button>
        {collapsed !== null && (
          <button
            type="button"
            onClick={lookAgain}
            className="min-h-11 rounded-lg border border-line px-4 font-mono text-xs transition-colors hover:border-accent hover:text-accent"
          >
            {mode === 'kid' ? 'Look again' : 'Re-measure'}
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mt-4 space-y-1.5">
          {(['0', '1'] as const).map((k) => {
            const pct = (tally[k] / total) * 100;
            return (
              <div key={k} className="flex items-center gap-2 font-mono text-xs">
                <span className="w-6 text-content-subtle">{k}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-20 text-right text-content-muted">
                  {tally[k]} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
          <p className="pt-1 text-center font-mono text-xs text-content-subtle">
            {total} looks · predicted {((probs['1'] ?? 0) * 100).toFixed(0)}% ones
            <button type="button" onClick={reset} className="ml-2 underline hover:text-accent">
              reset
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
