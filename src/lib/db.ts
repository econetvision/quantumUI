/**
 * Safe database access.
 *
 * The app is designed to be usable with no database at all — every learner
 * feature works anonymously against localStorage. The database adds durable,
 * cross-device progress and the instructor views on top of that.
 *
 * Prisma will happily block for tens of seconds trying to reach a MySQL server
 * that is not running, which would turn every API route into a hang. This
 * module probes once, caches the answer briefly, and lets callers degrade
 * cleanly instead.
 */

import { prisma } from './prisma';

/** How long a availability probe result stays valid. */
const PROBE_TTL_MS = 30_000;
/** Hard cap on the probe itself, so a dead host can't stall a request. */
const PROBE_TIMEOUT_MS = 1_500;

let cachedAvailable: boolean | null = null;
let cachedAt = 0;
let inFlight: Promise<boolean> | null = null;

async function probe(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('db probe timeout')), PROBE_TIMEOUT_MS),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

/** True when the database is reachable. Result is cached for PROBE_TTL_MS. */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();

  if (cachedAvailable !== null && now - cachedAt < PROBE_TTL_MS) {
    return cachedAvailable;
  }

  // Collapse concurrent probes into one round-trip.
  if (!inFlight) {
    inFlight = probe().then((ok) => {
      cachedAvailable = ok;
      cachedAt = Date.now();
      inFlight = null;
      return ok;
    });
  }

  return inFlight;
}

/**
 * Run `work` against the database, returning `fallback` when the database is
 * unavailable or the query fails.
 *
 * Errors are swallowed deliberately: a learner mid-lesson should never see a
 * stack trace because the instructor's database is down. Failures are logged
 * once server-side so they remain diagnosable.
 */
export async function withDatabase<T>(
  work: (client: typeof prisma) => Promise<T>,
  fallback: T,
): Promise<{ data: T; persisted: boolean }> {
  if (!(await isDatabaseAvailable())) {
    return { data: fallback, persisted: false };
  }

  try {
    return { data: await work(prisma), persisted: true };
  } catch (error) {
    console.error('[db] query failed, falling back:', error);
    // A failed query means our cached "available" is stale — re-probe next time.
    cachedAvailable = null;
    return { data: fallback, persisted: false };
  }
}

/** Reset the cached probe. Used by tests and the health route. */
export function resetDatabaseProbe() {
  cachedAvailable = null;
  cachedAt = 0;
}
