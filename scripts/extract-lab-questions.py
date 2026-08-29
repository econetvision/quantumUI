#!/usr/bin/env python3
"""
Extract lab questions from QWorld Jupyter notebooks.

Walks the qworld repos (qbook101, silver-qcourse511, qkd, qec), finds
"Task" cells in task notebooks, pairs them with starter code and the
matching solution from *_Solutions notebooks, and writes a question bank
JSON grouped by track/topic with easy/medium/complex difficulty tiers.

Usage:  python3 scripts/extract-lab-questions.py
Output: src/data/labs/lab-questions.json
"""

import glob
import json
import os
import re
import sys

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Notebooks are vendored under content/qworld/ — see content/qworld/SOURCES.md.
# QWORLD_CONTENT_ROOT overrides this when the content lives elsewhere.
QWORLD_BASE = os.environ.get(
    "QWORLD_CONTENT_ROOT", os.path.join(APP_ROOT, "content", "qworld")
)
OUTPUT_PATH = os.path.join(APP_ROOT, "src", "data", "labs", "lab-questions.json")

# topic slug -> display name, notebook glob patterns (task notebooks only)
TOPICS = {
    "quantum-fundamentals": {
        "name": "Quantum Fundamentals",
        "cert": "Microsoft Quantum Katas",
        "globs": [
            "qbook101/qbook101/QB21_*.ipynb",
            "qbook101/qbook101/QB23_*.ipynb",
            "qbook101/qbook101/QB24_*.ipynb",
        ],
    },
    "quantum-gates": {
        "name": "Quantum Gates & Circuits",
        "cert": "IBM Qiskit Developer",
        "globs": [
            "qbook101/qbook101/QB31_*.ipynb",
            "qbook101/qbook101/QB32_*.ipynb",
        ],
    },
    "qiskit-sdk-deep-dive": {
        "name": "Qiskit SDK",
        "cert": "IBM Qiskit Developer",
        "globs": [
            "qbook101/qbook101/appendices/C_qiskit/*.ipynb",
        ],
    },
    "cirq-sdk": {
        "name": "Google Cirq",
        "cert": "Google Cirq",
        "globs": [
            "qbook101/qbook101/appendices/D_cirq/*.ipynb",
            "silver-qcourse511/silver/B*_Cirq_*.ipynb",
        ],
    },
    "quantum-entanglement": {
        "name": "Quantum Entanglement",
        "cert": "Microsoft Quantum Katas",
        "globs": [
            "qbook101/qbook101/QB4*_*.ipynb",
            "silver-qcourse511/silver/C09_*.ipynb",
        ],
    },
    "quantum-algorithms": {
        "name": "Quantum Algorithms",
        "cert": "IBM Qiskit Developer",
        "globs": [
            "silver-qcourse511/silver/D*_*.ipynb",
        ],
    },
    "quantum-cryptography-qkd": {
        "name": "Quantum Cryptography & QKD",
        "cert": "Microsoft Quantum Katas",
        "globs": [
            "qkd/notebooks/QC*.ipynb",
        ],
    },
    "quantum-error-correction": {
        "name": "Quantum Error Correction",
        "cert": "IBM Qiskit Developer",
        "globs": [
            "qec/chapters/qec-intro/*.ipynb",
            "qec/chapters/stabilizer-codes/*.ipynb",
        ],
    },
}

TASK_HEADER_RE = re.compile(
    r"(?:<h[1-4][^>]*>\s*|#{1,4}\s*|\*\*\s*)Task\s*(\d+)?\s*[:.]?\s*(.*?)(?:</h[1-4]>|\*\*|$)",
    re.IGNORECASE,
)

