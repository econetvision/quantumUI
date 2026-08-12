FROM python:3.11-slim

WORKDIR /app

# curl is needed by the container healthcheck below.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Requirements first so the dependency layer caches across code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy every module, not just main.py. The service was split into
# qpiai_bridge / catalog / mock_circuit, and an image containing only main.py
# builds cleanly then dies on its first import at runtime.
COPY main.py qpiai_bridge.py catalog.py mock_circuit.py mcp_server.py ./

# Run as a non-root user. The service executes learner-submitted Python, so a
# container breakout should land somewhere unprivileged.
RUN useradd --create-home --uid 10001 executor && chown -R executor:executor /app
USER executor

# Railway, Render and Fly all inject $PORT. Default to 8080 for local docker run.
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

# Shell form so ${PORT} is expanded at runtime rather than baked in at build.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
