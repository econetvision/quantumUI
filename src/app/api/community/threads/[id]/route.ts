import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * One question with its answers, oldest answer first. Public — see the board
 * route for why reading needs no account.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const thread = await prisma.communityThread.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      author: { select: { name: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'No such question.' }, { status: 404 });
  }

  const name = (author: { name: string | null }) => author.name?.trim() || 'Learner';

  return NextResponse.json({
    thread: {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      createdAt: thread.createdAt.toISOString(),
      author: name(thread.author),
      replies: thread.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        author: name(r.author),
      })),
    },
  });
}
