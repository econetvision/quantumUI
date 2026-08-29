import type { Metadata, Viewport } from 'next';
import { DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { themeInitScript } from '@/components/theme/theme-script';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { JsonLd, organisationJsonLd, websiteJsonLd } from '@/components/seo/JsonLd';
import {
  ORG_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  IS_PRODUCTION_HOST,
} from '@/lib/site';

/**
 * Fonts are self-hosted through next/font. The previous markup only emitted
 * `preconnect` hints and never loaded a stylesheet, so every "Space Mono"
 * heading silently fell back to the system monospace.
 */
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  /**
   * Every URL-valued tag below — canonical, Open Graph, Twitter, the generated
   * OG image — is written as a relative path and resolved against this. Without
   * it Next throws at build time on the relative ones, and any that slipped
   * through as absolutes would be whatever host happened to build the page.
   * `SITE_URL` resolves the real production domain; see src/lib/site.ts.
   */
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,

  // Self-referencing canonical on the home page. Sub-pages set their own; the
  // template above does not apply to `alternates`, so each page states it.
  alternates: {
    canonical: '/',
  },

  keywords: [
    'quantum computing',
    'learn quantum computing',
    'quantum computing course',
    'qiskit tutorial',
    'qiskit certification',
    'IBM quantum developer certification',
    'qpiai',
    'quantum algorithms',
    'quantum circuit simulator',
    'bloch sphere visualiser',
    'quantum programming',
    'QWorld',
  ],

  authors: [{ name: ORG_NAME, url: SITE_URL }],
  creator: ORG_NAME,
  publisher: ORG_NAME,

  /**
   * Preview deployments and local builds are marked `noindex` at the tag level
   * as well as in robots.txt. Two independent mechanisms, because a crawler
   * that reaches a page without fetching robots.txt first still honours the
   * meta tag — and a staging copy in the index is very hard to get back out.
   */
  robots: IS_PRODUCTION_HOST
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : { index: false, follow: false },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_GB',
    url: '/',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      'Run real quantum circuits in the browser, visualise statevectors, and work through a 12-track curriculum.',
    // Images come from app/opengraph-image.tsx by file convention; listing them
    // here as well would emit the tag twice.
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      'Run real quantum circuits in the browser, visualise statevectors, and work through a 12-track curriculum.',
  },

  // Stops iOS Safari turning strings that look like phone numbers — qubit
  // counts, durations, version numbers — into tel: links inside lesson copy.
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
  },

  category: 'education',
};

/**
 * The viewport export is what makes the site render at device width. Without
 * it mobile browsers assume a ~980px desktop canvas and zoom out, which is why
 * every page previously looked shrunken on a phone regardless of the
 * responsive utility classes in the markup.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Pinch-zoom is left enabled deliberately — disabling it is an accessibility
  // failure (WCAG 1.4.4) even though it is common in app-style layouts.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#07090d' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${dmSans.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-surface text-content">
        {/* Applies the stored theme before the page paints, so there is no
            flash of the default theme on load. It sits at the top of <body>
            rather than in <head> because React hoists head scripts, which
            dropped it from the streamed HTML entirely. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {/* Site-level structured data. Emitted once from the layout so every
            page inherits the organisation and website identity that the
            page-level Course/Breadcrumb blocks reference by @id. */}
        <JsonLd data={organisationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />

        <SessionProvider>
          <ThemeProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            {/* Records a page view on every client-side navigation. Rendered
                inside the providers so it shares the session context. */}
            <AnalyticsTracker />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
