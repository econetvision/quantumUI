import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withDatabase } from '@/lib/db';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';
import { getQuestionById, gradingMode } from '@/lib/lab-questions';
import { requireSession } from '@/lib/api-auth';

/**
 * Grade a lab answer.
 *
 * Comparing source code would be hopeless — there are many correct ways to
 * build the same circuit. Instead both the learner's code and the reference
 * solution are executed and their measurement distributions compared. That
 * rewards any circuit that produces the right physics, which is the thing
 * actually being taught.
 *
 * Shot noise means the two runs will never match exactly, so agreement is
 * judged by total variation distance against a tolerance rather than equality.
 */

const CheckSchema = z.object({
  questionId: z.string().min(1).max(120),
  code: z.string().min(1).max(10_000),
  shots: z.number().int().min(256).max(20_000).optional(),
});

/**
 * Total variation distance between two outcome distributions: half the sum of
 * absolute differences in probability. 0 = identical, 1 = disjoint.
 */
function totalVariationDistance(
  a: Record<string, number>,
  b: Record<string, number>,
): number {
  const sumA = Object.values(a).reduce((s, v) => s + v, 0) || 1;
  const sumB = Object.values(b).reduce((s, v) => s + v, 0) || 1;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  let distance = 0;
  for (const key of keys) {
    distance += Math.abs((a[key] ?? 0) / sumA - (b[key] ?? 0) / sumB);
  }
  return distance / 2;
}

/**
 * Tolerance for sampling noise.
 *
 * The statistical error on each outcome scales as 1/√shots; summing over
 * outcomes gives roughly √(k/shots). This allows a generous multiple of that,
 * with a floor so tiny distributions are not judged too harshly.
 */
function noiseTolerance(shots: number, outcomes: number): number {
  return Math.max(0.08, 2.5 * Math.sqrt(Math.max(outcomes, 2) / shots));
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  // Grading runs the submission through the executor, so this needs a session
  // even though the grade itself is not personalised. Previously the session
  // was only read further down, to decide whether to record an attempt, which
  // left the execution path open to anyone.
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const parsed = CheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid submission.' },
      { status: 400 },
    );
  }

  const { questionId, code } = parsed.data;
  const shots = parsed.data.shots ?? 1024;

  const question = getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: `Unknown question: ${questionId}` }, { status: 404 });
  }

  const mode = gradingMode(question);

  try {
    // Run the learner's code first; a syntax error should be reported as a
    // failed attempt with the real message, not as a grading error.
    const attempt = await quantumExecutor.execute(code, shots);

    if (!attempt.success) {
      return NextResponse.json({
        passed: false,
        reason: 'error',
        message: 'Your code did not run.',
        error: attempt.error,
        output: attempt.output,
      });
    }

    // Not every question can be graded by comparing distributions. When the
    // reference is a teaching snippet rather than a runnable circuit, the most
    // useful thing we can honestly say is "your code ran" — plus the reference
    // to compare against. Claiming a pass/fail here would be guesswork.
    if (mode !== 'distribution') {
      return NextResponse.json({
        passed: null,
        mode,
        message:
          mode === 'execution'
            ? 'Your code ran. This question has no runnable reference circuit, so compare your output with the expected behaviour described in the task.'
            : 'Your code ran. This question is self-assessed — check your result against the reference solution.',
        output: attempt.output,
        counts: attempt.counts ?? null,
        referenceSolution: question.solution ?? null,
      });
    }

    if (!attempt.counts || Object.keys(attempt.counts).length === 0) {
      return NextResponse.json({
        passed: false,
        mode,
        reason: 'no-measurement',
        message:
          'The circuit ran but produced no measurement counts. Add a measure() call and assign the run to `job_result`.',
        output: attempt.output,
      });
    }

    const reference = await quantumExecutor.execute(question.solution!, shots);
    if (!reference.success || !reference.counts) {
      return NextResponse.json(
        {
          error: 'The reference solution failed to run, so this cannot be graded right now.',
          code: 'REFERENCE_FAILED',
        },
        { status: 500 },
      );
    }

    const distance = totalVariationDistance(attempt.counts, reference.counts);
    const outcomes = new Set([
      ...Object.keys(attempt.counts),
      ...Object.keys(reference.counts),
    ]).size;
    const tolerance = noiseTolerance(shots, outcomes);
    const passed = distance <= tolerance;

    // Score maps distance onto 0-100, saturating at twice the tolerance.
    const score = Math.max(0, Math.round(100 * (1 - distance / (2 * tolerance))));

    const xpByDifficulty: Record<string, number> = { easy: 10, medium: 20, complex: 40 };
    const xpEarned = passed ? (xpByDifficulty[question.difficulty] ?? 10) : 0;

    // Record the attempt for signed-in learners. Anonymous ones still get
    // graded — they simply have no history.
    const userId = gate.user.id;

    let recorded = false;
    if (userId) {
      const result = await withDatabase(async (db) => {
        await db.labAttempt.create({
          data: {
            userId,
            labId: question.labId ?? 0,
            submittedCode: code,
            output: attempt.output?.slice(0, 60_000) ?? null,
            status: passed ? 'PASSED' : 'FAILED',
            passed,
            score,
            xpEarned,
          },
        });
        return true;
      }, false);
      recorded = result.persisted;
    }

    return NextResponse.json({
      passed,
      score,
      xpEarned,
      recorded,
      distance: Number(distance.toFixed(4)),
      tolerance: Number(tolerance.toFixed(4)),
      yourCounts: attempt.counts,
      expectedCounts: reference.counts,
      output: attempt.output,
      message: passed
        ? 'Correct — your circuit produces the expected distribution.'
        : `Not quite. Your outcome distribution differs from the expected one by ${(distance * 100).toFixed(1)}% (tolerance ${(tolerance * 100).toFixed(1)}%).`,
    });
  } catch (error) {
    const { body: errorBody, status } = toErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
