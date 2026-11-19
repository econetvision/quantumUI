import { PHYSICS_MCQS, type PhysicsMCQ } from '@/lib/physics-mcq';
import { MCQ_02_06 } from '@/lib/foundations/mcq-02-06';
import { MCQ_07_09 } from '@/lib/foundations/mcq-07-09';

/**
 * The second question bank: 148 questions (ids 101–248) written for the 74
 * syllabus topics the hundred-question paper did not assess. Two per topic,
 * in syllabus order, so the topic map below is generated rather than typed.
 */
export const FOUNDATION_MCQS: PhysicsMCQ[] = [...MCQ_02_06, ...MCQ_07_09];

/** Topics in the order their question pairs were written. */
const TOPIC_ORDER = [
  '02.02', '02.03', '02.04', '02.05', '02.09',
  '03.08', '03.10',
  '04.01', '04.08', '04.09', '04.10', '04.11',
  '05.01', '05.02', '05.03', '05.04', '05.05', '05.06', '05.07', '05.08', '05.09', '05.10', '05.11',
  '06.01', '06.02', '06.03', '06.04', '06.05', '06.06', '06.07', '06.08',
  '07.01', '07.02', '07.03', '07.04', '07.05', '07.06', '07.07', '07.08', '07.09', '07.10', '07.11', '07.12', '07.13',
  '08.01', '08.02', '08.03', '08.04', '08.05', '08.06', '08.07', '08.08', '08.09', '08.10', '08.11', '08.12', '08.13', '08.14', '08.15', '08.16', '08.17', '08.18', '08.19',
  '09.02', '09.03', '09.04', '09.05', '09.06', '09.07', '09.08', '09.09', '09.10', '09.11', '09.12',
];

export const FOUNDATION_TOPIC_QUESTIONS: Record<string, number[]> = Object.fromEntries(
  TOPIC_ORDER.map((topic, i) => [topic, [101 + 2 * i, 102 + 2 * i]]),
);

const ALL_BY_ID = new Map<number, PhysicsMCQ>([...PHYSICS_MCQS, ...FOUNDATION_MCQS].map((q) => [q.id, q]));

/** Look a question up in either bank. */
export const getAnyQuestion = (id: number): PhysicsMCQ | undefined => ALL_BY_ID.get(id);

export const ALL_QUESTIONS: PhysicsMCQ[] = [...PHYSICS_MCQS, ...FOUNDATION_MCQS];
