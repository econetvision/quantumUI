import { prisma } from '@/lib/prisma';

/**
 * Fixed-window rate limiting on the `RateLimit` table.
 *
 * The executor endpoints are session-gated and the Python sandbox bounds each
 * individual run (AST allowlist, 15s deadline) — but nothing stopped one
 * signed-in account from submitting runs in a tight loop and starving the
 * executor for everyone else. This is that missing layer: per-user, per-endpoint
 * request budgets, enforced against the database so it holds across serverless
 * instances.
 *
 * The table's primary key is the `id` column alone, so rows are keyed as
 * `subject:endpoint` to allow one subject several independent windows; the
 * `endpoint` column is still populated for queryability.
 */

export interface WindowVerdict {
  allowed: boolean;
  /** Seconds until the window resets — the Retry-After header value. */
  retryAfterSeconds: number;
}

/**
 * Decide a request's fate from the state of its window. Pure — the database
 * wrapper below feeds it the post-increment count.
 */
export function evaluateWindow(
  countInWindow: number,
  windowStart: Date,
  now: Date,
  limit: number,
  windowSeconds: number,
): WindowVerdict {
  const resetAt = windowStart.getTime() + windowSeconds * 1000;
  if (countInWindow <= limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  return {
    allowed: false,
    // At least 1 so a client that honours Retry-After never busy-loops on 0.
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000)),
  };
}

/**
 * Count this request against `subject`'s budget for `endpoint`.
 *
 * Fails open: if the database is unreachable the request proceeds, because the
 * sandbox still bounds each individual run and "the site refused to run my
 * first circuit" is a worse failure than a briefly unenforced budget.
 */
export async function enforceRateLimit({
  subject,
  endpoint,
  limit,
  windowSeconds,
}: {
  subject: string;
  endpoint: string;
  limit: number;
  windowSeconds: number;
}): Promise<WindowVerdict> {
  const id = `${subject}:${endpoint}`;
  const now = new Date();
  const windowFloor = new Date(now.getTime() - windowSeconds * 1000);

  try {
    // Atomic increment when a live window exists…
    const bumped = await prisma.rateLimit.updateMany({
      where: { id, windowStart: { gt: windowFloor } },
      data: { count: { increment: 1 } },
    });

    if (bumped.count === 0) {
      // …otherwise open a fresh window. Two concurrent resets both write
      // count 1 — a one-request undercount, which is fine for a budget.
      await prisma.rateLimit.upsert({
        where: { id },
        create: { id, endpoint, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const row = await prisma.rateLimit.findUnique({ where: { id } });
    if (!row) return { allowed: true, retryAfterSeconds: 0 };
    return evaluateWindow(row.count, row.windowStart, now, limit, windowSeconds);
  } catch (error) {
    console.error('rate-limit check failed, allowing request', error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/** Budgets, named so routes read as policy rather than magic numbers. */
export const RATE_LIMITS = {
  /** Code execution: ample for a human iterating, hostile to a loop. */
  codeRun: { limit: 20, windowSeconds: 60 },
  /** Community posting: threads and replies. */
  communityPost: { limit: 10, windowSeconds: 300 },
} as const;
