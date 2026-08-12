"use client";

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { completeQuestion, getStreakData, recordActivity, XP_REWARDS } from '@/lib/streak';

interface LabQuestion {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  starterCode: string;
  solution: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'complex';
}

interface ExecutionResult {
  success: boolean;
  output: string;
  counts?: Record<string, number>;
  circuit_diagram?: string;
  error?: string;
  execution_time_ms?: number;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'text-green-400 border-green-500/40 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  complex: 'text-red-400 border-red-500/40 bg-red-500/10',
};

/**
 * Make notebook prompts readable in the UI: strip raw LaTeX blocks and
 * HTML tags that don't render in plain text, and tidy the whitespace.
 */
function cleanPrompt(raw: string): { text: string; hadMath: boolean } {
  let s = raw;
  const before = s.length;
  s = s.replace(/\$\$[\s\S]*?\$\$/g, ' ');
  s = s.replace(/\$[^$]*\$/g, ' ');
  s = s.replace(/\\begin\{[a-z*]+\}[\s\S]*?\\end\{[a-z*]+\}/gi, ' ');
  const hadMath = s.length !== before;
  s = s.replace(/<[^>]+>/g, '');
  s = s
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: s, hadMath };
}

const DEFAULT_SCAFFOLD = `# Scenario: build the circuit for this task, then run it
# on the QpiAI-QSV-Local statevector simulator.
circuit = Circuit(2, 2)
circuit.h(0)
# ... add your gates here ...
circuit.measure_all()
result = circuit.run(shots=1024)
print(result.get_counts())
`;

