'use client';

import { useCallback, useMemo, useState } from 'react';
import type { PhysicsMCQ } from '@/lib/physics-mcq';
import { QuestionCard } from './QuestionCard';

/**
 * Walks through a set of questions one at a time.
 *
 * One per screen rather than a scrolling list: every question carries a looping
 * figure, and a dozen of those animating at once is both unreadable and a
 * needless drain on a phone. It also keeps the figure and its options on screen
 * together, which matters for the five questions that cannot be answered
 * without the figure.
 *
 * The score is kept but not emphasised. These walkthroughs are written to teach
 * from a wrong answer, and a running tally invites restarting to protect it.
 */
export function QuizRunner({ questions }: { questions: PhysicsMCQ[] }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const current = questions[index];
  const answered = Object.keys(results).length;
  const correct = useMemo(() => Object.values(results).filter(Boolean).length, [results]);
  const isAnswered = current ? results[current.id] !== undefined : false;

  const record = useCallback(
    (wasCorrect: boolean) => {
      setResults((prev) => ({ ...prev, [current.id]: wasCorrect }));
    },
    [current],
  );

  if (!current) return null;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-content-subtle">
          {index + 1} / {questions.length}
          {answered > 0 && ` · ${correct}/${answered}`}
        </span>
      </div>

      {/* Keyed so each question gets a fresh card: without it the previously
          chosen option would persist into the next question's state. */}
      <QuestionCard key={current.id} question={current} onAnswered={record} />

      <nav className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="min-h-11 rounded-lg border border-line px-4 font-mono text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="font-mono text-xs text-content-subtle">
          {isAnswered ? '' : 'pick an answer to see the walkthrough'}
        </span>

        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
          className="quantum-btn disabled:opacity-40"
        >
          Next →
        </button>
      </nav>
    </div>
  );
}
