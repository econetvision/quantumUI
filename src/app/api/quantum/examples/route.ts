import { NextResponse } from 'next/server';

export interface QuantumExample {
  name: string;
  description: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const EXAMPLES: QuantumExample[] = [
  {
    name: 'Superposition',
    description: 'Create a qubit in superposition using the Hadamard gate',
    difficulty: 'beginner',
    code: `from qpiai_quantum import Circuit

# Create a single qubit circuit
circuit = Circuit(1, 1)

# Apply Hadamard gate to create |+⟩ state
# This puts the qubit in equal superposition of |0⟩ and |1⟩
circuit.h(0)

# Measure the qubit
circuit.measure(0, 0)

# Display the circuit
circuit.show()

# Run the simulation
job_result = circuit.run(shots=1024, experiment_name="Superposition")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nExpected: Roughly 50% |0⟩ and 50% |1⟩")
`,
  },
  {
    name: 'Quantum NOT (X Gate)',
    description: 'Flip a qubit from |0⟩ to |1⟩ using the Pauli-X gate',
    difficulty: 'beginner',
    code: `from qpiai_quantum import Circuit

# Create a single qubit circuit
circuit = Circuit(1, 1)

# Apply X gate (quantum NOT)
# This flips |0⟩ to |1⟩
circuit.x(0)

# Measure
circuit.measure(0, 0)

# Display circuit
circuit.show()

# Run simulation
job_result = circuit.run(shots=1024, experiment_name="Quantum NOT")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nExpected: 100% |1⟩")
`,
  },
  {
    name: 'Bell State (Entanglement)',
    description: 'Create a maximally entangled Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2',
    difficulty: 'beginner',
    code: `from qpiai_quantum import Circuit

# Create a 2-qubit circuit for Bell state
circuit = Circuit(2, 2)

# Step 1: Apply Hadamard to first qubit
# Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2
circuit.h(0)

# Step 2: Apply CNOT with q0 as control, q1 as target
# This entangles the qubits: (|00⟩ + |11⟩)/√2
circuit.cx(0, 1)

# Measure both qubits
circuit.measure([0, 1], [0, 1])

# Display circuit
circuit.show()

# Run simulation
job_result = circuit.run(shots=1024, experiment_name="Bell State")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nExpected: ~50% |00⟩ and ~50% |11⟩")
print("Notice: We never see |01⟩ or |10⟩ - the qubits are perfectly correlated!")
`,
  },
  {
    name: 'GHZ State',
    description: 'Create a 3-qubit Greenberger-Horne-Zeilinger entangled state',
    difficulty: 'intermediate',
    code: `from qpiai_quantum import Circuit

# Create a 3-qubit GHZ state circuit
# GHZ state: (|000⟩ + |111⟩)/√2
circuit = Circuit(3, 3)

# Apply Hadamard to first qubit
circuit.h(0)

# Create entanglement chain with CNOT gates
circuit.cx(0, 1)  # Entangle q0 and q1
circuit.cx(1, 2)  # Entangle q1 and q2

# Measure all qubits
circuit.measure([0, 1, 2], [0, 1, 2])

# Display circuit
circuit.show()

# Run simulation
job_result = circuit.run(shots=1024, experiment_name="GHZ State")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nExpected: ~50% |000⟩ and ~50% |111⟩")
print("All 3 qubits are maximally entangled!")
`,
  },
  {
    name: 'CNOT in the Hadamard Basis',
    description: 'Conjugating CNOT by Hadamards reverses which qubit is the control',
    difficulty: 'intermediate',
    code: `from qpiai_quantum import Circuit

# Sandwiching a CNOT between Hadamards on both qubits produces a CNOT
# running the *other* way: control and target swap roles.
circuit = Circuit(2, 2)

circuit.h(0)
circuit.h(1)

circuit.cx(0, 1)   # control q0, target q1

circuit.h(0)
circuit.h(1)

circuit.measure([0, 1], [0, 1])
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="CNOT Basis Change")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nThe net effect is CNOT with q1 controlling q0.")
print("'Control' and 'target' are basis-dependent labels, not physical roles.")
`,
  },
  {
    name: 'Phase Kickback',
    description: 'A controlled gate imprints phase onto its control qubit',
    difficulty: 'intermediate',
    code: `from qpiai_quantum import Circuit

# Phase kickback needs the TARGET prepared in |-> = (|0> - |1>)/sqrt(2),
# which is an eigenstate of X with eigenvalue -1. The CNOT then kicks that
# -1 phase back onto the control qubit.
circuit = Circuit(2, 2)

circuit.h(0)       # control into superposition
circuit.x(1)
circuit.h(1)       # target into |->

circuit.cx(0, 1)   # phase kicks back onto the control

circuit.h(0)       # rotate the control back to reveal the phase

circuit.measure([0, 1], [0, 1])
circuit.show()

job_result = circuit.run(shots=1024, experiment_name="Phase Kickback")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nThe control reads |1> even though no gate acted on it directly.")
print("This is the mechanism behind Deutsch-Jozsa, Grover and phase estimation.")
`,
  },
  {
    name: 'Quantum Teleportation Setup',
    description: 'Set up the quantum teleportation protocol (without classical communication)',
    difficulty: 'advanced',
    code: `from qpiai_quantum import Circuit

# Quantum Teleportation Circuit
# Alice wants to teleport her qubit (q0) to Bob (q2)
# q1 is the shared entangled pair

circuit = Circuit(3, 3)

# === Prepare the state to teleport ===
# Let's teleport a |+⟩ state
circuit.h(0)  # Alice's qubit to teleport

# === Create Bell pair between Alice (q1) and Bob (q2) ===
circuit.h(1)
circuit.cx(1, 2)

# === Alice's Bell measurement ===
circuit.cx(0, 1)  # CNOT with message qubit
circuit.h(0)      # Hadamard on message qubit

# Measure Alice's qubits
circuit.measure([0, 1, 2], [0, 1, 2])

# Display circuit
circuit.show()

# Run simulation
job_result = circuit.run(shots=1024, experiment_name="Teleportation")
counts = job_result.get_counts()

print(f"\\nMeasurement results: {counts}")
print("\\nNote: In real teleportation, Bob applies corrections based on Alice's measurements")
`,
  },
];

export async function GET() {
  return NextResponse.json({ examples: EXAMPLES });
}
