'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge, Card, EmptyState } from '@/components/ui/primitives';
import { MotionSafe } from '@/components/learning/MotionSafe';
import { relativeTime } from '@/lib/relative-time';
import { trackEvent } from '@/lib/analytics-client';

interface Reply {
  id: string;
  body: string;
  createdAt: string;
  author: string;
}

interface Thread {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: string;
  replies: Reply[];
}

/**
 * One community question with its answers. Reading needs no account; the reply
 * box appears only for signed-in learners, with a sign-in invitation in its
 * place otherwise — the sign-in link carries a callback so the learner lands
 * back on the same question afterwards.
 */
export function ThreadView({ threadId }: { threadId: string }) {
  const { status } = useSession();
  const [thread, setThread] = useState<Thread | null | 'missing'>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/community/threads/${threadId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setThread(d.thread))
      .catch(() => setThread('missing'));
  }, [threadId]);

  useEffect(load, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong — try again.');
        return;
      }
      setReply('');
      trackEvent('community_reply', { meta: { threadId } });
      load();
    } catch {
      setError('Could not reach the server — check your connection and try again.');
    } finally {
      setPosting(false);
    }
  };

  if (thread === null) {
    return <p className="mt-10 font-mono text-sm text-content-subtle">Loading…</p>;
  }

  if (thread === 'missing') {
    return (
      <div className="mt-10">
        <EmptyState
          title="This question no longer exists"
          description="It may have been removed. The board has plenty more."
          action={
            <Link href="/community" className="quantum-btn">
              Back to the board
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <Link
        href="/community"
        className="font-mono text-xs text-content-muted transition-colors hover:text-content"
      >
        ← All questions
      </Link>

      {/* The question */}
      <Card>
        <h1 className="text-lg font-bold leading-snug sm:text-xl">{thread.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
          {thread.body}
        </p>
        <p className="mt-4 font-mono text-xs text-content-subtle">
          {thread.author} · {relativeTime(thread.createdAt)}
        </p>
      </Card>

      {/* Answers */}
      <div className="flex items-center gap-3">
        <h2 className="font-mono text-sm font-bold">
          {thread.replies.length === 0
            ? 'No answers yet'
            : `${thread.replies.length} ${thread.replies.length === 1 ? 'answer' : 'answers'}`}
        </h2>
        {thread.replies.length === 0 && <Badge tone="accent">Yours could be first</Badge>}
      </div>

      <div className="space-y-4">
        {thread.replies.map((r, i) => (
          <MotionSafe
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04 }}
          >
            <Card className="!p-4 sm:!p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
                {r.body}
              </p>
              <p className="mt-3 font-mono text-xs text-content-subtle">
                {r.author} · {relativeTime(r.createdAt)}
              </p>
            </Card>
          </MotionSafe>
        ))}
      </div>

      {/* Reply box */}
      <Card>
        {status === 'authenticated' ? (
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="community-reply" className="font-mono text-sm font-bold">
              Your answer
            </label>
            <textarea
              id="community-reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Share what helped you — even a partial answer moves things forward."
              rows={4}
              maxLength={5000}
              required
              className="w-full resize-y rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-accent"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={posting}
              className="quantum-btn !min-h-[2.5rem] px-6 text-xs disabled:opacity-50"
            >
              {posting ? 'Posting…' : 'Post answer'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm leading-relaxed text-content-muted">
              Know the answer? Sign in to reply — answers carry their author&apos;s name.
            </p>
            <Link
              href={`/login?callbackUrl=/community/${threadId}`}
              className="quantum-btn mt-4 inline-flex !min-h-[2.5rem] px-6 text-xs"
            >
              Sign in to reply
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
