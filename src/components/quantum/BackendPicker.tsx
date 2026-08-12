'use client';

import { useEffect, useState } from 'react';
import type { Backend } from '@/lib/quantum-client';

/**
 * Backend selector.
 *
 * Cloud backends and the Indus-1 QPU need a QpiAI API key. Rather than hiding
 * them, they are listed and disabled with the reason shown — the point is for
 * learners to see that a real QPU is on the other side of this dropdown.
 */
export function BackendPicker({
  value,
  onChange,
  className = '',
}: {
  value: string | null;
  onChange: (backendId: string) => void;
  className?: string;
}) {
  const [backends, setBackends] = useState<Backend[]>([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/quantum/backends')
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setBackends(data.backends ?? []);
        setOffline(Boolean(data.offline));
        if (!value && data.default) onChange(data.default);
      })
      .catch(() => {
        if (!cancelled) setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Runs once: the picker fetches its options on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = backends.find((backend) => backend.id === value);

  return (
    <div className={className}>
      <label
        htmlFor="backend-picker"
        className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
      >
        Backend
      </label>

      <select
        id="backend-picker"
        value={value ?? ''}
        disabled={loading || offline || !backends.length}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface-raised px-3 font-mono text-sm text-content disabled:opacity-60"
      >
        {loading && <option>Loading backends…</option>}
        {offline && <option>Executor offline</option>}
        {backends.map((backend) => (
          <option key={backend.id} value={backend.id} disabled={!backend.available}>
            {backend.label}
            {backend.available ? '' : ' — needs API key'}
          </option>
        ))}
      </select>

      {selected && (
        <p className="mt-1.5 text-xs leading-relaxed text-content-subtle">
          {selected.description} Up to {selected.max_qubits} qubits.
        </p>
      )}
    </div>
  );
}
