'use client';

import { useState } from 'react';
import { useLearningMode } from '@/components/learning/LearningModeProvider';

/**
 * Lesson 1: your name as switches.
 *
 * Typing your own name is the point — a child seeing *their* name in 0s and 1s
 * makes the abstraction personal in a way a fixed example never does.
 */
export function BinaryNameTag() {
  const { mode } = useLearningMode();
  const [name, setName] = useState('');
  const letters = [...name].slice(0, 8);

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-5">
      <label className="block">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
          {mode === 'kid' ? 'Type your name' : 'Text to encode'}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={mode === 'kid' ? 'Ada' : 'ASCII input'}
          maxLength={8}
          className="mt-1.5 h-12 w-full rounded-lg border border-line bg-surface px-3 text-lg text-content placeholder:text-content-subtle"
        />
      </label>

      {letters.length === 0 ? (
        <p className="mt-4 text-sm text-content-muted">
          {mode === 'kid'
            ? 'Type a letter and watch it turn into switches!'
            : 'Each character becomes its 8-bit ASCII code.'}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {letters.map((ch, i) => {
            const code = ch.charCodeAt(0);
            const bits = code.toString(2).padStart(8, '0');
            return (
              <div key={`${ch}-${i}`} className="flex flex-wrap items-center gap-3">
                <span className="w-8 text-center text-2xl font-bold">{ch}</span>
                <div className="flex gap-1" aria-label={`${ch} is ${bits} in binary`}>
                  {[...bits].map((b, j) => (
                    <span
                      key={j}
                      aria-hidden="true"
                      className={`flex h-9 w-7 items-center justify-center rounded font-mono text-sm ${
                        b === '1'
                          ? 'bg-accent text-accent-contrast'
                          : 'border border-line text-content-subtle'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
                {mode !== 'kid' && (
                  <span className="font-mono text-xs text-content-subtle">
                    ASCII {code}
                  </span>
                )}
              </div>
            );
          })}
          <p className="text-xs text-content-muted">
            {mode === 'kid'
              ? `That is ${letters.length * 8} switches — and your whole phone is millions of them.`
              : `${letters.length} characters × 8 bits = ${letters.length * 8} bits (${letters.length} bytes).`}
          </p>
        </div>
      )}
    </div>
  );
}
