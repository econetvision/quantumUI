r"""
Execution sandbox for learner-submitted Python.

Replaces the previous regex denylist, which was bypassable in one step:
`\bimport\s+os\b` never matches `from os import system`, and the namespace
handed to exec() carried the *real* __builtins__, so anything reachable from a
builtin was reachable from lab code.

Three layers here, in order of importance:

  1. An AST allowlist. Imports must name an approved module, and NO attribute or
     name beginning with an underscore may be referenced. That second rule is
     what actually closes the escape family — every published CPython sandbox
     break routes through a dunder (`().__class__.__base__.__subclasses__()`,
     `func.__globals__`, `obj.__reduce__`), and none of them survive it.
  2. A restricted builtins mapping. Even if a construct slips past the AST pass,
     `open`, `eval`, `exec`, `__import__` and friends are simply absent.
  3. A wall-clock deadline enforced via a per-line trace hook, so `while True:`
     terminates instead of pinning a worker forever.

This is defence in depth for a *teaching* service, not a claim of containment.
Code that must be treated as hostile still belongs in a disposable per-run
container with seccomp and no egress; see SECURITY.md.
"""

from __future__ import annotations

import ast
import builtins
import sys
import threading
from typing import Any, Callable, Dict, Iterable

# ---------------------------------------------------------------------------
# Limits
# ---------------------------------------------------------------------------

DEFAULT_TIMEOUT_SECONDS = 15.0
MAX_CODE_LENGTH = 10_000


class SandboxError(Exception):
    """Code rejected before it ran."""


class SandboxTimeout(Exception):
    """Code exceeded its wall-clock budget."""


# ---------------------------------------------------------------------------
# Layer 1 — AST allowlist
# ---------------------------------------------------------------------------

# Modules a quantum lab legitimately needs. numpy is here because essentially
# every statevector exercise uses it; it exposes no process or filesystem API.
ALLOWED_MODULES = frozenset({
    "math", "cmath", "random", "statistics", "fractions", "decimal",
    "itertools", "functools", "collections",
    "numpy", "numpy.linalg", "json",
})

# Builtins that hand back an execution primitive or a filesystem handle. Absent
# from SAFE_BUILTINS too — rejected here as well so the learner gets a clear
# message instead of a confusing NameError.
DENIED_CALLS = frozenset({
    "eval", "exec", "compile", "open", "input", "breakpoint", "help",
    "__import__", "globals", "locals", "vars", "dir",
    "getattr", "setattr", "delattr", "hasattr",
    "memoryview", "exit", "quit", "license", "credits", "copyright",
})


# Attribute names that reach the filesystem or the C/FFI layer on an otherwise
# allowed module — numpy.load with allow_pickle=True is arbitrary code execution,
# and blocking open() does nothing when the path is just an argument. Matched by
# name on any object, which is blunt but unambiguous.
DENIED_ATTRIBUTES = frozenset({
    "load", "save", "savez", "savez_compressed", "fromfile", "tofile",
    "loadtxt", "savetxt", "genfromtxt", "memmap", "DataSource",
    "ctypeslib", "f2py", "distutils", "testing", "system", "popen",
})


class _Validator(ast.NodeVisitor):
    def __init__(self) -> None:
        self.problems: list[str] = []

    def _reject(self, node: ast.AST, message: str) -> None:
        line = getattr(node, "lineno", "?")
        self.problems.append(f"line {line}: {message}")

    # -- imports ------------------------------------------------------------
    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            if alias.name.split(".")[0] not in ALLOWED_MODULES:
                self._reject(node, f"import of '{alias.name}' is not permitted here")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        # `from os import system` — the exact case the old denylist missed.
        root = (node.module or "").split(".")[0]
        if root not in ALLOWED_MODULES:
            self._reject(
                node, f"import from '{node.module or '.'}' is not permitted here"
            )
        self.generic_visit(node)

    # -- the dunder rule ----------------------------------------------------
    def visit_Attribute(self, node: ast.Attribute) -> None:
        if node.attr.startswith("_"):
            self._reject(node, f"access to private attribute '{node.attr}' is blocked")
        elif node.attr in DENIED_ATTRIBUTES:
            self._reject(node, f"'.{node.attr}' reaches the filesystem and is blocked")
        self.generic_visit(node)

    def visit_Name(self, node: ast.Name) -> None:
        if node.id.startswith("__"):
            self._reject(node, f"reference to '{node.id}' is blocked")
        self.generic_visit(node)

    # -- dangerous calls ----------------------------------------------------
    def visit_Call(self, node: ast.Call) -> None:
        func = node.func
        if isinstance(func, ast.Name) and func.id in DENIED_CALLS:
            self._reject(node, f"'{func.id}()' is not available in this sandbox")
        # type('X', (object,), {}) is a class definition wearing a disguise, and
        # its dict keys are strings, so dunder methods could be declared without
        # ever writing a dunder *access*.
        if isinstance(func, ast.Name) and func.id == "type" and len(node.args) == 3:
            self._reject(node, "three-argument type() creates a class and is blocked")
        self.generic_visit(node)

    # -- misc escapes -------------------------------------------------------
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        # Subclassing lets you override __init_subclass__/__set_name__ and reach
        # the type machinery without ever writing a dunder *access*.
        self._reject(node, "class definitions are not permitted in this sandbox")
        self.generic_visit(node)

    def visit_Global(self, node: ast.Global) -> None:
        self._reject(node, "'global' is not permitted in this sandbox")

    def visit_Nonlocal(self, node: ast.Nonlocal) -> None:
        self._reject(node, "'nonlocal' is not permitted in this sandbox")


