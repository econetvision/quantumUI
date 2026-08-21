#!/usr/bin/env python3
"""
Fill in missing solutions in src/data/labs/lab-questions.json.

Why this exists instead of just re-running extract-lab-questions.py: the
committed bank is not that script's raw output. It carries 152 questions
against the generator's 127, plus curation fields (solutionAuthored,
verifiedAgainst, verifiedOutput...) added by hand afterwards. Regenerating
throws all of that away and renumbers every id, which orphans the completed-
question ids learners already hold in localStorage.

So this walks the existing bank and only ever writes a `solution` that is
currently empty. Everything else is left byte-for-byte alone.

    python3 scripts/backfill-lab-solutions.py --dry-run
    python3 scripts/backfill-lab-solutions.py
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BANK = os.path.join(ROOT, "src", "data", "labs", "lab-questions.json")
QWORLD = os.path.join(ROOT, "content", "qworld")


def _load_generator():
    """Import extract-lab-questions.py (hyphens make it non-importable normally)."""
    path = os.path.join(HERE, "extract-lab-questions.py")
    spec = importlib.util.spec_from_file_location("extract_lab_questions", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _norm(s: str) -> str:
    return " ".join((s or "").split()).strip().lower()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    gen = _load_generator()
    raw = open(BANK, encoding="utf-8").read()
    bank = json.loads(raw)

    # Cache per notebook: extract_tasks() and find_solutions() both re-read it.
    tasks_cache: dict[str, list] = {}
    sols_cache: dict[str, dict] = {}

    filled = unmatched = no_source = no_solution = skipped_unsafe = 0
    report: list[str] = []

    # Group questions by their source notebook, preserving bank order. The
    # generator appended one question per task in task order, so when the two
    # counts agree the i-th question is the i-th task. That positional join is
    # exact; matching on title is not — several QWorld tasks share a title like
    # "Convince yourself", and a title join silently gave four questions the
    # same solution.
    by_source: dict[str, list] = {}
    for topic in bank["topics"]:
        for q in topic["questions"]:
            src = q.get("source")
            if src:
                by_source.setdefault(src, []).append(q)

    for src, questions in by_source.items():
        nb = os.path.join(QWORLD, src)
        if not os.path.exists(nb):
            no_source += sum(1 for q in questions if not (q.get("solution") or "").strip())
            continue

        tasks = gen.extract_tasks(nb)
        sols = gen.find_solutions(nb)
        if not sols:
            no_solution += sum(1 for q in questions if not (q.get("solution") or "").strip())
            continue

        if len(tasks) != len(questions):
            # Counts disagree, so position proves nothing. Refuse to guess.
            missing = sum(1 for q in questions if not (q.get("solution") or "").strip())
            if missing:
                skipped_unsafe += missing
                report.append(
                    f"  ? {os.path.basename(src):48} skipped: "
                    f"{len(questions)} questions vs {len(tasks)} tasks"
                )
            continue

        for q, (number, _title, _prompt, _starter) in zip(questions, tasks):
            if (q.get("solution") or "").strip():
                continue  # curated or already harvested — never overwrite
            code = sols.get(number)
            if not code:
                no_solution += 1
                continue
            q["solution"] = code
            q["solutionHarvested"] = True
            q["solutionSource"] = os.path.basename(src)
            filled += 1
            report.append(f"  + {q['id']:32} <- {os.path.basename(src)} task {number}")

    print("\n".join(report))
    print(
        f"\nfilled={filled}  no_solution_for_task={no_solution}  "
        f"skipped_ambiguous={skipped_unsafe}  no_source_notebook={no_source}"
    )

    if args.dry_run:
        print("dry run — nothing written")
        return 0

    # Match the generator's serialisation exactly so the diff is only the
    # solutions themselves.
    with open(BANK, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
    print(f"wrote {BANK}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
