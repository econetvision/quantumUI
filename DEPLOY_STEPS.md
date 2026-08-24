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

Then, from a checkout with those values in `.env.local` (secrets never go in
`.env`, which is for non-secret defaults):

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
railway domain               # generates the public hostname
```

Generate the shared secret ONCE and keep it — both platforms need the same value:

```bash
EXECUTOR_KEY=$(openssl rand -hex 32)
echo "$EXECUTOR_KEY"         # you will paste this into Vercel in step 3
```

Then set:

| Variable | Value |
| --- | --- |
| `EXECUTOR_API_KEY` | **required** — the value above. Without it the executor returns 503 on every execution request, by design. |
| `CORS_ORIGINS` | your Vercel URL, e.g. `https://quantumui.vercel.app` |
| `QPIAI_API_KEY` | optional — unlocks cloud simulators and the Indus-1 QPU |

```bash
railway variables --service quantum-executor \
  --set "EXECUTOR_API_KEY=$EXECUTOR_KEY" \
  --set "CORS_ORIGINS=https://<your-vercel-domain>"
```

`CORS_ORIGINS` is a browser policy, not a control — `EXECUTOR_API_KEY` is what
actually keeps the internet out of your interpreter. See SECURITY.md.

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
vercel env add EXECUTOR_API_KEY production      # the SAME value set on Railway
vercel env add AUTH_GOOGLE_ID production        # optional — Google sign-in
vercel env add AUTH_GOOGLE_SECRET production    # optional — Google sign-in
vercel --prod
```

The Google credentials go **here**, not on Railway: NextAuth reads them inside
the Next.js app, and Railway only runs the executor. Railway's variables stay
`CORS_ORIGINS`, `QPIAI_API_KEY` and `EXECUTOR_API_KEY`.

Once the production domain exists, add its callback to the same Google OAuth
client (Console → Credentials → your client → Authorised redirect URIs):

```
https://<your-vercel-domain>/api/auth/callback/google
```

The localhost URI can stay alongside it — one client may hold several. A missing
production URI is the usual cause of `redirect_uri_mismatch` on first deploy.
Leave both variables unset to ship without Google sign-in; the password form is
unaffected.

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
| `curl -X POST https://<railway-domain>/execute -d '{"code":"print(1)"}'` | **401** — if this returns 200, the key is not set |
| `curl https://<railway-domain>/health` | `"auth_required": true, "auth_configured": true` |
| `https://<app>/api/quantum/backends` | non-empty list |
| Sign in | session cookie set, header shows Sign out |
| `/playground` → Run | real counts and Bloch vectors |

If the playground reports the executor is offline, it is almost always
`CORS_ORIGINS` not matching the Vercel domain exactly — scheme included.

---

## Before you announce it

- [ ] `EXECUTOR_API_KEY` set on BOTH Railway and Vercel, same value
- [ ] `POST /execute` with no key returns 401 (verify from outside your network)
- [ ] `AUTH_SECRET` replaced — the committed default is a known placeholder
- [ ] Seed passwords set via `SEED_ADMIN_PASSWORD` / `SEED_STUDENT_PASSWORD`
- [ ] Old leaked token `ghp_NeFrB4…` revoked at github.com/settings/tokens
- [ ] Repo visibility is what you intend — it is currently **private**
- [ ] `CORS_ORIGINS` set to the production domain

## Costs

Neon and Railway both have free tiers that suit a pilot. Railway sleeps idle
containers on the free plan, so the first circuit run after a quiet period takes
a few seconds to wake — worth knowing before a demo.
