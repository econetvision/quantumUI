"""
Declarative catalogue of the SDK's algorithms and state generators.

Each entry carries a parameter schema so the frontend can render a form without
hardcoding anything about a given algorithm — add an entry here and it shows up
in the UI. Every SDK class in this catalogue shares the same shape
(`build_circuit()` / `get_info()` / `run()` / `to_qasm()`), which is what makes
the generic runner below possible.

Entries also declare an `insight` hook: the algorithm-specific result that makes
the run educational (the factors Shor found, the string Bernstein-Vazirani
recovered, whether a Deutsch-Jozsa oracle was constant or balanced).
"""

from __future__ import annotations

import math
from typing import Any, Callable, Optional

import qpiai_bridge


# ---------------------------------------------------------------------------
# Parameter schema helpers
# ---------------------------------------------------------------------------


def _int(name: str, label: str, default: int, minimum: int, maximum: int, help_text: str = "") -> dict[str, Any]:
    return {
        "name": name,
        "label": label,
        "type": "int",
        "default": default,
        "min": minimum,
        "max": maximum,
        "help": help_text,
    }


def _choice(name: str, label: str, default: Any, choices: list[Any], help_text: str = "") -> dict[str, Any]:
    return {
        "name": name,
        "label": label,
        "type": "choice",
        "default": default,
        "choices": choices,
        "help": help_text,
    }


def _bitstring(name: str, label: str, default: str, help_text: str = "") -> dict[str, Any]:
    return {
        "name": name,
        "label": label,
        "type": "bitstring",
        "default": default,
        "help": help_text,
    }


def _bool(name: str, label: str, default: bool, help_text: str = "") -> dict[str, Any]:
    return {
        "name": name,
        "label": label,
        "type": "bool",
        "default": default,
        "help": help_text,
    }


# ---------------------------------------------------------------------------
# Insight extractors — the "what did we learn" line for each algorithm
# ---------------------------------------------------------------------------


def _safe(fn: Callable[[], Any]) -> Any:
    try:
        return qpiai_bridge._jsonable(fn())
    except Exception:
        return None


def _grover_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {
        "target": getattr(instance, "target", None),
        "success_probability": _safe(instance.get_success_probability),
    }


def _shor_insight(instance: Any, _result: Any) -> dict[str, Any]:
    """
    Report the factors Shor recovered.

    `instance.find_period(a)` is deliberately not surfaced: on qpiai-quantum
    0.2.0 it returns 1 for N=15, a=7 whose true period is 4 — the measurement
    peaks (0, 4, 8, 12 over a 4-qubit counting register) show the correct
    period, so the helper is unreliable rather than the circuit. Showing a wrong
    period on a teaching platform is worse than showing none.
    """
    return {
        "factors": _safe(instance.factor),
        "base_a": getattr(instance, "_quantumui_a", None),
    }


def _dj_insight(instance: Any, result: Any) -> dict[str, Any]:
    counts = qpiai_bridge._call(result, "get_counts") or {}
    out: dict[str, Any] = {"theoretical": _safe(instance.get_theoretical_result)}
    try:
        out["determined"] = qpiai_bridge._jsonable(instance.interpret_result(dict(counts)))
    except Exception:
        out["determined"] = _safe(instance.determine_function_type)
    return out


def _bv_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {
        "hidden_string": getattr(instance, "hidden_string", None),
        "recovered": _safe(instance.find_hidden_string),
    }


def _simon_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {
        "hidden_string": getattr(instance, "hidden_string", None),
        "recovered": _safe(instance.find_hidden_string),
    }


def _qrng_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {"value": _safe(instance.generate)}


def _entanglement_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {
        "expected_outcomes": _safe(instance.get_expected_outcomes),
        "entangled": _safe(instance.verify_entanglement),
    }


def _cluster_insight(instance: Any, _result: Any) -> dict[str, Any]:
    return {
        "expected_outcomes": _safe(instance.get_expected_outcomes),
        "circuit_depth": _safe(instance.get_circuit_depth),
    }


# ---------------------------------------------------------------------------
# The catalogue
# ---------------------------------------------------------------------------

