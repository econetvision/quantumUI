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
| `QUANTUM_EXECUTOR_URL` | Executor base URL | yes |
| `CORS_ORIGINS` | Allowed origins, executor side | yes |
| `QWORLD_CONTENT_ROOT` | Override vendored content location | no |
| `AUTH_GOOGLE_ID` | Google OAuth client ID — enables Google sign-in | no |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | no |
| `QPIAI_API_KEY` | Unlocks cloud simulators and the Indus-1 QPU | no |

Without `QPIAI_API_KEY` the platform runs entirely on the local statevector
simulator. Everything works; only cloud/QPU targets are unavailable, and the UI
says so rather than failing.

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
