import { NextResponse } from 'next/server';
import { quantumExecutor, toErrorResponse } from '@/lib/quantum-client';

/**
 * The QpiAI SDK algorithm catalogue, including each entry's parameter schema
 * so the gallery can render its form without hardcoding algorithm knowledge.
 */
export async function GET() {
  try {
    return NextResponse.json(await quantumExecutor.algorithms());
  } catch (error) {
    const { body, status } = toErrorResponse(error);

    if (status === 503) {
      return NextResponse.json({
        algorithms: [],
        categories: [],
        sdk_available: false,
        offline: true,
        error: body.error,
      });
    }

    return NextResponse.json(body, { status });
  }
}
