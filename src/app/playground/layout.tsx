import type { Metadata } from 'next';

/**
 * The playground is a client component (it loads Monaco dynamically), so its
 * head lives here. Unlike /login this page *is* worth indexing — "quantum
 * circuit simulator online" is exactly what it is.
 */
export const metadata: Metadata = {
  title: 'Quantum circuit playground',
  description:
    'Write and run quantum circuits in your browser. Real statevectors, measurement histograms and per-qubit Bloch vectors from the QpiAI Quantum SDK — no install, no registration.',
  alternates: { canonical: '/playground' },
  openGraph: {
    title: 'Quantum circuit playground · QuantumUI',
    description:
      'Write quantum code and execute it on a real statevector simulator, in the browser.',
    url: '/playground',
    type: 'website',
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
