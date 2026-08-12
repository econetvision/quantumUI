/**
 * Lesson Content Loader
 * Loads real lesson content from JSON files
 */

import fs from 'fs';
import path from 'path';

export interface LessonImage {
  src: string;
  alt: string;
  caption: string;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: 'lesson' | 'lab' | 'quiz';
  content: string;
  images?: LessonImage[];
  codeExamples?: CodeExample[];
  keyTakeaways?: string[];
}

export interface LessonData {
  trackSlug: string;
  trackName: string;
  lessons: Lesson[];
}

/**
 * Load lessons for a specific track
 */
export function loadTrackLessons(trackSlug: string): LessonData | null {
  try {
    const lessonsPath = path.join(process.cwd(), 'src/data/lessons', `${trackSlug}.json`);

    if (!fs.existsSync(lessonsPath)) {
      console.warn(`Lessons file not found for track: ${trackSlug}`);
      return null;
    }

    const fileContent = fs.readFileSync(lessonsPath, 'utf-8');
    const lessonData: LessonData = JSON.parse(fileContent);

    return lessonData;
  } catch (error) {
    console.error(`Error loading lessons for track ${trackSlug}:`, error);
    return null;
  }
}

/**
 * Get a specific lesson by ID
 */
export function getLesson(trackSlug: string, lessonId: number): Lesson | null {
  const lessonData = loadTrackLessons(trackSlug);

  if (!lessonData) {
    return null;
  }

  const lesson = lessonData.lessons.find(l => l.id === lessonId);
  return lesson || null;
}

/**
 * Get all lessons for a track
 */
export function getAllLessons(trackSlug: string): Lesson[] {
  const lessonData = loadTrackLessons(trackSlug);
  return lessonData?.lessons || [];
}

/**
 * Check if real content exists for a track
 */
export function hasRealContent(trackSlug: string): boolean {
  const lessonsPath = path.join(process.cwd(), 'src/data/lessons', `${trackSlug}.json`);
  return fs.existsSync(lessonsPath);
}

/**
 * Get track name for a track slug
 */
export function getTrackName(trackSlug: string): string | null {
  const lessonData = loadTrackLessons(trackSlug);
  return lessonData?.trackName || null;
}
