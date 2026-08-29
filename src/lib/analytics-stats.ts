/**
 * Reading side of the analytics store — everything the admin dashboard shows.
 *
 * All of it runs server-side inside `withDatabase`, so with no database the
 * page renders an honest "analytics need the database" state instead of a wall
 * of zeroes that reads like a real (and alarming) result.
 *
 * Day bucketing is done in SQL with `date_trunc`, pinned to UTC. Doing it in
 * JavaScript would mean pulling every row in the range into memory; pinning the
 * zone means the buckets do not silently shift when the server's TZ changes.
 */

import type { UserRole } from '@prisma/client';
import { withDatabase } from './db';
import { eventLabel } from './analytics';

/** Ranges the dashboard offers. Anything else falls back to 30. */
export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export function parseRange(raw: string | string[] | undefined): RangeDays {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return (RANGE_OPTIONS as readonly number[]).includes(value)
    ? (value as RangeDays)
    : 30;
}

export interface DailyPoint {
  /** ISO date, `YYYY-MM-DD`. */
  day: string;
  pageViews: number;
  visitors: number;
  signIns: number;
  signUps: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface RosterRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  /** When the account was created — "when they signed up". */
  signedUpAt: string;
  /** Most recent successful authentication — "when they logged in". */
  lastLoginAt: string | null;
  loginCount: number;
  lastActivityAt: string | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  labAttempts: number;
  labsPassed: number;
  /** Interactions recorded in the selected window. */
  eventsInRange: number;
}

export interface LoginRow {
  id: number;
  at: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  provider: string | null;
  userAgent: string | null;
}

export interface SiteStats {
  rangeDays: number;
  /** Start of the window, ISO. */
  since: string;
  generatedAt: string;

  totals: {
    users: number;
    newUsers: number;
    activeUsers: number;
    signIns: number;
    pageViews: number;
    visitors: number;
    interactions: number;
    /** Users who have never signed in since login tracking began. */
    neverSignedIn: number;
  };
  /** Same measures over the immediately preceding window, for deltas. */
  previous: {
    newUsers: number;
    signIns: number;
    pageViews: number;
    visitors: number;
    interactions: number;
  };

  daily: DailyPoint[];
  topPages: NamedCount[];
  topReferrers: NamedCount[];
  eventBreakdown: NamedCount[];
  usersByRole: NamedCount[];

  roster: RosterRow[];
  recentLogins: LoginRow[];
}

/** `YYYY-MM-DD` in UTC, matching the SQL bucket keys. */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Every day in the window, so a quiet day renders as a zero-height bar rather
 * than vanishing and making the x-axis lie about the spacing between points.
 */
