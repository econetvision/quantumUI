'use client';

import { useMemo, useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';

interface Card { id: string; label: string; team: 'bit' | 'qubit' }

const CARDS: Card[] = [
  { id: 'c1', label: 'Can only be 0 or 1', team: 'bit' },
  { id: 'c2', label: 'Can be both at once', team: 'qubit' },
  { id: 'c3', label: 'AND / OR / NOT gates', team: 'bit' },
  { id: 'c4', label: 'Hadamard / CNOT gates', team: 'qubit' },
  { id: 'c5', label: 'Your laptop', team: 'bit' },
  { id: 'c6', label: 'IBM Quantum computer', team: 'qubit' },
  { id: 'c7', label: 'Breaks easily from noise', team: 'qubit' },
  { id: 'c8', label: 'Does not mind noise', team: 'bit' },
];

/**
 * Lesson 3 sorting game.
 *
 * Click-to-assign rather than drag-and-drop: dragging is unreliable on touch,
 * hostile to keyboard users, and this needs to work for an eight-year-old on a
 * phone. There is no failure state — a wrong pick says so and lets them move it.
 */
export function SortingGame() {
  const { mode } = useLearningMode();
  const [placed, setPlaced] = useState<Record<string, 'bit' | 'qubit'>>({});

  const remaining = CARDS.filter((c) => !placed[c.id]);
  const correct = useMemo(
    () => CARDS.filter((c) => placed[c.id] === c.team).length,
    [placed],
  );
  const done = remaining.length === 0;

  const place = (card: Card, team: 'bit' | 'qubit') =>
    setPlaced((p) => ({ ...p, [card.id]: team }));

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <p className="text-sm text-content-muted">
        {mode === 'kid'
          ? 'Which team does each card belong to? Tap a card, then tap a team.'
          : 'Assign each property to the correct model.'}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(['bit', 'qubit'] as const).map((team) => (
          <div key={team} className="rounded-lg border border-line p-3">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
              {team === 'bit' ? '💡 Switch team' : '🪙 Coin team'}
            </p>
            <ul className="mt-2 space-y-1">
              {CARDS.filter((c) => placed[c.id] === team).map((c) => {
                const right = c.team === team;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-sm ${
                      right ? 'bg-success-soft text-content' : 'bg-warning-soft text-content'
                    }`}
                  >
                    <span>{right ? '✓' : '↺'} {c.label}</span>
                    {!right && (
                      <button
                        type="button"
                        onClick={() => setPlaced((p) => { const n = { ...p }; delete n[c.id]; return n; })}
                        className="shrink-0 text-xs underline"
                      >
                        try again
                      </button>
                    )}
                  </li>
                );
              })}
              {CARDS.filter((c) => placed[c.id] === team).length === 0 && (
                <li className="text-xs text-content-subtle">Nothing here yet.</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {!done && (
        <div className="mt-4 space-y-2">
          {remaining.map((card) => (
            <div key={card.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-2">
              <span className="flex-1 text-sm">{card.label}</span>
              <button type="button" onClick={() => place(card, 'bit')}
                className="h-11 rounded-lg border border-line px-3 text-xs hover:border-line-strong">
                💡 Switch
              </button>
              <button type="button" onClick={() => place(card, 'qubit')}
                className="h-11 rounded-lg border border-line px-3 text-xs hover:border-line-strong">
                🪙 Coin
              </button>
            </div>
          ))}
        </div>
      )}

      {done && (
        <p role="status" className="mt-4 rounded-lg bg-accent-soft p-3 text-sm">
          {correct === CARDS.length
            ? mode === 'kid' ? '🎉 Every card in the right team. You have got it!' : `All ${CARDS.length} correct.`
            : `${correct} of ${CARDS.length} right — tap "try again" on any card marked ↺.`}
        </p>
      )}
    </div>
  );
}
