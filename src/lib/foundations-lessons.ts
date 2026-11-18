import type { FoundationLesson } from '@/lib/foundations-types';
import { MODULE_01 } from '@/lib/foundations/module-01';
import { MODULE_02 } from '@/lib/foundations/module-02';

export type { FoundationLesson, FoundationTier } from '@/lib/foundations-types';

/**
 * Every written lesson, one file per syllabus module.
 *
 * Modules are added here as they are authored; foundations.test.ts checks
 * that each lesson names a real syllabus topic, carries all three tiers,
 * and draws a figure the registry can render.
 */
export const FOUNDATION_LESSONS: FoundationLesson[] = [...MODULE_01, ...MODULE_02];

const BY_TOPIC = new Map(FOUNDATION_LESSONS.map((l) => [l.topic, l]));

export const getLessonForTopic = (topicId: string): FoundationLesson | undefined =>
  BY_TOPIC.get(topicId);

export const hasLesson = (topicId: string): boolean => BY_TOPIC.has(topicId);
