'use client';

import { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { ExecutionResult } from '@/lib/quantum-client';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Badge, Callout, Card } from '@/components/ui/primitives';
import { MeasurementHistogram } from '@/components/quantum/MeasurementHistogram';
import { BlochReadout } from '@/components/quantum/BlochReadout';
import { BackendPicker } from '@/components/quantum/BackendPicker';

interface QuantumExample {
  name: string;
  description: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const DEFAULT_CODE = `from qpiai_quantum import Circuit

# Two qubits, two classical bits
circuit = Circuit(2, 2)

circuit.h(0)          # superposition on the first qubit
circuit.cx(0, 1)      # entangle it with the second
circuit.measure([0, 1], [0, 1])

circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Bell State")
counts = job_result.get_counts()
print(f"\\nResults: {counts}")
`;

type ExecutorStatus = 'checking' | 'connected' | 'offline';

export default function QuantumCodePlayground({
  initialCode = DEFAULT_CODE,
  title = 'Quantum playground',
  showExamples = true,
}: {
  initialCode?: string;
  title?: string;
  showBlochSphere?: boolean;
  showExamples?: boolean;
}) {
  const { theme } = useTheme();

  const [code, setCode] = useState(initialCode);
  const [shots, setShots] = useState(1024);
  const [backend, setBackend] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [examples, setExamples] = useState<QuantumExample[]>([]);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [status, setStatus] = useState<ExecutorStatus>('checking');
  const [mode, setMode] = useState<string | null>(null);

  // Probe the executor so the UI can say plainly whether runs are real.
  useEffect(() => {
    fetch('/api/quantum/execute')
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.status === 'connected' ? 'connected' : 'offline');
        setMode(data.executor?.mode ?? null);
      })
      .catch(() => setStatus('offline'));
  }, []);

  useEffect(() => {
    if (!showExamples) return;
    fetch('/api/quantum/examples')
      .then((response) => response.json())
      .then((data) => setExamples(data.examples ?? []))
      .catch(() => setExamples([]));
  }, [showExamples]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/quantum/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, shots, backend }),
      });
      const data: ExecutionResult = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Execution failed.');
        setResult(data.output ? data : null);
      } else {
        setResult(data);
      }
    } catch {
      setError('Could not reach the executor.');
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, [code, shots, backend]);

  // Cmd/Ctrl+Enter runs, matching every other code editor.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!running) run();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run, running]);

  const statusBadge = {
    checking: { tone: 'neutral' as const, label: 'Checking executor…' },
    connected: {
      tone: mode === 'live' ? ('success' as const) : ('accent' as const),
      label:
        mode === 'live'
          ? 'QpiAI cloud connected'
          : mode === 'mock'
            ? 'Demo mode — SDK not installed'
            : 'Local simulator',
    },
    offline: { tone: 'danger' as const, label: 'Executor offline' },
  }[status];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-lg font-bold">{title}</h2>
        <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
      </div>

      {status === 'offline' && (
        <Callout tone="warning" title="The quantum executor is not running">
          Circuits cannot be executed until it starts. Run{' '}
          <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-code-text">
            cd quantum-executor &amp;&amp; ./run.sh
          </code>{' '}
          and reload. Results are never faked in the browser.
        </Callout>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Editor */}
        <Card className="!p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
              circuit.py
            </span>
            <div className="flex items-center gap-2">
              {showExamples && examples.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExamplesOpen((value) => !value)}
                  className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-content-muted transition-colors hover:border-line-strong hover:text-content"
                >
                  Examples
                </button>
              )}
              <button
                type="button"
                onClick={run}
                disabled={running || status === 'offline'}
                className="quantum-btn !min-h-9 !px-4 !text-xs"
              >
                {running ? 'Running…' : 'Run ▶'}
              </button>
            </div>
          </div>

          {examplesOpen && (
            <ul className="max-h-56 overflow-y-auto border-b border-line">
              {examples.map((example) => (
                <li key={example.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setCode(example.code);
                      setExamplesOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-surface-overlay"
                  >
                    <span className="font-mono text-sm font-bold">
                      {example.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-content-muted">
                      {example.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Editor
            height="380px"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value ?? '')}
            // Follow the app theme rather than pinning a dark editor into a
            // light page.
            theme={theme === 'light' ? 'light' : 'vs-dark'}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />

          <div className="flex flex-wrap items-end gap-4 border-t border-line px-4 py-3">
            <div className="w-28">
              <label
                htmlFor="playground-shots"
                className="block font-mono text-xs font-bold uppercase tracking-wider text-content-subtle"
              >
                Shots
              </label>
              <input
                id="playground-shots"
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                value={shots}
                onChange={(event) => setShots(Number(event.target.value))}
                className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 font-mono text-sm"
              />
            </div>
            <BackendPicker
              value={backend}
              onChange={setBackend}
              className="min-w-[12rem] flex-1"
            />
          </div>
        </Card>

        {/* Output */}
        <div className="space-y-5">
          {error && (
            <Callout tone="danger" title="Execution error">
              <pre className="scroll-x whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {error}
              </pre>
            </Callout>
          )}

          {result?.notice && (
            <Callout tone="warning" title="Backend substituted">
              {result.notice}
            </Callout>
          )}

          <Card className="!p-0">
            <div className="border-b border-line px-4 py-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
                Output
              </span>
            </div>
            <pre className="scroll-x max-h-64 overflow-y-auto bg-code-bg p-4 font-mono text-xs leading-relaxed text-code-text">
              {result?.output?.trim() ||
                'Run the circuit to see output here.\n\nTip: press ⌘/Ctrl + Enter to run.'}
            </pre>
          </Card>

          {result?.counts && Object.keys(result.counts).length > 0 && (
            <Card>
              <MeasurementHistogram counts={result.counts} shots={shots} />
            </Card>
          )}

          {result?.bloch_vectors && result.bloch_vectors.length > 0 && (
            <Card>
              <BlochReadout vectors={result.bloch_vectors} />
            </Card>
          )}

          {result?.circuit_diagram && (
            <Card>
              <h3 className="font-mono text-sm font-bold">Circuit diagram</h3>
              <pre className="scroll-x mt-2 rounded-lg bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-text">
                {result.circuit_diagram}
              </pre>
              {result.execution_time_ms != null && (
                <p className="mt-2 font-mono text-xs text-content-subtle">
                  Completed in {Math.round(result.execution_time_ms)}ms on{' '}
                  {result.backend}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
