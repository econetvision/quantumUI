'use client';

import { useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';
import type { QuizQuestion } from '@/lib/track0-lessons';

/**
 * End-of-lesson check.
 *
 * No failure state, by design. A wrong answer shows the hint and stays open for
 * another try; nothing is scored down and nothing is locked. The goal is a
 * child who keeps going, not a mark.
 */
export function MiniQuiz({ questions, onComplete }: { questions: QuizQuestion[]; onComplete?: () => void }) {
  const { mode } = useLearningMode();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const solved = questions.filter((q, i) => picked[i] === q.answer).length;
  const done = solved === questions.length;

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
          {mode === 'kid' ? 'Quick check' : 'Check your understanding'}
        </h3>
        <span className="font-mono text-xs text-content-subtle">{solved}/{questions.length}</span>
      </div>

      <ol className="mt-4 space-y-5">
        {questions.map((q, i) => {
          const choice = picked[i];
          const right = choice === q.answer;
          return (
            <li key={i}>
              <p className="text-sm font-medium text-content">{i + 1}. {q.q}</p>
              <div className="mt-2 space-y-1.5">
                {q.options.map((opt, j) => {
                  const chosen = choice === j;
                  const isAnswer = j === q.answer;
                  const show = choice !== undefined;
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => {
                        setPicked((p) => ({ ...p, [i]: j }));
                        if (j === q.answer && solved + 1 === questions.length) onComplete?.();
                      }}
                      aria-pressed={chosen}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        show && isAnswer
                          ? 'border-success bg-success-soft'
                          : chosen
                            ? 'border-warning bg-warning-soft'
                            : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <span aria-hidden="true">{show && isAnswer ? '✓' : chosen ? '↺' : '○'}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {choice !== undefined && !right && (
                <p className="mt-2 rounded bg-surface px-3 py-2 text-xs text-content-muted">
                  💡 {q.hint}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {done && (
        <p role="status" className="mt-5 rounded-lg bg-accent-soft p-3 text-sm">
          {mode === 'kid' ? '🎉 All correct — you are ready for the next one!' : 'All correct.'}
        </p>
      )}
    </div>
  );
}
