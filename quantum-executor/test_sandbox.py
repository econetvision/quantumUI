"""
Security regression tests for the execution sandbox.

These exist because the sandbox they replaced looked correct and was not: a
regex denylist blocking `import os` never matched `from os import system`. Every
escape below was reachable before sandbox.py existed. If one of these starts
passing, the service is executing hostile code again.

Run: python -m pytest test_sandbox.py -q   (or: python test_sandbox.py)
"""

from __future__ import annotations

import sandbox

# Each entry is code that MUST be refused before execution.
ESCAPES = [
    # The bypass that defeated the old denylist outright.
    "from os import system",
    "from subprocess import run",
    "from shutil import rmtree",
    "import os",
    "import sys",
    "import socket",
    # The classic type-graph walk, in its usual spellings.
    "().__class__.__base__.__subclasses__()",
    "[].__class__.__mro__[1].__subclasses__()",
    "(lambda: 0).__globals__['__builtins__']",
    "''.__class__.__mro__[1].__subclasses__()",
    # Builtins that hand back an execution primitive.
    "eval('1+1')",
    "exec('x=1')",
    "compile('1', '<s>', 'eval')",
    "open('/etc/passwd')",
    "breakpoint()",
    "__import__('os')",
    "getattr(object, '__subclasses__')()",
    "vars(object)",
    "globals()",
    # String-keyed getattr equivalents — these take the attribute name as data,
    # so an AST attribute check alone would not see them.
    "import operator",
    "import typing",
    # Class creation, both spellings, since a class body can declare dunders
    # without ever writing a dunder access.
    "class Evil:\n    pass",
    "type('Evil', (object,), {})",
    # numpy is allowed, but not its filesystem surface.
    "import numpy as np\nnp.load('/etc/passwd')",
    "import numpy as np\nnp.save('/tmp/x', [1])",
]

# Code a learner legitimately writes. A sandbox that blocks these is useless.
LEGITIMATE = [
    "print('hello')",
    "import math\nprint(math.sqrt(2))",
    "import numpy as np\nprint(np.array([1, 2]).sum())",
    "counts = {'00': 512, '11': 512}\nprint(sorted(counts.items()))",
    "def bell():\n    return [1, 0, 0, 1]\nprint(bell())",
    "for i in range(3):\n    print(i ** 2)",
    "x = [i for i in range(5) if i % 2 == 0]\nprint(x)",
    "import random\nprint(len([random.random() for _ in range(3)]))",
]


def test_escapes_are_blocked() -> None:
    leaked = []
    for code in ESCAPES:
        try:
            sandbox.validate_code(code)
            leaked.append(code)
        except sandbox.SandboxError:
            pass
    assert not leaked, "sandbox escape reachable:\n" + "\n".join(f"  {c!r}" for c in leaked)


def test_legitimate_code_is_allowed() -> None:
    rejected = []
    for code in LEGITIMATE:
        try:
            sandbox.validate_code(code)
        except sandbox.SandboxError as exc:
            rejected.append(f"{code!r}: {exc}")
    assert not rejected, "false positives:\n" + "\n".join(f"  {r}" for r in rejected)


def test_restricted_builtins_lack_escape_hatches() -> None:
    table = sandbox.safe_builtins()
    for name in ("open", "eval", "exec", "compile", "__import__", "getattr", "input"):
        assert name not in table, f"{name} is reachable from the sandbox namespace"
    # ...while the things lab code actually needs are present.
    for name in ("print", "len", "range", "sum", "sorted", "abs"):
        assert name in table, f"{name} missing — legitimate code would break"


def test_runaway_loop_is_interrupted() -> None:
    namespace = {"__builtins__": sandbox.safe_builtins()}
    code = compile("while True:\n    pass", "<test>", "exec")
    try:
        sandbox.run_with_timeout(lambda: exec(code, namespace), timeout=2.0)
    except sandbox.SandboxTimeout:
        return
    raise AssertionError("an infinite loop ran to completion — the deadline is not firing")


if __name__ == "__main__":
    for fn in (
        test_escapes_are_blocked,
        test_legitimate_code_is_allowed,
        test_restricted_builtins_lack_escape_hatches,
        test_runaway_loop_is_interrupted,
    ):
        fn()
        print(f"  ok  {fn.__name__}")
    print(f"\n{len(ESCAPES)} escapes blocked, {len(LEGITIMATE)} legitimate programs allowed.")
