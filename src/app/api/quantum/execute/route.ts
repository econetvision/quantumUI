import { NextResponse, type NextRequest } from 'next/server';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';

export type {
  ExecutionResult,
  BlochVector,
  Amplitude,
} from '@/lib/quantum-client';

interface ExecuteBody {
  code?: string;
  shots?: number;
  backend?: string;
}

/**
 * Execute learner-written quantum code.
 *
 * This proxies straight to the Python executor, which owns sandboxing, backend
 * resolution and result extraction. It deliberately does *not* fall back to a
 * JavaScript approximation when the executor is down: a fake histogram that
 * looks real is worse than an honest "the executor isn't running" message on a
 * platform where the output is the lesson.
 */
export async function POST(request: NextRequest) {
  let body: ExecuteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed request body.', output: '' },
      { status: 400 },
    );
  }

  if (!body.code?.trim()) {
    return NextResponse.json(
      { success: false, error: 'No code provided', output: '' },
      { status: 400 },
    );
  }

  const shots = Number(body.shots ?? 1024);
  if (!Number.isFinite(shots) || shots < 1 || shots > 100_000) {
    return NextResponse.json(
      { success: false, error: 'Shots must be between 1 and 100000.', output: '' },
      { status: 400 },
    );
  }

  try {
    const result = await quantumExecutor.execute(body.code, shots, body.backend);
    return NextResponse.json(result);
  } catch (error) {
    const { body: errorBody, status } = toErrorResponse(error);
    return NextResponse.json({ ...errorBody, output: '' }, { status });
  }
}

/** Health probe used by the playground to show executor status. */
export async function GET() {
  try {
    const health = await quantumExecutor.health();
    return NextResponse.json({ status: 'connected', executor: health });
  } catch (error) {
    const { body } = toErrorResponse(error);
    return NextResponse.json({ status: 'offline', message: body.error });
  }
}