#: id -> spec. `factory` receives validated params and returns an SDK instance.
CATALOG: dict[str, dict[str, Any]] = {
    # --- Search & factoring -------------------------------------------------
    "grover": {
        "id": "grover",
        "name": "Grover's Search",
        "category": "Search & Factoring",
        "summary": "Finds a marked item in an unstructured set with quadratic speedup.",
        "detail": "Amplitude amplification rotates the state toward the target across ~√N iterations.",
        "params": [
            _int("num_qubits", "Qubits", 3, 2, 8, "Search space is 2^n items."),
            _bitstring("target", "Target state", "101", "Bitstring to search for; length must match qubits."),
        ],
        # qpiai-quantum 0.2.0 is not self-consistent about bit ordering: Grover
        # reports counts reversed relative to the target you asked for (search
        # "110", get "011"), while Bernstein-Vazirani and Simon report in the
        # same order as their input. Verified per algorithm on the local
        # simulator — hence a per-entry flag rather than a global setting.
        "insight": _grover_insight,
    },
    "shor": {
        "id": "shor",
        "name": "Shor's Factoring",
        "category": "Search & Factoring",
        "summary": "Factors an integer in polynomial time via quantum period finding.",
        "detail": "Reduces factoring to finding the period of a^x mod N, which the QFT extracts efficiently.",
        "params": [
            _int("N", "Number to factor", 15, 4, 91, "Small composite — 15, 21, 33, 35 work well."),
            _int("a", "Base (a)", 7, 2, 90, "Must share no factor with N. The period of a^x mod N is what gets measured."),
            _int("precision_qubits", "Precision qubits", 4, 2, 8, "Counting register width — more qubits, sharper period estimate."),
        ],
        # Unlike every other entry, ShorsAlgorithm splits its arguments: N goes
        # to the constructor while `a` and `precision_qubits` are required by
        # build_circuit(). `build_params` marks which ones to hold back.
        "build_params": ["a", "precision_qubits"],
        "insight": _shor_insight,
    },
    # --- Transforms & estimation -------------------------------------------
    "qft": {
        "id": "qft",
        "name": "Quantum Fourier Transform",
        "category": "Transforms & Estimation",
        "summary": "The quantum analogue of the discrete Fourier transform.",
        "detail": "Maps between computational and frequency bases; the engine behind Shor and phase estimation.",
        "params": [
            _int("num_qubits", "Qubits", 3, 1, 8),
            _bool("inverse", "Inverse QFT", False, "Apply QFT† instead."),
        ],
        "insight": None,
    },
    "qpe": {
        "id": "qpe",
        "name": "Quantum Phase Estimation",
        "category": "Transforms & Estimation",
        "summary": "Estimates the eigenvalue phase of a unitary operator.",
        "detail": "More precision qubits means a finer estimate of the phase φ in e^(2πiφ).",
        "params": [
            _int("precision_qubits", "Precision qubits", 3, 1, 8, "Controls how many bits of φ you recover."),
            _int("eigenstate_qubits", "Eigenstate qubits", 1, 1, 4),
        ],
        "insight": lambda inst, _res: {"theoretical_phase": _safe(inst.get_theoretical_phase)},
    },
    # --- Oracle problems ----------------------------------------------------
    "deutsch-jozsa": {
        "id": "deutsch-jozsa",
        "name": "Deutsch-Jozsa",
        "category": "Oracle Problems",
        "summary": "Decides constant vs balanced in a single query.",
        "detail": "Classically needs 2^(n-1)+1 queries in the worst case; quantum needs exactly one.",
        "params": [
            _int("num_qubits", "Qubits", 3, 1, 8),
            _choice(
                "oracle_type",
                "Oracle type",
                "balanced",
                ["constant_zero", "constant_one", "balanced"],
            ),
        ],
        "insight": _dj_insight,
    },
    "bernstein-vazirani": {
        "id": "bernstein-vazirani",
        "name": "Bernstein-Vazirani",
        "category": "Oracle Problems",
        "summary": "Recovers a hidden bitstring in one query.",
        "detail": "Classically needs n queries to learn n bits; quantum needs one.",
        "params": [
            _int("num_qubits", "Qubits", 3, 1, 8),
            _bitstring("hidden_string", "Hidden string", "101", "Length must match qubit count."),
        ],
        "insight": _bv_insight,
    },
    "simon": {
        "id": "simon",
        "name": "Simon's Algorithm",
        "category": "Oracle Problems",
        "summary": "Finds a hidden XOR period exponentially faster than any classical method.",
        "detail": "The separation that inspired Shor's algorithm.",
        "params": [
            _int("num_qubits", "Qubits", 3, 2, 6),
            _bitstring("hidden_string", "Hidden period", "110", "Length must match qubit count."),
        ],
        "insight": _simon_insight,
    },
    # --- Entangled states ---------------------------------------------------
    "bell": {
        "id": "bell",
        "name": "Bell State",
        "category": "Entangled States",
        "summary": "The canonical two-qubit maximally entangled pair.",
        "detail": "Measuring one qubit instantly determines the other — the heart of the EPR argument.",
        "params": [
            _choice("state_type", "Bell state", "|Φ+>", ["|Φ+>", "|Φ->", "|Ψ+>", "|Ψ->"]),
        ],
        "insight": _entanglement_insight,
    },
    "ghz": {
        "id": "ghz",
        "name": "GHZ State",
        "category": "Entangled States",
        "summary": "Multi-qubit maximal entanglement: |00…0⟩ + |11…1⟩.",
        "detail": "Fragile — losing a single qubit destroys the entanglement entirely.",
        "params": [_int("num_qubits", "Qubits", 3, 2, 10)],
        "insight": _entanglement_insight,
    },
    "w": {
        "id": "w",
        "name": "W State",
        "category": "Entangled States",
        "summary": "Symmetric single-excitation entanglement.",
        "detail": "Unlike GHZ, entanglement survives the loss of a qubit — a robustness tradeoff.",
        "params": [_int("num_qubits", "Qubits", 3, 2, 8)],
        "insight": _entanglement_insight,
    },
    "cluster": {
        "id": "cluster",
        "name": "Cluster State",
        "category": "Entangled States",
        "summary": "Graph state used as the substrate for measurement-based computing.",
        "detail": "Prepare once, then compute purely by choosing measurement bases.",
        "params": [_int("num_qubits", "Qubits", 4, 2, 10)],
        "insight": _cluster_insight,
    },
    # --- Utilities ----------------------------------------------------------
    "qrng": {
        "id": "qrng",
        "name": "Quantum RNG",
        "category": "Utilities",
        "summary": "True randomness sourced from measurement, not a PRNG seed.",
        "detail": "Hadamards put every qubit in superposition; measurement collapses them unpredictably.",
        "params": [_int("n_bits", "Bits", 8, 1, 16)],
        "insight": _qrng_insight,
    },
}


