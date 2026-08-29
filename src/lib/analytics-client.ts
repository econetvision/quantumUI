/**
 * Browser side of analytics.
 *
 * Deliberately tiny and dependency-free — no third-party script, no cookies, no
 * cross-site identifiers. A random `visitorId` lives in this browser's
 * localStorage and never leaves first-party storage; combined with the fact
 * that the server stores no IP address on analytics rows, there is nothing here
 * that identifies a person.
 *
 * Every call is fire-and-forget: analytics must never delay a navigation, and a
 * failed beacon is not worth a console error in a learner's face.
 */

import type { TrackedEvent } from './analytics';

const VISITOR_KEY = 'quantumui:visitor-id';
const ENDPOINT = '/api/analytics/event';

/**
 * Honour Do Not Track and Global Privacy Control.
 *
 * This is a first-party, cookieless, PII-free counter, so it is not strictly
 * required to — but a visitor who has asked not to be measured has asked
 * clearly, and the cost is a slightly lower number on a dashboard. The admin
 * dashboard says so in a footnote rather than pretending the totals are
 * exhaustive. Flip this function to `() => false` to count everyone.
 */
function optedOut(): boolean {
  if (typeof navigator === 'undefined') return true;

  const nav = navigator as Navigator & {
    doNotTrack?: string;
    msDoNotTrack?: string;
    globalPrivacyControl?: boolean;
  };
  const win = window as Window & { doNotTrack?: string };

  if (nav.globalPrivacyControl === true) return true;

  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

/** Random id for this browser, created on first use. */
function visitorId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    // `randomUUID` needs a secure context; over plain http on a LAN address it
    // is undefined, which would otherwise throw and kill every event.
    const fresh =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    // Private mode, or storage blocked entirely. Without a stable id there is
    // no unique-visitor figure to contribute to, so skip rather than invent a
    // new id per page and inflate the count.
    return null;
  }
}

interface TrackOptions {
  path?: string;
  meta?: Record<string, unknown>;
}

/**
 * Record one interaction.
 *
 * Uses `sendBeacon` where available so the request survives the page being
 * unloaded mid-navigation — a plain `fetch` is cancelled by the browser at that
 * point, which is exactly when the last page view of a session happens.
 */
export function trackEvent(type: TrackedEvent, options: TrackOptions = {}): void {
  if (typeof window === 'undefined' || optedOut()) return;

  const id = visitorId();
  if (!id) return;

  const payload = JSON.stringify({
    type,
    visitorId: id,
    path: options.path ?? window.location.pathname,
    // Only an external referrer is interesting; an internal one is just the
    // previous page of the same visit, which the page-view series already shows.
    referrer:
      document.referrer && !document.referrer.startsWith(window.location.origin)
        ? document.referrer
        : null,
    meta: options.meta,
  });

  try {
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }

    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      /* analytics is never worth surfacing to the learner */
    });
  } catch {
    /* ditto */
  }
}
