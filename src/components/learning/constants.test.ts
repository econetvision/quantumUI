import { describe, expect, it } from 'vitest';
import {
  coercePreferences, DEFAULT_PREFERENCES, meetsMode, MODE_ORDER, modeRank,
} from './constants';

describe('mode ordering', () => {
  it('ranks the three tiers in increasing depth', () => {
    expect(MODE_ORDER).toEqual(['kid', 'student', 'professional']);
    expect(modeRank('kid')).toBeLessThan(modeRank('student'));
    expect(modeRank('student')).toBeLessThan(modeRank('professional'));
  });

  it('treats an unknown mode as the shallowest, never deeper', () => {
    // Guards the inherit-upward rule: a bad value must not unlock pro content.
    expect(modeRank('nonsense' as never)).toBe(0);
  });

  it('meetsMode is inclusive of the tier itself', () => {
    expect(meetsMode('student', 'student')).toBe(true);
    expect(meetsMode('professional', 'student')).toBe(true);
    expect(meetsMode('kid', 'student')).toBe(false);
  });
});

describe('coercePreferences', () => {
  it('falls back to the defaults for junk', () => {
    expect(coercePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(coercePreferences('nope')).toEqual(DEFAULT_PREFERENCES);
    expect(coercePreferences(42)).toEqual(DEFAULT_PREFERENCES);
  });

  it('accepts all three modes and rejects anything else', () => {
    expect(coercePreferences({ mode: 'professional' }).mode).toBe('professional');
    expect(coercePreferences({ mode: 'student' }).mode).toBe('student');
    expect(coercePreferences({ mode: 'hacker' }).mode).toBe('kid');
  });

  it('clamps fontScale, which is multiplied into a CSS length', () => {
    // A hand-edited localStorage value must not be able to destroy the layout.
    expect(coercePreferences({ fontScale: 400 }).fontScale).toBe(1.3);
    expect(coercePreferences({ fontScale: -5 }).fontScale).toBe(1);
    expect(coercePreferences({ fontScale: Number.NaN }).fontScale).toBe(1);
    expect(coercePreferences({ fontScale: 1.15 }).fontScale).toBe(1.15);
  });

  it('keeps booleans and rejects non-booleans', () => {
    expect(coercePreferences({ soundOn: false }).soundOn).toBe(false);
    expect(coercePreferences({ soundOn: 'yes' }).soundOn).toBe(true);
  });

  it('ignores an empty language rather than blanking it', () => {
    expect(coercePreferences({ language: '' }).language).toBe('en');
    expect(coercePreferences({ language: 'hi' }).language).toBe('hi');
  });
});
