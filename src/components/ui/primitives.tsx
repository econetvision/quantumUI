import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Layout and content primitives shared across pages.
 *
 * Pages previously repeated `w-full max-w-6xl mx-auto px-4 sm:px-6` and a
 * bespoke card treatment in every file, which is how the spacing and radii
 * drifted apart. These wrap those decisions once.
 */

export function Container({
  children,
  size = 'default',
  className = '',
}: {
  children: ReactNode;
  size?: 'narrow' | 'default' | 'wide';
  className?: string;
}) {
  const width = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  }[size];

  return (
    <div className={`mx-auto w-full ${width} px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className = '',
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      className={`py-12 sm:py-16 ${muted ? 'bg-surface-raised' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  as = 'div',
  href,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
  href?: string;
}) {
  const classes = `quantum-card p-5 sm:p-6 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${classes} block`}>
        {children}
      </Link>
    );
  }

  const Tag = as;
  return <Tag className={classes}>{children}</Tag>;
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-surface-overlay text-content-muted border-line',
    accent: 'bg-accent-soft text-accent border-accent/30',
    success: 'bg-success-soft text-success border-success/30',
    warning: 'bg-warning-soft text-warning border-warning/30',
    danger: 'bg-danger-soft text-danger border-danger/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Callout({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: BadgeTone;
  title?: ReactNode;
  children: ReactNode;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: 'border-line bg-surface-raised',
    accent: 'border-accent/30 bg-accent-soft',
    success: 'border-success/30 bg-success-soft',
    warning: 'border-warning/30 bg-warning-soft',
    danger: 'border-danger/30 bg-danger-soft',
  };

  return (
    <div className={`rounded-xl border p-4 text-sm ${tones[tone]}`}>
      {title && <p className="mb-1 font-mono font-bold">{title}</p>}
      <div className="leading-relaxed text-content-muted">{children}</div>
    </div>
  );
}

export function StatTile({
  value,
  label,
  href,
}: {
  value: ReactNode;
  label: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="font-mono text-2xl font-bold text-accent sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-content-muted sm:text-sm">{label}</div>
    </>
  );

  return href ? (
    <Card href={href} className="!p-4 text-center sm:!p-5">
      {body}
    </Card>
  ) : (
    <Card className="!p-4 text-center sm:!p-5">{body}</Card>
  );
}

/** Shown when a list has nothing in it, or a service is unreachable. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-8 text-center">
      <h2 className="font-mono text-base font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
