# Requirements checklist

Audited against the codebase on 2 Aug 2026. Every status below is backed by a
check that was actually run, not by reading intent from file names.

Legend: ✅ done · 🟡 partial · ❌ missing

---

## 1. In-browser lab shell with QpiAI SDK-backed Q&A

| Item | Status | Evidence |
| --- | --- | --- |
| Shell UI inside the site | ✅ | `src/components/LabShell.tsx`, `/labs/shell` |
| Stateful REPL (variables persist) | ✅ | `POST /repl`, session namespace per `session_id` |
| Runs on qpiai-sdk | ✅ | executor binds `Circuit` from `qpiai_quantum` 0.2.0 |
| Question bank wired into the shell | ✅ | `/api/labs/questions`, 7 refs in `LabShell` |
| Answer checking / grading | ❌ | no verification that a submitted answer is correct |
| Per-question progress persisted | ❌ | nothing written to `LabAttempt` |

**Gap:** the shell runs code, but nothing marks a question as solved.

---

## 2. Images → GIF, resolution settings

| Item | Status | Evidence |
| --- | --- | --- |
| GIF generation script | ✅ | `scripts/generate-lesson-gifs.py` (Ken Burns loop) |
| Resolution configurable | 🟡 | single `SIZE = 384` constant, not a CLI flag |
| Pillow available | ✅ | 11.3.0 |
| Applied to new track imagery | ❌ | only 4 GIFs exist, for 3 tracks |
| ffmpeg (for mp4/webm) | ❌ | not installed |

---

## 3. Explanations + questions mapped from QWorld notebooks + minimal black/blue UI

| Item | Status | Evidence |
| --- | --- | --- |
| Questions extracted from QWorld notebooks | ✅ | 127 questions, `scripts/extract-lab-questions.py` |
| Difficulty tiers easy/medium/complex | ✅ | 44 / 43 / 40 |
| Starter code | 🟡 | 97 / 127 |
| Solutions | 🟡 | 50 / 127 |
| **Explanations** | ❌ | **0 / 127** |
| Minimal black + blue UI | ✅ | token system, blue accent, light + dark |

**Gap:** no question has an explanation. This is the single biggest content gap.

---

## 4. Full product: admin, students, assigned materials, tracking

| Item | Status | Evidence |
| --- | --- | --- |
| Prisma schema | ✅ | 14 models incl. `Assignment`, `UserProgress`, `LabAttempt` |
| Admin dashboard UI | ✅ | `src/components/AdminDashboard.tsx` |
| **Admin backed by database** | ❌ | `useState(DEMO_STUDENTS)` — in-memory only |
| **Any API route touching Prisma** | ❌ | 8 routes exist; none query the DB |
| **Progress / XP / streak persisted** | ❌ | no `prisma.` calls in `streak.ts`, `assignments.ts`, `projects.ts` |
| Auth | 🟡 | NextAuth configured; login form is a stub |

**Gap:** the whole persistence layer is unimplemented. Everything resets on
refresh. This is the "fix the backend properly" item.

---

## 5. Zero → Quantum champion across three certifications

| Item | Status | Evidence |
| --- | --- | --- |
| Ordered 0→advanced curriculum | ✅ | 12 tracks, 104 lessons |
| Uses QWorld material | 🟡 | 4 of 7 vendored repos used (`tqc`, `qnickel`, `adequate-qbook1` unused) |
| Easy / medium / complex per topic | ✅ | all three tiers present |
| Topic coverage | 🟡 | 8 question topics vs 12 tracks |
| IBM Qiskit Developer track | ✅ | `ibm-cert-exam-prep` |
| **Microsoft Quantum Katas track** | ❌ | referenced in extract script, no track, not in output |
| **Google Cirq track** | ❌ | `cirq-sdk` topic extracted but no track and no cert tagging |
| Cert tagging on questions | ❌ | `cert` defined in the script but never written to JSON |

---

## 6. Duolingo-style flow + streaks

| Item | Status | Evidence |
| --- | --- | --- |
| Streak badge UI | ✅ | `StreakBadge.tsx`, `lib/streak.ts` |
| XP rewards defined | ✅ | on `Lab` model in schema |
| **Streak persisted** | ❌ | localStorage only, no DB |
| Daily goal / freeze / recovery | ❌ | not implemented |
| Lesson-completion loop | ❌ | no completion state at all |
| Achievements | 🟡 | models exist, never awarded |

---

## Option 3 — QpiAI SDK integration (requested)

| Item | Status |
| --- | --- |
| QpiAI SDK track (13th track) | ❌ to build |
| Docs deep-links per track | ❌ to build |
| Qiskit-vs-QpiAI syntax callouts | ❌ to build |

Context: the curriculum mentions Qiskit ~610 times and QpiAI twice, while
*every* circuit executes on the QpiAI SDK. Learners are never told which SDK
they are using.

---

## Priority order

1. **Backend persistence** — API routes over Prisma; progress, attempts,
   streaks, assignments. Unblocks 1, 4 and 6.
2. **Answer checking** in the lab shell. Unblocks the Duolingo loop.
3. **Explanations** for all 127 questions + cert tagging.
4. **QpiAI SDK track** + docs links + syntax callouts (Option 3).
5. **Cirq and Katas tracks**; use the three unused QWorld repos.
6. **GIF pipeline** applied to new imagery, resolution as a flag.
