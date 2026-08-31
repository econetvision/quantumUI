"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { completeQuestion, isQuestionCompleted, recordActivity, XP_REWARDS } from '@/lib/streak';
import { extractPromptImages } from '@/lib/prompt-images';
import { BackendPicker } from '@/components/quantum/BackendPicker';
import { trackEvent } from '@/lib/analytics-client';
import { CelebrationBurst } from '@/components/learning/CelebrationBurst';

interface TerminalLine {
  kind: 'input' | 'output' | 'error' | 'info';
  text: string;
}

interface LabQuestion {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  starterCode: string;
  solution: string;
  /** Prose answer for proof/discussion tasks; never loaded into the editor. */
  workedSolution?: string;
  hint?: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'complex';
}

interface TopicGate {
  trackSlug: string | null;
  lessonsTotal: number;
  lessonsDone: number;
  unlocked: boolean;
}

interface TopicBank {
  slug: string;
  name: string;
  certification: string;
  questions: LabQuestion[];
  /**
   * Set by the API when this track's lessons are not finished. The questions
   * array arrives empty in that case — the gate is enforced server-side, so
   * locked content never reaches the browser to be un-hidden.
   */
  locked?: boolean;
  gate?: TopicGate;
}

const DIFFICULTY_LABELS: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Medium', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  complex: { label: 'Complex', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const WELCOME: TerminalLine[] = [
  { kind: 'info', text: 'QuantumUI Lab Shell — Python REPL with qpiai-sdk (Circuit is pre-loaded)' },
  { kind: 'info', text: 'Type Python code and press Enter to run. Shift+Enter for a new line.' },
  { kind: 'info', text: "Try:  c = Circuit(2, 2); c.h(0); c.cx(0, 1); c.run(shots=1024).get_counts()" },
];

