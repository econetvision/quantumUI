/**
 * Writing side of the analytics + audit trail.
 *
 * Two stores, on purpose:
 *   - `AnalyticsEvent` — product analytics. Anonymous-friendly, high volume,
 *     queried by time bucket. Page views and interactions land here.
 *   - `AuditLog` — the security trail. Sign-ins, sign-outs and account
 *     creation, with IP and user agent, queried per account.
 *
 * Both writers are best-effort. Losing a page view is not worth failing a
 * request over, and the app is built to run with no database at all (see
 * src/lib/db.ts), so every call degrades to a no-op instead of throwing.
 */

import type { Prisma } from '@prisma/client';
import { withDatabase } from './db';

/**
 * Event types the dashboard knows how to talk about.
 *
 * `/api/analytics/event` is a public endpoint — anything with a browser can
 * post to it. Without a fixed vocabulary a bored visitor could write a million
 * distinct `type` values and make every GROUP BY on the dashboard useless.
 * Unknown types are rejected rather than silently stored.
 */
export const TRACKED_EVENTS = [
  'page_view',
  'code_run',
  'lab_check',
  'lab_solved',
  'algorithm_run',
  'exam_start',
  'exam_submit',
  'lesson_open',
  // Track 0's quizzes have no failure state, so a wrong pick is a signal about
  // the explanation rather than about the learner — it says which idea did not
  // land. Recorded with the lesson and the tier that was on screen.
  'quiz_answer',
  'track_open',
  'search',
  'cta_click',
] as const;

export type TrackedEvent = (typeof TRACKED_EVENTS)[number];

/*
 * Note what is NOT in that list: sign-in, sign-out and sign-up.
 *
 * Those three have authoritative sources already — `AuditLog` rows written by
 * the auth callbacks, and `User.createdAt`. Mirroring them into the analytics
 * stream would mean a browser could inflate the sign-in count by posting to a
 * public endpoint, and it would corrupt the unique-visitor figure, since a
 * server-side write has no browser `visitorId` to attribute it to. The
 * dashboard reads those three straight from their own tables.
 */

const TRACKED_EVENT_SET: ReadonlySet<string> = new Set(TRACKED_EVENTS);

export function isTrackedEvent(value: unknown): value is TrackedEvent {
  return typeof value === 'string' && TRACKED_EVENT_SET.has(value);
}

/** Human labels for the dashboard, so it never renders a raw snake_case key. */
export const EVENT_LABELS: Record<TrackedEvent, string> = {
  page_view: 'Page views',
  code_run: 'Code runs',
  lab_check: 'Lab checks',
  lab_solved: 'Labs solved',
  algorithm_run: 'Algorithm runs',
  exam_start: 'Exams started',
  exam_submit: 'Exams submitted',
  lesson_open: 'Lessons opened',
  quiz_answer: 'Quiz answers',
  track_open: 'Tracks opened',
  search: 'Searches',
  cta_click: 'CTA clicks',
};

export function eventLabel(type: string): string {
  return (EVENT_LABELS as Record<string, string>)[type] ?? type;
}

/** Longest value we will store for a path or referrer. */
const MAX_PATH = 200;
const MAX_REFERRER = 200;

/**
 * Reduce a URL to the part worth counting: pathname only, no query string and
 * no fragment. Query strings carry callback URLs and search terms, which is
 * both a privacy problem and a cardinality problem — `/login?callbackUrl=...`
 * would otherwise be thousands of distinct "pages".
 */
export function normalisePath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const withoutQuery = raw.split(/[?#]/)[0] || '/';
  const path = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  // Trailing slash is the same page as no trailing slash; count them together.
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return trimmed.slice(0, MAX_PATH) || '/';
}

/**
 * Keep only the origin of a referrer. The full URL of the page somebody came
 * from can contain their search query or a private document title; the host is
 * all an acquisition report needs.
 */
export function normaliseReferrer(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!url.host) return null;
    return `${url.protocol}//${url.host}`.slice(0, MAX_REFERRER);
  } catch {
    return null;
  }
}

export interface RecordEventInput {
  type: TrackedEvent;
  visitorId: string;
  path?: string | null;
  referrer?: string | null;
  userId?: string | null;
  meta?: Prisma.InputJsonValue | null;
}

/**
 * Append one analytics event. Returns whether it was actually persisted, which
 * the API route reports back so a caller can tell "recorded" from "the
 * database is down" — it never surfaces as an error to the visitor either way.
 */
export async function recordEvent(input: RecordEventInput): Promise<boolean> {
  const { persisted } = await withDatabase(
    (db) =>
      db.analyticsEvent.create({
        data: {
          type: input.type,
          visitorId: input.visitorId.slice(0, 64),
          path: normalisePath(input.path),
          referrer: normaliseReferrer(input.referrer),
          // A userId for an account that has since been deleted would violate
          // the foreign key and throw; the caller always passes a session id,
          // which by definition exists, so this is just a null-guard.
          userId: input.userId || null,
          meta: input.meta ?? undefined,
        },
        select: { id: true },
      }),
    null,
  );

  return persisted;
}

export interface AuditInput {
  userId?: string | null;
  action: string;
  resource?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

/**
 * Append one audit-trail row.
 *
 * The `AuditLog` model has been in the schema since it was written and nothing
 * ever wrote to it, so "when did this person last sign in" had no answer at
 * all. Sign-in, sign-out and registration now land here.
 */
export async function recordAudit(input: AuditInput): Promise<boolean> {
  const { persisted } = await withDatabase(
    (db) =>
      db.auditLog.create({
        data: {
          userId: input.userId || null,
          action: input.action.slice(0, 64),
          resource: input.resource?.slice(0, 200) ?? null,
          ipAddress: input.ipAddress?.slice(0, 64) ?? null,
          userAgent: input.userAgent?.slice(0, 500) ?? null,
          metadata: input.metadata ?? undefined,
        },
        select: { id: true },
      }),
    null,
  );

  return persisted;
}

/**
 * Record a successful sign-in: bump the denormalised counters the roster reads,
 * and append the audit row that holds the full history.
 *
 * Both happen in one `withDatabase` call so a dead database costs one probe
 * rather than two, and so a sign-in is never delayed by more round trips than
 * it needs.
 */
export async function recordSignIn(options: {
  userId: string;
  provider?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<boolean> {
  const { userId, provider, ipAddress, userAgent } = options;
  const now = new Date();

  const { persisted } = await withDatabase(
    (db) =>
      db.$transaction([
        db.user.update({
          where: { id: userId },
          data: {
            lastLoginAt: now,
            loginCount: { increment: 1 },
            // Signing in is activity. Without this a learner who only ever
            // reads lessons looks permanently dormant on the roster.
            lastActivityAt: now,
          },
          select: { id: true },
        }),
        db.auditLog.create({
          data: {
            userId,
            action: 'login',
            resource: provider ?? null,
            ipAddress: ipAddress?.slice(0, 64) ?? null,
            userAgent: userAgent?.slice(0, 500) ?? null,
          },
          select: { id: true },
        }),
      ]),
    null,
  );

  return persisted;
}

/**
 * Best-effort client address from the proxy headers.
 *
 * `x-forwarded-for` is a comma-separated chain; the first entry is the original
 * client. This is only ever written to the audit trail, never to the analytics
 * stream, and never exposed outside the admin dashboard.
 */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? null;
}
