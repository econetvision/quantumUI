"use client";

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  createProject,
  deleteProject,
  getProjects,
  PROJECT_BACKENDS,
  PROJECT_TEMPLATES,
  QuantumProject,
  updateProject,
} from '@/lib/projects';
import { recordActivity, XP_REWARDS } from '@/lib/streak';

interface ExecutionResult {
  success: boolean;
  output: string;
  counts?: Record<string, number>;
  circuit_diagram?: string;
  error?: string;
  execution_time_ms?: number;
}

export default function ProjectsWorkspace() {
  const [projects, setProjects] = useState<QuantumProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('bell');
  const [newBackend, setNewBackend] = useState('QpiAI-QSV-Local');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [executorMode, setExecutorMode] = useState<string>('checking');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Defer the initial localStorage read past the sync effect body
    const t = setTimeout(() => {
      const list = getProjects();
      setProjects(list);
      if (list.length > 0) setActiveId(list[0].id);
    }, 0);
    fetch('/api/quantum/execute')
      .then((r) => r.json())
      .then((d) => setExecutorMode(d.executor?.mode || d.status || 'fallback'))
      .catch(() => setExecutorMode('fallback'));
    return () => clearTimeout(t);
  }, []);

  const active = projects.find((p) => p.id === activeId) || null;
  const liveEnabled = executorMode === 'live';

  const handleCreate = () => {
    if (!newName.trim()) return;
    const project = createProject(newName.trim(), newTemplate, newBackend);
    setProjects(getProjects());
    setActiveId(project.id);
    setShowCreate(false);
    setNewName('');
    setResult(null);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    const list = getProjects();
    setProjects(list);
    if (activeId === id) setActiveId(list[0]?.id || null);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!active) return;
    updateProject(active.id, { code: value || '' });
    setProjects(getProjects());
  };

  const runProject = async (deploy = false) => {
    if (!active || running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/quantum/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: active.code,
          shots: 1024,
          backend: deploy ? active.backend : 'QpiAI-QSV-Local',
        }),
      });
      const data: ExecutionResult = await res.json();
      setResult(data);
      if (data.success) recordActivity(XP_REWARDS.run);
    } catch {
      setResult({ success: false, output: '', error: 'Executor not reachable.' });
    } finally {
      setRunning(false);
    }
  };

  const copyCode = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const maxCount = result?.counts ? Math.max(...Object.values(result.counts)) : 0;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar: project list */}
      <div className="quantum-card p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-sm text-quantum-accent">🧪 My Projects</span>
          <button onClick={() => setShowCreate(true)} className="quantum-btn text-xs px-3 py-1.5">
            + New
          </button>
        </div>
        {projects.length === 0 && (
          <p className="text-sm text-content-subtle">
            No projects yet. Create one from a template to get started.
          </p>
        )}
        <div className="space-y-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                p.id === activeId
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700/60 hover:border-quantum-accent/50'
              }`}
              onClick={() => {
                setActiveId(p.id);
                setResult(null);
              }}
            >
              <div className="min-w-0">
                <p className="text-sm text-content font-mono truncate">{p.name}</p>
                <p className="text-xs text-content-subtle truncate">{p.backend}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p.id);
                }}
                className="text-content-subtle hover:text-red-400 text-xs"
                title="Delete project"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* bloq.in integration */}
        <div className="mt-6 pt-4 border-t border-quantum-accent/10 space-y-2">
          <p className="text-xs text-content-subtle font-mono">Design visually, no-code:</p>
          <a
            href="https://www.bloq.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs px-3 py-2 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono"
          >
            ⬡ Open Bloq Quantum (bloq.in) ↗
          </a>
          <button
            onClick={copyCode}
            disabled={!active}
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-600/40 text-content-muted hover:text-content transition-colors font-mono disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy project code for Bloq'}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="space-y-4 min-w-0">
        {!active ? (
          <div className="quantum-card p-10 text-center text-content-subtle">
            Create a project to open the workspace.
          </div>
        ) : (
          <>
            <div className="quantum-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-quantum-bg-secondary border-b border-quantum-accent/10">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm text-content truncate">{active.name}</span>
                  <select
                    value={active.backend}
                    onChange={(e) => {
                      updateProject(active.id, { backend: e.target.value });
                      setProjects(getProjects());
                    }}
                    className="bg-surface-sunken border border-quantum-accent/30 text-content text-xs rounded-lg px-2 py-1.5 font-mono outline-none"
                  >
                    {PROJECT_BACKENDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.requiresKey ? ' 🔒' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runProject(false)}
                    disabled={running}
                    className="quantum-btn text-xs px-5 py-2 disabled:opacity-50"
                  >
                    {running ? '⏳ Running...' : '▶ Run locally'}
                  </button>
                  <button
                    onClick={() => runProject(true)}
                    disabled={!liveEnabled || running}
                    title={
                      liveEnabled
                        ? `Deploy to ${active.backend}`
                        : 'Add your QpiAI API key to quantum-executor/qcloud.env to deploy to cloud simulators or the Indus-1 QPU'
                    }
                    className="text-xs px-5 py-2 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🚀 Deploy to QpiAI {liveEnabled ? '' : '(needs API key)'}
                  </button>
                </div>
              </div>
              <div className="h-80">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  path={active.id}
                  value={active.code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                  }}
                />
              </div>
            </div>

            {result && (
              <div className="quantum-card p-5 space-y-4">
                {result.error && (
                  <pre className="whitespace-pre-wrap text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    {result.error}
                  </pre>
                )}
                {result.circuit_diagram && (
                  <pre className="font-mono text-sm text-quantum-accent bg-surface-sunken p-3 rounded-lg border border-quantum-accent/20 overflow-x-auto">
                    {result.circuit_diagram}
                  </pre>
                )}
                {result.counts && (
                  <div className="space-y-2">
                    {Object.entries(result.counts)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([state, count]) => (
                        <div key={state} className="flex items-center gap-3">
                          <span className="font-mono text-quantum-accent w-20 text-right">
                            |{state}⟩
                          </span>
                          <div className="flex-1 bg-surface-sunken rounded-full h-5 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            >
                              <span className="text-xs font-mono text-content/80">{count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {result.output && (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-green-400 bg-surface-sunken p-3 rounded-lg border border-green-500/20">
                    {result.output}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-surface-sunken/70 flex items-center justify-center p-4">
          <div className="quantum-card p-6 w-full max-w-lg space-y-4">
            <h2 className="font-mono font-bold text-lg text-content">New Quantum Project</h2>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              className="w-full bg-surface-sunken border border-quantum-accent/30 rounded-lg px-3 py-2 text-content text-sm outline-none focus:border-blue-500"
              autoFocus
            />
            <div>
              <p className="text-xs text-content-subtle font-mono mb-2">Template</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROJECT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setNewTemplate(t.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      newTemplate === t.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-quantum-accent/50'
                    }`}
                  >
                    <p className="text-sm text-content font-mono">{t.name}</p>
                    <p className="text-xs text-content-subtle">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-content-subtle font-mono mb-2">Target backend</p>
              <select
                value={newBackend}
                onChange={(e) => setNewBackend(e.target.value)}
                className="w-full bg-surface-sunken border border-quantum-accent/30 text-content text-sm rounded-lg px-3 py-2 font-mono outline-none"
              >
                {PROJECT_BACKENDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.requiresKey ? ' 🔒 (API key required for deploy)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-600/40 text-content-muted hover:text-content transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleCreate} className="quantum-btn text-sm px-6 py-2">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
