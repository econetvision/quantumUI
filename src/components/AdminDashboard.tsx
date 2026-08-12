"use client";

import { useEffect, useState } from 'react';
import {
  createAssignment,
  deleteAssignment,
  DEMO_STUDENTS,
  DemoAssignment,
  DemoStudent,
  getAssignments,
  updateAssignmentStatus,
} from '@/lib/assignments';
import { getStreakData } from '@/lib/streak';

const TRACKS = [
  { slug: 'quantum-fundamentals', name: 'Quantum Fundamentals' },
  { slug: 'quantum-gates', name: 'Quantum Gates & Circuits' },
  { slug: 'qiskit-sdk-deep-dive', name: 'Qiskit SDK Deep Dive' },
  { slug: 'quantum-entanglement', name: 'Quantum Entanglement' },
  { slug: 'quantum-algorithms', name: 'Quantum Algorithms' },
  { slug: 'quantum-cryptography-qkd', name: 'Quantum Cryptography & QKD' },
  { slug: 'quantum-error-correction', name: 'Quantum Error Correction' },
  { slug: 'ibm-cert-exam-prep', name: 'IBM Cert Exam Prep' },
];

const LAB_TOPICS = [
  'quantum-fundamentals',
  'quantum-gates',
  'qiskit-sdk',
  'cirq-sdk',
  'quantum-entanglement',
  'quantum-algorithms',
  'quantum-cryptography',
  'error-correction',
];

