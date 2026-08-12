'use client';

import { useState } from 'react';
import { Badge, Card } from '@/components/ui/primitives';

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  answer: number;
  topic: string;
  explanation: string;
}

/**
 * Interactive sample quiz.
 *
 * The previous markup styled the options as clickable (pointer cursor, hover
 * colour) but wired nothing to them, so the page promised an interaction it
 * never delivered. Answers are now selectable, graded, and explained.
 */
export function SampleQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((q) => answers[q.id] === q.answer).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-lg font-bold">
          Sample quiz{' '}
          <span className="text-sm font-normal text-content-subtle">
            — {questions.length} questions
          </span>
        </h2>
        <span className="font-mono text-xs text-content-subtle">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <ol className="mt-5 space-y-4">
        {questions.map((question, index) => {
          const chosen = answers[question.id];
          const hasChosen = chosen !== undefined;

          return (
            <li key={question.id}>
              <Card>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs text-accent"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Badge tone="neutral">{question.topic}</Badge>
                    <p className="mt-2 text-sm font-medium sm:text-base">
                      {question.text}
                    </p>
                  </div>
                </div>

                <fieldset className="mt-4 sm:ml-10">
                  <legend className="sr-only">{question.text}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => {
                      const isChosen = chosen === optionIndex;
                      const isCorrect = optionIndex === question.answer;

                      // Colour only settles after submitting; before that the
                      // selection is neutral so it can't leak the answer.
                      let tone =
                        'border-line hover:border-line-strong text-content-muted';
                      if (submitted && isCorrect) {
                        tone = 'border-success bg-success-soft text-success';
                      } else if (submitted && isChosen && !isCorrect) {
                        tone = 'border-danger bg-danger-soft text-danger';
                      } else if (isChosen) {
                        tone = 'border-accent bg-accent-soft text-accent';
                      }

                      return (
                        <label
                          key={optionIndex}
                          className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors sm:text-sm ${tone}`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionIndex}
                            checked={isChosen}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-content-subtle">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="min-w-0">{option}</span>
                          {submitted && isCorrect && (
                            <span aria-hidden="true" className="ml-auto">
                              ✓
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {submitted && (
                  <div
                    className={`mt-4 rounded-lg border p-3 text-xs leading-relaxed sm:ml-10 ${
                      hasChosen && chosen === question.answer
                        ? 'border-success/30 bg-success-soft'
                        : 'border-line bg-surface-overlay'
                    }`}
                  >
                    <p className="font-mono font-bold">
                      {!hasChosen
                        ? 'Not answered'
                        : chosen === question.answer
                          ? 'Correct'
                          : 'Not quite'}
                    </p>
                    <p className="mt-1 text-content-muted">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {!submitted ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={answeredCount === 0}
            className="quantum-btn w-full sm:w-auto"
          >
            Check answers
          </button>
        ) : (
          <>
            <p className="font-mono text-sm">
              Score:{' '}
              <span
                className={
                  score === questions.length ? 'text-success' : 'text-accent'
                }
              >
                {score}/{questions.length}
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="rounded-lg border border-line-strong px-4 py-2.5 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
