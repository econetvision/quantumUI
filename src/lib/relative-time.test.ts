import { describe, expect, it } from 'vitest';
import { relativeTime } from '@/lib/relative-time';

describe('relativeTime', () => {
  const now = new Date('2026-08-30T12:00:00Z');
  const at = (iso: string) => relativeTime(iso, now);

  it('collapses anything under a minute to "just now"', () => {
    expect(at('2026-08-30T11:59:59Z')).toBe('just now');
    expect(at('2026-08-30T12:00:00Z')).toBe('just now');
  });

  it('steps through the units at their boundaries', () => {
    expect(at('2026-08-30T11:59:00Z')).toBe('1m ago');
    expect(at('2026-08-30T11:00:00Z')).toBe('1h ago');
    expect(at('2026-08-29T12:00:00Z')).toBe('1d ago');
    expect(at('2026-07-30T12:00:00Z')).toBe('1mo ago');
    expect(at('2025-08-30T12:00:00Z')).toBe('1y ago');
  });

  it('treats a clock-skewed future timestamp as now, not negative', () => {
    // A reply created on the server one second "in the future" relative to the
    // browser clock must not render "-1s ago".
    expect(at('2026-08-30T12:00:05Z')).toBe('just now');
  });

  it('returns an empty string for garbage rather than NaN text', () => {
    expect(at('not-a-date')).toBe('');
  });
});
