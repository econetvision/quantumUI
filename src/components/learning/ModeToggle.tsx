'use client';

import { useLearningMode } from './LearningModeProvider';

/**
 * Kid / Student switch.
 *
 * A segmented control rather than a single toggle button: with two named
 * options both are always visible, so a learner can see which layer they are
 * in without having to infer it from an icon. Implemented as radios so arrow
 * keys move between them and screen readers announce it as one group.
 */
export function ModeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useLearningMode();

  return (
    <fieldset
      className={`inline-flex items-center rounded-lg border border-line p-0.5 ${className}`}
    >
      <legend className="sr-only">Learning mode</legend>
      {(
        [
          { value: 'kid', label: 'Kid', emoji: '🧒', hint: 'Stories, animations and games. No maths.' },
          { value: 'student', label: 'Student', emoji: '🎓', hint: 'Full equations, matrices and worked examples.' },
        ] as const
      ).map((opt) => {
        const active = mode === opt.value;
        return (
          <label
            key={opt.value}
            title={opt.hint}
            className={`cursor-pointer select-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent text-accent-contrast'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <input
              type="radio"
              name="learning-mode"
              value={opt.value}
              checked={active}
              onChange={() => setMode(opt.value)}
              className="sr-only"
            />
            <span aria-hidden="true">{opt.emoji}</span> {opt.label}
          </label>
        );
      })}
    </fieldset>
  );
}
