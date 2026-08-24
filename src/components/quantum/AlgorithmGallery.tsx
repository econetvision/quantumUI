'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  Algorithm,
  AlgorithmParam,
  AlgorithmResult,
} from '@/lib/quantum-client';
import { Badge, Callout, Card, EmptyState } from '@/components/ui/primitives';
import { MeasurementHistogram } from './MeasurementHistogram';
import { BlochReadout } from './BlochReadout';
import { BackendPicker } from './BackendPicker';

type ParamValues = Record<string, string | number | boolean>;

function defaultsFor(algorithm: Algorithm): ParamValues {
  return Object.fromEntries(
    algorithm.params.map((param) => [param.name, param.default]),
  );
}

/** Renders one schema-driven form control. */
function ParamField({
  param,
  value,
  onChange,
}: {
  param: AlgorithmParam;
  value: string | number | boolean;
  onChange: (next: string | number | boolean) => void;
}) {
  const id = `param-${param.name}`;
  const base =
    'h-11 w-full rounded-lg border border-line bg-surface px-3 font-mono text-sm text-content';

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
      >
        {param.label}
      </label>

      {param.type === 'int' && (
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={param.min}
          max={param.max}
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className={`mt-1.5 ${base}`}
        />
      )}

      {param.type === 'bitstring' && (
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[01]*"
          spellCheck={false}
          autoComplete="off"
          value={String(value)}
          onChange={(event) =>
            onChange(event.target.value.replace(/[^01]/g, ''))
          }
          className={`mt-1.5 ${base}`}
        />
      )}

      {param.type === 'choice' && (
        <select
          id={id}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`mt-1.5 ${base}`}
        >
          {param.choices?.map((choice) => (
            <option key={String(choice)} value={String(choice)}>
              {String(choice)}
            </option>
          ))}
        </select>
      )}

      {param.type === 'bool' && (
        <label
          htmlFor={id}
          className="mt-1.5 flex min-h-11 items-center gap-2.5 rounded-lg border border-line bg-surface px-3"
        >
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="text-sm text-content-muted">Enabled</span>
        </label>
      )}

      {param.help && (
        <p className="mt-1 text-xs leading-relaxed text-content-subtle">
          {param.help}
        </p>
      )}
    </div>
  );
}