const STATUS_STYLES: Record<DemoAssignment['status'], string> = {
  ASSIGNED: 'text-content-muted border-line bg-surface-overlay',
  IN_PROGRESS: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  COMPLETED: 'text-green-400 border-green-500/40 bg-green-500/10',
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<DemoStudent[]>(DEMO_STUDENTS);
  const [assignments, setAssignments] = useState<DemoAssignment[]>([]);
  const [tab, setTab] = useState<'students' | 'assignments'>('students');

  // create form state
  const [studentId, setStudentId] = useState('local');
  const [title, setTitle] = useState('');
  const [materialKind, setMaterialKind] = useState<'track' | 'lab'>('track');
  const [trackSlug, setTrackSlug] = useState(TRACKS[0].slug);
  const [labTopic, setLabTopic] = useState(LAB_TOPICS[0]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'complex'>('easy');
  const [dueDate, setDueDate] = useState('');

  // null = not yet known; false = running without a database
  const [dbAvailable, setDbAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    /*
     * Load the real roster.
     *
     * This dashboard previously showed a hardcoded DEMO_STUDENTS array: the
     * same three fictional students for every instructor, with any assignment
     * lost on refresh. It now reads the User table, and only falls back to the
     * demo rows when the database is genuinely unreachable — with the banner
     * below saying so, rather than passing fiction off as a cohort.
     */
    (async () => {
      try {
        const [rosterRes, assignmentsRes] = await Promise.all([
          fetch('/api/admin/students'),
          fetch('/api/admin/assignments'),
        ]);

        if (cancelled) return;

        if (rosterRes.ok) {
          const data = await rosterRes.json();
          setDbAvailable(Boolean(data.databaseAvailable));

          if (data.databaseAvailable && Array.isArray(data.students) && data.students.length) {
            setStudents(
              data.students.map((s: Record<string, unknown>) => ({
                id: String(s.id),
                name: (s.name as string) || (s.email as string) || 'Unnamed',
                email: s.email as string,
                xp: Number(s.xp ?? 0),
                streak: Number(s.currentStreak ?? 0),
                labsCompleted: Number(s.attempts ?? 0),
                isLocal: false,
              })) as DemoStudent[],
            );
          }
        } else {
          setDbAvailable(false);
        }

        if (assignmentsRes.ok) {
          const data = await assignmentsRes.json();
          if (Array.isArray(data.assignments) && data.assignments.length) {
            setAssignments(data.assignments as DemoAssignment[]);
            return;
          }
        }
      } catch {
        if (!cancelled) setDbAvailable(false);
      }

      // No server data: fall back to whatever this browser has locally.
      if (!cancelled) {
        setAssignments(getAssignments());
        const s = getStreakData();
        setStudents((prev) =>
          prev.map((st) =>
            st.isLocal
              ? { ...st, xp: s.xp, streak: s.streak, labsCompleted: s.completedQuestions.length }
              : st,
          ),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = () => {
    if (!title.trim()) return;
    createAssignment({
      studentId,
      title: title.trim(),
      trackSlug: materialKind === 'track' ? trackSlug : undefined,
      labTopic: materialKind === 'lab' ? labTopic : undefined,
      difficulty: materialKind === 'lab' ? difficulty : undefined,
      dueDate: dueDate || undefined,
    });
    setAssignments(getAssignments());
    setTitle('');
    setTab('assignments');
  };

  const studentName = (id: string) => students.find((s) => s.id === id)?.name || id;

  return (
    <div className="space-y-8">
      {/* Say plainly when this is demo data rather than a real cohort. An
          instructor acting on fictional students is worse than an empty table. */}
      {dbAvailable === false && (
        <div
          role="status"
          className="rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm"
        >
          <p className="font-mono font-bold text-warning">Showing demo data</p>
          <p className="mt-1 leading-relaxed text-content-muted">
            The database is unreachable, so this is sample data held in your
            browser — assignments made here will not reach any student. Start
            MySQL and reload to see the real cohort.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['students', 'assignments'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-mono text-sm border transition-colors ${
              tab === t
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-gray-700 text-content-subtle hover:text-content-muted'
            }`}
          >
            {t === 'students' ? '👥 Students' : `📋 Assignments (${assignments.length})`}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <div className="quantum-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-quantum-accent/20 text-left text-content-subtle font-mono text-xs">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">XP</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">Labs done</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Assignments</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const theirs = assignments.filter((a) => a.studentId === s.id);
                const done = theirs.filter((a) => a.status === 'COMPLETED').length;
                return (
                  <tr key={s.id} className="border-b border-quantum-accent/10">
                    <td className="px-4 py-3">
                      <p className="text-content">{s.name}</p>
                      <p className="text-xs text-content-subtle">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-400">⚡ {s.xp}</td>
                    <td className="px-4 py-3 font-mono text-orange-400">🔥 {s.streak}</td>
                    <td className="px-4 py-3 font-mono text-content-muted">{s.labsCompleted}</td>
                    <td className="px-4 py-3 text-content-muted">{s.lastActive}</td>
                    <td className="px-4 py-3 font-mono text-content-muted">
                      {theirs.length === 0 ? '—' : `${done}/${theirs.length} done`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'assignments' && (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Create form */}
          <div className="quantum-card p-5 h-fit space-y-3">
            <h3 className="font-mono font-bold text-content text-sm">Assign material</h3>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-surface-sunken border border-quantum-accent/30 text-content text-sm rounded-lg px-3 py-2 font-mono outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="w-full bg-surface-sunken border border-quantum-accent/30 rounded-lg px-3 py-2 text-content text-sm outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              {(['track', 'lab'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setMaterialKind(k)}
                  className={`flex-1 text-xs px-3 py-2 rounded-lg border font-mono transition-colors ${
                    materialKind === k
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-gray-700 text-content-subtle'
                  }`}
                >
                  {k === 'track' ? '📚 Track' : '⌨️ Lab questions'}
                </button>
              ))}
            </div>
            {materialKind === 'track' ? (
              <select
                value={trackSlug}
                onChange={(e) => setTrackSlug(e.target.value)}
                className="w-full bg-surface-sunken border border-quantum-accent/30 text-content text-sm rounded-lg px-3 py-2 font-mono outline-none"
              >
                {TRACKS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <select
                  value={labTopic}
                  onChange={(e) => setLabTopic(e.target.value)}
                  className="flex-1 bg-surface-sunken border border-quantum-accent/30 text-content text-sm rounded-lg px-3 py-2 font-mono outline-none"
                >
                  {LAB_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="bg-surface-sunken border border-quantum-accent/30 text-content text-sm rounded-lg px-3 py-2 font-mono outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
            )}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-sunken border border-quantum-accent/30 rounded-lg px-3 py-2 text-content-muted text-sm outline-none font-mono"
            />
            <button onClick={handleCreate} className="quantum-btn w-full text-sm py-2">
              Assign
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {assignments.length === 0 && (
              <div className="quantum-card p-8 text-center text-content-subtle text-sm">
                No assignments yet. Assign a track or lab question set to a student.
              </div>
            )}
            {assignments.map((a) => (
              <div key={a.id} className="quantum-card p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-content text-sm font-mono">{a.title}</p>
                  <p className="text-xs text-content-subtle">
                    {studentName(a.studentId)} ·{' '}
                    {a.trackSlug
                      ? `Track: ${a.trackSlug}`
                      : `Labs: ${a.labTopic} (${a.difficulty})`}
                    {a.dueDate ? ` · due ${a.dueDate}` : ''}
                  </p>
                </div>
                <select
                  value={a.status}
                  onChange={(e) => {
                    updateAssignmentStatus(a.id, e.target.value as DemoAssignment['status']);
                    setAssignments(getAssignments());
                  }}
                  className={`text-xs px-2 py-1 rounded-full border font-mono bg-surface-sunken outline-none ${STATUS_STYLES[a.status]}`}
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button
                  onClick={() => {
                    deleteAssignment(a.id);
                    setAssignments(getAssignments());
                  }}
                  className="text-content-subtle hover:text-red-400 text-sm"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
