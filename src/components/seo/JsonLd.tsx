import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * Structured data (schema.org JSON-LD).
 *
 * This is the part of SEO that `<meta>` tags cannot do: it tells a search
 * engine that a page is a *course* with a provider and a level, not just a
 * document containing the word "course". It is what makes breadcrumb trails and
 * course cards eligible to appear in a result instead of a bare blue link.
 */

/**
 * Renders one JSON-LD block.
 *
 * The `<` escape is not decoration. JSON-LD goes inside a `<script>` element,
 * and any `</script>` sequence inside the serialised data — from a track
 * description, say — would close the tag early and inject the remainder into
 * the document as markup. Escaping `<` to its unicode form is valid JSON, is
 * parsed identically, and makes that impossible.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/** Identity of the site itself. Rendered once, on the home page. */
export function organisationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organisation`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl('/opengraph-image'),
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} — ${SITE_DESCRIPTION.split('.')[0]}`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organisation` },
  };
}

/**
 * A learning track, described as a `Course`.
 *
 * `hasCourseInstance` is what stops Google rejecting the markup: a Course
 * without one is incomplete under their guidelines. Ours is self-paced and
 * online, which the `courseMode`/`courseWorkload` pair states exactly.
 */
export function courseJsonLd(track: {
  slug: string;
  name: string;
  description: string;
  hours?: number;
  difficulty?: string;
  free: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': absoluteUrl(`/tracks/${track.slug}#course`),
    name: track.name,
    description: track.description,
    url: absoluteUrl(`/tracks/${track.slug}`),
    inLanguage: 'en',
    provider: { '@id': `${SITE_URL}/#organisation` },
    educationalLevel: track.difficulty,
    isAccessibleForFree: track.free,
    teaches: track.name,
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: track.hours ? `PT${Math.round(track.hours)}H` : undefined,
      },
    ],
    offers: track.free
      ? [
          {
            '@type': 'Offer',
            category: 'Free',
            price: 0,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ]
      : undefined,
  };
}

/** A single lesson inside a track. */
export function lessonJsonLd(lesson: {
  trackSlug: string;
  trackName: string;
  lessonId: number;
  title: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': absoluteUrl(
      `/tracks/${lesson.trackSlug}/lessons/${lesson.lessonId}#lesson`,
    ),
    name: lesson.title,
    description: lesson.description,
    url: absoluteUrl(`/tracks/${lesson.trackSlug}/lessons/${lesson.lessonId}`),
    inLanguage: 'en',
    learningResourceType: 'Lesson',
    isPartOf: { '@id': absoluteUrl(`/tracks/${lesson.trackSlug}#course`) },
    provider: { '@id': `${SITE_URL}/#organisation` },
  };
}

/**
 * The trail shown under a result — "quantumui.app › Tracks › Quantum Gates"
 * instead of a raw URL. `position` is 1-based and must be contiguous.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
