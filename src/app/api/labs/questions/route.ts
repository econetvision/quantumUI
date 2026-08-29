import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import auth from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { gateForTopic } from '@/lib/lab-access';

export interface LabQuestion {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  starterCode: string;
  solution: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'complex';
}

interface QuestionBank {
  topics: {
    slug: string;
    name: string;
    certification: string;
    questionCount: number;
    questions: LabQuestion[];
  }[];
}

let cachedBank: QuestionBank | null = null;

function loadBank(): QuestionBank {
  if (!cachedBank) {
    const filePath = path.join(process.cwd(), 'src', 'data', 'labs', 'lab-questions.json');
    cachedBank = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as QuestionBank;
  }
  return cachedBank;
}

/**
 * Lesson completions for the signed-in learner, keyed by track slug.
 * Empty for a signed-out request, which then unlocks nothing.
 */
async function completionsFor(userId: string): Promise<Record<string, number[]>> {
  const rows = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { trackSlug: true, lessonId: true },
  });
  const byTrack: Record<string, number[]> = {};
  for (const r of rows) (byTrack[r.trackSlug] ??= []).push(r.lessonId);
  return byTrack;
}

export async function GET(request: NextRequest) {
  try {
    const bank = loadBank();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    // Labs are for signed-in learners. The proxy redirects the page, but the
    // API has to say no itself — a redirect on the page is a convenience for
    // humans, not a boundary, and this route is reachable directly.
    const session = await auth.auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json(
        { topics: [], error: 'Sign in to open the labs' },
        { status: 401 },
      );
    }

    const completed = await completionsFor(userId);

    let topics = bank.topics;
    if (topic) {
      topics = topics.filter((t) => t.slug === topic);
    }

    // The gate decides whether the questions travel at all. Sending them and
    // hiding them in the UI would put every solution one devtools tab away,
    // which is not a gate. A locked topic still reports its name and how much
    // is left, so the page can say why rather than showing an empty list.
    const result = topics.map((t) => {
      const gate = gateForTopic(t.slug, completed);
      if (!gate.unlocked) {
        return { ...t, questions: [], locked: true, gate };
      }
      return {
        ...t,
        locked: false,
        gate,
        questions: difficulty
          ? t.questions.filter((q) => q.difficulty === difficulty)
          : t.questions,
      };
    });

    return NextResponse.json({ topics: result });
  } catch {
    return NextResponse.json(
      { topics: [], error: 'Question bank not available' },
      { status: 500 }
    );
  }
}
