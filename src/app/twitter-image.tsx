/**
 * X/Twitter reads its own `twitter:image` tag and falls back to `og:image` only
 * inconsistently, so the card is emitted explicitly rather than left to chance.
 * It is the same 1200x630 artwork — re-exporting keeps one design, one file to
 * edit, and no risk of the two drifting apart.
 */
export { default, alt, size, contentType } from './opengraph-image';
