import type { FoundationLesson } from '@/lib/foundations-types';
import { MODULE_01 } from '@/lib/foundations/module-01';
import { MODULE_02 } from '@/lib/foundations/module-02';
import { MODULE_03 } from '@/lib/foundations/module-03';
import { MODULE_04 } from '@/lib/foundations/module-04';
import { MODULE_05 } from '@/lib/foundations/module-05';
import { MODULE_06 } from '@/lib/foundations/module-06';
import { MODULE_07 } from '@/lib/foundations/module-07';
import { MODULE_08 } from '@/lib/foundations/module-08';
import { MODULE_09 } from '@/lib/foundations/module-09';

export type { FoundationLesson, FoundationTier } from '@/lib/foundations-types';

/**
 * Every lesson, one file per syllabus module — all 106 topics.
 *
 * foundations.test.ts checks
 * that each lesson names a real syllabus topic, carries all three tiers,
 * and draws a figure the registry can render.
 */
export const FOUNDATION_LESSONS: FoundationLesson[] = [
  ...MODULE_01, ...MODULE_02, ...MODULE_03, ...MODULE_04, ...MODULE_05,
  ...MODULE_06, ...MODULE_07, ...MODULE_08, ...MODULE_09,
];

const BY_TOPIC = new Map(FOUNDATION_LESSONS.map((l) => [l.topic, l]));

export const getLessonForTopic = (topicId: string): FoundationLesson | undefined =>
  BY_TOPIC.get(topicId);

export const hasLesson = (topicId: string): boolean => BY_TOPIC.has(topicId);
