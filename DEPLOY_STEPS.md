# Deploy: Neon + Railway + Vercel

Three services, deployed in this order because each one's URL feeds the next.

```
Vercel  ──HTTPS──▶  Railway            Vercel ──▶ Neon
(Next.js app)       (Python executor)  (Postgres)
```

**Vercel cannot run Docker.** It hosts Next.js only — serverless functions plus
static assets. The Next app is both frontend and backend (its `/api/*` routes),
so Vercel covers both, but the FastAPI executor is a container and has to live
somewhere that runs containers. Railway, Fly and Render all work; `railway.json`
and `quantum-executor/Dockerfile` are set up for Railway.

---

## 1. Neon — database

Create a project at [neon.tech](https://neon.tech), then copy **two** connection
strings from the dashboard:

| Variable | Which endpoint | Used for |
| --- | --- | --- |
| `DATABASE_URL` | **pooled** — hostname contains `-pooler` | every runtime query |
| `DIRECT_URL` | **unpooled** — no `-pooler` | migrations only |

Both need `?sslmode=require`.

Two URLs are not optional here. Serverless functions open a connection per
invocation and will exhaust a plain endpoint under load, while schema migrations
cannot run through a transaction pooler at all. `prisma/schema.prisma` declares
both.

Then, from a checkout with those values in `.env`:

```bash
npx prisma db push        # creates the tables
npm run db:seed           # tracks, labs, achievements from the vendored notebooks
SEED_ADMIN_PASSWORD='<strong>' SEED_STUDENT_PASSWORD='<strong>' npm run db:seed:users
```

Set those two variables — without them the seed falls back to `admin1234`.

---

## 2. Railway — quantum executor

```bash
railway login
railway init                 # or: link an existing project
railway up                   # builds quantum-executor/Dockerfile per railway.json
```

Then set:

| Variable | Value |
| --- | --- |
| `CORS_ORIGINS` | your Vercel URL, e.g. `https://quantumui.vercel.app` |
| `QPIAI_API_KEY` | optional — unlocks cloud simulators and the Indus-1 QPU |

Railway injects `$PORT`; the Dockerfile honours it. Confirm with:

```bash
curl https://<your-railway-domain>/health
# {"status":"healthy","sdk_available":true,...}
```

Note the domain — Vercel needs it next.

---

## 3. Vercel — the app

```bash
vercel link
vercel env add DATABASE_URL production          # Neon pooled
vercel env add DIRECT_URL production            # Neon unpooled
vercel env add AUTH_SECRET production           # openssl rand -base64 48
vercel env add QUANTUM_EXECUTOR_URL production  # https://<railway-domain>
vercel --prod
```

`vercel.json` already handles the rest: `prisma generate` before build (Vercel's
cache can otherwise skip it), a 60s limit on the circuit-execution routes, and
security headers.

Finally, go back and set Railway's `CORS_ORIGINS` to the real Vercel domain.
Without it the browser blocks every circuit run.

---

## Verify

| Check | Expected |
| --- | --- |
| `https://<app>/` | 200 |
| `https://<app>/api/quantum/execute` | `{"status":"connected"}` |
| `https://<app>/api/quantum/backends` | non-empty list |
| Sign in | session cookie set, header shows Sign out |
| `/playground` → Run | real counts and Bloch vectors |

If the playground reports the executor is offline, it is almost always
`CORS_ORIGINS` not matching the Vercel domain exactly — scheme included.

---

## Before you announce it

- [ ] `AUTH_SECRET` replaced — the committed default is a known placeholder
- [ ] Seed passwords set via `SEED_ADMIN_PASSWORD` / `SEED_STUDENT_PASSWORD`
- [ ] Old leaked token `ghp_NeFrB4…` revoked at github.com/settings/tokens
- [ ] Repo visibility is what you intend — it is currently **public**
- [ ] `CORS_ORIGINS` set to the production domain

## Costs

Neon and Railway both have free tiers that suit a pilot. Railway sleeps idle
containers on the free plan, so the first circuit run after a quiet period takes
a few seconds to wake — worth knowing before a demo.
