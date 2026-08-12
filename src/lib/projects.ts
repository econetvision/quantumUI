/**
 * Quantum Projects — client-side project store (localStorage, demo mode).
 * Create multiple projects from templates, execute locally on the qpiai-sdk
 * statevector simulator, and later deploy to QpiAI cloud/QPU with an API key.
 */

export interface QuantumProject {
  id: string;
  name: string;
  template: string;
  backend: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'quantumui-projects';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const PROJECT_BACKENDS = [
  { id: 'QpiAI-QSV-Local', name: 'QpiAI-QSV-Local (local statevector)', requiresKey: false },
  { id: 'QpiAI-QSV-Simulator', name: 'QpiAI-QSV-Simulator (cloud)', requiresKey: true },
  { id: 'QpiAI-QDM-Simulator', name: 'QpiAI-QDM-Simulator (cloud, density matrix)', requiresKey: true },
  { id: 'QpiAI-Indus-1', name: 'QpiAI-Indus-1 (real 25-qubit QPU)', requiresKey: true },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Circuit',
    description: 'Start from scratch with an empty 2-qubit circuit',
    code: `from qpiai_quantum import Circuit

# Build your quantum operations here
circuit = Circuit(2, 2)

circuit.measure([0, 1], [0, 1])

job_result = circuit.run(shots=1024, device_name="QpiAI-QSV-Local")
counts = job_result.get_counts()
print(f"Results: {counts}")
`,
  },
  {
    id: 'bell',
    name: 'Bell State',
    description: 'Two-qubit entanglement: |00⟩ + |11⟩',
    code: `from qpiai_quantum import Circuit

circuit = Circuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])

job_result = circuit.run(shots=1024, experiment_name="Bell State", device_name="QpiAI-QSV-Local")
counts = job_result.get_counts()
print(f"Results: {counts}")
print("Expected: ~50% |00> and ~50% |11>")
`,
  },
  {
    id: 'ghz',
    name: 'GHZ State',
    description: 'Three-qubit entanglement: |000⟩ + |111⟩',
    code: `from qpiai_quantum import Circuit

circuit = Circuit(3, 3)
circuit.h(0)
circuit.cx(0, 1)
circuit.cx(1, 2)
circuit.measure([0, 1, 2], [0, 1, 2])

job_result = circuit.run(shots=1024, experiment_name="GHZ State", device_name="QpiAI-QSV-Local")
counts = job_result.get_counts()
print(f"Results: {counts}")
print("Expected: ~50% |000> and ~50% |111>")
`,
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation',
    description: 'Teleport a qubit state using entanglement + classical bits',
    code: `from qpiai_quantum import Circuit

# Teleport qubit 0's state to qubit 2
circuit = Circuit(3, 3)

# Prepare the state to teleport (|+> here)
circuit.h(0)

# Create the shared Bell pair (qubits 1 and 2)
circuit.h(1)
circuit.cx(1, 2)

# Bell measurement on qubits 0 and 1
circuit.cx(0, 1)
circuit.h(0)
circuit.measure([0, 1], [0, 1])

# Corrections on qubit 2 (deferred measurement style)
circuit.cx(1, 2)
circuit.cz(0, 2)
circuit.measure(2, 2)

job_result = circuit.run(shots=1024, experiment_name="Teleportation", device_name="QpiAI-QSV-Local")
counts = job_result.get_counts()
print(f"Results: {counts}")
`,
  },
  {
    id: 'grover',
    name: "Grover's Search (2 qubits)",
    description: 'Amplify the |11⟩ state with one Grover iteration',
    code: `from qpiai_quantum import Circuit

# 2-qubit Grover search for |11>
circuit = Circuit(2, 2)

# Uniform superposition
circuit.h(0)
circuit.h(1)

# Oracle marking |11> (controlled-Z)
circuit.cz(0, 1)

# Diffusion operator
circuit.h(0)
circuit.h(1)
circuit.x(0)
circuit.x(1)
circuit.cz(0, 1)
circuit.x(0)
circuit.x(1)
circuit.h(0)
circuit.h(1)

circuit.measure([0, 1], [0, 1])

job_result = circuit.run(shots=1024, experiment_name="Grover", device_name="QpiAI-QSV-Local")
counts = job_result.get_counts()
print(f"Results: {counts}")
print("Expected: ~100% |11>")
`,
  },
];

export function getProjects(): QuantumProject[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as QuantumProject[];
  } catch {
    return [];
  }
}

function saveProjects(projects: QuantumProject[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name: string, templateId: string, backend: string): QuantumProject {
  const template = PROJECT_TEMPLATES.find((t) => t.id === templateId) || PROJECT_TEMPLATES[0];
  const now = new Date().toISOString();
  const project: QuantumProject = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`,
    name,
    template: template.id,
    backend,
    code: template.code,
    createdAt: now,
    updatedAt: now,
  };
  saveProjects([project, ...getProjects()]);
  return project;
}

export function updateProject(id: string, changes: Partial<QuantumProject>) {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
  );
  saveProjects(projects);
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter((p) => p.id !== id));
}
