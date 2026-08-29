'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLearningMode } from './LearningModeProvider';
import { ModeToggle } from './ModeToggle';

/**
 * Learner settings, opened from the gear in the header.
 *
 * A popover rather than a route: every control here changes the page you are
 * already looking at, and navigating away to change font size then back would
 * lose your place in a lesson.
 *
 * Preferences persist to localStorage through the provider. For a signed-in
 * learner they are also mirrored to the account so a second device starts
 * where the first left off; that sync is fire-and-forget because losing it
 * must never block a setting from applying locally.
 */
export function SettingsPanel() {
  const { prefs, update, reducedMotion } = useLearningMode();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click and on Escape, and return focus to the trigger so
  // keyboard users are not dropped at the top of the document.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Mirror to the account, but only when there is an account to mirror to.
  // Firing this while anonymous returned 401 on every settings change — caught
  // in code, yet still logged by the browser as a failed request and recorded
  // server-side. Anonymous visitors are a supported state, not an error, so the
  // request is simply not made.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const id = setTimeout(() => {
      void fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
        keepalive: true,
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(id);
  }, [prefs, status]);

  const fontOptions = [
    { scale: 1, label: 'A', name: 'Normal' },
    { scale: 1.15, label: 'A+', name: 'Large' },
    { scale: 1.3, label: 'A++', name: 'Largest' },
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Learning settings"
        title="Learning settings"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-content-muted transition-colors hover:border-line-strong hover:text-content"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Learning settings"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface-raised p-4 shadow-xl"
        >
          <div className="space-y-5">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                Learning mode
              </p>
              <div className="mt-2">
                <ModeToggle className="w-full [&>label]:flex-1 [&>label]:text-center" />
              </div>
              <p className="mt-1.5 text-xs text-content-muted">
                {prefs.mode === 'kid'
                  ? 'Stories, animations and games — no maths.'
                  : 'Full equations, matrices and worked examples.'}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                Text size
              </p>
              <div className="mt-2 flex gap-2">
                {fontOptions.map((f) => (
                  <button
                    key={f.scale}
                    type="button"
                    onClick={() => update({ fontScale: f.scale })}
                    aria-pressed={prefs.fontScale === f.scale}
                    aria-label={`Text size: ${f.name}`}
                    className={`h-11 flex-1 rounded-lg border text-sm transition-colors ${
                      prefs.fontScale === f.scale
                        ? 'border-accent bg-accent-soft text-content'
                        : 'border-line text-content-muted hover:text-content'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Row
              label="Sound effects"
              hint="Gentle clicks and chimes during activities."
              checked={prefs.soundOn}
              onChange={(v) => update({ soundOn: v })}
            />
            <Row
              label="Reduce motion"
              hint={
                reducedMotion && !prefs.reducedMotion
                  ? 'Already reduced because your device asks for it.'
                  : 'Calms animations and transitions.'
              }
              checked={reducedMotion}
              // The OS setting is a floor: when the device already asks for
              // reduced motion the control shows on and cannot be turned off
              // here, rather than silently disagreeing with the system.
              disabled={reducedMotion && !prefs.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-content">{label}</span>
        <span className="block text-xs text-content-muted">{hint}</span>
      </span>
    </label>
  );
}
