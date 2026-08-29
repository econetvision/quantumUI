'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import {
  applyGate, collapse, GATES, probabilityMap, stateFromAngles, zeroState,
} from '@/lib/quantum-sim';

/**
 * Lesson 2's magic coin.
 *
 * The coin is a real qubit, not an animation with a random() behind it. SPIN
 * applies a Hadamard through quantum-sim; CATCH collapses that state. The
 * tally therefore converges on the real distribution, and when a learner later
 * runs the same circuit on the backend they get the same numbers — which is
 * the entire pedagogical claim of this platform.
 */
export function SpinningCoinQubit() {
  const { mode, reducedMotion } = useLearningMode();
  const [spinning, setSpinning] = useState(false);
  const [outcome, setOutcome] = useState<'0' | '1' | null>(null);
  const [tally, setTally] = useState<{ '0': number; '1': number }>({ '0': 0, '1': 0 });
  const [bias, setBias] = useState(0.5);

  // theta chosen so |alpha|^2 = 1 - bias, i.e. the slider reads as "chance of 1".
  const state = useMemo(
    () => (bias === 0.5
      ? applyGate(zeroState(1), GATES.H, 0)
      : stateFromAngles(2 * Math.asin(Math.sqrt(bias)), 0)),
    [bias],
  );

  const probs = probabilityMap(state);
  const p0 = probs['0'] ?? 0;
  const p1 = probs['1'] ?? 0;

  const spin = useCallback(() => {
    setOutcome(null);
    setSpinning(true);
  }, []);

  const catchIt = useCallback(() => {
    const { outcome: got } = collapse(state);
    const bit = got as '0' | '1';
    setOutcome(bit);
    setSpinning(false);
    setTally((t) => ({ ...t, [bit]: t[bit] + 1 }));
  }, [state]);

  const total = tally['0'] + tally['1'];
  const face = outcome === '1' ? '🌙' : outcome === '0' ? '☀️' : '🪙';

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <div className="flex flex-col items-center gap-4">
        <div
          aria-live="polite"
          aria-label={
            spinning ? 'The coin is spinning — it is both at once'
            : outcome ? `You caught ${outcome === '0' ? 'heads, a 0' : 'tails, a 1'}`
            : 'The coin is resting. Press spin.'
          }
          className={`flex h-28 w-28 items-center justify-center rounded-full border-2 border-accent bg-accent-soft text-5xl ${
            spinning && !reducedMotion ? 'animate-spin [animation-duration:0.6s]' : ''
          }`}
        >
          {spinning ? '🌀' : face}
        </div>

        <p className="min-h-6 text-center text-sm text-content-muted">
          {spinning
            ? mode === 'kid'
              ? 'Both at once! Catch it to make it choose.'
              : 'In superposition. Measuring will project onto the computational basis.'
            : outcome
              ? mode === 'kid'
                ? `You caught ${outcome === '0' ? 'heads ☀️' : 'tails 🌙'}!`
                : `Collapsed to |${outcome}⟩.`
              : mode === 'kid'
                ? 'Press SPIN to start the magic.'
                : 'Prepared in |0⟩. Apply H to create a superposition.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={spin} disabled={spinning} className="quantum-btn h-12 px-6 disabled:opacity-50">
            {mode === 'kid' ? 'SPIN 🌀' : 'Apply H'}
          </button>
          <button
            type="button"
            onClick={catchIt}
            disabled={!spinning}
            className="h-12 rounded-lg border border-accent px-6 text-sm font-bold text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
          >
            {mode === 'kid' ? 'CATCH 🤲' : 'Measure'}
          </button>
        </div>

        {mode !== 'kid' && (
          <label className="w-full max-w-xs text-xs text-content-muted">
            Chance of measuring 1: {(bias * 100).toFixed(0)}%
            <input
              type="range" min={0} max={1} step={0.05} value={bias}
              onChange={(e) => setBias(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--accent)]"
            />
          </label>
        )}

        <div className="w-full">
          <div className="flex justify-between font-mono text-xs text-content-subtle">
            <span>{mode === 'kid' ? '☀️ heads' : 'P(0)'} {(p0 * 100).toFixed(0)}%</span>
            <span>{mode === 'kid' ? 'tails 🌙' : 'P(1)'} {(p1 * 100).toFixed(0)}%</span>
          </div>
          <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-surface">
            <div className="bg-accent" style={{ width: `${p0 * 100}%` }} />
            <div className="bg-accent-alt" style={{ width: `${p1 * 100}%` }} />
          </div>
        </div>

        {total > 0 && (
          <div className="w-full rounded-lg border border-line p-3">
            <p className="font-mono text-xs text-content-subtle">
              {mode === 'kid' ? `You caught it ${total} times` : `${total} shots`}
            </p>
            <div className="mt-2 space-y-1">
              {(['0', '1'] as const).map((bit) => (
                <div key={bit} className="flex items-center gap-2">
                  <span className="w-14 font-mono text-xs">{bit === '0' ? '☀️ 0' : '🌙 1'}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
                    <div
                      className={bit === '0' ? 'h-full bg-accent' : 'h-full bg-accent-alt'}
                      style={{ width: total ? `${(tally[bit] / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-xs">{tally[bit]}</span>
                </div>
              ))}
            </div>
            {total >= 10 && (
              <p className="mt-2 text-xs text-content-muted">
                {mode === 'kid'
                  ? 'See? Catching it lots of times shows the pattern.'
                  : `Measured ${((tally['0'] / total) * 100).toFixed(0)}% zeros against a predicted ${(p0 * 100).toFixed(0)}%.`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
