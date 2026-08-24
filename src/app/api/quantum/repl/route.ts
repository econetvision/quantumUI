import { NextResponse, type NextRequest } from 'next/server';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';
import { requireSession } from '@/lib/api-auth';

interface ReplBody {
  sessionId?: string;
  code?: string;
  reset?: boolean;
  backend?: string;
}

/** Stateful REPL for the Lab Shell — variables persist per `sessionId`. */
export async function POST(request: NextRequest) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  let body: ReplBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed request body.', output: '' },
      { status: 400 },
    );
  }

  if (!body.sessionId) {
    return NextResponse.json(
      { success: false, error: 'No sessionId provided', output: '' },
      { status: 400 },
    );
  }

  try {
    const result = await quantumExecutor.repl(
      body.sessionId,
      body.code ?? '',
      body.reset ?? false,
      body.backend,
    );
    return NextResponse.json(result);
  } catch (error) {
    const { body: errorBody, status } = toErrorResponse(error);
    return NextResponse.json({ ...errorBody, output: '' }, { status });
  }
}
