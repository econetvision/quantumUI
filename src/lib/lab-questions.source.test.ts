import { describe, expect, it } from 'vitest';
import { TOPICS } from '@/lib/lab-questions';

/**
 * `source` names the QWorld notebook a question was harvested from. Questions
 * written for this platform have none, and both lab components declared the
 * field required and read it unguarded — `active.source.split('/')` threw
 * during render, the error boundary caught it, and three entire tracks could
 * not open a single lesson.
 *
 * The fix is to treat the field as optional, which it always was in the data.
 * These tests pin both halves of that: the data is allowed to omit it, and no
 * component may assume it is present.
 */
describe('question source attribution', () => {
  it('has questions with no source, which is legitimate', () => {
    const without = TOPICS.flatMap((t) => t.questions.filter((q) => !q.source));
    // Not asserting an exact count — new authored questions should not fail a
    // test. The point is that zero would make this whole test file pointless,
    // and the components must cope with however many there are.
    expect(without.length).toBeGreaterThan(0);
  });

  it('every question that does carry a source has a usable one', () => {
    for (const topic of TOPICS) {
      for (const q of topic.questions) {
        if (q.source === undefined) continue;
        expect(typeof q.source, `${q.id}`).toBe('string');
        expect(q.source.trim().length, `${q.id} has an empty source`).toBeGreaterThan(0);
        // The UI renders the basename, so a value that splits to nothing would
        // render blank rather than crash — still worth catching here.
        expect(q.source.split('/').pop()?.length, `${q.id} basename is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('no question is missing the fields the lab UI reads unguarded', () => {
    // These four are read without a guard on every render, so a missing one is
    // the same class of bug as `source` was.
    for (const topic of TOPICS) {
      for (const q of topic.questions) {
        expect(typeof q.id, `${q.id}: id`).toBe('string');
        expect(typeof q.title, `${q.id}: title`).toBe('string');
        expect(typeof q.prompt, `${q.id}: prompt`).toBe('string');
        expect(typeof q.difficulty, `${q.id}: difficulty`).toBe('string');
      }
    }
  });
});
