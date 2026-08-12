"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CERTIFICATIONS, CURRICULUM } from '@/data/curriculum';
import { getStreakData, STREAK_EVENT } from '@/lib/streak';

interface TopicCounts {
  [slug: string]: string[]; // question ids per topic
}

export default function CurriculumPath() {
  const [topicQuestions, setTopicQuestions] = useState<TopicCounts>({});
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/labs/questions')
      .then((r) => r.json())
      .then((data) => {
        const map: TopicCounts = {};
        for (const t of data.topics || []) {
          map[t.slug] = t.questions.map((q: { id: string }) => q.id);
        }
        setTopicQuestions(map);
      })
      .catch(() => {});
    const sync = () => setCompleted(getStreakData().completedQuestions);
    sync();
    window.addEventListener(STREAK_EVENT, sync);
    return () => window.removeEventListener(STREAK_EVENT, sync);
  }, []);

  const stageProgress = (labTopics: string[]) => {
    const ids = labTopics.flatMap((t) => topicQuestions[t] || []);
    if (ids.length === 0) return null;
    const done = ids.filter((id) => completed.includes(id)).length;
    return { done, total: ids.length, pct: Math.round((done / ids.length) * 100) };
  };

  const certStyle = (name: string) =>
    CERTIFICATIONS.find((c) => c.name === name)?.color ||
    'text-content-muted border-line bg-surface-overlay';

  return (
    <div>
      {/* Certification targets */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {CERTIFICATIONS.map((cert) => (
          <div key={cert.name} className={`quantum-card p-4 border ${cert.color.split(' ')[1]}`}>
            <p className={`font-mono font-bold text-sm mb-1 ${cert.color.split(' ')[0]}`}>
              🎯 {cert.name}
            </p>
            <p className="text-xs text-content-muted">{cert.focus}</p>
          </div>
        ))}
      </div>

      {/* Path */}
      <div className="relative space-y-6">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/60 to-blue-500/10 hidden sm:block" />
        {CURRICULUM.map((stage) => {
          const progress = stageProgress(stage.labTopics);
          return (
            <div key={stage.level} className="relative sm:pl-16">
              <div className="absolute left-0 top-6 w-12 h-12 rounded-full bg-surface-sunken border-2 border-blue-500/60 hidden sm:flex items-center justify-center font-mono font-bold text-blue-400">
                {stage.level}
              </div>
              <div className="quantum-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-xl font-mono font-bold text-content">
                      {stage.emoji} Level {stage.level}: {stage.title}
                    </h2>
                    <p className="text-content-muted text-sm mt-1 max-w-2xl">{stage.description}</p>
                  </div>
                  {progress && (
                    <div className="text-right">
                      <p className="text-xs font-mono text-content-subtle mb-1">
                        {progress.done}/{progress.total} labs
                      </p>
                      <div className="w-32 h-2 bg-surface-sunken rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${progress.pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {stage.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {stage.certifications.map((cert) => (
                      <span
                        key={cert}
                        className={`text-xs px-2 py-0.5 rounded-full border font-mono ${certStyle(cert)}`}
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {stage.tracks.map((track) => (
                    <Link
                      key={track.slug}
                      href={`/tracks/${track.slug}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-quantum-accent/30 text-quantum-accent hover:bg-quantum-accent/10 transition-colors font-mono"
                    >
                      📚 {track.name}
                    </Link>
                  ))}
                  {stage.labTopics.length > 0 && (
                    <Link
                      href="/labs/shell"
                      className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono"
                    >
                      ⌨️ Practice in Lab Shell
                    </Link>
                  )}
                  {stage.level === 7 && (
                    <>
                      <Link
                        href="/exam"
                        className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono"
                      >
                        📝 Mock Exam
                      </Link>
                      <Link
                        href="/projects"
                        className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono"
                      >
                        🧪 Capstone Projects
                      </Link>
                    </>
                  )}
                </div>

                <p className="text-xs text-content-subtle font-mono mt-4">→ {stage.outcome}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
