import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(request: NextRequest) {
  try {
    const bank = loadBank();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    let topics = bank.topics;
    if (topic) {
      topics = topics.filter((t) => t.slug === topic);
    }

    const result = topics.map((t) => ({
      ...t,
      questions: difficulty
        ? t.questions.filter((q) => q.difficulty === difficulty)
        : t.questions,
    }));

    return NextResponse.json({ topics: result });
  } catch {
    return NextResponse.json(
      { topics: [], error: 'Question bank not available' },
      { status: 500 }
    );
  }
}
