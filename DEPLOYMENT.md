# Deployment

## Blockers — must be done before going live

These are development defaults committed for local convenience. Shipping any of
them is a security incident, not a rough edge.

### 1. Replace the auth secret

`.env.local` holds a development `AUTH_SECRET`.
Anyone who knows it can mint valid session tokens for any account.

```bash
openssl rand -base64 48        # use the output as AUTH_SECRET
```

### 2. Replace the database credentials

The local database uses `quantumui:quantumui`. Create a production user with a
generated password and grant it only what the app needs:

```sql
CREATE USER quantumui WITH PASSWORD '<generated>';
GRANT CONNECT ON DATABASE quantumui TO quantumui;
GRANT USAGE ON SCHEMA public TO quantumui;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO quantumui;
-- deliberately no DROP/ALTER: migrations run separately, via DIRECT_URL
```

### 3. Rotate the seeded accounts

`npm run db:seed:users` creates `admin@quantumui.local / admin1234` and
`student@quantumui.local / student1234`. Delete or re-password both before the
site is reachable:

```sql
DELETE FROM "User" WHERE email LIKE '%@quantumui.local';  -- quoted: Postgres folds unquoted identifiers to lowercase
```

### 4. Point the executor's CORS at the real origin

`quantum-executor/main.py` defaults to `http://localhost:3000`. Set
`CORS_ORIGINS=https://your-domain` or the browser will block every circuit run.

---

## Environment

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL, **pooled** (`postgresql://…`) | yes |
| `DIRECT_URL` | PostgreSQL, unpooled — migrations only | yes |
| `AUTH_SECRET` | NextAuth session signing | yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin — SEO | yes |
| `QUANTUM_EXECUTOR_URL` | Executor base URL | yes |
| `CORS_ORIGINS` | Allowed origins, executor side | yes |
| `QWORLD_CONTENT_ROOT` | Override vendored content location | no |
| `AUTH_GOOGLE_ID` | Google OAuth client ID — enables Google sign-in | no |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | no |
| `QPIAI_API_KEY` | Unlocks cloud simulators and the Indus-1 QPU | no |

Without `QPIAI_API_KEY` the platform runs entirely on the local statevector
simulator. Everything works; only cloud/QPU targets are unavailable, and the UI
says so rather than failing.

`NEXT_PUBLIC_SITE_URL` must be the origin you want indexed (scheme included, no
trailing slash) and must be present **at build time**, not just at runtime:
`robots.txt`, `sitemap.xml`, every `<link rel="canonical">` and every Open Graph
URL are baked during `next build`. Unset, the app falls back to
`VERCEL_PROJECT_PRODUCTION_URL` and then to `localhost:3000` — a production
build that falls through to the last of those will publish a sitemap full of
localhost URLs and canonical tags pointing at a host nobody can reach.

Preview deployments (`VERCEL_ENV != production`) serve `Disallow: /` and a
`noindex` tag automatically, so a staging copy cannot compete with production
for its own search results.

## Order of operations

```bash
# 1. database
npx prisma db push
npm run db:seed             # tracks + labs from the vendored notebooks
npm run db:seed:users       # then immediately rotate these — see blocker 3

# 2. executor (must be running before the app serves traffic)
cd quantum-executor
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8080

# 3. app
npm ci
npm run build
npm start
```

Or `docker compose up -d` — the compose file now includes PostgreSQL with a
healthcheck, and the app waits for it.

## Health checks

| Endpoint | Healthy response |
| --- | --- |
| `GET /api/quantum/execute` | `{"status":"connected"}` |
| `GET /api/quantum/backends` | non-empty `backends` array |
| `GET :8080/health` | `{"status":"healthy","sdk_available":true}` |

The app degrades rather than crashes: with the executor down, lessons and tracks
still serve and the playground says the executor is offline instead of faking
results. With the database down, learning works anonymously and only accounts,
progress sync and the admin views are unavailable.

## Known limitations at launch

Be aware of these before promising them to users:

- **Auto-grading covers 16 of 127 questions.** The rest are self-check, because
  their reference solutions are Qiskit/Cirq or plain Python rather than QpiAI.
- **Four tracks have fewer than 10 lab questions** (`qiskit-sdk` 2, `cirq-sdk` 2,
  `error-correction` 8), and six tracks share two question topics between them.
- **No QpiAI-specific track**, despite the SDK being what executes everything.
- **Streaks and XP are localStorage-only** unless signed in; the sync route
  exists but the client does not call it yet.
- **`quantum-error-correction` has no concept diagrams** — its only source
  imagery is CC-BY-NC-ND, which conflicts with the paid tiers on `/upgrade`.
  See `public/images/ATTRIBUTION.md`.

## Rollback

The app is stateless apart from PostgreSQL. Redeploy the previous build and, if a
migration ran, restore from a dump taken immediately before:

```bash
pg_dump -U quantumui quantumui > backup-$(date +%F).sql
```

---

## Enabling Google sign-in

Optional. Without it the password form works exactly as before, and the
"Sign in with Google" button does not render at all — `src/lib/auth.ts`
registers the provider only when both variables below are present and
non-empty, and `GoogleSignInButton` asks `/api/auth/providers` before
drawing itself. Setting only one half leaves Google switched off rather
than half-configured.

### 1. Create the OAuth client

[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
→ **Create credentials → OAuth client ID → Web application**.

**Authorised redirect URIs** — every origin the app answers on. The
`/api/auth/callback/google` path is NextAuth's, not ours; it must match
character for character, and a trailing slash breaks it:

    https://www.sroobservotary.com/api/auth/callback/google
    https://sroobservotary.com/api/auth/callback/google
    https://quantumui-app.vercel.app/api/auth/callback/google
    http://localhost:3000/api/auth/callback/google

**Authorised JavaScript origins:**

    https://www.sroobservotary.com
    http://localhost:3000

A redirect URI that is missing here is the usual cause of
`Error 400: redirect_uri_mismatch` after the consent screen.

### 2. Add the credentials

Production:

    vercel env add AUTH_GOOGLE_ID production
    vercel env add AUTH_GOOGLE_SECRET production
    vercel deploy --prod        # env vars are read at build time

Local development — in `.env.local`, which is gitignored:

    AUTH_GOOGLE_ID="...apps.googleusercontent.com"
    AUTH_GOOGLE_SECRET="GOCSPX-..."

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are read as fallbacks, since
that is what the Google console labels them.

### 3. Publish the consent screen

A new consent screen starts in **Testing**, where only accounts listed
under *Test users* can sign in — everyone else gets `access_denied`.
Publish it before real learners arrive.

### What a Google sign-in does to the account

The `jwt` callback upserts by email, so signing in with Google using an
address that already has a password account **links to that same row**
rather than creating a second one: the same `User.id`, so progress, XP
and streaks carry over, and the password keeps working. A genuinely new
Google account is created with the schema default role, `FREE`.

### Verifying

    curl -s https://www.sroobservotary.com/api/auth/providers

`google` appears in that JSON once the variables are live. If it does
not, the deploy has not picked them up yet — the button follows this
endpoint, so there is nothing else to switch on.