# qpiai-quantum 0.2.0 has the Bell basis labels transposed: asking it for
# "|Φ+>" builds (|01>+|10>)/√2, which is textbook |Ψ+>, and vice versa. Verified
# against all four states on the local simulator. Since this platform teaches
# the Bell basis, we correct the label at the boundary rather than propagate the
# error to learners — the user-facing name is standard, and we swap Φ↔Ψ on the
# way into the SDK. Drop this once upstream fixes the labelling.
_SDK_BELL_LABEL = {
    "|Φ+>": "|Ψ+>",
    "|Φ->": "|Ψ->",
    "|Ψ+>": "|Φ+>",
    "|Ψ->": "|Φ->",
}


def _bell_factory(state_type: str = "|Φ+>"):
    import qpiai_quantum as q

    return q.BellStateGenerator(_SDK_BELL_LABEL.get(state_type, state_type))


def _factories() -> dict[str, Callable[..., Any]]:
    """SDK constructors, imported lazily so the catalogue is importable without the SDK."""
    import qpiai_quantum as q
    from qpiai_quantum.algorithms.phase_estimation import QuantumPhaseEstimation

    return {
        "grover": q.GroverSearch,
        "shor": q.ShorsAlgorithm,
        "qft": q.QFT,
        "qpe": QuantumPhaseEstimation,
        "deutsch-jozsa": q.DeutschJozsa,
        "bernstein-vazirani": q.BernsteinVazirani,
        "simon": q.SimonAlgorithm,
        "bell": _bell_factory,
        "ghz": q.GHZStateGenerator,
        "w": q.WStateGenerator,
        "cluster": q.ClusterStateGenerator,
        "qrng": q.QRNG,
    }


def list_algorithms() -> list[dict[str, Any]]:
    """Catalogue entries as plain JSON (drops the Python-only `insight` hook)."""
    return [
        {k: v for k, v in spec.items() if k != "insight"}
        for spec in CATALOG.values()
    ]


