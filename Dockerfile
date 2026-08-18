# syntax=docker/dockerfile:1

# QuantumUI frontend. Structurally the twin of erp_project_amm/frontend/Dockerfile
# (multi-stage node build, non-root runtime, build metadata via ARG) but the
# second stage is Node, not nginx: that app is a CRA SPA that compiles to static
# files, whereas this one has 13 server-side routes under src/app/api and needs
# a live Node runtime to serve them.

# ─── Stage 1: dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Prisma's engine binaries are glibc-linked; libc6-compat is the alpine shim.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_VERSION=1.0.0
ARG BUILD_SHA=dev
ARG BUILD_TIME=unknown
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION
ENV NEXT_PUBLIC_BUILD_SHA=$BUILD_SHA
ENV NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time only. Prisma needs a parseable URL to generate against and the auth
# module needs a secret to import; nothing connects during `next build`. The
# real values arrive as runtime env vars. Same trick ci.yml already uses.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV AUTH_SECRET="build-only-secret-not-used-at-runtime"

RUN npx prisma generate && npm run build

# ─── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root, matching the executor image's uid convention.
RUN addgroup -g 10001 -S nodejs && adduser -u 10001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public
# `output: "standalone"` emits a self-contained server.js plus only the traced
# node_modules, which is why this image does not carry the full dependency tree.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Next's tracing does not reliably pick up Prisma's query-engine binary, and a
# missing engine builds clean then fails on the first database query at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/" || exit 1

# server.js reads $PORT, so the same image runs on Railway/Render/Fly unchanged.
CMD ["node", "server.js"]