/** Human-readable rendering of the algorithm-specific takeaway. */
function InsightPanel({ insight }: { insight: Record<string, unknown> }) {
  const entries = Object.entries(insight).filter(
    ([, value]) => value !== null && value !== undefined,
  );
  if (!entries.length) return null;

  return (
    <Callout tone="accent" title="What this run shows">
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
        {entries.map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="font-mono text-xs uppercase tracking-wide text-content-subtle">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd className="font-mono text-sm text-content">
              {typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </Callout>
  );
}

export function AlgorithmGallery() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [params, setParams] = useState<ParamValues>({});
  const [shots, setShots] = useState(1024);
  const [backend, setBackend] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AlgorithmResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/quantum/algorithms')
      .then((response) => response.json())
      .then((data) => {
        setAlgorithms(data.algorithms ?? []);
        setCategories(data.categories ?? []);
        if (data.offline || !data.algorithms?.length) {
          setLoadError(
            data.error ??
              'Circuit execution is temporarily unavailable, so the algorithm catalogue cannot load.',
          );
        }
      })
      .catch(() =>
        setLoadError('Could not reach the algorithm catalogue.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
    () => algorithms.find((algorithm) => algorithm.id === selectedId) ?? null,
    [algorithms, selectedId],
  );

  const select = (algorithm: Algorithm) => {
    setSelectedId(algorithm.id);
    setParams(defaultsFor(algorithm));
    setResult(null);
    setRunError(null);
  };

  const run = async () => {
    if (!selected) return;
    setRunning(true);
    setRunError(null);

    try {
      const response = await fetch(
        `/api/quantum/algorithms/${selected.id}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params, shots, backend }),
        },
      );
      const data = await response.json();

      if (!response.ok || data.success === false) {
        setRunError(data.error ?? 'The run failed.');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setRunError('Could not reach the executor.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <p className="loading-quantum font-mono text-sm text-content-muted">
        Loading algorithm catalogue…
      </p>
    );
  }

  if (loadError) {
    return (
      // `loadError` already carries the full sentence from the API. This block
      // used to append a restart command after it, which both duplicated the
      // message and told a visitor to run a shell command they have no shell
      // for. The reader gets the state and what still works; the operator gets
      // the cause from the server log.
      <EmptyState
        title="Algorithm catalogue unavailable"
        description={
          <>
            {loadError} The curriculum and lesson material are unaffected.
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      {/* Catalogue */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
              {category}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {algorithms
                .filter((algorithm) => algorithm.category === category)
                .map((algorithm) => {
                  const active = algorithm.id === selectedId;
                  return (
                    <li key={algorithm.id}>
                      <button
                        type="button"
                        onClick={() => select(algorithm)}
                        aria-pressed={active}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-accent bg-accent-soft'
                            : 'border-line bg-surface-raised hover:border-line-strong'
                        }`}
                      >
                        <span
                          className={`block font-mono text-sm font-bold ${active ? 'text-accent' : 'text-content'}`}
                        >
                          {algorithm.name}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-content-muted">
                          {algorithm.summary}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>

      {/* Runner */}
      <div className="min-w-0">
        {!selected ? (
          <EmptyState
            title="Pick an algorithm"
            description="Choose one from the catalogue to configure its parameters and run it on the simulator."
          />
        ) : (
          <div className="space-y-5">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-mono text-lg font-bold">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-content-muted">
                    {selected.detail}
                  </p>
                </div>
                <Badge tone="accent">{selected.category}</Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {selected.params.map((param) => (
                  <ParamField
                    key={param.name}
                    param={param}
                    value={params[param.name] ?? param.default}
                    onChange={(next) =>
                      setParams((current) => ({
                        ...current,
                        [param.name]: next,
                      }))
                    }
                  />
                ))}

                <div>
                  <label
                    htmlFor="shots"
                    className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
                  >
                    Shots
                  </label>
                  <input
                    id="shots"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100000}
                    value={shots}
                    onChange={(event) => setShots(Number(event.target.value))}
                    className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 font-mono text-sm text-content"
                  />
                </div>

                <BackendPicker value={backend} onChange={setBackend} />
              </div>

              <button
                type="button"
                onClick={run}
                disabled={running}
                className="quantum-btn mt-5 w-full sm:w-auto"
              >
                {running ? 'Running…' : `Run ${selected.name}`}
              </button>
            </Card>

            {runError && (
              <Callout tone="danger" title="Run failed">
                {runError}
              </Callout>
            )}

            {result && (
              <>
                {result.notice && (
                  <Callout tone="warning" title="Backend substituted">
                    {result.notice}
                  </Callout>
                )}

                {result.insight && <InsightPanel insight={result.insight} />}

                {result.counts && (
                  <Card>
                    <MeasurementHistogram
                      counts={result.counts}
                      shots={shots}
                      caption={`${result.algorithm.name} — outcomes`}
                    />
                  </Card>
                )}

                {result.bloch_vectors && result.bloch_vectors.length > 0 && (
                  <Card>
                    <BlochReadout vectors={result.bloch_vectors} />
                  </Card>
                )}

                <Card>
                  <h3 className="font-mono text-sm font-bold">Circuit</h3>
                  <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-content-muted">
                    <div className="flex gap-1.5">
                      <dt className="text-content-subtle">backend</dt>
                      <dd>{result.backend}</dd>
                    </div>
                    {result.circuit?.depth !== undefined && (
                      <div className="flex gap-1.5">
                        <dt className="text-content-subtle">depth</dt>
                        <dd>{result.circuit.depth}</dd>
                      </div>
                    )}
                    {result.circuit?.size !== undefined && (
                      <div className="flex gap-1.5">
                        <dt className="text-content-subtle">gates</dt>
                        <dd>{result.circuit.size}</dd>
                      </div>
                    )}
                    {result.execution_time_ms != null && (
                      <div className="flex gap-1.5">
                        <dt className="text-content-subtle">time</dt>
                        <dd>{Math.round(result.execution_time_ms)}ms</dd>
                      </div>
                    )}
                  </dl>

                  {result.circuit_diagram && (
                    <pre className="scroll-x mt-3 rounded-lg bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-text">
                      {result.circuit_diagram}
                    </pre>
                  )}

                  {result.circuit?.qasm && (
                    <details className="mt-3">
                      <summary className="cursor-pointer font-mono text-xs text-accent">
                        View OpenQASM
                      </summary>
                      <pre className="scroll-x mt-2 rounded-lg bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-text">
                        {result.circuit.qasm}
                      </pre>
                    </details>
                  )}
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
