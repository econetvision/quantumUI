'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics-client';

/**
 * Records a page view on first paint and on every client-side navigation.
 *
 * Mounted once in the root layout. It reads `usePathname` and deliberately not
 * `useSearchParams`: query strings are stripped server-side anyway (see
 * `normalisePath`), and reading them here would force the whole layout into a
 * Suspense boundary and opt every page out of static rendering — a real cost to
 * pay for data we throw away.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  // React 18 mounts effects twice in development StrictMode. Without this the
  // dev database fills with duplicate page views and every local number is 2x.
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    trackEvent('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