export default function LessonLab({
  topic,
  lessonNumber,
  count = 3,
}: {
  topic: string;
  lessonNumber: number;
  count?: number;
}) {
  const [questions, setQuestions] = useState<LabQuestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/labs/questions?topic=${encodeURIComponent(topic)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const all: LabQuestion[] = d.topics?.[0]?.questions || [];
        if (all.length === 0) {
          setLoaded(true);
          return;
        }
        // Deterministic per-lesson selection: each lesson gets its own
        // rotating window of scenario questions from the topic bank.
        const start = ((lessonNumber - 1) * count) % all.length;
        const picked: LabQuestion[] = [];
        for (let i = 0; i < Math.min(count, all.length); i++) {
          picked.push(all[(start + i) % all.length]);
        }
        setQuestions(picked);
        setCode(picked[0].starterCode || DEFAULT_SCAFFOLD);
        setCompleted(getStreakData().completedQuestions);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [topic, lessonNumber, count]);

  const active = questions[activeIdx];

  const selectQuestion = (idx: number) => {
    setActiveIdx(idx);
    setCode(questions[idx].starterCode || DEFAULT_SCAFFOLD);
    setResult(null);
    setShowSolution(false);
  };

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/quantum/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setResult(data);
      recordActivity(XP_REWARDS.run);
    } catch {
      setResult({ success: false, output: '', error: 'Executor unreachable. Is the quantum-executor service running on :8080?' });
    } finally {
      setRunning(false);
    }
  };

  const handleComplete = () => {
    if (!active || completed.includes(active.id)) return;
    completeQuestion(active.id, XP_REWARDS[active.difficulty] ?? XP_REWARDS.easy);
    setCompleted(getStreakData().completedQuestions);
  };

  if (!loaded || questions.length === 0) return null;

  const maxCount = result?.counts ? Math.max(...Object.values(result.counts)) : 0;
  const solvedCount = questions.filter((q) => completed.includes(q.id)).length;
  const cleaned = active ? cleanPrompt(active.prompt) : null;

  return (
    <div className="quantum-card p-6 sm:p-8 mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="text-xl font-mono font-bold text-content">
          ⌨️ Hands-on <span className="gradient-text">Lab</span>
        </h2>
        <span className="flex items-center gap-2 text-xs text-content-muted font-mono px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live statevector simulator
        </span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-content-subtle text-sm">Solve real scenarios, run them instantly.</p>
        <span className="ml-auto text-xs font-mono text-content-subtle">
          {solvedCount}/{questions.length} solved
        </span>
        <span className="w-24 h-1.5 bg-surface-sunken rounded-full overflow-hidden">
          <span
            className="block h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${(solvedCount / questions.length) * 100}%` }}
          />
        </span>
      </div>

      {/* Scenario steps */}
      <div className="flex flex-wrap gap-2 mb-5">
        {questions.map((q, idx) => {
          const done = completed.includes(q.id);
          return (
            <button
              key={q.id}
              onClick={() => selectQuestion(idx)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                idx === activeIdx
                  ? 'border-blue-500 text-blue-300 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                  : 'border-gray-800 text-content-subtle hover:border-gray-600 hover:text-content-muted'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? 'bg-green-500/20 text-green-400'
                    : idx === activeIdx
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-surface-sunken text-content-subtle'
                }`}
              >
                {done ? '✓' : idx + 1}
              </span>
              Scenario {idx + 1}
              <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${DIFFICULTY_STYLES[q.difficulty]}`}>
                {q.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="space-y-4">
          {/* Scenario prompt */}
          <div className="bg-surface-sunken border border-quantum-accent/20 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="font-mono text-sm text-blue-300 font-bold">📋 {active.title}</p>
              <span className="text-[10px] text-content-subtle font-mono truncate" title={active.source}>
                {active.source.split('/').pop()}
              </span>
            </div>
            <p className="text-content-muted text-sm whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {cleaned?.text}
            </p>
            {cleaned?.hadMath && (
              <p className="text-[10px] text-content-subtle font-mono mt-3">
                ⓘ Full mathematical notation available in the source notebook.
              </p>
            )}
          </div>

          {/* Editor */}
          <div className="border border-quantum-accent/20 rounded-lg overflow-hidden">
            <Editor
              height="240px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 10 },
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleRun} disabled={running} className="quantum-btn text-xs px-4 py-2 disabled:opacity-50">
              {running ? '⏳ Running…' : '▶ Run on simulator'}
            </button>
            {active.solution && (
              <button
                onClick={() => setShowSolution((s) => !s)}
                className="px-4 py-2 rounded-lg border border-gray-700 text-content-muted hover:text-content text-xs font-mono transition-colors"
              >
                {showSolution ? 'Hide solution' : '💡 Show solution'}
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={completed.includes(active.id)}
              className={`px-4 py-2 rounded-lg border text-xs font-mono transition-colors ${
                completed.includes(active.id)
                  ? 'border-green-500/40 text-green-400 bg-green-500/10 cursor-default'
                  : 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              {completed.includes(active.id)
                ? '✓ Completed'
                : `✓ Mark complete (+${XP_REWARDS[active.difficulty] ?? XP_REWARDS.easy} XP)`}
            </button>
          </div>

          {/* Solution */}
          {showSolution && active.solution && (
            <div className="bg-surface-sunken border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs text-yellow-400 font-bold">Solution</p>
                <button
                  onClick={() => setCode(active.solution)}
                  className="text-[10px] font-mono text-content-subtle hover:text-content"
                >
                  Load into editor →
                </button>
              </div>
              <pre className="text-content-muted text-xs whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {active.solution}
              </pre>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`rounded-lg border p-4 ${
                result.success ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`font-mono text-xs font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? '✓ Execution succeeded' : '✕ Execution failed'}
                </p>
                {result.execution_time_ms != null && (
                  <span className="text-[10px] text-content-subtle font-mono">{result.execution_time_ms.toFixed(2)} ms</span>
                )}
              </div>
              {result.error && (
                <pre className="text-red-300 text-xs whitespace-pre-wrap mb-2">{result.error}</pre>
              )}
              {result.output && (
                <pre className="text-content-muted text-xs whitespace-pre-wrap mb-2 max-h-40 overflow-y-auto">
                  {result.output}
                </pre>
              )}
              {result.counts && (
                <div className="space-y-1.5 mt-3">
                  <p className="text-[10px] font-mono text-content-subtle uppercase tracking-wider mb-1">
                    Measurement distribution
                  </p>
                  {Object.entries(result.counts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([state, n]) => (
                      <div key={state} className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-blue-300 w-16">|{state}⟩</span>
                        <span className="flex-1 h-3.5 bg-surface-sunken rounded-full overflow-hidden">
                          <span
                            className="block h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${(n / maxCount) * 100}%` }}
                          />
                        </span>
                        <span className="text-content-muted w-12 text-right">{n}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
