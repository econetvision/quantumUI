/**
 * The site's own identity: canonical origin, name, and the boilerplate that
 * every page's `<head>` is built from.
 *
 * Everything SEO-related needs one absolute origin — `metadataBase`, canonical
 * links, Open Graph URLs, the sitemap, JSON-LD `@id`s. Deriving it in one place
 * is what stops half the tags pointing at localhost and the other half at the
 * deployment, which is the classic way a site ends up with its preview domain
 * indexed instead of its real one.
 */

/**
 * Canonical origin, in order of trust:
 *
 *  1. `NEXT_PUBLIC_SITE_URL` — set this in production. It is the only source
 *     that knows about a custom domain.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's stable production host,
 *     the same on every deployment. Notably NOT `VERCEL_URL`, which is the
 *     per-deployment preview host: using it would emit canonical URLs pointing
 *     at a throwaway deployment and ask Google to index it.
 *  3. `VERCEL_URL` — last resort so a preview at least self-references
 *     coherently. Previews are `noindex` anyway (see `robots.ts`).
 *  4. localhost, for development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(withProtocol(explicit));

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return `https://${stripTrailingSlash(productionHost)}`;

  const deploymentHost = process.env.VERCEL_URL?.trim();
  if (deploymentHost) return `https://${stripTrailingSlash(deploymentHost)}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = 'QuantumUI';
export const SITE_TAGLINE = 'Learn Quantum Computing Interactively';

/**
 * The studio behind the site. Shown as the byline under the wordmark and named
 * as the issuer on completion certificates.
 */
export const ORG_NAME = 'Sroorbitary Labs';
export const SITE_BYLINE = `by ${ORG_NAME}`;

export const SITE_DESCRIPTION =
  'Interactive quantum computing curriculum. Run real circuits on the QpiAI Quantum SDK, visualise Bloch spheres and statevectors, and prepare for IBM Qiskit certification. Start with Track 0 — free, no account needed.';

/**
 * True only on the real production host.
 *
 * Preview deployments serve the same content on a different domain; indexed,
 * they compete with production for the same queries and split its ranking.
 * `robots.ts` reads this to serve `Disallow: /` everywhere but production.
 */
export const IS_PRODUCTION_HOST =
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production');

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Where a stuck user goes to reach a human.
 *
 * A Google Workspace mailbox on `econetvision.com`, which is also the identity
 * outbound mail authenticates as. Kept here rather than inlined at each call
 * site because it appears on pages that render when the app is already broken —
 * the last place you want a stale address — and because the mail sender will
 * need the same constant for its `From` header.
 */
export const SUPPORT_EMAIL = 'contact@econetvision.com';

/**
 * A `mailto:` for {@link SUPPORT_EMAIL}, with anything supplied prefilled.
 *
 * Hand-built mailto links are a reliable source of dead UI: an unencoded `&`
 * silently splits the subject into a second parameter, and an unencoded `#`
 * truncates everything after it, both without any visible failure. Encoding
 * happens here so no caller has to remember.
 *
 * Blank values are dropped rather than emitted empty, so an error page with no
 * reference to quote produces a clean link instead of `?body=`.
 */
export function supportMailto(
  { subject, body }: { subject?: string; body?: string } = {},
): string {
  const params = [
    ['subject', subject],
    ['body', body],
  ]
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => `${key}=${encodeURIComponent(value!.trim())}`);

  return params.length
    ? `mailto:${SUPPORT_EMAIL}?${params.join('&')}`
    : `mailto:${SUPPORT_EMAIL}`;
}
