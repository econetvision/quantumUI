import type { Metadata } from 'next';

/**
 * `/login` is a client component, and a client component cannot export
 * `metadata` — Next only reads that export from server files. A layout wrapping
 * the single route is the standard way to give such a page a proper head
 * without converting the form to a server component it cannot be.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to QuantumUI to sync your progress, streak and XP across devices.',
  // A sign-in form has no search value and duplicates itself across every
  // callbackUrl. robots.txt disallows it too; this covers crawlers that reach
  // the page without fetching robots.txt first.
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
