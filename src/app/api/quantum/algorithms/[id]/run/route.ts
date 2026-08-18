import { NextResponse, type NextRequest } from 'next/server';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';
import { requireSession } from '@/lib/api-auth';

interface RunBody {
  params?: Record<string, unknown>;
  shots?: number;
  backend?: string;
}

/**
 * Run one catalogue algorithm.
 *
 * Parameter validation lives in the executor (`catalog.coerce_params`) so the
 * schema has a single source of truth; a 400 from there carries a message
 * written for the learner and is passed through unchanged.
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/quantum/algorithms/[id]/run'>,
) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const { id } = await ctx.params;

  let body: RunBody;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const shots = Number(body.shots ?? 1024);
  if (!Number.isFinite(shots) || shots < 1 || shots > 100_000) {
    return NextResponse.json(
      { success: false, error: 'Shots must be between 1 and 100000.' },
      { status: 400 },
    );
  }

  try {
    const result = await quantumExecutor.runAlgorithm(
      id,
      body.params ?? {},
      shots,
      body.backend,
    );
    return NextResponse.json(result);
  } catch (error) {
    const { body: errorBody, status } = toErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
