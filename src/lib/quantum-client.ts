/**
 * Typed client for the Python quantum executor service.
 *
 * Every route handler that talks to the executor goes through here so the URL,
 * timeouts and failure handling are defined once. Types mirror the executor's
 * wire format (see `quantum-executor/main.py`).
 */

export const EXECUTOR_URL =
  process.env.QUANTUM_EXECUTOR_URL || 'http://localhost:8080';

/**
 * Shared secret proving a request came from this app rather than from anyone
 * who found the executor's public hostname. The executor refuses /execute,
 * /repl and /algorithms/*\/run without it. Server-side only — it must never be
 * prefixed NEXT_PUBLIC_, or it ships to the browser and stops being a secret.
 */
const EXECUTOR_KEY = process.env.EXECUTOR_API_KEY ?? '';

/** How long to wait on the executor before giving up, per endpoint class. */
const TIMEOUTS = {
  fast: 8_000, // health, backends, catalogue listing
  run: 60_000, // circuit execution and algorithm runs
} as const;

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/** Complex amplitude as returned by the executor. */
export interface Amplitude {
  re: number;
  im: number;
}

/**
 * Per-qubit Bloch coordinates derived from the reduced density matrix.
 * `length` is |r|: 1 for a pure state on the sphere surface, 0 at the centre
 * for a maximally mixed (maximally entangled) qubit.
 */
export interface BlochVector {
  qubit: number;
  x: number;
  y: number;
  z: number;
  length: number;
}

export interface CircuitMetadata {
  depth?: number;
  size?: number;
  num_qubits?: number;
  num_clbits?: number;
  qasm?: string;
}

export type ExecutionMode = 'live' | 'local-sdk' | 'mock';

export interface ExecutionResult {
  success: boolean;
  output: string;
  counts?: Record<string, number> | null;
  probabilities?: Record<string, number> | null;
  statevector?: Amplitude[] | null;
  bloch_vectors?: BlochVector[] | null;
  circuit_diagram?: string | null;
  circuit?: CircuitMetadata | null;
  backend?: string | null;
  mode?: ExecutionMode | null;
  /** Set when the requested backend was unavailable and we downgraded. */
  notice?: string | null;
  error?: string | null;
  execution_time_ms?: number | null;
}

export interface Backend {
  id: string;
  label: string;
  kind: 'simulator' | 'qpu';
  requires_auth: boolean;
  max_qubits: number;
  supports_statevector: boolean;
  supports_density_matrix: boolean;
  description: string;
  available: boolean;
}

export interface AlgorithmParam {
  name: string;
  label: string;
  type: 'int' | 'bool' | 'choice' | 'bitstring';
  default: string | number | boolean;
  min?: number;
  max?: number;
  choices?: (string | number)[];
  help?: string;
}

export interface Algorithm {
  id: string;
  name: string;
  category: string;
  summary: string;
  detail: string;
  params: AlgorithmParam[];
}

export interface AlgorithmResult extends ExecutionResult {
  algorithm: Pick<Algorithm, 'id' | 'name' | 'category' | 'summary' | 'detail'>;
  params: Record<string, unknown>;
  info?: Record<string, unknown> | null;
  /** Algorithm-specific takeaway: factors found, string recovered, etc. */
  insight?: Record<string, unknown> | null;
}

export interface ExecutorHealth {
  status: string;
  sdk_available: boolean;
  sdk_version: string | null;
  mode: ExecutionMode;
  cloud_authenticated: boolean;
  algorithm_count: number;
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

/** Raised when the executor is unreachable or returns a non-2xx response. */
export class ExecutorError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly offline = false,
  ) {
    super(message);
    this.name = 'ExecutorError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const { timeout = TIMEOUTS.fast, ...rest } = init;

  let response: Response;
  try {
    response = await fetch(`${EXECUTOR_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(EXECUTOR_KEY ? { 'X-Executor-Key': EXECUTOR_KEY } : {}),
        ...rest.headers,
      },
      signal: AbortSignal.timeout(timeout),
    });
  } catch (error) {
    // Connection refused / DNS failure / timeout — the service isn't there.
    // These strings reach the browser, so they describe what the reader can
    // observe. How to restart the executor is an operator's concern and goes
    // to the server log, never to a learner who cannot act on it.
    console.error(
      `[quantum-client] executor unreachable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    const reason = error instanceof Error && error.name === 'TimeoutError'
      ? `Circuit execution timed out after ${timeout / 1000}s.`
      : 'Circuit execution is temporarily unavailable.';
    throw new ExecutorError(reason, 503, true);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 503) {
      // A misconfigured EXECUTOR_API_KEY is an operator problem, not a learner
      // one — do not echo the executor's wording to the browser.
      console.error(
        `[quantum-client] executor rejected the request (${response.status}): ${body.detail ?? ''}`,
      );
      throw new ExecutorError(
        'Circuit execution is temporarily unavailable.',
        502,
      );
    }
    throw new ExecutorError(
      body.detail || `Executor returned ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const quantumExecutor = {
  health: () => request<ExecutorHealth>('/health'),

  backends: () =>
    request<{ backends: Backend[]; default: string; cloud_authenticated: boolean }>(
      '/backends',
    ),

  algorithms: () =>
    request<{ algorithms: Algorithm[]; categories: string[]; sdk_available: boolean }>(
      '/algorithms',
    ),

  runAlgorithm: (
    id: string,
    params: Record<string, unknown>,
    shots = 1024,
    backend?: string,
  ) =>
    request<AlgorithmResult>(`/algorithms/${encodeURIComponent(id)}/run`, {
      method: 'POST',
      body: JSON.stringify({ params, shots, backend }),
      timeout: TIMEOUTS.run,
    }),

  execute: (code: string, shots = 1024, backend?: string) =>
    request<ExecutionResult>('/execute', {
      method: 'POST',
      body: JSON.stringify({ code, shots, backend }),
      timeout: TIMEOUTS.run,
    }),

  repl: (sessionId: string, code: string, reset = false, backend?: string) =>
    request<{
      success: boolean;
      output: string;
      error?: string | null;
      execution_time_ms?: number | null;
    }>('/repl', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, code, reset, backend }),
      timeout: TIMEOUTS.run,
    }),

  examples: () =>
    request<{ examples: { name: string; description: string; code: string }[] }>(
      '/examples',
    ),
};

/**
 * Turn an unknown error into a JSON body + status for a route handler.
 * Keeps the "executor is offline" case a clear 503 rather than an opaque 500.
 *
 * The message is passed through untouched. It previously had a shell command
 * ("cd quantum-executor && ./run.sh") appended to the offline case, which was
 * written for someone running the stack locally and read as nonsense to a
 * visitor on the deployed site — who has no shell to run it in. The `offline`
 * flag is what callers should branch on; restart instructions belong in the
 * runbook, not in a learner's browser.
 */
export function toErrorResponse(error: unknown): {
  body: { success: false; error: string; offline: boolean };
  status: number;
} {
  if (error instanceof ExecutorError) {
    return {
      body: {
        success: false,
        error: error.message,
        offline: error.offline,
      },
      status: error.status,
    };
  }

  return {
    body: {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
      offline: false,
    },
    status: 500,
  };
}
