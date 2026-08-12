import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';

/**
 * Learner progress: streak, XP and solved questions.
 *
 * Anonymous learners keep everything in localStorage and never touch this
 * route. Once signed in, the client mirrors its local state here so progress
 * survives a new device — which is the whole point of having an account.
 *
 * Account-wide totals live on `User`. They previously sat on a `UserProgress`
 * row with `trackId` 0 — a track that does not exist — which only worked
 * because MySQL had foreign keys disabled. Postgres enforces them, so the data
 * now lives where it belongs.
 */

const SyncSchema = z.object({
  xp: z.number().int().min(0).max(10_000_000),
  currentStreak: z.number().int().min(0).max(10_000),
  longestStreak: z.number().int().min(0).max(10_000),
  completedQuestionIds: z.array(z.string().max(120)).max(5_000).optional(),
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
    return NextResponse.json({ signedIn: false, progress: null });
  }

  const { data, persisted } = await withDatabase(
    async (db) => {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { totalXP: true, currentStreak: true, longestStreak: true },
      });
      const rows = await db.userProgress.findMany({ where: { userId } });
      const attempts = await db.labAttempt.count({ where: { userId, passed: true } });

      return {
        xp: user?.totalXP ?? 0,
        currentStreak: user?.currentStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        solvedCount: attempts,
        perTrack: rows
          .map((r) => ({
            trackId: r.trackId,
            labsCompleted: r.labsCompleted,
            totalLabs: r.totalLabs,
            completionPct: r.completionPct,
          })),
      };
    },
    null,
  );

  return NextResponse.json({ signedIn: true, persisted, progress: data });
}

export async function POST(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to sync progress across devices.', signedIn: false },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = SyncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid progress payload.' },
      { status: 400 },
    );
  }

  const { xp, currentStreak, longestStreak } = parsed.data;

  const { persisted } = await withDatabase(async (db) => {
    const existing = await db.user.findUnique({
      where: { id: userId },
      select: { totalXP: true, currentStreak: true, longestStreak: true },
    });

    // Never let a sync move counters backwards. A second device with a stale
    // cache would otherwise wipe a streak the learner actually earned.
    const nextXp = Math.max(xp, existing?.totalXP ?? 0);
    const nextStreak = Math.max(currentStreak, existing?.currentStreak ?? 0);
    const nextLongest = Math.max(longestStreak, existing?.longestStreak ?? 0, nextStreak);

    await db.user.update({
      where: { id: userId },
      data: {
        totalXP: nextXp,
        currentStreak: nextStreak,
        longestStreak: nextLongest,
        lastActivityAt: new Date(),
      },
    });
    return true;
  }, false);

  return NextResponse.json({ ok: true, persisted });
}
