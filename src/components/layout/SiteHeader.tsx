'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SITE_BYLINE } from '@/lib/site';
import { NAV_LINKS, SECONDARY_LINKS } from './nav-links';

function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5"
      aria-label="QuantumUI home"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-alt font-mono text-lg font-bold text-accent-contrast"
      >
        Q
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-mono text-lg font-bold tracking-tight">
          Quantum<span className="text-accent">UI</span>
        </span>
        <span className="mt-0.5 text-[0.6rem] font-medium tracking-wide text-content-subtle">
          {SITE_BYLINE}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The drawer records which route it was opened on. Deriving `open` from that
  // means any navigation — a drawer link, a back button, anything — closes it
  // automatically, without an effect that re-renders to sync state.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn !== null && openedOn === pathname;

  const setOpen = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      setOpenedOn((current) => {
        const isOpen = current !== null && current === pathname;
        const wanted = typeof next === 'function' ? next(isOpen) : next;
        return wanted ? pathname : null;
      });
    },
    [pathname],
  );

  // Lock body scroll while the drawer covers the viewport.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes, and focus returns to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Logo />

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-accent-soft text-accent'
                    : 'text-content-muted hover:bg-surface-raised hover:text-content'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {status === 'authenticated' ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[10rem] truncate font-mono text-xs text-content-muted">
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 font-mono text-xs text-content-muted transition-colors hover:border-line-strong hover:text-content"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="quantum-btn hidden !min-h-[2.5rem] !px-4 !text-xs sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          {/* Drawer trigger — the only nav affordance below `lg`. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-content-muted transition-colors hover:border-line-strong hover:text-content lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile drawer — deliberately a sibling of <header>, not a child.
          The header carries `backdrop-blur-md`, and an element with a
          backdrop-filter becomes the containing block for its fixed-position
          descendants. Nested inside, this wrapper resolved `top-16 bottom-0`
          against the 64px-tall header and collapsed to zero height, so the
          backdrop never dimmed the page or caught taps to close. */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
          />
          <div
            id="mobile-nav"
            ref={panelRef}
            className="relative max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-surface px-4 pb-8 pt-2 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`flex min-h-[3.25rem] flex-col justify-center rounded-xl px-4 py-2.5 transition-colors ${
                      isActive(link.href)
                        ? 'bg-accent-soft text-accent'
                        : 'text-content hover:bg-surface-raised'
                    }`}
                  >
                    <span className="font-mono text-base font-bold">
                      {link.label}
                    </span>
                    <span className="text-sm text-content-muted">
                      {link.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-4 border-t border-line" />

            <ul className="flex flex-col gap-1">
              {SECONDARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[2.75rem] items-center rounded-xl px-4 text-sm text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/tracks" className="quantum-btn mt-5 w-full">
              Start Learning
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
