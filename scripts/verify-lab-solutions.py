#!/usr/bin/env python3
"""
Run every lab solution against the executor and report which ones work.

A solution that does not execute is worse than no solution: the learner
copies it, presses enter, and concludes the lab is broken. This is the
check that stops that shipping.

  EXECUTOR_URL=... EXECUTOR_API_KEY=... python3 scripts/verify-lab-solutions.py
  ... --only-missing        # verify a candidate file instead of the bank
  ... --candidates FILE     # JSON {id: code} to test before writing them in
"""
from __future__ import annotations
import argparse, json, os, sys, time, urllib.request, urllib.error

BANK = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "src", "data", "labs", "lab-questions.json")
URL = os.environ.get("EXECUTOR_URL", "").rstrip("/")
KEY = os.environ.get("EXECUTOR_API_KEY", "")
PACE = float(os.environ.get("PACE_SECONDS", "2.2"))   # executor allows 30/min


def run(code: str, timeout: int = 60):
    body = json.dumps({"code": code, "shots": 128}).encode()
    req = urllib.request.Request(f"{URL}/execute", data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "X-Executor-Key": KEY})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"success": False, "error": f"HTTP {e.code}: {e.read()[:200].decode(errors='replace')}"}
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {e}"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if not URL or not KEY:
        print("EXECUTOR_URL and EXECUTOR_API_KEY must be set", file=sys.stderr)
        return 2

    if args.candidates:
        items = list(json.load(open(args.candidates)).items())
    else:
        bank = json.load(open(BANK))
        items = [(q["id"], q.get("solution") or "")
                 for t in bank["topics"] for q in t["questions"]
                 if (q.get("solution") or "").strip()]
    if args.limit:
        items = items[: args.limit]

    ok, bad = [], []
    for i, (qid, code) in enumerate(items, 1):
        res = run(code)
        if res.get("success"):
            ok.append(qid)
            print(f"  [{i}/{len(items)}] PASS {qid}")
        else:
            err = (res.get("error") or "").strip().replace("\n", " ")[:110]
            bad.append((qid, err))
            print(f"  [{i}/{len(items)}] FAIL {qid}: {err}")
        sys.stdout.flush()
        time.sleep(PACE)

    print(f"\npassed={len(ok)}  failed={len(bad)}  of {len(items)}")
    if bad:
        out = os.path.join(os.path.dirname(BANK), "..", "..", "..", "failing-solutions.json")
        json.dump(dict(bad), open("/tmp/failing-solutions.json", "w"), indent=2)
        print("failing ids -> /tmp/failing-solutions.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
