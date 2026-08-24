# Security

## Threat model

The executor runs Python written by whoever is using the platform. That is the
product — a quantum lab where nothing runs is not a lab — so the question is
never "can we avoid running untrusted code" but "what does it reach when it
runs, and who gets to ask".

## Controls

### Authentication

`/execute`, `/repl` and `/algorithms/{id}/run` require an `X-Executor-Key`
header matching `EXECUTOR_API_KEY`, compared with `hmac.compare_digest`. The
Next.js app holds the same value server-side and attaches it in
`src/lib/quantum-client.ts`.

The service **fails closed**: with no key configured those endpoints return 503
rather than accepting requests. Local development opts out explicitly with
`ALLOW_UNAUTHENTICATED=true`, which logs a warning on every boot. Never set that
on a public hostname.

`CORS_ORIGINS` is *not* a control. It is a browser policy and stops nothing that
speaks curl. It is set so the browser behaves, not so attackers do.

Every route in the Next app that reaches the executor also requires a signed-in
session (`src/lib/api-auth.ts`). `src/proxy.ts` redirects unauthenticated humans
away from protected pages, but per the Next.js docs proxy may be hoisted to a
CDN, so it is a convenience layer — the route handlers are the boundary.

### Sandboxing

`quantum-executor/sandbox.py`, three layers:

1. **AST allowlist.** Imports must name an approved module. No attribute or name
   beginning with an underscore may be referenced — that single rule closes the
   published escape family, all of which route through a dunder. Class creation
   is refused in both spellings (`class X:` and three-argument `type()`).
2. **Restricted builtins.** `open`, `eval`, `exec`, `compile`, `__import__`,
   `getattr` and friends are absent from the namespace, not merely unmentioned.
3. **Wall-clock deadline.** A per-line trace hook raises inside the worker
   thread at `EXECUTION_TIMEOUT_SECONDS` (default 15), so `while True:`
   terminates rather than pinning the container.

`quantum-executor/test_sandbox.py` asserts 25 known escapes stay blocked and 8
legitimate programs stay allowed. It runs in CI. **Do not weaken the allowlists
without adding the corresponding case to that file.**

### Rate limiting

`EXECUTE_RATE_LIMIT` requests/minute per caller (default 30), keyed on the API
key where present and the first `X-Forwarded-For` hop otherwise, since both
Railway and Vercel front the container with a proxy.
`MAX_CONCURRENT_EXECUTIONS` (default 4) bounds simultaneous interpreters.

## What this does not cover

The sandbox is defence in depth for a teaching service, not containment. It
blocks the known escapes and the shape of the unknown ones, but a CPython
sandbox in-process is not a security boundary anyone should bet a production
secret on. Two consequences:

- **Do not put anything in the executor's environment you would mind losing.**
  `QPIAI_API_KEY` lives there. Scope it to what a learner is allowed to spend.
- **Executions serialize.** The handlers are `async def`, so a run holds the
  event loop for its duration. A 15-second run delays other requests to that
  container. This is an availability characteristic, not a compromise, and it is
  what keeps stdout capture correct — `sys.stdout` is process-global.

Untrusted multi-tenant use needs a disposable container per run with seccomp and
no egress. That is a project, not a patch, and it is the right next step if this
platform is ever opened to the public internet.

## Reporting

Open a private security advisory on the repository. Do not file a public issue.
