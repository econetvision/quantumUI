"""
Request guards for the executor: authentication, rate limiting, concurrency.

The service exposes arbitrary code execution. Before this module existed the
only thing in front of /execute was a length check, and CORS_ORIGINS — which is
a browser policy and stops nothing that speaks curl. Once Railway assigns the
service a public hostname, these guards are the whole perimeter.

Fail-closed by design: with no EXECUTOR_API_KEY configured the service refuses
execution requests rather than accepting them. Local development opts out
explicitly with ALLOW_UNAUTHENTICATED=true.
"""

from __future__ import annotations

import hmac
import logging
import os
import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import Header, HTTPException, Request, status

log = logging.getLogger("executor.guards")

API_KEY_HEADER = "X-Executor-Key"

_API_KEY = os.environ.get("EXECUTOR_API_KEY", "").strip()
_ALLOW_ANON = os.environ.get("ALLOW_UNAUTHENTICATED", "").lower() == "true"

# Per-minute cap on execution requests, per caller.
_RATE_LIMIT = int(os.environ.get("EXECUTE_RATE_LIMIT", "30"))
_RATE_WINDOW = 60.0

# Simultaneous interpreter runs. Each one holds a thread and can burn a core for
# its full timeout, so this is what stops a burst from wedging the container.
_MAX_CONCURRENT = int(os.environ.get("MAX_CONCURRENT_EXECUTIONS", "4"))
_slots = threading.BoundedSemaphore(_MAX_CONCURRENT)

_hits: Dict[str, Deque[float]] = defaultdict(deque)
_hits_lock = threading.Lock()


if not _API_KEY and not _ALLOW_ANON:
    log.warning(
        "EXECUTOR_API_KEY is not set — /execute, /repl and /algorithms/*/run "
        "will refuse every request. Set the key, or set ALLOW_UNAUTHENTICATED=true "
        "for local development only."
    )
elif _ALLOW_ANON:
    log.warning(
        "ALLOW_UNAUTHENTICATED=true — code execution is OPEN. Never use this "
        "on a public hostname."
    )


def _caller_id(request: Request, key: str | None) -> str:
    """
    Identity for rate limiting.

    Prefers the API key so one leaked key cannot be spread across a botnet to
    multiply its budget. Falls back to the client address, taking the first hop
    of X-Forwarded-For because Railway and Vercel both front the container with
    a proxy and request.client would otherwise be the proxy for everyone.
    """
    if key:
        return f"key:{key[:8]}"
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return f"ip:{forwarded.split(',')[0].strip()}"
    return f"ip:{request.client.host if request.client else 'unknown'}"


def _check_rate(caller: str) -> None:
    now = time.time()
    with _hits_lock:
        window = _hits[caller]
        while window and now - window[0] > _RATE_WINDOW:
            window.popleft()
        if len(window) >= _RATE_LIMIT:
            retry = int(_RATE_WINDOW - (now - window[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({_RATE_LIMIT}/min). Retry in {retry}s.",
                headers={"Retry-After": str(retry)},
            )
        window.append(now)
        # Bound the bookkeeping itself so a spray of unique IPs cannot grow it
        # without limit.
        if len(_hits) > 10_000:
            for stale in [k for k, v in _hits.items() if not v][:5_000]:
                del _hits[stale]


async def require_execution_auth(
    request: Request,
    x_executor_key: str | None = Header(default=None, alias=API_KEY_HEADER),
) -> str:
    """
    FastAPI dependency for every endpoint that runs code.

    Returns the caller id so handlers can log it.
    """
    if not _ALLOW_ANON:
        if not _API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Executor is not configured for authenticated use.",
            )
        # compare_digest keeps the comparison time-independent of how many
        # leading characters matched.
        if not x_executor_key or not hmac.compare_digest(x_executor_key, _API_KEY):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid executor key.",
            )

    caller = _caller_id(request, x_executor_key)
    _check_rate(caller)
    return caller


class execution_slot:
    """Context manager bounding how many interpreters run at once."""

    def __enter__(self) -> "execution_slot":
        if not _slots.acquire(timeout=10):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Executor is busy. Try again in a moment.",
            )
        return self

    def __exit__(self, *exc_info: object) -> None:
        _slots.release()


def public_config() -> Dict[str, object]:
    """Non-secret guard state, surfaced on /health for deployment checks."""
    return {
        "auth_required": not _ALLOW_ANON,
        "auth_configured": bool(_API_KEY),
        "rate_limit_per_min": _RATE_LIMIT,
        "max_concurrent_executions": _MAX_CONCURRENT,
    }
