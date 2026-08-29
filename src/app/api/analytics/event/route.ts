import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import auth from '@/lib/auth';
import { TRACKED_EVENTS, recordEvent } from '@/lib/analytics';

/**
 * Ingest one analytics event from a browser.
 *
 * Public by design — most traffic on this site is signed out, and a curriculum
 * that only counted logged-in learners would answer none of the questions the
 * dashboard exists to answer. That makes abuse the thing to design against:
 *
 *   - `type` must be one of a fixed vocabulary (see src/lib/analytics.ts), so
 *     nobody can spray unbounded values into a column the dashboard GROUP BYs.
 *   - `meta` is capped and shape-checked rather than stored as arbitrary JSON.
 *   - a per-visitor in-memory burst cap keeps one tab from writing thousands of
 *     rows a second.
 *   - the response is always 202 and carries no data, so it is useless as an
 *     oracle for probing whether the database is up.
 */

const EventSchema = z.object({
  type: z.enum(TRACKED_EVENTS),
  visitorId: z.string().min(8).max(64),
  path: z.string().max(500).nullish(),
  referrer: z.string().max(500).nullish(),
  // Small, flat, and only scalars — a nested blob from a browser is not
  // something we want to hand to `JSON.stringify` on the dashboard.
  meta: z
    .record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean()]))
    .refine((value) => Object.keys(value).length <= 10, {
      message: 'Too many meta keys',
    })
    .nullish(),
});

/**
 * Burst cap, per visitor id, per instance.
 *
 * This is a speed bump, not a security boundary — serverless spreads requests
 * over instances, so a determined client gets a higher effective limit. It is
 * enough to stop a runaway `useEffect` or an open tab from filling the table,
 * which is the failure this endpoint is actually likely to see.
 */
const BURST_WINDOW_MS = 60_000;
const BURST_MAX = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function overBurstLimit(visitorId: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(visitorId);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(visitorId, { count: 1, resetAt: now + BURST_WINDOW_MS });

    // Opportunistic sweep so the map cannot grow without bound on a long-lived
    // instance. Cheap because it only runs when a new window opens.
    if (buckets.size > 5_000) {
      for (const [key, value] of buckets) {
        if (now > value.resetAt) buckets.delete(key);
      }
    }
    return false;
  }

  bucket.count += 1;
  return bucket.count > BURST_MAX;
}

/**
 * Always the same answer — accepted, no body — so this route leaks nothing
 * about server state, not even whether the database is reachable.
 *
 * A fresh instance per call rather than a shared constant: a `Response` body is
 * a one-shot stream, and handing the same object to two concurrent requests is
 * a bug waiting for the first burst of traffic.
 */
function accepted() {
  return new NextResponse(null, { status: 202 });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return accepted();
  }

  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return accepted();

  const { type, visitorId, path, referrer, meta } = parsed.data;
  if (overBurstLimit(visitorId)) return accepted();

  // Attribution comes from the session cookie, never from the request body —
  // otherwise a browser could post events as any user id it liked.
  const session = await auth.auth().catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  await recordEvent({
    type,
    visitorId,
    path,
    referrer,
    userId,
    meta: meta ?? undefined,
  });

  return accepted();
}
