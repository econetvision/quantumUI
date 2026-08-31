import { describe, expect, it } from 'vitest';
import { evaluateWindow } from '@/lib/rate-limit';

/**
 * The window decision is what stands between one hot-looping account and the
 * shared Python executor, so its edges are asserted: the boundary count, the
 * Retry-After arithmetic, and the never-zero floor that keeps a compliant
 * client from busy-looping.
 */
describe('evaluateWindow', () => {
  const start = new Date('2026-08-30T10:00:00Z');
  const limit = 20;
  const windowSeconds = 60;

  it('allows requests up to and including the limit', () => {
    expect(evaluateWindow(1, start, start, limit, windowSeconds).allowed).toBe(true);
    expect(evaluateWindow(20, start, start, limit, windowSeconds).allowed).toBe(true);
  });

  it('refuses the first request past the limit', () => {
    const verdict = evaluateWindow(21, start, start, limit, windowSeconds);
    expect(verdict.allowed).toBe(false);
  });

  it('reports seconds remaining until the window resets', () => {
    const now = new Date(start.getTime() + 45_000); // 45s into a 60s window
    const verdict = evaluateWindow(21, start, now, limit, windowSeconds);
    expect(verdict.retryAfterSeconds).toBe(15);
  });

  it('rounds partial seconds up, never down to a lie', () => {
    const now = new Date(start.getTime() + 45_500);
    const verdict = evaluateWindow(21, start, now, limit, windowSeconds);
    expect(verdict.retryAfterSeconds).toBe(15);
  });

  it('never returns Retry-After of zero, even at the window edge', () => {
    const now = new Date(start.getTime() + 60_000);
    const verdict = evaluateWindow(21, start, now, limit, windowSeconds);
    expect(verdict.allowed).toBe(false);
    expect(verdict.retryAfterSeconds).toBe(1);
  });

  it('allowed verdicts carry no retry delay', () => {
    expect(evaluateWindow(5, start, start, limit, windowSeconds).retryAfterSeconds).toBe(0);
  });
});