def coerce_params(spec: dict[str, Any], raw: dict[str, Any]) -> dict[str, Any]:
    """
    Validate and coerce user-supplied params against the schema.

    Raises ValueError with a user-facing message — the API layer turns that into
    a 400 rather than letting a bad cast surface as a 500.
    """
    params: dict[str, Any] = {}

    for field in spec["params"]:
        name = field["name"]
        value = raw.get(name, field["default"])

        if field["type"] == "int":
            try:
                value = int(value)
            except (TypeError, ValueError):
                raise ValueError(f"{field['label']} must be a whole number.")
            if not (field["min"] <= value <= field["max"]):
                raise ValueError(
                    f"{field['label']} must be between {field['min']} and {field['max']}."
                )

        elif field["type"] == "bool":
            value = bool(value)

        elif field["type"] == "choice":
            if value not in field["choices"]:
                raise ValueError(
                    f"{field['label']} must be one of: {', '.join(map(str, field['choices']))}."
                )

        elif field["type"] == "bitstring":
            value = str(value).strip()
            if not value or any(c not in "01" for c in value):
                raise ValueError(f"{field['label']} must contain only 0s and 1s.")

        params[name] = value

    # Bitstring length has to agree with the register width, otherwise the SDK
    # raises deep inside circuit construction with an opaque message.
    qubit_key = next(
        (f["name"] for f in spec["params"] if f["name"] in ("num_qubits", "n_bits")),
        None,
    )
    if qubit_key:
        width = params[qubit_key]
        for field in spec["params"]:
            if field["type"] == "bitstring" and len(params[field["name"]]) != width:
                raise ValueError(
                    f"{field['label']} must be exactly {width} bits to match the qubit count."
                )

    # Shor only works when the base shares no factor with N — otherwise gcd(a, N)
    # already *is* a factor and the quantum part is pointless. Checking here
    # gives a teachable message instead of a confusing run.
    if "N" in params and "a" in params:
        n_value, a_value = params["N"], params["a"]
        if a_value >= n_value:
            raise ValueError(f"Base (a) must be smaller than N ({n_value}).")
        if math.gcd(a_value, n_value) != 1:
            common = math.gcd(a_value, n_value)
            raise ValueError(
                f"Base (a) must be coprime with N. gcd({a_value}, {n_value}) = {common}, "
                f"so {common} is already a factor — no quantum computation needed. "
                f"Pick a base that shares no factor with N."
            )

    return params


def run_algorithm(
    algorithm_id: str,
    raw_params: dict[str, Any],
    shots: int = 1024,
    backend: Optional[str] = None,
) -> dict[str, Any]:
    """Instantiate, build, run and summarise a catalogue algorithm."""
    spec = CATALOG.get(algorithm_id)
    if spec is None:
        raise ValueError(f"Unknown algorithm: {algorithm_id}")

    if qpiai_bridge.sdk_module() is None:
        raise RuntimeError(
            "The QpiAI Quantum SDK is not installed, so the algorithm catalogue "
            "is unavailable. Install it with: pip install qpiai-quantum"
        )

    params = coerce_params(spec, raw_params)
    device, notice = qpiai_bridge.resolve_device(backend)

    # Most classes take everything in the constructor; a few (Shor) require some
    # arguments at build_circuit() time instead.
    build_names = spec.get("build_params", [])
    build_args = {name: params[name] for name in build_names if name in params}
    init_args = {k: v for k, v in params.items() if k not in build_args}

    instance = _factories()[algorithm_id](**init_args)

    # Every class in this catalogue requires build_circuit() before run() — the
    # SDK raises "Circuit not built" otherwise. A failure here is fatal, not
    # something to swallow.
    try:
        circuit = instance.build_circuit(**build_args)
    except TypeError as exc:
        raise ValueError(
            f"{spec['name']} could not be built with the given parameters: {exc}"
        ) from exc

    # Stash the base so the Shor insight hook can recover the period with it.
    if "a" in build_args:
        instance._quantumui_a = build_args["a"]

    result = instance.run(
        shots=shots,
        experiment_name=f"QuantumUI · {spec['name']}",
        need_statevector=True,
        device_name=device,
        # Canonical ordering for every algorithm -- see the note in
        # qpiai_bridge.get_circuit_class. This path builds circuits directly
        # rather than through PinnedCircuit, so it sets the same default here.
        reverse_bits=spec.get("reverse_bits", True),
    )

    payload: dict[str, Any] = {
        "success": True,
        "algorithm": {
            "id": spec["id"],
            "name": spec["name"],
            "category": spec["category"],
            "summary": spec["summary"],
            "detail": spec["detail"],
        },
        "params": qpiai_bridge._jsonable(params),
        "backend": device,
        "notice": notice,
        "info": qpiai_bridge._jsonable(_safe(instance.get_info)),
    }
    payload.update(qpiai_bridge.extract_result(result))

    if circuit is not None:
        payload["circuit"] = qpiai_bridge.circuit_metadata(circuit)
        diagram = qpiai_bridge.circuit_text_diagram(circuit)
        if diagram:
            payload["circuit_diagram"] = diagram

    hook = spec.get("insight")
    if hook is not None:
        try:
            payload["insight"] = hook(instance, result)
        except Exception:
            payload["insight"] = None

    return payload