function emptySeries(since: Date, until: Date): Map<string, DailyPoint> {
  const series = new Map<string, DailyPoint>();
  const cursor = new Date(
    Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), since.getUTCDate()),
  );
  while (cursor <= until) {
    series.set(isoDay(cursor), {
      day: isoDay(cursor),
      pageViews: 0,
      visitors: 0,
      signIns: 0,
      signUps: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

type DayTypeRow = { day: Date; type: string; count: number };
type DayCountRow = { day: Date; count: number };

/**
 * Build the whole dashboard payload.
 *
 * Returns `null` when the database is unreachable — see the module comment.
 */
export async function getSiteStats(rangeDays: number): Promise<SiteStats | null> {
  const now = new Date();
  const since = new Date(now.getTime() - rangeDays * 86_400_000);
  // The window immediately before this one, same length, for the deltas.
  const previousSince = new Date(since.getTime() - rangeDays * 86_400_000);

  const { data } = await withDatabase(async (db) => {
    const inRange = { gte: since };
    const inPrevious = { gte: previousSince, lt: since };

    const [
      users,
      newUsers,
      previousNewUsers,
      neverSignedIn,
      usersByRole,
      activeUsers,
      signIns,
      previousSignIns,
      eventCounts,
      previousEventCounts,
      topPages,
      topReferrers,
      dailyByType,
      dailyVisitors,
      dailySignUps,
      dailySignIns,
      visitorTotals,
      recentLoginRows,
      rosterUsers,
      attemptTotals,
      passedTotals,
      eventsPerUser,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: inRange } }),
      db.user.count({ where: { createdAt: inPrevious } }),
      db.user.count({ where: { lastLoginAt: null } }),
      db.user.groupBy({ by: ['role'], _count: { _all: true } }),
      // "Active" means did something we recorded, not merely holds an account.
      db.user.count({ where: { lastActivityAt: inRange } }),
      db.auditLog.count({ where: { action: 'login', createdAt: inRange } }),
      db.auditLog.count({ where: { action: 'login', createdAt: inPrevious } }),

      db.analyticsEvent.groupBy({
        by: ['type'],
        where: { createdAt: inRange },
        _count: { _all: true },
      }),
      db.analyticsEvent.groupBy({
        by: ['type'],
        where: { createdAt: inPrevious },
        _count: { _all: true },
      }),

      db.analyticsEvent.groupBy({
        by: ['path'],
        where: { type: 'page_view', createdAt: inRange, path: { not: null } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 12,
      }),
      db.analyticsEvent.groupBy({
        by: ['referrer'],
        where: { createdAt: inRange, referrer: { not: null } },
        _count: { referrer: true },
        orderBy: { _count: { referrer: 'desc' } },
        take: 8,
      }),

      db.$queryRaw<DayTypeRow[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS day,
               "type",
               COUNT(*)::int AS count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${since}
        GROUP BY 1, 2
      `,
      db.$queryRaw<DayCountRow[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS day,
               COUNT(DISTINCT "visitorId")::int AS count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
      `,
      // Sign-ups come from the User table rather than the event stream, so an
      // account created by a seed script or by an admin still shows up.
      db.$queryRaw<DayCountRow[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS day,
               COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
      `,
      // Sign-ins come from the audit trail, which is the only authoritative
      // record of an authentication — see the note in src/lib/analytics.ts.
      db.$queryRaw<DayCountRow[]>`
        SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC')::date AS day,
               COUNT(*)::int AS count
        FROM "AuditLog"
        WHERE "action" = 'login' AND "createdAt" >= ${since}
        GROUP BY 1
      `,

      // The aggregate and its FILTER must be parenthesised before the cast —
      // `count(x) FILTER (WHERE y)::int` binds the cast to `y`, not to the
      // count, and Postgres rejects it.
      db.$queryRaw<{ current: number; previous: number }[]>`
        SELECT
          (COUNT(DISTINCT "visitorId") FILTER (WHERE "createdAt" >= ${since}))::int
            AS current,
          (COUNT(DISTINCT "visitorId") FILTER (
            WHERE "createdAt" >= ${previousSince} AND "createdAt" < ${since}
          ))::int AS previous
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${previousSince}
      `,

      db.auditLog.findMany({
        where: { action: 'login' },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          createdAt: true,
          userId: true,
          resource: true,
          userAgent: true,
        },
      }),

      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true,
          lastActivityAt: true,
          totalXP: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),

      // Two aggregate passes rather than a per-user query, so the roster costs
      // a fixed number of round trips however large the cohort gets.
      db.labAttempt.groupBy({ by: ['userId'], _count: { _all: true } }),
      db.labAttempt.groupBy({
        by: ['userId'],
        where: { passed: true },
        _count: { _all: true },
      }),
      db.analyticsEvent.groupBy({
        by: ['userId'],
        where: { createdAt: inRange, userId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    // ---- fold the day buckets into one dense series -----------------------
    const series = emptySeries(since, now);

    for (const row of dailyByType) {
      const point = series.get(isoDay(new Date(row.day)));
      if (!point) continue;
      if (row.type === 'page_view') point.pageViews += row.count;
    }
    for (const row of dailySignIns) {
      const point = series.get(isoDay(new Date(row.day)));
      if (point) point.signIns += row.count;
    }
    for (const row of dailyVisitors) {
      const point = series.get(isoDay(new Date(row.day)));
      if (point) point.visitors += row.count;
    }
    for (const row of dailySignUps) {
      const point = series.get(isoDay(new Date(row.day)));
      if (point) point.signUps += row.count;
    }

    // ---- totals ------------------------------------------------------------
    const countOf = (
      rows: { type: string; _count: { _all: number } }[],
      type: string,
    ) => rows.find((r) => r.type === type)?._count._all ?? 0;

    const sumOf = (rows: { _count: { _all: number } }[]) =>
      rows.reduce((total, r) => total + r._count._all, 0);

    const pageViews = countOf(eventCounts, 'page_view');
    const previousPageViews = countOf(previousEventCounts, 'page_view');
    const allEvents = sumOf(eventCounts);
    const previousAllEvents = sumOf(previousEventCounts);

    const attemptsBy = new Map(attemptTotals.map((r) => [r.userId, r._count._all]));
    const passedBy = new Map(passedTotals.map((r) => [r.userId, r._count._all]));
    const eventsBy = new Map(
      eventsPerUser.map((r) => [r.userId as string, r._count._all]),
    );

    const loginUserIds = [
      ...new Set(recentLoginRows.map((r) => r.userId).filter(Boolean) as string[]),
    ];
    const loginUsers = loginUserIds.length
      ? await db.user.findMany({
          where: { id: { in: loginUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const loginUserBy = new Map(loginUsers.map((u) => [u.id, u]));

    const stats: SiteStats = {
      rangeDays,
      since: since.toISOString(),
      generatedAt: now.toISOString(),

      totals: {
        users,
        newUsers,
        activeUsers,
        signIns,
        pageViews,
        visitors: visitorTotals[0]?.current ?? 0,
        // "Interactions" deliberately excludes navigation: it is the count of
        // things people *did* — ran code, checked a lab, started an exam.
        interactions: allEvents - pageViews,
        neverSignedIn,
      },
      previous: {
        newUsers: previousNewUsers,
        signIns: previousSignIns,
        pageViews: previousPageViews,
        visitors: visitorTotals[0]?.previous ?? 0,
        interactions: previousAllEvents - previousPageViews,
      },

      daily: [...series.values()],

      topPages: topPages.map((row) => ({
        name: row.path ?? '/',
        count: row._count.path,
      })),
      topReferrers: topReferrers.map((row) => ({
        name: row.referrer ?? 'direct',
        count: row._count.referrer,
      })),
      eventBreakdown: eventCounts
        .map((row) => ({ name: eventLabel(row.type), count: row._count._all }))
        .sort((a, b) => b.count - a.count),
      usersByRole: usersByRole
        .map((row) => ({ name: row.role, count: row._count._all }))
        .sort((a, b) => b.count - a.count),

      roster: rosterUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        signedUpAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        loginCount: user.loginCount,
        lastActivityAt: user.lastActivityAt?.toISOString() ?? null,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        labAttempts: attemptsBy.get(user.id) ?? 0,
        labsPassed: passedBy.get(user.id) ?? 0,
        eventsInRange: eventsBy.get(user.id) ?? 0,
      })),

      recentLogins: recentLoginRows.map((row) => {
        const user = row.userId ? loginUserBy.get(row.userId) : undefined;
        return {
          id: row.id,
          at: row.createdAt.toISOString(),
          userId: row.userId,
          name: user?.name ?? null,
          email: user?.email ?? null,
          provider: row.resource,
          userAgent: row.userAgent,
        };
      }),
    };

    return stats;
  }, null);

  return data;
}

/**
 * Percentage change between two windows, or null when the previous window has
 * nothing to compare against — "+∞%" against a zero baseline is noise, not a
 * result, and the UI renders a dash instead.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
