# QuantumUI Architecture

## Repository layout

Everything the app needs now lives inside this directory — there are no
references to sibling folders or absolute paths.

```
quantumui-app/
├── content/qworld/          # Vendored QWorld course material (see SOURCES.md)
│   ├── qbook101/            #   notebooks + images, .git detached
│   ├── silver-qcourse511/
│   ├── qkd/  qec/  tqc/
│   ├── adequate-qbook1/
│   └── qnickel-qcourse511-2/
├── quantum-executor/        # Python FastAPI service wrapping the QpiAI SDK
│   ├── main.py              #   routes, sandboxing, request validation
│   ├── qpiai_bridge.py      #   SDK access, backends, result extraction, Bloch math
│   ├── catalog.py           #   algorithm catalogue + parameter schemas
│   └── mock_circuit.py      #   demo fallback when the SDK isn't installed
├── prisma/                  # Schema + seeding from vendored notebooks
├── scripts/                 # Content extraction tooling
└── src/
    ├── app/                 # Routes (App Router)
    ├── components/
    │   ├── layout/          #   SiteHeader (with mobile drawer), SiteFooter
    │   ├── theme/           #   ThemeProvider, toggle, pre-paint script
    │   ├── quantum/         #   Histogram, Bloch readout, backend picker, gallery
    │   └── ui/              #   Container, Card, Badge, PageHeader, …
    ├── data/                # Lesson JSON + extracted lab questions
    └── lib/                 # content-paths, quantum-client, loaders
```

### Content root

`src/lib/content-paths.ts` resolves the QWorld content directory. Override it
with `QWORLD_CONTENT_ROOT` when the material is mounted elsewhere (Docker
volume, CI cache). Nothing hardcodes a developer's home directory any more.

Regenerate derived data after changing content:

```bash
npm run content:labs      # -> src/data/labs/lab-questions.json
npm run content:images -- quantum-fundamentals
npm run db:seed
```

## The quantum stack

```
browser  ──►  /api/quantum/*  ──►  quantum-executor (FastAPI)  ──►  qpiai-quantum
             (Next route)          localhost:8080                   SDK
```

`src/lib/quantum-client.ts` is the single typed client for the executor —
route handlers never call it directly with bare `fetch`.

### Executor endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | SDK availability, version, execution mode |
| `GET /backends` | The five backends and whether each is usable now |
| `GET /algorithms` | Catalogue with per-algorithm parameter schemas |
| `POST /algorithms/{id}/run` | Run one catalogue algorithm |
| `POST /execute` | Run learner-written circuit code |
| `POST /repl` | Stateful REPL for the Lab Shell |
| `POST /auth/verify` | Validate a QpiAI API key (never persisted) |
| `GET /examples` | Starter circuits |

### Execution modes

- **`live`** — a QpiAI API key is present; cloud simulators and the Indus-1 QPU
  are reachable.
- **`local-sdk`** — the SDK is installed but unauthenticated. Everything runs on
  `QpiAI-QSV-Local`, in-process, no network. This is the default.
- **`mock`** — the SDK isn't installed. Results come from `mock_circuit.py` and
  are always labelled as simulated.

Requests for a cloud backend without a key are **downgraded, not failed** — the
response carries a `notice` explaining the substitution so the UI can say where
the circuit actually ran.

To enable cloud/QPU execution, set `QPIAI_API_KEY` or drop a `qcloud.env` into
`quantum-executor/` (both are gitignored).

## SDK workarounds

`qpiai-quantum` 0.2.0 has three quirks this codebase corrects at the boundary.
Re-verify these before widening the version pin in `requirements.txt`.

1. **Bell state labels are transposed.** Asking the SDK for `|Φ+>` builds
   `(|01⟩+|10⟩)/√2`, which is textbook `|Ψ+>`. Corrected in
   `catalog._SDK_BELL_LABEL` so learners see the standard convention.
2. **Grover reports counts bit-reversed.** Searching for `110` returns `011`.
   Fixed with `reverse_bits=True` for that entry only — Bernstein-Vazirani and
   Simon report in input order and would break under a global flag.
3. **`ShorsAlgorithm` breaks the uniform interface.** `build_circuit(a,
   precision_qubits)` takes arguments every other class takes in its
   constructor; `catalog`'s `build_params` handles the split. Its
   `find_period()` is also unreliable (returns 1 where the true period is 4), so
   it is not surfaced.

## Theming

Tokens live in `src/app/globals.css`: raw values on `:root` (dark) with a
`[data-theme="light"]` override, mapped to utilities via `@theme inline`.

- `ThemeProvider` derives the resolved theme with `useSyncExternalStore` — no
  state mirroring in effects.
- `theme-script.ts` is injected at the top of `<body>` (React hoists `<head>`
  scripts out of the streamed HTML) and applies the stored theme before paint.
- `THEME_STORAGE_KEY` lives in `constants.ts` with **no** `'use client'`
  directive. Importing it from the client provider into the server layout makes
  Next substitute an error stub into the inline script.

The chart colours (`--q-zero`, `--q-one`) are validated for both surfaces:
lightness band, chroma floor, CVD separation, normal-vision separation and
≥3:1 contrast. Re-validate if you change them.

## Running locally

```bash
# 1. Executor (required for any circuit execution)
cd quantum-executor
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
./venv/bin/python -m uvicorn main:app --port 8080

# 2. App
npm install
npm run dev
```

The executor is *not* faked in the browser: if it is down, the UI says so
rather than rendering a plausible-looking histogram.