export default function LabShell() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`
  );
  // Where the code runs: the in-process simulator, a QCloud simulator, or the
  // Indus-1 QPU. BackendPicker sets this to the executor's default on mount.
  const [backend, setBackend] = useState<string | null>(null);

  // Q&A state
  const [topics, setTopics] = useState<TopicBank[]>([]);
  const [topicSlug, setTopicSlug] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'complex'>('all');
  const [selected, setSelected] = useState<LabQuestion | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [celebration, setCelebration] = useState(0);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/labs/questions')
      .then((res) => res.json())
      .then((data) => {
        const t: TopicBank[] = data.topics || [];
        setTopics(t);
        // Open on something the learner can actually work on. Landing on a
        // locked bank looks like an empty product rather than a gate.
        const first = t.find((x) => !x.locked) ?? t[0];
        if (first) setTopicSlug(first.slug);
      })
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [lines]);

  const runCode = useCallback(
    async (code: string) => {
      if (!code.trim() || busy) return;
      setBusy(true);
      setLines((prev) => [
        ...prev,
        ...code.split('\n').map((l, i) => ({
          kind: 'input' as const,
          text: (i === 0 ? '>>> ' : '... ') + l,
        })),
      ]);
      setHistory((prev) => [...prev, code]);
      setHistoryIdx(-1);
      setInput('');

      try {
        const res = await fetch('/api/quantum/repl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, code, backend }),
        });
        const result = await res.json();
        setLines((prev) => {
          const next = [...prev];
          if (result.output) next.push({ kind: 'output', text: result.output.replace(/\n$/, '') });
          if (result.error) next.push({ kind: 'error', text: result.error });
          return next;
        });
        trackEvent('code_run', {
          meta: { surface: 'lab-shell', backend, ok: Boolean(result.success) },
        });
        // Keep the streak alive for the attempt, award XP only for a clean run.
        // This used to be `if (result.success)`, so a lab whose published
        // solution imports a module this environment does not carry — most of
        // the Cirq-era QWorld material — gave the learner no day credit at all.
        // Turning up and running code is the behaviour a streak exists to
        // reward; getting it right is what XP is for.
        recordActivity(result.success ? XP_REWARDS.run : 0);
      } catch {
        setLines((prev) => [...prev, { kind: 'error', text: 'Connection to executor failed.' }]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, sessionId, backend]
  );

  const resetSession = useCallback(async () => {
    await fetch('/api/quantum/repl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, code: '', reset: true }),
    }).catch(() => {});
    setLines([...WELCOME, { kind: 'info', text: 'Session reset — all variables cleared.' }]);
  }, [sessionId]);

  /**
   * Switch execution target.
   *
   * The executor pins a REPL session's backend when it first builds the
   * namespace, so a running session keeps whatever it started on. Changing the
   * dropdown without clearing the session would leave the picker showing one
   * platform while the code kept running on another — so the switch resets,
   * and says that it did rather than dropping the learner's variables silently.
   */
  const changeBackend = useCallback(
    async (next: string) => {
      if (next === backend) return;
      const first = backend === null;
      setBackend(next);
      if (first) return; // BackendPicker choosing the default on mount

      await fetch('/api/quantum/repl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: '', reset: true }),
      }).catch(() => {});
      setLines((prev) => [
        ...prev,
        { kind: 'info', text: `Now running on ${next} — session reset, variables cleared.` },
      ]);
    },
    [backend, sessionId]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runCode(input);
    } else if (e.key === 'ArrowUp' && !input.includes('\n')) {
      e.preventDefault();
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      if (history[idx] !== undefined) {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown' && historyIdx !== -1) {
      e.preventDefault();
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  const currentTopic = topics.find((t) => t.slug === topicSlug);
  const questions = (currentTopic?.questions || []).filter(
    (q) => difficulty === 'all' || q.difficulty === difficulty
  );

  const selectQuestion = (q: LabQuestion) => {
    setSelected(q);
    setShowSolution(false);
    setShowHint(false);
    setCompleted((prev) => ({ ...prev, [q.id]: isQuestionCompleted(q.id) }));
  };

  const markComplete = (q: LabQuestion) => {
    if (completed[q.id]) return;
    completeQuestion(q.id, XP_REWARDS[q.difficulty]);
    setCompleted((prev) => ({ ...prev, [q.id]: true }));
    setCelebration((n) => n + 1);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Terminal */}
      <div className="quantum-card overflow-hidden flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-quantum-bg-secondary border-b border-quantum-accent/10">
          <span className="font-mono text-sm text-quantum-accent">⌨️ Lab Shell (qpiai-sdk REPL)</span>
          <div className="flex flex-wrap items-center gap-2">
            <BackendPicker
              value={backend}
              onChange={changeBackend}
              className="min-w-[11rem]"
            />
            <button
              onClick={() => setLines(WELCOME)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-600/40 text-content-muted hover:text-content transition-colors"
            >
              Clear
            </button>
            <button
              onClick={resetSession}
              className="text-xs px-3 py-1.5 rounded-lg border border-quantum-accent/30 text-quantum-accent hover:bg-quantum-accent/10 transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div
          ref={terminalRef}
          className="flex-1 min-h-[320px] max-h-[480px] overflow-y-auto bg-surface-sunken p-4 font-mono text-sm cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <pre
              key={i}
              className={`whitespace-pre-wrap ${
                line.kind === 'input'
                  ? 'text-content'
                  : line.kind === 'error'
                  ? 'text-red-400'
                  : line.kind === 'info'
                  ? 'text-content-subtle'
                  : 'text-green-400'
              }`}
            >
              {line.text}
            </pre>
          ))}
          <div className="flex items-start gap-0">
            <span className="text-quantum-accent select-none pt-0.5">{busy ? '...' : '>>>'}</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={busy}
              rows={Math.max(1, input.split('\n').length)}
              spellCheck={false}
              className="flex-1 bg-transparent text-content outline-none resize-none pl-2 font-mono text-sm"
              placeholder={busy ? 'running...' : ''}
              autoFocus
            />
          </div>
        </div>

        {/* Run bar — Enter already runs, but an explicit button is the
            affordance a first-time (or eight-year-old) visitor actually
            finds. Sits outside the scroll area so it can never scroll away. */}
        <div className="flex items-center justify-between gap-3 border-t border-quantum-accent/10 bg-quantum-bg-secondary px-4 py-3">
          <p className="hidden font-mono text-xs text-content-subtle sm:block">
            Enter runs · Shift+Enter for a new line
          </p>
          <button
            onClick={() => runCode(input)}
            disabled={busy || !input.trim()}
            className="quantum-btn ml-auto !min-h-[2.5rem] px-6 text-xs disabled:opacity-50"
          >
            {busy ? '⏳ Running…' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Q&A Panel */}
      <div className="quantum-card overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-quantum-bg-secondary border-b border-quantum-accent/10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm text-quantum-accent">📝 Lab Questions (QWorld)</span>
            <select
              value={topicSlug}
              onChange={(e) => {
                setTopicSlug(e.target.value);
                setSelected(null);
              }}
              className="bg-surface-sunken border border-quantum-accent/30 text-content text-xs rounded-lg px-2 py-1.5 font-mono outline-none"
            >
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.locked
                    ? `🔒 ${t.name} (${t.gate?.lessonsDone ?? 0}/${t.gate?.lessonsTotal ?? 0} lessons)`
                    : `${t.name} (${t.questions.length})`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {(['all', 'easy', 'medium', 'complex'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-xs px-3 py-1 rounded-full border font-mono transition-colors ${
                  difficulty === d
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-gray-700 text-content-subtle hover:text-content-muted'
                }`}
              >
                {d === 'all' ? 'All' : DIFFICULTY_LABELS[d].label}
              </button>
            ))}
          </div>
          {currentTopic && (
            <p className="text-xs text-content-subtle font-mono">
              🎯 Builds toward: {currentTopic.certification}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[480px]">
          {currentTopic?.locked ? (
            /* A locked bank arrives with no questions, so without this it
               would look like an empty product. It says what is missing and
               links straight at the work that opens it. */
            <div className="p-6 text-center">
              <p className="text-3xl" aria-hidden="true">🔒</p>
              <p className="mt-3 font-mono text-sm font-bold text-content">
                {currentTopic.name} labs are locked
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-content-muted">
                Finish the lessons in this track first — you have completed{' '}
                {currentTopic.gate?.lessonsDone ?? 0} of{' '}
                {currentTopic.gate?.lessonsTotal ?? 0}. The labs assume the
                material those lessons cover, so opening them early is how a
                learner concludes the exercises are broken.
              </p>
              {currentTopic.gate?.trackSlug && (
                <a
                  href={`/tracks/${currentTopic.gate.trackSlug}`}
                  className="quantum-btn mt-4 inline-flex"
                >
                  Go to the lessons
                </a>
              )}
            </div>
          ) : !selected ? (
            <div className="divide-y divide-quantum-accent/10">
              {questions.length === 0 && (
                <p className="p-4 text-sm text-content-subtle">No questions for this filter.</p>
              )}
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => selectQuestion(q)}
                  className="w-full text-left p-3 hover:bg-quantum-accent/5 transition-colors flex items-center gap-3"
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${DIFFICULTY_LABELS[q.difficulty].cls}`}
                  >
                    {DIFFICULTY_LABELS[q.difficulty].label}
                  </span>
                  <span className="text-sm text-content flex-1">{q.title}</span>
                  {isQuestionCompleted(q.id) && <span className="text-green-400 text-sm">✓</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-content-muted hover:text-content font-mono"
                >
                  ← Back to list
                </button>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-mono ${DIFFICULTY_LABELS[selected.difficulty].cls}`}
                >
                  {DIFFICULTY_LABELS[selected.difficulty].label} · +{XP_REWARDS[selected.difficulty]} XP
                </span>
              </div>
              <h3 className="font-mono font-bold text-content">{selected.title}</h3>
              {(() => {
                // Prompts can carry an <img> tag naming a diagram the task
                // refers to; shown as an image rather than literal markup.
                const parts = extractPromptImages(selected.prompt);
                return (
                  <>
                    <pre className="whitespace-pre-wrap text-sm text-content-muted bg-surface-sunken/40 p-3 rounded-lg border border-quantum-accent/10 max-h-48 overflow-y-auto">
                      {parts.text}
                    </pre>
                    {parts.images.map((src) => (
                      // White plate: these are black-line figures from the
                      // notebooks and vanish on the dark surface without it.
                      <div key={src} className="rounded-lg bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt="Diagram referenced by this task"
                          loading="lazy"
                          className="mx-auto max-h-56 w-auto"
                        />
                      </div>
                    ))}
                  </>
                );
              })()}
              <p className="text-xs text-content-subtle font-mono">Source: {selected.source}</p>

              <div className="flex flex-wrap gap-2">
                {selected.starterCode && (
                  <button
                    onClick={() => {
                      setInput(selected.starterCode);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-quantum-accent/30 text-quantum-accent hover:bg-quantum-accent/10 transition-colors font-mono"
                  >
                    ⤵ Load starter code into shell
                  </button>
                )}
                {selected.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-quantum-accent/30 text-quantum-accent hover:bg-quantum-accent/10 transition-colors font-mono"
                  >
                    {showHint ? 'Hide hint' : '💡 Hint'}
                  </button>
                )}
                {(selected.solution || selected.workedSolution) && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors font-mono"
                  >
                    {showSolution ? 'Hide solution' : 'Show solution'}
                  </button>
                )}
                <span className="relative inline-flex">
                  <button
                    onClick={() => markComplete(selected)}
                    disabled={completed[selected.id]}
                    className="text-xs px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors font-mono disabled:opacity-50"
                  >
                    {completed[selected.id] ? '✓ Completed' : 'Mark complete'}
                  </button>
                  <CelebrationBurst burstKey={celebration} />
                </span>
              </div>

              {showHint && selected.hint && (
                <div className="rounded-lg border border-quantum-accent/30 bg-quantum-accent/5 p-3">
                  <span className="text-xs text-quantum-accent font-mono">Hint</span>
                  <p className="mt-1 text-sm leading-relaxed text-content-muted">{selected.hint}</p>
                </div>
              )}

              {/* Worked answers for tasks that are proofs or discussions rather
                  than programs. Rendered as prose, and deliberately without a
                  "load into shell" button — it is not code and would not run. */}
              {showSolution && selected.workedSolution && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <span className="text-xs text-yellow-400 font-mono">Worked answer</span>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
                    {selected.workedSolution}
                  </div>
                </div>
              )}

              {showSolution && selected.solution && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-yellow-400 font-mono">Solution</span>
                    <button
                      onClick={() => {
                        setInput(selected.solution);
                        inputRef.current?.focus();
                      }}
                      className="text-xs text-content-muted hover:text-content font-mono"
                    >
                      ⤵ Load into shell
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-yellow-200/80 bg-surface-sunken/40 p-3 rounded-lg border border-yellow-500/20 max-h-48 overflow-y-auto">
                    {selected.solution}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
