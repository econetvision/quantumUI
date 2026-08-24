# QuantumUI — PostgreSQL Setup

`prisma/schema.prisma` declares `provider = "postgresql"`. MySQL will not work:
the schema relies on real foreign keys, which is why account-wide progress lives
on `User` rather than on a `UserProgress` row pointing at a track that does not
exist.

Pick one of the three options below, then run **Initialize** at the bottom.

---

## Option 1 — Docker (recommended)

The repo ships a `db` service, so nothing needs installing:

```bash
docker compose up -d db
```

That is all the configuration required — the credentials below already match
the compose service.

```bash
# .env.local
DATABASE_URL="postgresql://quantumui:quantumui@localhost:5432/quantumui?schema=public"
DIRECT_URL="postgresql://quantumui:quantumui@localhost:5432/quantumui?schema=public"
```

Useful afterwards:

```bash
docker compose stop db      # stop, keep data
docker compose down -v      # remove, DELETES data
docker compose exec db psql -U quantumui quantumui   # psql shell
```

---

## Option 2 — Local install

```bash
brew install postgresql@16
brew services start postgresql@16
createdb quantumui
```

```bash
# .env.local
DATABASE_URL="postgresql://$(whoami)@localhost:5432/quantumui?schema=public"
DIRECT_URL="postgresql://$(whoami)@localhost:5432/quantumui?schema=public"
```

Homebrew's Postgres trusts your local user by default, so no password is needed.
To create a dedicated user instead:

```sql
CREATE USER quantumui WITH PASSWORD 'quantumui';
CREATE DATABASE quantumui OWNER quantumui;
```

---

## Option 3 — Neon (free cloud tier)

Create a project at [neon.tech](https://neon.tech) and copy **two** connection
strings — this is not optional:

| Variable | Endpoint | Used for |
| --- | --- | --- |
| `DATABASE_URL` | **pooled** — hostname contains `-pooler` | every runtime query |
| `DIRECT_URL` | **unpooled** — no `-pooler` | migrations only |

Serverless functions open a connection per invocation and exhaust a plain
endpoint under load, while schema migrations cannot run through a transaction
pooler at all. Both need `?sslmode=require`.

---

## Initialize (all options)

Secrets go in `.env.local`, which is gitignored — never `.env`.

```bash
cp .env.example .env.local   # then fill in DATABASE_URL / DIRECT_URL
npm run setup                # verifies the environment
npm run db:generate          # Prisma client
npm run db:push              # create tables
npm run db:seed              # tracks, labs, achievements from the notebooks
npm run dev
```

The `db:*` scripts are wrapped in `dotenv-cli` because the Prisma CLI reads
`.env` only and would not otherwise see `.env.local`.

Browse the result with `npm run db:studio` (http://localhost:5555) — you should
see `User`, `Track`, `Lab`, `Question` and friends.

---

## Troubleshooting

**`P1001: Can't reach database server`** — the server is not running, or
`DATABASE_URL` points elsewhere.

```bash
docker compose ps db                 # Docker
brew services list | grep postgres   # local install
psql "$DATABASE_URL" -c 'SELECT 1'   # test the exact URL Prisma uses
```

**`role "…" does not exist`** or **`database "quantumui" does not exist`** — the
user or database was never created. See Option 2, or use Docker where both are
created for you.

**`Environment variable not found: DATABASE_URL`** — it is in `.env.local` but
you ran `npx prisma` directly. Use `npm run db:push` (etc.), which loads that
file, or prefix manually:

```bash
npx dotenv -e .env.local -- npx prisma db push
```

**Port 5432 already in use** — something else is on the port:

```bash
lsof -i :5432
# either stop it, or map the container elsewhere and use 5433 in DATABASE_URL
```

**SSL errors against Neon** — append `?sslmode=require` to both URLs.
