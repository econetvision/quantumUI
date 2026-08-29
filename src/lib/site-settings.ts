/**
 * Site-wide settings, read far more often than they are written.
 *
 * Cached in memory for 60s rather than Redis: no Redis instance is provisioned
 * (REDIS_URL sits unused in .env.example), and on serverless each function
 * instance keeps its own copy, so the worst case after an admin change is one
 * stale minute per warm instance. If a shared cache is added later, only the
 * two functions here need to change.
 */

import { withDatabase } from './db';

export interface SiteSettings {
  /** Master switch for the Track 0 entry module. */
  track0Enabled: boolean;
  /** Which layer a brand-new visitor sees first. */
  kidModeDefault: boolean;
  showConfetti: boolean;
  /** Empty string means no banner. */
  maintenanceBanner: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  track0Enabled: true,
  kidModeDefault: true,
  showConfetti: true,
  maintenanceBanner: '',
};

export const SITE_SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettings)[];

const TTL_MS = 60_000;
let cache: { value: SiteSettings; at: number } | null = null;

export function invalidateSiteSettings() {
  cache = null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  // Defaults stand in when the database is unavailable: the site keeps
  // rendering with sensible flags rather than failing to answer at all.
  const { data: rows } = await withDatabase((db) => db.siteSetting.findMany(), []);

  const merged = { ...DEFAULT_SITE_SETTINGS };
  for (const row of rows) {
    if (!(row.key in merged)) continue; // ignore keys retired from the type
    const key = row.key as keyof SiteSettings;
    const value = row.value;
    if (typeof value === typeof merged[key]) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  cache = { value: merged, at: Date.now() };
  return merged;
}
