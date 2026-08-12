import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader, Card, StatTile } from '@/components/ui/primitives';
import { SampleQuiz, type QuizQuestion } from '@/components/SampleQuiz';

export const metadata: Metadata = {
  title: 'Certification Exam Prep',
  description:
    'Practice questions aligned to the IBM Qiskit Developer Certification blueprint, with explanations for every answer.',
};

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Which gate creates superposition from a computational basis state?',
    options: ['Pauli X', 'Hadamard (H)', 'CNOT', 'Toffoli'],
    answer: 1,
    topic: 'Gates',
    explanation:
      'The Hadamard maps |0⟩ to (|0⟩+|1⟩)/√2 and |1⟩ to (|0⟩−|1⟩)/√2. Pauli X only flips the basis state; CNOT and Toffoli are controlled gates that need an existing superposition to do anything interesting.',
  },
  {
    id: 2,
    text: 'What is the result of measuring |+⟩ = (|0⟩ + |1⟩)/√2 in the computational basis?',
    options: [
      'Always |0⟩',
      'Always |1⟩',
      '|0⟩ or |1⟩ with 50% probability each',
      'Depends on the operator',
    ],
    answer: 2,
    topic: 'Measurement',
    explanation:
      'Both amplitudes are 1/√2, so each outcome has probability |1/√2|² = 0.5. Note that measuring |+⟩ in the X basis instead would give a deterministic result — the basis matters.',
  },
  {
    id: 3,
    text: 'Which Qiskit class is used to create a quantum circuit?',
    options: ['QCircuit', 'QuantumCircuit', 'Circuit', 'QiskitCircuit'],
    answer: 1,
    topic: 'Qiskit',
    explanation:
      'Qiskit uses `QuantumCircuit`. (The QpiAI SDK this platform runs on calls it `Circuit` — a common source of confusion when moving between the two.)',
  },
  {
    id: 4,
    text: "Roughly what share of the IBM Qiskit Developer exam covers 'Performing operations on quantum circuits'?",
    options: ['20%', '35%', '47%', '60%'],
    answer: 2,
    topic: 'Certification',
    explanation:
      'Circuit operations are the largest single section of the blueprint at around 47%, which makes gate mechanics and circuit construction the highest-leverage revision topic.',
  },
  {
    id: 5,
    text: 'Which of these is a two-qubit controlled gate?',
    options: ['H gate', 'Pauli Y', 'CNOT', 'S gate'],
    answer: 2,
    topic: 'Gates',
    explanation:
      'CNOT (controlled-X) flips the target qubit only when the control is |1⟩. H, Y and S all act on a single qubit.',
  },
];

export default function ExamPage() {
  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Certification"
        title="Exam preparation"
        description="Practice aligned to the IBM Qiskit Developer Certification blueprint. The sample below is graded with explanations."
      />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile value="240+" label="Practice questions" />
        <StatTile value="4" label="Mock exams" />
        <StatTile value="90 min" label="Exam duration" />
        <StatTile value="~70%" label="Typical pass mark" />
      </div>

      <div className="mt-12">
        <SampleQuiz questions={SAMPLE_QUESTIONS} />
      </div>

      <Card className="mt-12 text-center">
        <h2 className="font-mono text-lg font-bold">Keep going</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
          The exam-prep track covers the full blueprint section by section, with
          timed mock exams and worked solutions.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/tracks/ibm-cert-exam-prep" className="quantum-btn">
            Open exam-prep track
          </Link>
          <Link
            href="/tracks"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            All tracks
          </Link>
        </div>
      </Card>
    </Container>
  );
}
