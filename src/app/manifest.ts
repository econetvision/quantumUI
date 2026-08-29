import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

/**
 * Served at /manifest.webmanifest.
 *
 * Makes the site installable and, more to the point here, gives mobile search
 * and share sheets a proper name, colour and icon instead of deriving them from
 * the URL. `theme_color` matches the dark surface the layout already declares
 * in its viewport export, so the browser chrome does not flash a different one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#07090d',
    theme_color: '#07090d',
    categories: ['education', 'science', 'productivity'],
    lang: 'en',
    // 192/512 PNGs are what Android's install prompt actually uses; the
    // maskable variant fills the full square so adaptive-icon shapes do not
    // letterbox it. All three are renders of the same mark as src/app/icon.svg.
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
