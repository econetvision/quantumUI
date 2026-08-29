# Track 0 — syllabus coverage across three tiers

Audit table required by Phase 6. Every syllabus topic maps to a lesson, a
component, and the tier at which it first appears.

## The three tiers

Ordered, not parallel. Content declares a **minimum** tier and is inherited
upward, so a professional keeps the student derivation instead of losing it to
a deeper block. `ModeSwitch` falls back down the chain, which means most topics
only ever need two layers written.

| Tier | Audience | What it adds |
| --- | --- | --- |
| 🧒 **Kid** | ~8+ | Analogy, animation, a game. No notation at all. |
| 🎓 **Student** | undergraduate | Dirac notation, matrices, normalisation, worked examples. |
| ⚛️ **Professional** | practitioner | Cost and limits: gate depth, complexity class, decoherence, hardware reality, where the abstraction leaks. |

The professional tier is not "more equations". It is the layer that answers
*what does this cost and where does it break* — the questions a student does
not yet have, and a practitioner has before anything else.

## Coverage

| # | Lesson | Kid | Student | Professional | Component | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Light Switch World | switches spell a smiley; binary name tag | two-level systems, AND/OR/NOT, bytes→GB | Landauer limit; why irreversibility costs energy | `BinaryNameTag`, `TruthTableExplorer` | planned |
| 2 | Meet the Qubit | spinning coin, catch it | α\|0⟩+β\|1⟩, normalisation, column vector | T₁/T₂ times; what "a qubit" means in transmon vs trapped ion | `SpinningCoinQubit` | planned |
| 3 | Bit vs Qubit | sorting game | 9-row comparison table | where the 2ⁿ advantage does *not* apply | `SortingGame` | planned |
| 4 | ⟨bra\|ket⟩ | nametags on coin faces | inner/outer product, projectors, ⟨φ\|P\|φ⟩ | density matrices; why projectors matter for readout error | `BraKetCalculator` | planned |
| 5 | The Infinity Room | drag an arrow round a circle | Hilbert space, span, normalisation checks | dimension counting; why 50 qubits is 2⁵⁰ amplitudes | — | planned |
| 6 | The Magic Globe | globe with chance bars | θ/φ parameterisation, P₀=cos²(θ/2) | Bloch picture breaks for mixed states; enter the density matrix | `BlochSphereExplorer` | planned |
| 7 | Gate School | machines that change the coin | matrices + truth tables per gate | gate fidelity, native gate sets, transpilation depth | `GatePlayground` | planned |
| 8 | Coin Teams | doubling machine | tensor products, 2ⁿ, product states | why simulation dies at ~50 qubits | `DoublingMachine` | planned |
| 9 | How It Thinks | best-friend coins; wave playground | Bell states, entanglement criterion, interference | entanglement as a resource; monogamy; noise destroys it first | `EntanglementDemo`, `WaveInterference` | planned |
| 10 | The Movie of a Qubit | rewindable dance | Schrödinger evolution, U=e^{−iĤt/ℏ} | coherence budget: how long before the movie is noise | — | planned |
| 11 | The Big Reveal | peeking forces a choice | collapse, P=\|α\|², measurement operators | readout error, repeated sampling, shot noise | `MeasurementGame` | planned |
| 12 | Superpowers & Kryptonite | sorting game | advantages and challenges | error-correction overhead; the real qubit budget | `SortingGame`, `Certificate` | planned |

**Status is honest: Phase 2 lessons are not built yet.** This table is the
contract they will be built against, and the Phase 6 audit item that says every
syllabus topic must appear somewhere.

## Built and tested

| Piece | Where | Tests |
| --- | --- | --- |
| Three-tier mode system | `components/learning/constants.ts` | 12 |
| `LearningModeProvider` + pre-paint script | `components/learning/` | verified in browser |
| Settings panel, admin site settings | `components/learning/`, `app/admin/settings/` | verified in browser |
| **State-vector simulator** | `lib/quantum-sim.ts` | **34** |

### `quantum-sim.ts` — what the tests actually assert

Not "it runs" — the physics the lessons claim:

- every single-qubit gate against the truth tables in the syllabus, including
  `X: α\|0⟩+β\|1⟩ → β\|0⟩+α\|1⟩`, `Y\|0⟩ = i\|1⟩`, `T·T = S`, `H·H = I`
- the full CNOT mapping `00→00, 01→01, 10→11, 11→10`
- Bell state is `(|00⟩+|11⟩)/√2` and **measures only 00 and 11** over 2000 shots
- the Bloch worked example: θ=π/3 ⇒ P₀=0.75, P₁=0.25
- the measurement worked example: 0.6\|0⟩+0.8\|1⟩ ⇒ P₀=0.36, P₁=0.64, verified
  empirically to within 3 percentage points over 5000 shots
- normalisation preserved across a mixed H/CNOT/RY/Toffoli/SWAP circuit
- Toffoli flips only when **both** controls are 1
- rz changes phase but never the measured probabilities

Statistical assertions take an injectable RNG so they are deterministic — a
CI flake in a physics test teaches nobody anything.

**Qubit 0 is the leftmost character of a basis label**, asserted explicitly.
This is written down because the SDK the rest of the platform talks to is *not*
self-consistent about ordering (Grover reverses, Bernstein–Vazirani does not),
and a teaching simulator that silently picked the other convention would
contradict its own lessons.
