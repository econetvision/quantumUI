# Execution backends: current state, gaps, and what to ask QpiAI

Written 2026-08-24. Every number here was measured against the running
deployment, not inferred — the commands are included so you can re-check.

---

## 1. What is running today

```
mode                 local-sdk
sdk_available        true      (qpiai-quantum 0.2.0)
cloud_authenticated  false
algorithm_count      12
```
`curl -s https://quantum-executor-production-113a.up.railway.app/health`

**The platform already runs entirely locally.** The QpiAI SDK is installed in
the executor container and every circuit is executed in-process. Nothing
reaches QpiAI's cloud, and no API key is present.

### Backends the executor advertises

| Backend | Kind | Available | Needs key |
| --- | --- | --- | --- |
| `QpiAI-QSV-Local` | simulator | **yes** | no |
| `QpiAI-QSV-Simulator` | simulator | no | yes |
| `QpiAI-QDM-Simulator` | density matrix | no | yes |
| `QpiAI-QTN-Simulator` | tensor network | no | yes |
| `QpiAI-Indus-1` | **physical QPU** | no | yes |

One of five is usable. The other four are listed and disabled, labelled
`— needs API key`, gated on `QPIAI_API_KEY` (`qpiai_bridge.py:113`).

Cirq is not installed at all and never has been.

---

## 2. The MockCircuit problem

`quantum-executor/mock_circuit.py` is the fallback when the SDK is absent. Its
own docstring:

> This exists so the frontend stays usable in a bare checkout — it is *not* a
> simulator. It pattern-matches the gates applied and returns the textbook
> distribution for a few common circuits.

It does not compute anything. It recognises a shape of circuit and returns the
answer a textbook would print. That is fine as a placeholder for a developer
with no SDK installed, and unacceptable as a teaching backend: the product
promises throughout the UI that *"Results are never simulated in the browser"*.

**It is not a candidate for "local mode".** Any local path has to actually
solve the circuit.

### What to ask QpiAI

1. Is `qpiai-quantum` licensed for unlimited local (in-process) execution
   without a cloud key, for an educational deployment? We rely on this today.
2. What are the limits of the local statevector simulator — max qubits, max
   shots, memory profile? We advertise 20 qubits from the backend metadata.
3. Is there a supported way to get a **density-matrix / noise** simulation
   locally, or is `QpiAI-QDM-Simulator` cloud-only?
4. Pricing and quota for `QpiAI-QSV-Simulator`, `QpiAI-QDM-Simulator`,
   `QpiAI-QTN-Simulator`, and queue behaviour + cost for `Indus-1`.
5. Is a shared/classroom key model available, or is it one key per learner?

---

## 3. Feasibility: replacing the SDK with a local numpy simulator

Measured against all 152 lab questions — this is the entire API surface the
curriculum uses:

| Category | Members |
| --- | --- |
| Gates | `h x z cx cz swap ccx cswap rx ry rz cp` (12) |
| Execution | `measure`, `run(shots=)`, `get_counts()` |
| Metadata | `draw`, `depth`, `size` |

A numpy statevector engine covering that is roughly 250 lines: 12 gate matrices
applied to a 2^n amplitude vector, plus multinomial sampling for shots.

**The gates are the easy part.** Six files import the SDK:

```
catalog.py  main.py  qpiai_bridge.py  sandbox.py  mcp_server.py  mock_circuit.py
```

The real cost sits elsewhere:

- `catalog.py` — the 12-algorithm gallery is built on the SDK (19 references)
- `.show()` — the ASCII circuit diagrams the playground renders
- statevector and per-qubit Bloch vectors, returned on every run and drawn in
  the UI
- re-verifying all 108 working solutions against a new engine

**Gained:** no vendor dependency, no key ever, smaller image, faster cold start.
**Lost:** the upgrade path to a real QPU, and the "runs on the QpiAI Quantum
SDK" claim on the homepage and footer stops being true.

Recommended shape if pursued: build it behind `QUANTUM_ENGINE=local` so both
engines coexist and results can be compared before anything is switched.

---

## 4. Proposal: sell the locked backends instead of greying them out

Today an unavailable backend is a disabled `<option>` reading `— needs API key`.
It states a fact and offers no way forward.

Better: selecting a locked backend opens a panel that

- names what it gives you (`QpiAI-QDM-Simulator` → noise and mixed states;
  `Indus-1` → a physical superconducting QPU, 25 qubits)
- links to QpiAI to obtain a key
- accepts the key inline and stores it **per user**, not per deployment

The plumbing already exists: `cloud_auth_available()` reads `QPIAI_API_KEY`
(`qpiai_bridge.py:113`) and `resolve_device()` refuses auth-gated backends
without it. Today that is one process-wide environment variable, so a key would
unlock the backend for **every** visitor. Per-user keys need:

- a `User.qpiaiApiKey` column, encrypted at rest
- the key forwarded per request rather than read from the environment
- the executor accepting a per-request key instead of only its own env var

The same pattern covers Cirq: rather than hiding it, offer it as an
integration that is not enabled on this deployment.

---

## 5. Lab content gaps (measured, 2026-08-24)

152 questions, **108 with solutions, all 108 verified to execute** against the
live backend (`scripts/verify-lab-solutions.py`).

### 44 questions have no solution

| Track | Questions | Missing |
| --- | --- | --- |
| **quantum-error-correction** | 8 | **8 — every one** |
| quantum-algorithms | 24 | 12 |
| quantum-entanglement | 24 | 10 |
| quantum-cryptography-qkd | 22 | 7 |
| quantum-fundamentals | 24 | 4 |
| quantum-gates | 21 | 2 |
| qiskit-sdk-deep-dive | 2 | 1 |

QWorld does not publish solutions for most of these — they need authoring, then
verifying against the executor rather than being accepted because they look
plausible.

### 12 finished labs no track points at

| Topic | Questions | With solutions |
| --- | --- | --- |
| `qpiai-sdk` | 10 | **10** |
| `cirq-sdk` | 2 | 2 |

Both are complete and reachable from `/labs`, but no curriculum track maps to
them (`LAB_TOPIC_BY_TRACK` in
`src/app/tracks/[slug]/lessons/[lessonId]/page.tsx`). The `qpiai-sdk` set is
the most valuable content in the bank — ten labs written against the engine
that actually runs — and the curriculum never surfaces it.

**One line fixes this.** Point `qiskit-sdk-deep-dive` or
`advanced-qiskit-topics` at `qpiai-sdk`.

### Three tracks share the same two labs

`qiskit-sdk-deep-dive`, `advanced-qiskit-topics` and `ibm-cert-exam-prep` all
map to `qiskit-sdk`, which holds 2 questions, one of which has no solution.

---

## 6. Re-checking any of this

```bash
# execution mode and backend availability
curl -s https://quantum-executor-production-113a.up.railway.app/health
curl -s https://quantum-executor-production-113a.up.railway.app/backends

# every solution, executed for real
EXECUTOR_URL=https://quantum-executor-production-113a.up.railway.app \
EXECUTOR_API_KEY=<railway project var> \
python3 scripts/verify-lab-solutions.py
```