def validate_code(code: str) -> ast.Module:
    """
    Parse and statically check learner code.

    Returns the parsed tree so callers do not pay for a second parse.
    Raises SandboxError listing every problem found, not just the first — a
    learner fixing one blocked line at a time is a miserable experience.
    """
    if len(code) > MAX_CODE_LENGTH:
        raise SandboxError(f"Code too long (max {MAX_CODE_LENGTH} characters).")

    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as exc:
        raise SandboxError(f"SyntaxError: {exc.msg} (line {exc.lineno})") from exc

    validator = _Validator()
    validator.visit(tree)
    if validator.problems:
        raise SandboxError(
            "Blocked for safety:\n  " + "\n  ".join(validator.problems)
        )
    return tree


# ---------------------------------------------------------------------------
# Layer 2 — restricted builtins
# ---------------------------------------------------------------------------

_SAFE_BUILTIN_NAMES: Iterable[str] = (
    # output and introspection that cannot escape
    "print", "repr", "format", "len", "id", "hash",
    # numbers
    "abs", "round", "min", "max", "sum", "pow", "divmod",
    "int", "float", "complex", "bool",
    # sequences and iteration
    "list", "dict", "set", "tuple", "frozenset", "str", "bytes",
    "range", "enumerate", "zip", "map", "filter", "sorted", "reversed",
    "any", "all", "iter", "next", "slice",
    # types and predicates
    "isinstance", "issubclass", "type", "callable",
    # exceptions the learner may legitimately raise or catch
    "Exception", "BaseException", "ValueError", "TypeError", "KeyError",
    "IndexError", "AttributeError", "ZeroDivisionError", "ArithmeticError",
    "RuntimeError", "StopIteration", "NotImplementedError", "AssertionError",
    "OverflowError", "NameError",
    # constants
    "True", "False", "None", "NotImplemented", "Ellipsis",
)


def safe_builtins() -> Dict[str, Any]:
    """A fresh restricted builtins mapping. Fresh so callers cannot poison it."""
    table: Dict[str, Any] = {}
    for name in _SAFE_BUILTIN_NAMES:
        if hasattr(builtins, name):
            table[name] = getattr(builtins, name)
    # Some libraries probe __name__ on the namespace; give them a harmless one.
    table["__name__"] = "__sandbox__"
    return table


# ---------------------------------------------------------------------------
# Layer 3 — wall-clock deadline
# ---------------------------------------------------------------------------

def run_with_timeout(
    fn: Callable[[], Any],
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> Any:
    """
    Run `fn` on a worker thread, interrupting it if it overruns `timeout`.

    The interrupt is a per-line trace hook that raises inside the worker, which
    is what makes `while True: pass` terminable — a plain `Thread.join(timeout)`
    would return control while the runaway thread kept burning CPU forever.

    Tracing costs roughly 2-3x on tight loops. That is an acceptable price for
    lab-sized code, and it is the only interruption mechanism that works off the
    main thread (signal.setitimer does not).
    """
    deadline = threading.Event()
    box: Dict[str, Any] = {}

    def _tracer(frame, event, arg):  # noqa: ANN001 - CPython trace protocol
        if deadline.is_set():
            raise SandboxTimeout(
                f"Execution exceeded {timeout:.0f}s and was stopped."
            )
        return _tracer

    def _worker() -> None:
        sys.settrace(_tracer)
        try:
            box["value"] = fn()
        except BaseException as exc:  # noqa: BLE001 - relayed to the caller
            box["error"] = exc
        finally:
            sys.settrace(None)

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        deadline.set()
        # Give the trace hook a moment to fire on the next line executed.
        thread.join(2.0)
        raise SandboxTimeout(f"Execution exceeded {timeout:.0f}s and was stopped.")

    if "error" in box:
        raise box["error"]
    return box.get("value")
