'use client';

import { useState } from 'react';
import { Callout, Card } from '@/components/ui/primitives';
import type { SiteSettings } from '@/lib/site-settings';

/**
 * Optimistic in the UI, authoritative from the response: each toggle applies
 * locally at once so the switch never feels laggy, and the server's returned
 * settings replace local state afterwards. A rejected change therefore snaps
 * back rather than leaving the admin believing a flag is set when it is not.
 */
export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [banner, setBanner] = useState(initial.maintenanceBanner);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  async function patch(body: Partial<SiteSettings>) {
    const previous = settings;
    setSettings((s) => ({ ...s, ...body }));
    setStatus('saving');
    setError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettings(previous);
        setStatus('error');
        setError(data.error ?? 'Could not save.');
        return;
      }
      setSettings(data.settings);
      setBanner(data.settings.maintenanceBanner);
      setStatus('saved');
    } catch {
      setSettings(previous);
      setStatus('error');
      setError('Could not reach the server.');
    }
  }

  const flags = [
    { key: 'track0Enabled', label: 'Track 0 enabled', hint: 'Shows the "Quantum for Everyone" entry module.' },
    { key: 'kidModeDefault', label: 'Kid mode by default', hint: 'Which layer a brand-new visitor sees first.' },
    { key: 'showConfetti', label: 'Celebrations', hint: 'Confetti when a lesson is completed.' },
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
          Feature flags
        </h2>
        <div className="mt-4 space-y-4">
          {flags.map((f) => (
            <label key={f.key} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={settings[f.key]}
                onChange={(e) => void patch({ [f.key]: e.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-content">{f.label}</span>
                <span className="block text-xs text-content-muted">{f.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-content-subtle">
          Maintenance banner
        </h2>
        <p className="mt-1 text-xs text-content-muted">
          Shown site-wide. Leave empty to hide it.
        </p>
        <textarea
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Scheduled maintenance on Sunday 02:00–04:00 IST."
          className="mt-3 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content placeholder:text-content-subtle"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-content-subtle">{banner.length}/500</span>
          <button
            type="button"
            onClick={() => void patch({ maintenanceBanner: banner })}
            disabled={banner === settings.maintenanceBanner}
            className="quantum-btn disabled:opacity-50"
          >
            Save banner
          </button>
        </div>
      </Card>

      {status === 'error' && (
        <div role="alert">
          <Callout tone="danger">{error}</Callout>
        </div>
      )}
      {status === 'saved' && (
        <p role="status" className="text-sm text-content-muted">
          Saved. Live for everyone within a minute.
        </p>
      )}
    </div>
  );
}
