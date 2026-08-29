'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { applyGate, cnot, collapse, GATES, probabilityMap, zeroState } from '@/lib/quantum-sim';

/**
 * Lesson 6's impossible pair, and lesson 11's runnable circuit.
 *
 * A real Bell state: H on qubit 0, then CNOT. Measuring collapses the actual
 * two-qubit state through quantum-sim, so 01 and 10 never appear because the
 * amplitudes are genuinely zero — not because a conditional forces the second
 * coin to copy the first. That distinction is the whole lesson, and faking it
 * would teach the misconception the lesson exists to remove.
 *
 * The comparison toggle matters pedagogically: two independent coins produce
 * all four outcomes, and running both side by side is what makes "they always
 * agree" land as a measured fact rather than an assertion.
 */
export function EntangledPair() {
  const { mode, reducedMotion } = useLearningMode();
  const [entangled, setEntangled] = useState(true);
  const [last, setLast] = useState<string | null>(null);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [flipping, setFlipping] = useState(false);

  const state = useMemo(() => {
    // |00> -> H on qubit 0 -> CNOT(0,1) gives (|00> + |11>)/sqrt(2).
    // Without the CNOT the two qubits stay independent, which is the control.
    const superposed = applyGate(zeroState(2), GATES.H, 0);
    return entangled ? cnot(superposed, 0, 1) : applyGate(superposed, GATES.H, 1);
  }, [entangled]);

  const probs = probabilityMap(state);
  const total = Object.values(tally).reduce((a, b) => a + b, 0);

  const measure = useCallback(() => {
    const run = () => {
      const { outcome } = collapse(state);
      setLast(outcome);
      setTally((t) => ({ ...t, [outcome]: (t[outcome] ?? 0) + 1 }));
      setFlipping(false);
    };
    if (reducedMotion) return run();
    setFlipping(true);
    setTimeout(run, 320);
  }, [state, reducedMotion]);

  const reset = useCallback(() => {
    setTally({});
    setLast(null);
  }, []);

  const outcomes = ['00', '01', '10', '11'];

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
          {mode === 'kid' ? 'Two magic coins' : 'Bell pair'}
        </h3>
        <button
          type="button"
          onClick={() => {
            setEntangled((e) => !e);
            reset();
          }}
          className="min-h-9 rounded-lg border border-line px-3 font-mono text-xs transition-colors hover:border-accent hover:text-accent"
        >
          {entangled
            ? mode === 'kid'
              ? 'Linked — unlink them'
              : 'Entangled — remove CNOT'
            : mode === 'kid'
              ? 'Not linked — link them'
              : 'Independent — add CNOT'}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-6">
        {[0, 1].map((q) => {
          const face = last ? last[q] : null;
          return (
            <div key={q} className="text-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl font-bold transition-all ${
                  flipping
                    ? 'animate-pulse border-accent text-accent'
                    : face === null
                      ? 'border-dashed border-line-strong text-content-subtle'
                      : 'border-accent bg-accent-soft text-accent'
                }`}
              >
                {flipping ? '?' : (face ?? '?')}
              </div>
              <p className="mt-2 font-mono text-xs text-content-subtle">
                {mode === 'kid' ? `Coin ${q + 1}` : `q${q}`}
              </p>
            </div>
          );
        })}
      </div>

      {last && !flipping && (
        <p className="mt-3 text-center text-sm text-content-muted">
          {last[0] === last[1]
            ? mode === 'kid'
              ? '✅ They match — like always.'
              : `Both read ${last[0]} — correlated.`
            : mode === 'kid'
              ? '❌ They disagree. Only possible when unlinked.'
              : `Disagreement (${last}) — only possible without the CNOT.`}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={measure} className="quantum-btn flex-1">
          {mode === 'kid' ? 'Look at both' : 'Measure'}
        </button>
        {total > 0 && (
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-lg border border-line px-4 font-mono text-xs transition-colors hover:border-accent hover:text-accent"
          >
            Reset
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mt-4 space-y-1.5">
          {outcomes.map((o) => {
            const n = tally[o] ?? 0;
            const pct = total ? (n / total) * 100 : 0;
            return (
              <div key={o} className="flex items-center gap-2 font-mono text-xs">
                <span className="w-8 text-content-subtle">{o}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                  <div
                    className={`h-full rounded-full ${n ? 'bg-accent' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-content-muted">
                  {n} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
          <p className="pt-1 text-center font-mono text-xs text-content-subtle">
            {total} {total === 1 ? 'measurement' : 'measurements'}
            {entangled && ' · 01 and 10 have zero amplitude'}
          </p>
        </div>
      )}

      {mode !== 'kid' && (
        <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-content-subtle">
          {entangled
            ? 'State: (|00⟩ + |11⟩)/√2'
            : 'State: (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2'}
          {' · '}
          {outcomes
            .filter((o) => (probs[o] ?? 0) > 1e-9)
            .map((o) => `P(${o})=${(probs[o] ?? 0).toFixed(2)}`)
            .join('  ')}
        </p>
      )}
    </div>
  );
}
