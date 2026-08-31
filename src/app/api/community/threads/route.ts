import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/api-auth';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * The community question board.
 *
 * Reading is public — a stuck learner without an account still benefits from
 * every answered question. Posting requires a session, so each thread has a
 * real author to notify and to hold to the rules.
 */

const ThreadSchema = z.object({
  title: z.string().trim().min(8, 'Give your question a title (at least 8 characters).').max(200),
  body: z
    .string()
    .trim()
    .min(1, 'Describe your question.')
    .max(5000, 'Questions are capped at 5000 characters.'),
});

/** Only the author's display name leaves the server — never the email. */
const AUTHOR_SELECT = { select: { name: true } } as const;

function displayName(author: { name: string | null }): string {
  return author.name?.trim() || 'Learner';
}

export async function GET() {
  const threads = await prisma.communityThread.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      author: AUTHOR_SELECT,
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      // The list shows a teaser, not the whole question.
      excerpt: t.body.length > 200 ? `${t.body.slice(0, 200)}…` : t.body,
      createdAt: t.createdAt.toISOString(),
      author: displayName(t.author),
      replyCount: t._count.replies,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to ask the community.', unauthenticated: true },
      { status: 401 },
    );
  }

  const budget = await enforceRateLimit({
    subject: user.id,
    endpoint: 'community-post',
    ...RATE_LIMITS.communityPost,
  });
  if (!budget.allowed) {
    return NextResponse.json(
      { error: `You're posting quickly — try again in ${budget.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': String(budget.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = ThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid question.' },
      { status: 400 },
    );
  }

  const thread = await prisma.communityThread.create({
    data: { ...parsed.data, authorId: user.id },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: thread.id }, { status: 201 });
}
