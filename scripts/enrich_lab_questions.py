#!/usr/bin/env python3
"""
Repair and enrich the extracted lab question bank — in place, losing nothing.

The extractor pulls task cells out of the QWorld notebooks faithfully, but the
*title* it records is often empty or a fragment ("(Discuss)", "[extra]", ")").
The task statement itself is almost always fine and sitting in the prompt. So
rather than dropping those questions, this repairs them:

  1. TITLE   — derived from the prompt's first imperative sentence when the
               recorded title is empty or junk.
  2. EXPLANATION — a "why this matters" note, selected by detecting which
               concepts the prompt and code actually involve. Explanations are
               never invented about physics the question doesn't touch; if no
               concept matches, a topic-level explanation is used.

All 127 questions are kept. Nothing is deleted.

Usage:
    python3 scripts/enrich_lab_questions.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK_PATH = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")

# --------------------------------------------------------------------------
# Title repair
# --------------------------------------------------------------------------

JUNK_TITLE = re.compile(
    r"^[\s)\]\[<>*_#-]*$"
    r"|^\(?\s*(discuss(ion)?|on paper|extra|note|hint)\s*\)?[\s.]*$"
    r"|click for our solution",
    re.IGNORECASE,
)


def clean_inline(text: str) -> str:
    """Strip the notebook markup that makes a title unreadable."""
    text = re.sub(r"\$[^$]*\$", "", text)            # inline LaTeX
    text = re.sub(r"!?\[[^\]]*\]\([^)]*\)", "", text)  # links / images
    text = re.sub(r"<[^>]+>", "", text)               # stray HTML
    text = re.sub(r"[*_`#]+", "", text)               # emphasis markers
    text = re.sub(r"\s+", " ", text)
    return text.strip(" .:;,-–—")


def derive_title(prompt: str, fallback: str) -> str:
    """
    Build a title from the task statement.

    Prompts open with "Task N" followed by the instruction, so the leading
    marker is dropped and the first real sentence used. Sentences are split on
    terminal punctuation only, to avoid cutting inside "0.5" or "e.g.".
    """
    text = clean_inline(prompt or "")
    text = re.sub(r"^task\s*\d+\s*[.:)-]?\s*", "", text, flags=re.IGNORECASE)
    if not text:
        return fallback

    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
    title = ""
    for part in parts:
        part = part.strip()
        # Skip scene-setting openers; we want the instruction.
        if len(part) < 12:
            continue
        title = part
        break
    title = title or text

    if len(title) > 78:
        cut = title[:78].rsplit(" ", 1)[0]
        title = f"{cut}…"
    return title or fallback


# --------------------------------------------------------------------------
# Explanation selection
# --------------------------------------------------------------------------

# (regex over prompt+code, explanation). Order matters: the most specific
# concept that matches wins, so a BB84 question is not explained as "sampling".
CONCEPT_EXPLANATIONS: list[tuple[str, str]] = [
    (r"chsh|bell inequality|correlation value",
     "The CHSH value is the sharpest dividing line in physics. Any theory where "
     "particles carry pre-set values obeys |S| ≤ 2; quantum mechanics reaches "
     "2√2 ≈ 2.83. Measuring above 2 rules out local hidden variables — this is "
     "the experiment that settled the Einstein–Bohr argument, and it won the "
     "2022 Nobel Prize."),

    (r"bb84|eavesdrop|eve\b|key distribution|sifting",
     "BB84's security does not rest on a hard maths problem — it rests on "
     "measurement disturbing the state. An eavesdropper must measure, measuring "
     "in the wrong basis randomises the result, and that shows up as errors in "
     "the shared key. Noise and eavesdropping look identical, so the honest "
     "parties simply abort whenever the error rate is too high."),

    (r"grover|amplitude amplification|diffusion operator",
     "Grover finds a marked item in ~√N steps instead of N. The oracle only "
     "flips the sign of the target — it never increases its probability. The "
     "amplification comes from the diffusion step reflecting every amplitude "
     "about their mean. Run too many iterations and the probability falls "
     "again, so the ~π/4·√N stopping point matters."),

    (r"shor|period finding|factoring|modular exponent",
     "Shor's algorithm reduces factoring to finding the period of aˣ mod N — a "
     "problem the quantum Fourier transform solves efficiently. The quantum "
     "part only finds the period; turning that into factors is classical "
     "number theory. This is the algorithm that motivates post-quantum "
     "cryptography."),

    (r"deutsch|constant or balanced|oracle_type",
     "Deutsch–Jozsa answers 'constant or balanced?' in one query where a "
     "classical computer may need 2ⁿ⁻¹+1. It works because the superposition "
     "queries every input at once and interference cancels the wrong answer. "
     "It is contrived on purpose — it was the first clean proof that quantum "
     "beats classical for *some* problem."),

    (r"simon|hidden string|xor mask",
     "Simon's problem gives an exponential separation, and each run yields a "
     "linear equation about the hidden string rather than the string itself. "
     "Collect enough independent equations and solve classically. This "
     "structure — quantum sampling plus classical post-processing — is exactly "
     "what Shor later reused."),

    (r"syndrome|stabilizer|\[\[5,1,3\]\]|error correction|repetition code",
     "Quantum error correction cannot copy a qubit (no-cloning) and cannot look "
     "at it directly without collapsing it. The trick is to measure *stabilizers* "
     "— joint properties that reveal which error occurred while revealing nothing "
     "about the encoded data. The syndrome names the error; the data stays "
     "untouched."),

    (r"teleport|superdense",
     "Teleportation moves a quantum state without moving a particle, but it "
     "needs two classical bits to complete — which is why it cannot beat light "
     "speed. Note the original is destroyed by the measurement: this is "
     "no-cloning being respected, not circumvented."),

    (r"ghz|w state|cluster state",
     "GHZ and W states are both genuinely multipartite entangled, but they fail "
     "differently: lose one qubit from GHZ and all entanglement vanishes, while "
     "a W state keeps some. That robustness difference decides which is useful "
     "for which protocol."),

    (r"bell state|entangl|\|00\rangle \+ \|11\rangle|epr",
     "Entanglement means the pair has a definite joint state while neither qubit "
     "has a state of its own. Measuring one instantly fixes the other's outcome, "
     "yet no information travels — the individual results are random, and only "
     "comparing both reveals the correlation."),

    (r"cnot|controlled-not|\.cx\(|toffoli|ccx",
     "CNOT is what makes multi-qubit computing non-trivial: it cannot be "
     "decomposed into single-qubit gates, so it is the source of entanglement. "
     "Applied to a superposed control it does not choose a branch — it "
     "correlates both branches at once."),

    (r"hadamard|\.h\(|superposition|\|\+\rangle",
     "The Hadamard gate creates superposition, and applying it twice returns "
     "the original state. That reversibility is the point: superposition is not "
     "'the qubit is secretly 0 or 1', it is a definite state whose amplitudes "
     "can later interfere and cancel."),

    (r"bloch|theta.*phi|rotation gate|\.r[xyz]\(",
     "The Bloch sphere makes single-qubit states visual: θ sets the measurement "
     "probabilities and φ sets the relative phase. Phase is invisible to a "
     "computational-basis measurement, which is exactly why algorithms must "
     "interfere states before measuring."),

    (r"qft|fourier",
     "The quantum Fourier transform maps between computational and frequency "
     "bases. It is not faster at computing Fourier coefficients you can read — "
     "you only get samples — but it is the engine that makes period-finding, "
     "and therefore Shor, work."),

    (r"measure|probabilit|shots|counts",
     "A single measurement tells you almost nothing; the distribution over many "
     "shots is the result. Probabilities are the squared magnitudes of "
     "amplitudes, which is why amplitudes may be negative or complex while "
     "probabilities never are."),

    (r"inner product|braket|orthogonal|norm",
     "The inner product measures overlap between states. Orthogonal states are "
     "perfectly distinguishable in one measurement; non-orthogonal ones are "
     "not, and that impossibility is precisely what makes quantum key "
     "distribution secure."),

    (r"coin|randrange|random|bias",
     "A biased coin is the classical stand-in for a qubit: both give "
     "probabilistic outcomes with weights summing to 1. The difference is that "
     "coin probabilities only ever add, while quantum amplitudes can be "
     "negative and cancel. Interference is what a coin can never do."),

    (r"complex number|euler|polar form|modulus",
     "Quantum amplitudes are complex numbers, and the complex phase is not "
     "decorative — it decides whether paths interfere constructively or "
     "destructively. Probability discards the phase, so it only becomes visible "
     "through interference."),

    (r"cirq|qiskit|circuit\(|quantumcircuit",
     "Every SDK expresses the same physics with different names: circuits, "
     "registers, gates, then a run against a backend. Learning to move between "
     "them matters more than memorising one API — the underlying linear algebra "
     "is identical."),
]

TOPIC_FALLBACK = {
    "quantum-fundamentals":
        "This builds the foundation the rest of the course stands on: states, "
        "probability and measurement. Superposition is not uncertainty about a "
        "hidden value — it is a definite state whose parts can interfere.",
    "quantum-gates":
        "Quantum gates are reversible unitary operations, so no information is "
        "lost and every gate can be undone. That constraint is why quantum "
        "circuits look so different from classical logic.",
    "qiskit-sdk":
        "SDK fluency is what turns understanding into working circuits — "
        "building, transpiling and running against a backend.",
    "cirq-sdk":
        "Cirq exposes the same quantum mechanics with different syntax. "
        "Comparing SDKs makes clear which parts are physics and which are API.",
    "quantum-entanglement":
        "Entanglement is the resource that separates quantum from classical "
        "computing — correlations no classical system can reproduce.",
    "quantum-algorithms":
        "Quantum algorithms win by arranging interference so wrong answers "
        "cancel and right answers reinforce. Speedup comes from that structure, "
        "not from 'trying everything at once'.",
    "quantum-cryptography":
        "Quantum cryptography's security rests on physics rather than "
        "computational hardness — measurement disturbs a state, and that "
        "disturbance is detectable.",
    "error-correction":
        "Error correction is what stands between today's noisy devices and "
        "useful quantum computing, encoding one logical qubit across many "
        "physical ones.",
}


def choose_explanation(question: dict, topic_slug: str) -> str:
    haystack = " ".join([
        question.get("title") or "",
        question.get("prompt") or "",
        question.get("starterCode") or "",
        question.get("solution") or "",
    ]).lower()

    for pattern, explanation in CONCEPT_EXPLANATIONS:
        if re.search(pattern, haystack, re.IGNORECASE):
            return explanation

    return TOPIC_FALLBACK.get(
        topic_slug,
        "Work through the task, run it, and compare what you observe against "
        "what the theory predicts — the gap between the two is where the "
        "learning happens.",
    )


# --------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with open(BANK_PATH, encoding="utf-8") as fh:
        bank = json.load(fh)

    titles_fixed = explained = 0
    total = 0

    for topic in bank["topics"]:
        slug = topic.get("slug", "")
        for question in topic["questions"]:
            total += 1

            raw_title = (question.get("title") or "")
            stripped = re.sub(r"^task\s*\d+\s*[.:)-]?\s*", "", raw_title,
                              flags=re.IGNORECASE).strip()

            if not stripped or JUNK_TITLE.match(stripped):
                derived = derive_title(question.get("prompt", ""), fallback="")
                if derived:
                    question["title"] = derived
                    question["titleDerived"] = True  # provenance, so it is auditable
                    titles_fixed += 1
            else:
                question["title"] = clean_inline(stripped) or stripped

            if not question.get("explanation"):
                question["explanation"] = choose_explanation(question, slug)
                explained += 1

    print(f"  questions          : {total}")
    print(f"  titles repaired    : {titles_fixed}")
    print(f"  explanations added : {explained}")

    if args.dry_run:
        print("\n  --dry-run: nothing written")
        return 0

    with open(BANK_PATH, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"\n  written -> {BANK_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
