'use client';

import { useCallback, useState } from 'react';
import type { PhysicsMCQ } from '@/lib/physics-mcq';
import { figureFor } from './registry';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * One question: the figure, the options, then the walkthrough.
 *
 * The figure sits above the options rather than beside them because five of
 * these questions are unanswerable without it — "the two curves shown" is not
 * a hint, it is half the question. Putting it in a sidebar on a phone would
 * push it below the options it is required to read.
 *
 * A wrong answer is kept on screen next to the right one. The walkthroughs in
 * the paper exist mostly to say why a particular distractor is tempting — Q41's
 * wrong options are the work function and the whole photon energy — and that
 * only lands if the learner can still see what they picked.
 */
export function QuestionCard({
  question,
  onAnswered,
}: {
  question: PhysicsMCQ;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;
  const correct = picked === question.answer;

  const choose = useCallback(
    (index: number) => {
      if (picked !== null) return; // first answer stands; this is assessment
      setPicked(index);
      onAnswered?.(index === question.answer);
    },
    [picked, question.answer, onAnswered],
  );

  return (
    <article className="rounded-xl border border-line bg-surface-raised p-5">
      <header className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs font-bold text-content-subtle">Q{question.id}</span>
        <span className="font-mono text-xs text-content-subtle">{question.topic}</span>
      </header>

      <p className="mt-2 text-base leading-relaxed text-content">{question.prompt}</p>

      <div className="mt-4">{figureFor(question.animation, question.id, revealed)}</div>

      <ul className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const isAnswer = i === question.answer;
          const isPicked = i === picked;
          const tone = !revealed
            ? 'border-line hover:border-accent hover:bg-surface-overlay'
            : isAnswer
              ? 'border-success bg-success-soft'
              : isPicked
                ? 'border-danger bg-danger-soft'
                : 'border-line opacity-55';
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={revealed}
                aria-pressed={isPicked}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${tone}`}
              >
                <span className="font-mono text-xs font-bold text-content-subtle">{LETTERS[i]}</span>
                <span className="flex-1 text-content">{opt}</span>
                {revealed && isAnswer && <span aria-hidden="true">✓</span>}
                {revealed && isPicked && !isAnswer && <span aria-hidden="true">✗</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className="mt-4 rounded-lg border border-line bg-surface p-4">
          <p className={`font-mono text-xs font-bold ${correct ? 'text-success' : 'text-warning'}`}>
            {correct
              ? `Correct — ${LETTERS[question.answer]}`
              : `Answer ${LETTERS[question.answer]}`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">{question.reason}</p>
        </div>
      )}
    </article>
  );
}
