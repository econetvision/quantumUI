#!/usr/bin/env python3
"""
Harvest reference answers from QWorld's paired *_Solutions notebooks.

`extract-lab-questions.py` globbed task notebooks only, so it never opened the
`X_Solutions.ipynb` sitting beside every `X.ipynb`. 179 solution notebooks are
vendored and none were read — which is the real reason 111 questions have no
reference answer, not any shortage of material.

The Solutions notebooks are cleanly structured:

    markdown  <a name="task3"></a> <h3> Task 3 </h3> ...the task restated...
    markdown  <h3>Solution</h3>
    code      ...the answer...

so a task number maps to the first code cell following its Solution heading.
Answers written by the same educators who set the questions beat anything
generated, and they match the exact wording of the task.

Usage: python3 scripts/harvest_qworld_solutions.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")
CONTENT = os.environ.get(
    "QWORLD_CONTENT_ROOT", os.path.join(APP_ROOT, "content", "qworld")
)

SOLUTION_SUFFIXES = ("_Solutions.ipynb", "_Solution.ipynb",
                     "_solutions.ipynb", "_solution.ipynb")


def find_solutions_notebook(source_rel: str) -> str | None:
    """Locate the Solutions notebook paired with a task notebook."""
    full = os.path.join(CONTENT, source_rel)
    if full.endswith(".ipynb"):
        stem = full[: -len(".ipynb")]
    else:
        return None

    # Already a solutions notebook — nothing to pair.
    if any(full.endswith(sfx) for sfx in SOLUTION_SUFFIXES):
        return full if os.path.exists(full) else None

    for suffix in SOLUTION_SUFFIXES:
        candidate = stem + suffix
        if os.path.exists(candidate):
            return candidate
    return None


def parse_solutions(path: str) -> dict[int, str]:
    """
    Map task number -> solution code.

    Walks the notebook in order, tracking which task the narrative is currently
    under, and claims the first code cell that appears after a Solution heading.
    Anchors (`<a name="task3">`) are preferred over prose headings because they
    are unambiguous; a `Task N` heading is the fallback.
    """
    try:
        with open(path, encoding="utf-8") as fh:
            notebook = json.load(fh)
    except Exception:
        return {}

    solutions: dict[int, str] = {}
    current_task: int | None = None
    expecting_code = False

    for cell in notebook.get("cells", []):
        text = "".join(cell.get("source", []))

        if cell.get("cell_type") == "markdown":
            anchor = re.search(r'<a\s+name=["\']task(\d+)["\']', text, re.I)
            heading = re.search(r"Task\s*(\d+)", text, re.I)

            if anchor:
                current_task = int(anchor.group(1))
                expecting_code = False
            elif heading and "solution" not in text[:40].lower():
                current_task = int(heading.group(1))
                expecting_code = False

            if re.search(r"<h\d[^>]*>\s*solution|^\s*#+\s*solution", text, re.I | re.M):
                expecting_code = True

        elif cell.get("cell_type") == "code" and current_task is not None:
            code = text.strip()
            # Take the first substantive code cell after the Solution heading.
            # Some notebooks omit the heading, so also accept the first code
            # cell under a task when nothing has been claimed yet.
            if code and (expecting_code or current_task not in solutions):
                if current_task not in solutions:
                    solutions[current_task] = code
                expecting_code = False

    return solutions


def task_number(question: dict) -> int | None:
    for field in ("prompt", "title"):
        match = re.search(r"Task\s*(\d+)", question.get(field) or "", re.I)
        if match:
            return int(match.group(1))
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with open(BANK, encoding="utf-8") as fh:
        bank = json.load(fh)

    # Cache parsed notebooks; many questions share a source.
    parsed_cache: dict[str, dict[int, str]] = {}

    total = already = harvested = no_pair = no_match = no_task = 0

    for topic in bank["topics"]:
        for question in topic["questions"]:
            total += 1

            if question.get("solution"):
                already += 1
                continue

            source = question.get("source")
            if not source:
                no_pair += 1
                continue

            solutions_path = find_solutions_notebook(source)
            if not solutions_path:
                no_pair += 1
                continue

            if solutions_path not in parsed_cache:
                parsed_cache[solutions_path] = parse_solutions(solutions_path)
            solutions = parsed_cache[solutions_path]

            number = task_number(question)
            if number is None:
                no_task += 1
                continue

            code = solutions.get(number)
            if not code:
                no_match += 1
                continue

            harvested += 1
            if not args.dry_run:
                question["solution"] = code
                question["solutionSource"] = os.path.relpath(solutions_path, CONTENT)
                question["solutionHarvested"] = True

    print(f"  questions                 : {total}")
    print(f"  already had a solution    : {already}")
    print(f"  HARVESTED from QWorld     : {harvested}")
    print(f"  no paired Solutions file  : {no_pair}")
    print(f"  no 'Task N' in the prompt : {no_task}")
    print(f"  task not found in solutions: {no_match}")
    print()
    print(f"  solutions coverage: {already + harvested}/{total} "
          f"({100 * (already + harvested) // max(total, 1)}%)")

    if args.dry_run:
        print("\n  --dry-run: bank not modified")
        return 0

    with open(BANK, "w", encoding="utf-8") as fh:
        json.dump(bank, fh, indent=2, ensure_ascii=False)
    print(f"\n  written -> {BANK}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
