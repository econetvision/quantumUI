import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/api-auth';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const ReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write a reply first.')
    .max(5000, 'Replies are capped at 5000 characters.'),
});

/** Answer a community question. Sign-in required — every answer has an author. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to reply.', unauthenticated: true },
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

  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid reply.' },
      { status: 400 },
    );
  }

  const { id: threadId } = await params;

  // Validated before writing: Prisma would reject the orphan row anyway, but a
  // clean 404 beats a 500 for a thread deleted while the reply box was open.
  const thread = await prisma.communityThread.findUnique({
    where: { id: threadId },
    select: { id: true },
  });
  if (!thread) {
    return NextResponse.json({ error: 'This question no longer exists.' }, { status: 404 });
  }

  const reply = await prisma.communityReply.create({
    data: { body: parsed.data.body, threadId, authorId: user.id },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: reply.id }, { status: 201 });
}
