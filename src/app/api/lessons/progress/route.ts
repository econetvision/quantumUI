import { NextResponse } from 'next/server';
import auth from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllLessons } from '@/lib/lesson-loader';
import { TOPICS } from '@/lib/lab-questions';
import { gateForTopic } from '@/lib/lab-access';

/**
 * What this learner has finished, and which lab banks that opens.
 *
 * Both halves come from the same request so the UI cannot show a lock state
 * computed from stale progress: the gate is evaluated server-side against rows
 * read in this call, and the client renders what it is told rather than
 * recomputing it.
 */
export async function GET() {
  const session = await auth.auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ signedIn: false, completedByTrack: {}, gates: {} });
  }

  const rows = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { trackSlug: true, lessonId: true },
  });

  const completedByTrack: Record<string, number[]> = {};
  for (const r of rows) {
    (completedByTrack[r.trackSlug] ??= []).push(r.lessonId);
  }

  const gates = Object.fromEntries(
    TOPICS.map((t) => [t.id, gateForTopic(t.id, completedByTrack)]),
  );

  return NextResponse.json({ signedIn: true, completedByTrack, gates });
}

/**
 * Mark one lesson finished.
 *
 * Idempotent: the unique constraint makes a repeat a no-op rather than a second
 * row, because the gate counts rows and a duplicate would let somebody unlock
 * labs by reopening a single lesson.
 *
 * The lesson is validated against the content files before anything is written.
 * Without that check a client could POST arbitrary ids and open every lab bank
 * on the site — the gate is an access control, not a progress bar.
 */
export async function POST(request: Request) {
  const session = await auth.auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to save progress' }, { status: 401 });
  }

  let body: { trackSlug?: unknown; lessonId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const trackSlug = typeof body.trackSlug === 'string' ? body.trackSlug : '';
  const lessonId = typeof body.lessonId === 'number' ? body.lessonId : Number.NaN;

  if (!trackSlug || !Number.isInteger(lessonId)) {
    return NextResponse.json({ error: 'trackSlug and lessonId are required' }, { status: 400 });
  }

  const exists = getAllLessons(trackSlug).some((l) => l.id === lessonId);
  if (!exists) {
    return NextResponse.json({ error: 'No such lesson' }, { status: 404 });
  }

  await prisma.lessonCompletion.upsert({
    where: { userId_trackSlug_lessonId: { userId, trackSlug, lessonId } },
    update: {},
    create: { userId, trackSlug, lessonId },
  });

  const rows = await prisma.lessonCompletion.findMany({
    where: { userId, trackSlug },
    select: { lessonId: true },
  });

  const completedByTrack = { [trackSlug]: rows.map((r) => r.lessonId) };
  const opened = TOPICS.map((t) => gateForTopic(t.id, completedByTrack)).filter(
    (g) => g.trackSlug === trackSlug && g.unlocked,
  );

  return NextResponse.json({
    ok: true,
    trackSlug,
    lessonsDone: rows.length,
    unlockedTopics: opened.map((g) => g.topicSlug),
  });
}
