import { describe, expect, it } from 'vitest';
import { gateForTopic, lockReason, LAB_TOPIC_TRACK } from '@/lib/lab-access';
import { getAllLessons } from '@/lib/lesson-loader';
import { TRACK_CONFIGS } from '@/lib/track-mapping';
import { TOPICS } from '@/lib/lab-questions';

/**
 * A gate that is wrong in the permissive direction lets everybody through and
 * nobody notices; wrong in the strict direction locks a learner out of work
 * they earned. Both are asserted here.
 */
describe('lab access gate', () => {
  it('names a real track, or null, for every lab topic that exists', () => {
    for (const topic of TOPICS) {
      expect(Object.hasOwn(LAB_TOPIC_TRACK, topic.id), `unmapped topic: ${topic.id}`).toBe(true);
      const track = LAB_TOPIC_TRACK[topic.id];
      if (track !== null) {
        expect(
          TRACK_CONFIGS.some((t) => t.slug === track),
          `${topic.id} -> ${track} is not a real track`,
        ).toBe(true);
      }
    }
  });

  it('maps no two topics onto the same track', () => {
    // Two banks sharing a track would unlock together, which is not what
    // "finish this track to open its labs" promises.
    const used = Object.values(LAB_TOPIC_TRACK).filter(Boolean) as string[];
    expect(new Set(used).size).toBe(used.length);
  });

  it('locks a gated topic when the learner has done nothing', () => {
    const gate = gateForTopic('quantum-fundamentals', {});
    expect(gate.unlocked).toBe(false);
    expect(gate.lessonsDone).toBe(0);
    expect(gate.lessonsTotal).toBeGreaterThan(0);
  });

  it('stays locked while even one lesson is outstanding', () => {
    const all = getAllLessons('quantum-fundamentals').map((l) => l.id);
    const gate = gateForTopic('quantum-fundamentals', {
      'quantum-fundamentals': all.slice(0, -1),
    });
    expect(gate.unlocked).toBe(false);
    expect(gate.lessonsDone).toBe(all.length - 1);
  });

  it('unlocks once every lesson in that track is done', () => {
    const all = getAllLessons('quantum-fundamentals').map((l) => l.id);
    const gate = gateForTopic('quantum-fundamentals', { 'quantum-fundamentals': all });
    expect(gate.unlocked).toBe(true);
  });

  it('does not let progress in one track unlock another', () => {
    // The learner picks a topic; finishing a different one must not open it.
    const other = getAllLessons('quantum-gates').map((l) => l.id);
    const gate = gateForTopic('quantum-fundamentals', { 'quantum-gates': other });
    expect(gate.unlocked).toBe(false);
    expect(gate.lessonsDone).toBe(0);
  });

  it('ignores completions for lessons that no longer exist', () => {
    // Stale rows survive a renumbering and must not count toward the total.
    const gate = gateForTopic('quantum-fundamentals', {
      'quantum-fundamentals': [9001, 9002, 9003, 9004, 9005, 9006, 9007],
    });
    expect(gate.lessonsDone).toBe(0);
    expect(gate.unlocked).toBe(false);
  });

  it('counts a repeated lesson once', () => {
    const all = getAllLessons('quantum-fundamentals').map((l) => l.id);
    const gate = gateForTopic('quantum-fundamentals', {
      'quantum-fundamentals': [all[0], all[0], all[0]],
    });
    expect(gate.lessonsDone).toBe(1);
    expect(gate.unlocked).toBe(all.length === 1);
  });

  it('leaves the two SDK banks open, since no track teaches them', () => {
    for (const topic of ['cirq-sdk', 'qpiai-sdk']) {
      const gate = gateForTopic(topic, {});
      expect(gate.unlocked, topic).toBe(true);
      expect(gate.trackSlug, topic).toBeNull();
    }
  });

  it('treats an unknown topic as ungated rather than throwing', () => {
    expect(gateForTopic('not-a-topic', {}).unlocked).toBe(true);
  });

  it('tells the learner how many lessons are left', () => {
    const all = getAllLessons('quantum-fundamentals').map((l) => l.id);
    const gate = gateForTopic('quantum-fundamentals', {
      'quantum-fundamentals': all.slice(0, 1),
    });
    const reason = lockReason(gate, 'Quantum Fundamentals');
    expect(reason).toContain(String(all.length - 1));
    expect(reason).toContain('Quantum Fundamentals');
    expect(lockReason(gateForTopic('qpiai-sdk', {}))).toBeNull();
  });
});
