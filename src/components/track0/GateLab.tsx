'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { applyGate, cAbs, GATES, probabilityMap, zeroState, type State } from '@/lib/quantum-sim';

type GateName = 'X' | 'H' | 'Z';

const GATE_HELP: Record<GateName, { kid: string; adult: string }> = {
  X: { kid: 'Flips it over', adult: 'Bit flip: |0⟩ ↔ |1⟩' },
  H: { kid: 'Sets it spinning', adult: 'Hadamard: creates an even superposition' },
  Z: { kid: 'Changes the hidden sign', adult: 'Phase flip: |1⟩ → −|1⟩, probabilities unchanged' },
};

/**
 * Lessons 5 and 7: the moves you can make.
 *
 * Gates are applied through quantum-sim, so the amplitudes shown are the real
 * ones. That matters most for Z, whose entire point is that it changes the
 * state while changing no probability — a mock that stored only probabilities
 * would render Z as a no-op and quietly teach that phase does not exist, which
 * is the misconception lesson 8 then has to undo.
 *
 * Undo is available because unitarity is the lesson: every gate here is its own
 * inverse, so stepping back is applying the same gate again rather than
 * restoring a saved snapshot.
 */
export function GateLab() {
  const { mode } = useLearningMode();
  const [history, setHistory] = useState<GateName[]>([]);

  const state: State = useMemo(
    () => history.reduce((s, g) => applyGate(s, GATES[g], 0), zeroState(1)),
    [history],
  );

  const probs = probabilityMap(state);
  const p0 = probs['0'] ?? 0;
  const p1 = probs['1'] ?? 0;

  const apply = useCallback((g: GateName) => setHistory((h) => [...h, g]), []);
  const undo = useCallback(() => setHistory((h) => h.slice(0, -1)), []);
  const reset = useCallback(() => setHistory([]), []);

  // Sign of each amplitude, which is the only visible trace of Z.
  const sign = (re: number) => (re < -1e-9 ? '−' : '');

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
        {mode === 'kid' ? 'Try the moves' : 'Single-qubit gates'}
      </h3>

      <div className="mt-4 space-y-2">
        {(['0', '1'] as const).map((basis) => {
          const p = basis === '0' ? p0 : p1;
          const amp = state.amplitudes[basis === '0' ? 0 : 1];
          return (
            <div key={basis} className="flex items-center gap-3">
              <span className="w-10 font-mono text-sm text-content">
                {mode === 'kid' ? basis : `|${basis}⟩`}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${p * 100}%` }}
                />
              </div>
              <span className="w-28 text-right font-mono text-xs text-content-muted">
                {(p * 100).toFixed(0)}%
                {mode !== 'kid' && (
                  <span className="ml-1.5 text-content-subtle">
                    ({sign(amp.re)}
                    {cAbs(amp).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {(['X', 'H', 'Z'] as GateName[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => apply(g)}
            className="min-h-11 rounded-lg border border-line-strong font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            {g}
          </button>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-content-muted">
        {mode === 'kid'
          ? 'X flips · H spins · Z changes the hidden sign'
          : (['X', 'H', 'Z'] as GateName[]).map((g) => GATE_HELP[g].adult).join(' · ')}
      </p>

      {history.length > 0 && (
        <>
          <p className="mt-4 text-center font-mono text-xs text-content-subtle">
            {mode === 'kid' ? 'Your moves: ' : 'Circuit: '}
            {history.join(' → ')}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={undo}
              className="min-h-9 flex-1 rounded-lg border border-line px-3 font-mono text-xs transition-colors hover:border-accent hover:text-accent"
            >
              {mode === 'kid' ? 'Undo the last move' : 'Undo'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-9 flex-1 rounded-lg border border-line px-3 font-mono text-xs transition-colors hover:border-accent hover:text-accent"
            >
              Reset
            </button>
          </div>
        </>
      )}

      {mode !== 'kid' && history.length > 0 && p0 > 0.499 && p0 < 0.501 && (
        <p className="mt-3 border-t border-line pt-3 text-xs text-content-muted">
          Both outcomes are equally likely — but the amplitude signs above still
          differ from a fresh H. That difference is invisible to a measurement
          now and decides the result once two paths meet.
        </p>
      )}
    </div>
  );
}
