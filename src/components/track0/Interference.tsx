'use client';

import { useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import { applyGate, GATES, probabilityMap, zeroState } from '@/lib/quantum-sim';

function Bar({ label, p }: { label: string; p: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-8 text-content-subtle">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-overlay">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${p * 100}%` }}
        />
      </div>
      <span className="w-10 text-right text-content-muted">{(p * 100).toFixed(0)}%</span>
    </div>
  );
}

/**
 * Lesson 8: the cancellation that makes quantum computing work.
 *
 * H · H · |0⟩ = |0⟩ exactly. Inserting Z between the two Hadamards flips the
 * relative phase and the same circuit gives |1⟩ with certainty. Nothing about
 * the intermediate probabilities changes — both are 50/50 — so the only thing
 * that can account for two opposite certain outcomes is the sign.
 *
 * That is the strongest available argument that phase is physical, and it only
 * works because these are real amplitudes from quantum-sim. Storing
 * probabilities would make both circuits identical and the demonstration
 * vacuous.
 */
export function Interference() {
  const { mode } = useLearningMode();
  const [phaseFlip, setPhaseFlip] = useState(false);

  const { mid, final } = useMemo(() => {
    const afterH = applyGate(zeroState(1), GATES.H, 0);
    const afterPhase = phaseFlip ? applyGate(afterH, GATES.Z, 0) : afterH;
    return { mid: afterPhase, final: applyGate(afterPhase, GATES.H, 0) };
  }, [phaseFlip]);

  const midProbs = probabilityMap(mid);
  const finalProbs = probabilityMap(final);
  const settled = finalProbs['0'] > 0.999 ? '0' : finalProbs['1'] > 0.999 ? '1' : null;

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
        {mode === 'kid' ? 'Two paths meeting' : 'Interference: H · Z? · H'}
      </h3>

      <p className="mt-3 text-sm text-content-muted">
        {mode === 'kid'
          ? 'Spin it, maybe flip the hidden sign, then spin it again. The middle looks the same either way — the ending does not.'
          : 'Both circuits pass through an identical 50/50 superposition. Only the relative phase differs.'}
      </p>

      <div className="mt-4 rounded-lg border border-line bg-surface p-3">
        <p className="font-mono text-xs text-content-subtle">
          {mode === 'kid' ? 'Halfway — always the same' : 'After H (and Z if on)'}
        </p>
        <div className="mt-2 space-y-1.5">
          <Bar label={mode === 'kid' ? '0' : '|0⟩'} p={midProbs['0'] ?? 0} />
          <Bar label={mode === 'kid' ? '1' : '|1⟩'} p={midProbs['1'] ?? 0} />
        </div>
        {mode !== 'kid' && (
          <p className="mt-2 font-mono text-xs text-content-subtle">
            amplitudes: {mid.amplitudes.map((a) => a.re.toFixed(3)).join(', ')}
          </p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-accent/40 bg-accent/[0.04] p-3">
        <p className="font-mono text-xs text-content-subtle">
          {mode === 'kid' ? 'After the second spin' : 'After the second H'}
        </p>
        <div className="mt-2 space-y-1.5">
          <Bar label={mode === 'kid' ? '0' : '|0⟩'} p={finalProbs['0'] ?? 0} />
          <Bar label={mode === 'kid' ? '1' : '|1⟩'} p={finalProbs['1'] ?? 0} />
        </div>
      </div>

      {settled && (
        <p className="mt-3 text-center text-sm text-content-muted">
          {mode === 'kid'
            ? `Always ${settled}. The other answer cancelled itself out completely.`
            : `Certain outcome |${settled}⟩ — the paths to the other basis state cancel exactly.`}
        </p>
      )}

      <button
        type="button"
        onClick={() => setPhaseFlip((f) => !f)}
        className="quantum-btn mt-4 w-full"
      >
        {phaseFlip
          ? mode === 'kid'
            ? 'Remove the hidden sign flip'
            : 'Remove Z'
          : mode === 'kid'
            ? 'Add a hidden sign flip'
            : 'Insert Z'}
      </button>

      {mode !== 'kid' && (
        <p className="mt-3 border-t border-line pt-3 text-xs text-content-muted">
          The midpoint probabilities are identical in both cases, so no
          measurement taken there could tell the two circuits apart. The endings
          are opposite and certain. Whatever distinguishes them is carried in the
          sign, not in the probabilities — which is why amplitudes, and not
          probabilities, are the state.
        </p>
      )}
    </div>
  );
}