# `<a name="task3"></a>` — how QWorld solution notebooks label which task a
# section answers. See find_solutions() for why matching this matters.
TASK_ANCHOR_RE = re.compile(r"<a\s+name=[\"']task(\d+)[\"']", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
MAX_PROMPT_CHARS = 1200
MAX_QUESTIONS_PER_TOPIC = 24


def strip_html(text: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = TAG_RE.sub("", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def cell_source(cell) -> str:
    src = cell.get("source", [])
    return "".join(src) if isinstance(src, list) else src


def load_notebook(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def extract_tasks(nb_path):
    """Extract (task_number, title, prompt, starter_code) tuples from a notebook."""
    nb = load_notebook(nb_path)
    if not nb:
        return []
    cells = nb.get("cells", [])
    tasks = []
    for i, cell in enumerate(cells):
        if cell.get("cell_type") != "markdown":
            continue
        src = cell_source(cell)
        m = TASK_HEADER_RE.search(src)
        if not m or "task" not in src.lower():
            continue
        number = int(m.group(1)) if m.group(1) else len(tasks) + 1
        title = strip_html(m.group(2) or "").strip() or f"Task {number}"
        prompt = strip_html(src)[:MAX_PROMPT_CHARS]
        # starter code: first non-empty code cell after the task cell
        starter = ""
        for nxt in cells[i + 1: i + 4]:
            if nxt.get("cell_type") == "code":
                code = cell_source(nxt).strip()
                if code:
                    starter = code
                break
        tasks.append((number, title, prompt, starter))
    return tasks


def find_solutions(nb_path):
    """Map task number -> solution code from the paired *_Solutions notebook."""
    base, ext = os.path.splitext(nb_path)
    solutions = {}
    for suffix in ("_Solutions", "_Solution"):
        sol_path = base + suffix + ext
        if not os.path.exists(sol_path):
            continue
        nb = load_notebook(sol_path)
        if not nb:
            continue
        cells = nb.get("cells", [])
        for i, cell in enumerate(cells):
            if cell.get("cell_type") != "markdown":
                continue

            # Which task does this cell introduce?
            #
            # Most QWorld solution notebooks do NOT repeat the task heading —
            # they mark the task with an HTML anchor and then head the section
            # plainly, e.g.
            #
            #     <a name="task2"></a>
            #     <h3>Solution</h3>
            #     [code]
            #
            # Matching only "Task <n>" therefore found nothing in 51 of the 170
            # solution notebooks, and every question sourced from them shipped
            # with an empty solution. The anchor is the reliable marker; the
            # heading is kept as a fallback for the notebooks that do repeat it.
            source = cell_source(cell)
            m = TASK_HEADER_RE.search(source)
            if m and m.group(1):
                num = int(m.group(1))
            else:
                anchor = TASK_ANCHOR_RE.search(source)
                if not anchor:
                    continue
                num = int(anchor.group(1))

            # Widened from 3 to 6: with the anchor form the code cell sits
            # behind an intervening "<h3>Solution</h3>" cell, and some
            # notebooks add a prose line before it.
            for nxt in cells[i + 1: i + 6]:
                if nxt.get("cell_type") == "code":
                    code = cell_source(nxt).strip()
                    # First writer wins. A task's own solution precedes any
                    # later cell that merely references it.
                    if code and num not in solutions:
                        solutions[num] = code
                    break
        break
    return solutions


def main():
    bank = {"generatedFrom": "QWorld notebooks", "topics": []}
    total = 0

    for slug, cfg in TOPICS.items():
        nb_paths = []
        for pattern in cfg["globs"]:
            nb_paths.extend(sorted(glob.glob(os.path.join(QWORLD_BASE, pattern))))
        # skip solution notebooks themselves
        nb_paths = [p for p in nb_paths if "_Solution" not in os.path.basename(p)]

        questions = []
        for nb_path in nb_paths:
            rel = os.path.relpath(nb_path, QWORLD_BASE)
            solutions = find_solutions(nb_path)
            for number, title, prompt, starter in extract_tasks(nb_path):
                questions.append({
                    "id": f"{slug}-{len(questions) + 1}",
                    "topic": slug,
                    "title": title,
                    "prompt": prompt,
                    "starterCode": starter,
                    "solution": solutions.get(number, ""),
                    "source": rel,
                })
            if len(questions) >= MAX_QUESTIONS_PER_TOPIC:
                break

        questions = questions[:MAX_QUESTIONS_PER_TOPIC]
        # difficulty tiers: first third easy, middle medium, rest complex
        n = len(questions)
        for idx, q in enumerate(questions):
            if n <= 1 or idx < n / 3:
                q["difficulty"] = "easy"
            elif idx < 2 * n / 3:
                q["difficulty"] = "medium"
            else:
                q["difficulty"] = "complex"

        bank["topics"].append({
            "slug": slug,
            "name": cfg["name"],
            "certification": cfg["cert"],
            "questionCount": n,
            "questions": questions,
        })
        total += n
        print(f"  {slug:24s} {n:3d} questions from {len(nb_paths)} notebooks")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {total} questions -> {OUTPUT_PATH}")
    return 0 if total > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
