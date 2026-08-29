import type { MetadataRoute } from 'next';
import { IS_PRODUCTION_HOST, absoluteUrl } from '@/lib/site';

/**
 * Served at /robots.txt.
 *
 * Two jobs: point crawlers at the sitemap, and keep them out of the routes that
 * are either private or worthless in an index.
 */
export default function robots(): MetadataRoute.Robots {
  // A preview deployment serves the same pages on a different host. Left
  // crawlable it competes with production for its own queries and splits the
  // ranking between two domains, so previews are closed entirely.
  if (!IS_PRODUCTION_HOST) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/dashboard',
          '/login',
          '/signup',
          '/unauthorized',
          // The lab shell is a stateful REPL behind a session; crawling it
          // produces nothing indexable and spends executor capacity.
          '/labs/shell',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
