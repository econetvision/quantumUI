import { NextResponse } from 'next/server';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';

/**
 * Execution backends and whether each is usable right now.
 *
 * When the executor is offline we still answer 200 with the local simulator
 * marked unavailable — the backend picker needs something to render, and the
 * `offline` flag tells the UI to explain why nothing is selectable.
 */
export async function GET() {
  try {
    return NextResponse.json(await quantumExecutor.backends());
  } catch (error) {
    const { body, status } = toErrorResponse(error);

    if (status === 503) {
      return NextResponse.json({
        backends: [],
        default: null,
        cloud_authenticated: false,
        offline: true,
        error: body.error,
      });
    }

    return NextResponse.json(body, { status });
  }
}
