'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge, Card, EmptyState } from '@/components/ui/primitives';
import { MotionSafe } from '@/components/learning/MotionSafe';
import { relativeTime } from '@/lib/relative-time';
import { trackEvent } from '@/lib/analytics-client';

interface ThreadSummary {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  author: string;
  replyCount: number;
}

/**
 * The community question board: a public list of questions, and an ask form
 * that only signed-in learners can submit. Signed-out visitors see the form
 * area replaced by a sign-in invitation rather than a form that fails on
 * submit — the gate is visible before any typing is wasted.
 */
export function CommunityBoard() {
  const { status } = useSession();
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/community/threads')
      .then((r) => r.json())
      .then((d) => setThreads(d.threads ?? []))
      .catch(() => setThreads([]));
  }, []);

  useEffect(load, [load]);

  const ask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/community/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong — try again.');
        return;
      }
      setTitle('');
      setBody('');
      trackEvent('community_ask', { meta: { threadId: data.id } });
      load();
    } catch {
      setError('Could not reach the server — check your connection and try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
      {/* Question list */}
      <div className="space-y-4">
        {threads === null && (
          <p className="font-mono text-sm text-content-subtle">Loading questions…</p>
        )}
        {threads?.length === 0 && (
          <EmptyState
            title="No questions yet"
            description="Be the first — ask anything about qubits, circuits, or a lab that has you stuck. Someone here has been stuck on it too."
          />
        )}
        {threads?.map((thread, i) => (
          <MotionSafe
            key={thread.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.05 }}
          >
            <Card href={`/community/${thread.id}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-sm font-semibold leading-snug sm:text-base">
                  {thread.title}
                </h2>
                <Badge tone={thread.replyCount > 0 ? 'success' : 'neutral'}>
                  {thread.replyCount === 0
                    ? 'No answers yet'
                    : `${thread.replyCount} ${thread.replyCount === 1 ? 'answer' : 'answers'}`}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-content-muted">
                {thread.excerpt}
              </p>
              <p className="mt-3 font-mono text-xs text-content-subtle">
                {thread.author} · {relativeTime(thread.createdAt)}
              </p>
            </Card>
          </MotionSafe>
        ))}
      </div>

      {/* Ask panel */}
      <div>
        <Card className="lg:sticky lg:top-24">
          <h2 className="font-mono text-base font-bold">Ask a question</h2>
          {status === 'authenticated' ? (
            <form onSubmit={ask} className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you stuck on?"
                maxLength={200}
                required
                className="w-full rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share what you tried, what happened, and what you expected."
                rows={5}
                maxLength={5000}
                required
                className="w-full resize-y rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-accent"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={posting}
                className="quantum-btn w-full !min-h-[2.5rem] text-xs disabled:opacity-50"
              >
                {posting ? 'Posting…' : 'Post question'}
              </button>
            </form>
          ) : (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-content-muted">
                Anyone can read the board. To ask or answer, sign in — questions
                and answers carry their author&apos;s name.
              </p>
              <Link
                href="/login?callbackUrl=/community"
                className="quantum-btn mt-4 w-full !min-h-[2.5rem] text-xs"
              >
                Sign in to participate
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
