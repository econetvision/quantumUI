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


# Modules a learner plausibly reaches for that this environment does not carry.
# Refusing them with the same wording used for `os` and `subprocess` reads as an
# accusation and tells the reader nothing: much of the QWorld lab material was
# written against Cirq, so people paste a published solution, get "not permitted
# here", and reasonably conclude the lab is broken. Name the substitute instead.
_SDK_HINT = (
    "this environment runs the QpiAI Quantum SDK. `Circuit` is already defined "
    "— delete the import and use it directly, e.g. `c = Circuit(2, 2)`"
)
_IMPORT_GUIDANCE = {
    # main.strip_sdk_imports() removes these before validation, so they should
    # never reach here. Kept so that if a future call site forgets to strip,
    # the learner still gets the substitute rather than a bare refusal.
    "qpiai_quantum": _SDK_HINT,
    "qiskit": _SDK_HINT,
    "cirq": _SDK_HINT,
    "cirq_web": "3-D Bloch rendering is not available here; `run()` returns bloch_vectors and the app draws them for you",
    "pennylane": _SDK_HINT,
    "braket": _SDK_HINT,
    "pyquil": _SDK_HINT,
    "projectq": _SDK_HINT,
    "matplotlib": "plotting is not available here; the circuit diagram, measurement counts and Bloch vectors come back with the result automatically",
    "seaborn": "plotting is not available here; results are rendered by the app",
    "pandas": "not available here — use plain lists and dicts, or numpy",
    "scipy": "not available here — numpy is, and covers the linear algebra these labs need",
}


def _import_message(name: str, root: str) -> str:
    """Explain a rejected import, with a way forward when there is one."""
    hint = _IMPORT_GUIDANCE.get(root)
    if hint:
        return f"'{name}' is not available — {hint}"
    return (
        f"import of '{name}' is not permitted here — only "
        f"{', '.join(sorted(ALLOWED_MODULES))} are available"
    )


class _Validator(ast.NodeVisitor):
    def __init__(self) -> None:
        self.problems: list[str] = []

    def _reject(self, node: ast.AST, message: str) -> None:
        line = getattr(node, "lineno", "?")
        self.problems.append(f"line {line}: {message}")

    # -- imports ------------------------------------------------------------
    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            root = alias.name.split(".")[0]
            if root not in ALLOWED_MODULES:
                self._reject(node, _import_message(alias.name, root))
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        # `from os import system` — the exact case the old denylist missed.
        root = (node.module or "").split(".")[0]
        if root not in ALLOWED_MODULES:
            self._reject(node, _import_message(node.module or ".", root))
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


def _guarded_import(
    name: str,
    globals: Any = None,
    locals: Any = None,
    fromlist: Any = (),
    level: int = 0,
) -> Any:
    """
    `__import__` restricted to ALLOWED_MODULES.

    Without this the allowlist was decorative. `import math` passed the AST
    check, then died at run time with "ImportError: __import__ not found",
    because the restricted builtins table had no __import__ at all — so every
    module the sandbox advertises as available was in fact unusable, and 22 of
    the shipped lab solutions failed on their first line.

    This is the second gate, not the only one: the AST validator has already
    rejected disallowed imports before any of this executes. It repeats the
    check because a bare `exec` of an allowed module's own internals could
    otherwise reach further than intended.
    """
    root = name.split(".")[0]
    if level != 0:
        # Relative import — there is no package here to be relative to.
        raise ImportError("relative imports are not permitted here")
    if root not in ALLOWED_MODULES:
        raise ImportError(_import_message(name, root))
    return builtins.__import__(name, globals, locals, fromlist, level)


def safe_builtins() -> Dict[str, Any]:
    """A fresh restricted builtins mapping. Fresh so callers cannot poison it."""
    table: Dict[str, Any] = {}
    for name in _SAFE_BUILTIN_NAMES:
        if hasattr(builtins, name):
            table[name] = getattr(builtins, name)
    # Not from _SAFE_BUILTIN_NAMES: the real __import__ would hand back `os`.
    # This one only resolves what ALLOWED_MODULES already permits.
    table["__import__"] = _guarded_import
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
