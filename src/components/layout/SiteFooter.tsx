import Link from 'next/link';
import { NAV_LINKS, SECONDARY_LINKS } from './nav-links';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface-raised">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-alt font-mono text-sm font-bold text-accent-contrast"
              >
                Q
              </span>
              <span className="font-mono text-base font-bold">
                Quantum<span className="text-accent">UI</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-content-muted">
              An interactive quantum computing curriculum. Circuits run on the
              QpiAI Quantum SDK; lesson material is adapted from QWorld&apos;s
              open educational notebooks.
            </p>
          </div>

          <nav aria-label="Learn">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
              Learn
            </h2>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-content-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-subtle">
              More
            </h2>
            <ul className="mt-3 space-y-2">
              {SECONDARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-content-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/qpiai/quantum-sdk"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-content-muted transition-colors hover:text-accent"
                >
                  QpiAI Quantum SDK ↗
                </a>
              </li>
              <li>
                <a
                  href="https://qworld.net"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-content-muted transition-colors hover:text-accent"
                >
                  QWorld ↗
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-sm text-content-subtle">
          <p>
            QuantumUI · Built with <span className="text-accent">|ψ⟩</span> ·
            Lesson content courtesy of QWorld under its original licences.
          </p>
        </div>
      </div>
    </footer>
  );
}
