import type { MetadataRoute } from 'next';
import { TRACK0_LESSONS } from '@/lib/track0-lessons';
import { absoluteUrl } from '@/lib/site';

/**
 * Served at /sitemap.xml — the file Google reads to discover every page.
 *
 * Generated rather than hand-written so a new track or lesson is crawlable the
 * moment its content lands, with no second file to remember to update. It
 * covers three layers:
 *
 *   1. the standing top-level pages,
 *   2. one entry per learning track,
 *   3. one entry per lesson inside every track that has real content.
 *
 * Deliberately absent: /login, /signup, /admin, /unauthorized and /labs/shell.
 * A sitemap is a list of pages you want ranked, and a sign-in form is not one —
 * listing them also contradicts robots.txt, which search consoles report as an
 * error against the site.
 *
 * `priority` is a hint about relative importance *within this site* only; it
 * says nothing to Google about other sites, which is why the numbers below only
 * separate the entry points from the leaves.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp for the whole generation. Emitting `new Date()` per entry
  // would claim every page changed at a slightly different instant, which is
  // both untrue and noise for a crawler diffing against its last fetch.
  const lastModified = new Date();

  const topLevel: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    // Track 0 is the entry point for readers with no background, and the
    // only part of the curriculum that needs no account at all. It ranks
    // alongside /tracks rather than below it.
    { path: '/learn/track-0', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/visuals', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/upgrade', priority: 0.4, changeFrequency: 'yearly' },
  ];

  /*
   * /tracks, /labs, /algorithms, /playground, /exam, /curriculum and /projects
   * used to be listed here and are not any more, because they now require an
   * account. A crawler following them receives a 307 to /login, so they could
   * never be indexed — 94 URLs of the previous sitemap were unreachable in
   * exactly that way, and submitting URLs that answer with a redirect is worse
   * than omitting them.
   *
   * What remains is what a signed-out visitor can actually read: the home page,
   * the whole of Track 0, and the visuals.
   */

  const entries: MetadataRoute.Sitemap = topLevel.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Track 0 lessons are typed data rather than JSON content files, so they
  // are not reachable through getAllLessons below. Listed explicitly, and
  // driven off TRACK0_LESSONS so a new lesson is crawlable the day it is
  // authored rather than whenever somebody remembers this file.
  for (const lesson of TRACK0_LESSONS) {
    entries.push({
      url: absoluteUrl(`/learn/track-0/${lesson.slug}`),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
