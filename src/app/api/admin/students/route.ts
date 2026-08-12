import { NextResponse } from 'next/server';
import auth from '@/lib/auth';
import { withDatabase } from '@/lib/db';

/**
 * Roster for the instructor view.
 *
 * The admin dashboard previously rendered a hardcoded `DEMO_STUDENTS` array
 * held in component state, so it showed the same three fictional students to
 * everyone and lost any change on refresh. This reads the real `User` table
 * joined with progress and attempt counts.
 */

async function requireAdmin() {
  const session = await auth.auth().catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, error: 'Sign in required.' };
  if (user.role !== 'ADMIN') {
    return { ok: false as const, status: 403, error: 'Admin role required.' };
  }
  return { ok: true as const, userId: user.id };
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { data, persisted } = await withDatabase(
    async (db) => {
      const users = await db.user.findMany({
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          totalXP: true, currentStreak: true, longestStreak: true, lastActivityAt: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 500,
      });

      // Fetch progress and attempts in two queries rather than per-user, so the
      // roster stays a constant number of round trips as the cohort grows.
      const attempts = await db.labAttempt.groupBy({
        by: ['userId'],
        _count: { _all: true },
        _sum: { xpEarned: true },
      });

      const attemptsBy = new Map(attempts.map((a) => [a.userId, a]));

      return users.map((user) => {
        const a = attemptsBy.get(user.id);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          joinedAt: user.createdAt,
          xp: user.totalXP,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastActiveAt: user.lastActivityAt,
          attempts: a?._count._all ?? 0,
          xpFromLabs: a?._sum.xpEarned ?? 0,
        };
      });
    },
    [],
  );

  return NextResponse.json({
    students: data,
    persisted,
    // Tells the UI to say "database unavailable" rather than render an empty
    // roster as though the cohort genuinely has no members.
    databaseAvailable: persisted,
  });
}
