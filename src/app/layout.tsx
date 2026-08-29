import type { Metadata, Viewport } from 'next';
import { DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { LearningModeProvider } from '@/components/learning/LearningModeProvider';
import { learningInitScript } from '@/components/learning/learning-script';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { themeInitScript } from '@/components/theme/theme-script';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

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
  title: {
    default: 'QuantumUI — Learn Quantum Computing Interactively',
    template: '%s · QuantumUI',
  },
  description:
    'Interactive quantum computing curriculum. Run real circuits on the QpiAI Quantum SDK, visualise Bloch spheres and statevectors, and prepare for certification.',
  applicationName: 'QuantumUI',
  keywords: [
    'quantum computing',
    'qiskit',
    'qpiai',
    'quantum algorithms',
    'quantum certification',
    'quantum programming',
    'QWorld',
  ],
  openGraph: {
    title: 'QuantumUI — Learn Quantum Computing Interactively',
    description:
      'Run real quantum circuits in the browser, visualise statevectors, and work through a 12-track curriculum.',
    type: 'website',
  },
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
        {/* Resolves learning mode and font scale before paint. Mode decides
            which half of a lesson renders, so settling it after hydration
            would briefly show a child the equations. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: learningInitScript }}
        />
        <SessionProvider>
          <ThemeProvider>
            <LearningModeProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            </LearningModeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
