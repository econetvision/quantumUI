import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';
import { TRACK_CONFIGS } from '@/lib/track-mapping';

/**
 * Per-lesson completion, mirrored from localStorage for signed-in learners.
 *
 * The client (src/lib/lesson-progress.ts) is the source of truth on-device;
 * this is what makes sequential track unlocking survive a new browser, and
 * what the digest emails and certificates read on the server.
 */

const KNOWN_SLUGS = new Set(TRACK_CONFIGS.map((track) => track.slug));

const CompleteSchema = z.object({
  trackSlug: z.string().max(80),
  lessonId: z.number().int().min(1).max(500),
});

async function currentUserId(): Promise<string | null> {
  try {
    const session = await auth.auth();
    return (session?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json({ signedIn: false, completed: null });
  }

  const { data, persisted } = await withDatabase(
    async (db) => {
      const rows = await db.lessonProgress.findMany({
        where: { userId },
        select: { trackSlug: true, lessonId: true },
      });
      const completed: Record<string, number[]> = {};
      for (const row of rows) {
        (completed[row.trackSlug] ??= []).push(row.lessonId);
      }
      for (const list of Object.values(completed)) list.sort((a, b) => a - b);
      return completed;
    },
    null,
  );

  return NextResponse.json({ signedIn: true, persisted, completed: data });
}

export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to sync lesson progress.', signedIn: false },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
      { status: 400 },
    );
  }

  const { trackSlug, lessonId } = parsed.data;
  if (!KNOWN_SLUGS.has(trackSlug)) {
    return NextResponse.json({ error: 'Unknown track.' }, { status: 400 });
  }

  const { persisted } = await withDatabase(async (db) => {
    // Upsert: marking the same lesson complete twice (two tabs, a re-visit) is
    // a no-op, not an error.
    await db.lessonProgress.upsert({
      where: { userId_trackSlug_lessonId: { userId, trackSlug, lessonId } },
      update: {},
      create: { userId, trackSlug, lessonId },
    });
    await db.user.update({
      where: { id: userId },
      data: { lastActivityAt: new Date() },
      select: { id: true },
    });
    return true;
  }, false);

  return NextResponse.json({ ok: true, persisted });
}
