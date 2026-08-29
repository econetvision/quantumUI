import type { Metadata } from 'next';

/** See the note in src/app/login/layout.tsx — same reason. */
export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Create a free QuantumUI account to keep your quantum computing progress, streak and XP across devices.',
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
