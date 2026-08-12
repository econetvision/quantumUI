"""
Demo-mode fallback used when the QpiAI Quantum SDK isn't installed.

This exists so the frontend stays usable in a bare checkout — it is *not* a
simulator. It pattern-matches the gates applied and returns the textbook
distribution for a few common circuits. Anything it returns is labelled as
simulated in the API response so the UI never presents it as a real run.
"""

from __future__ import annotations

import random
from typing import Dict


class MockCircuit:
    """Minimal Circuit stand-in covering the gates the lessons use."""

    def __init__(self, n_qubits: int, n_cbits: int | None = None):
        self.n_qubits = n_qubits
        self.n_cbits = n_cbits if n_cbits is not None else n_qubits
        self.operations: list[tuple] = []

    # --- gates ------------------------------------------------------------

    def _single(self, label: str, qubit: int):
        self.operations.append((label, qubit))
        return self

    def h(self, qubit: int):
        return self._single("H", qubit)

    def x(self, qubit: int):
        return self._single("X", qubit)

    def y(self, qubit: int):
        return self._single("Y", qubit)

    def z(self, qubit: int):
        return self._single("Z", qubit)

    def s(self, qubit: int):
        return self._single("S", qubit)

    def t(self, qubit: int):
        return self._single("T", qubit)

    def cx(self, control: int, target: int):
        self.operations.append(("CX", control, target))
        return self

    def cz(self, control: int, target: int):
        self.operations.append(("CZ", control, target))
        return self

    def measure(self, qubits, cbits):
        if isinstance(qubits, int):
            qubits = [qubits]
        if isinstance(cbits, int):
            cbits = [cbits]
        self.operations.append(("M", list(qubits), list(cbits)))
        return self

    def measure_all(self):
        return self.measure(list(range(self.n_qubits)), list(range(self.n_cbits)))

    def barrier(self, *_args, **_kwargs):
        return self

    # --- introspection ----------------------------------------------------

    def depth(self) -> int:
        return len(self.operations)

    def size(self) -> int:
        return len(self.operations)

    def show(self):
        diagram = self._ascii_diagram()
        print(diagram)
        return diagram

    def _ascii_diagram(self) -> str:
        """Named to match what `qpiai_bridge.circuit_text_diagram` looks for."""
        lines = []
        for q in range(self.n_qubits):
            line = f"q_{q}: ─"
            for op in self.operations:
                if op[0] == "M":
                    line += "─[M]─" if q in op[1] else "─────"
                elif op[0] in ("CX", "CZ"):
                    if op[1] == q:
                        line += "──●──"
                    elif op[2] == q:
                        line += "─[X]─" if op[0] == "CX" else "──●──"
                    else:
                        line += "─────"
                elif op[1] == q:
                    line += f"─[{op[0]}]─"
                else:
                    line += "─────"
            lines.append(line + "─")
        lines.append(f"c: {self.n_cbits}/{'═' * 10}")
        return "\n".join(lines)

    def __str__(self) -> str:
        return self._ascii_diagram()

    # --- execution --------------------------------------------------------

    def run(self, shots: int = 1024, **_kwargs):
        return MockJobResult(self, shots)


class MockJobResult:
    """Textbook outcome distributions for the handful of circuits we recognise."""

    def __init__(self, circuit: MockCircuit, shots: int):
        self.circuit = circuit
        self.shots = shots
        self.n_qubits = circuit.n_qubits
        self.n_cbits = circuit.n_cbits
        self._counts = self._simulate()

    def _simulate(self) -> Dict[str, int]:
        ops = self.circuit.operations
        has_h = any(op[0] == "H" for op in ops)
        has_x = any(op[0] == "X" for op in ops)
        has_cx = any(op[0] == "CX" for op in ops)
        n = self.n_qubits

        if has_h and has_cx and n >= 2:
            # Bell / GHZ: correlated all-zeros or all-ones
            zeros = self.shots // 2 + random.randint(-20, 20)
            return {"0" * n: zeros, "1" * n: self.shots - zeros}
        if has_h:
            zeros = self.shots // 2 + random.randint(-30, 30)
            if n == 1:
                return {"0": zeros, "1": self.shots - zeros}
            return {"0" * n: zeros, "1" + "0" * (n - 1): self.shots - zeros}
        if has_x:
            return {"1" * n: self.shots}
        return {"0" * n: self.shots}

    def get_counts(self) -> Dict[str, int]:
        return self._counts

    def get_probabilities(self) -> Dict[str, float]:
        return {k: v / self.shots for k, v in self._counts.items()}

    def get_statevector(self):
        return None
