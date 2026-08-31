import { describe, expect, it } from 'vitest';
import { ORG_NAME, SITE_BYLINE, SUPPORT_EMAIL, supportMailto } from '@/lib/site';

/**
 * The byline renders on every page, on certificates, and in outbound email.
 * It once said "Sroorbitary Labs" while the site lived at sroobservotary.com —
 * two different words. The registered domain is the spelling that cannot
 * change, so the name is asserted against it.
 */
describe('organisation name', () => {
  it('matches the production domain spelling', () => {
    expect(ORG_NAME).toBe('Sroobservotary Labs');
    expect(SITE_BYLINE).toBe('by Sroobservotary Labs');
  });
});

/**
 * The support address is the only route a stuck user has back to a human, and
 * it is pasted into error pages that render *because* something already went
 * wrong. A malformed mailto there fails silently — the link just does nothing —
 * so the encoding is asserted rather than eyeballed.
 */
describe('support contact', () => {
  it('is a mailbox on the Workspace domain that sends the mail', () => {
    // Mail is sent and received as this identity; a mismatch between the
    // address shown to users and the authenticated sender is what makes
    // replies bounce.
    expect(SUPPORT_EMAIL).toBe('contact@econetvision.com');
  });

  it('builds a bare mailto when there is nothing to prefill', () => {
    // Not `mailto:...?`, which some clients render as an empty subject.
    expect(supportMailto()).toBe('mailto:contact@econetvision.com');
    expect(supportMailto({})).toBe('mailto:contact@econetvision.com');
  });

  it('percent-encodes a subject rather than pasting it raw', () => {
    expect(supportMailto({ subject: 'Lab & exam broken' })).toBe(
      'mailto:contact@econetvision.com?subject=Lab%20%26%20exam%20broken',
    );
  });

  it('encodes the fragment character, which would otherwise truncate the link', () => {
    // A raw '#' ends the URL: everything after it becomes a fragment and is
    // dropped from the mail. Error references contain them often enough.
    expect(supportMailto({ subject: 'Error #42' })).toBe(
      'mailto:contact@econetvision.com?subject=Error%20%2342',
    );
  });

  it('carries a body alongside the subject', () => {
    expect(supportMailto({ subject: 'Broken', body: 'Reference: abc123' })).toBe(
      'mailto:contact@econetvision.com?subject=Broken&body=Reference%3A%20abc123',
    );
  });

  it('omits parameters that are absent or blank', () => {
    // An error page with no digest to report should not send a body of "".
    expect(supportMailto({ subject: 'Broken', body: '   ' })).toBe(
      'mailto:contact@econetvision.com?subject=Broken',
    );
    expect(supportMailto({ body: 'Reference: abc123' })).toBe(
      'mailto:contact@econetvision.com?body=Reference%3A%20abc123',
    );
  });
});
