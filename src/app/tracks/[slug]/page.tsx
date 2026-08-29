import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container, Card, Badge } from "@/components/ui/primitives";
import { getTrackImagery } from "@/lib/track-images";
import { TRACK_CONFIGS } from "@/lib/track-mapping";
import {
  JsonLd,
  breadcrumbJsonLd,
  courseJsonLd,
} from "@/components/seo/JsonLd";

const trackData: Record<string, { name: string; icon: string; free: boolean; color: string; desc: string; overviewImage?: string; lessons: { title: string; duration: string; type: string }[] }> = {
  "quantum-fundamentals": {
    name: "Quantum Fundamentals",
    icon: "⚛️",
    free: true,
    color: "quantum-accent",
    desc: "Start your quantum journey. Learn about qubits, superposition, measurement, and the Bloch sphere using Qiskit.",
    overviewImage: "/images/animated/quantum-fundamentals.gif",
    lessons: [
      { title: "What is a Qubit?", duration: "15 min", type: "lesson" },
      { title: "Superposition & Quantum States", duration: "20 min", type: "lesson" },
      { title: "The Bloch Sphere", duration: "25 min", type: "lab" },
      { title: "Dirac Notation", duration: "15 min", type: "lesson" },
      { title: "Quantum Measurement", duration: "20 min", type: "lab" },
      { title: "Probability Amplitudes", duration: "20 min", type: "lesson" },
      { title: "Your First Qiskit Circuit", duration: "30 min", type: "lab" },
      { title: "Fundamentals Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-gates": {
    name: "Quantum Gates & Circuits",
    icon: "🔀",
    free: true,
    color: "quantum-purple",
    desc: "Master quantum logic gates: Pauli X/Y/Z, Hadamard, CNOT, Toffoli, and how to compose multi-qubit circuits.",
    overviewImage: "/images/animated/quantum-gates.gif",
    lessons: [
      { title: "Pauli X Gate (Quantum NOT)", duration: "15 min", type: "lesson" },
      { title: "Pauli Y & Z Gates", duration: "15 min", type: "lesson" },
      { title: "The Hadamard Gate", duration: "20 min", type: "lab" },
      { title: "Rotation Gates: Rx, Ry, Rz", duration: "20 min", type: "lesson" },
      { title: "Multi-Qubit Systems", duration: "20 min", type: "lesson" },
      { title: "CNOT Gate & Entanglement", duration: "25 min", type: "lab" },
      { title: "Toffoli & CCX Gates", duration: "20 min", type: "lesson" },
      { title: "Circuit Composition", duration: "30 min", type: "lab" },
      { title: "Phase Kickback", duration: "20 min", type: "lesson" },
      { title: "Gates Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "qiskit-sdk-deep-dive": {
    name: "Qiskit SDK Deep Dive",
    icon: "🛠️",
    free: true,
    color: "quantum-accent",
    desc: "Go deep into the Qiskit SDK — transpiler, simulators, noise models, Aer backend, and real device execution.",
    lessons: [
      { title: "Qiskit Architecture Overview", duration: "15 min", type: "lesson" },
      { title: "QuantumCircuit & QuantumRegister", duration: "20 min", type: "lab" },
      { title: "The Aer Simulator", duration: "25 min", type: "lab" },
      { title: "Transpiler Pipeline", duration: "30 min", type: "lesson" },
      { title: "Optimization Levels", duration: "20 min", type: "lab" },
      { title: "Noise Models", duration: "25 min", type: "lesson" },
      { title: "Error Mitigation Techniques", duration: "25 min", type: "lab" },
      { title: "Statevector vs QASM Simulation", duration: "20 min", type: "lab" },
      { title: "Visualization Tools", duration: "20 min", type: "lab" },
      { title: "Primitives: Sampler & Estimator", duration: "25 min", type: "lab" },
      { title: "Qiskit SDK Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-entanglement": {
    name: "Quantum Entanglement",
    icon: "🔗",
    free: true,
    color: "quantum-purple",
    desc: "Explore quantum entanglement, Bell states, the EPR paradox, and GHZ states through hands-on Qiskit labs.",
    overviewImage: "/images/animated/quantum-entanglement.gif",
    lessons: [
      { title: "Introduction to Entanglement", duration: "20 min", type: "lesson" },
      { title: "Bell States", duration: "25 min", type: "lab" },
      { title: "The EPR Paradox", duration: "20 min", type: "lesson" },
      { title: "Bell's Inequality", duration: "20 min", type: "lesson" },
      { title: "GHZ States", duration: "25 min", type: "lab" },
      { title: "Entanglement in Real Circuits", duration: "30 min", type: "lab" },
      { title: "Entanglement Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-algorithms": {
    name: "Quantum Algorithms",
    icon: "🧮",
    free: true,
    color: "quantum-accent",
    desc: "Master famous quantum algorithms: Grover's search, Shor's factoring, Deutsch-Jozsa, and Quantum Fourier Transform.",
    lessons: [
      { title: "Introduction to Quantum Algorithms", duration: "20 min", type: "lesson" },
      { title: "Deutsch-Jozsa Algorithm", duration: "30 min", type: "lab" },
      { title: "Grover's Search Algorithm", duration: "35 min", type: "lab" },
      { title: "Quantum Fourier Transform", duration: "30 min", type: "lesson" },
      { title: "Shor's Factoring Algorithm", duration: "40 min", type: "lab" },
      { title: "Bernstein-Vazirani Algorithm", duration: "25 min", type: "lab" },
      { title: "Simon's Algorithm", duration: "30 min", type: "lab" },
      { title: "Algorithms Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-teleportation-protocols": {
    name: "Quantum Teleportation",
    icon: "🌀",
    free: true,
    color: "quantum-purple",
    desc: "Learn quantum teleportation protocol and superdense coding with hands-on implementations.",
    lessons: [
      { title: "What is Quantum Teleportation?", duration: "20 min", type: "lesson" },
      { title: "Teleportation Protocol", duration: "30 min", type: "lab" },
      { title: "Superdense Coding", duration: "25 min", type: "lab" },
      { title: "No-Cloning Theorem", duration: "15 min", type: "lesson" },
      { title: "Quantum Communication", duration: "20 min", type: "lesson" },
      { title: "Teleportation Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-error-correction": {
    name: "Error Correction",
    icon: "🛡️",
    free: true,
    color: "quantum-accent",
    desc: "Understand quantum error correction, stabilizer codes, and fault-tolerant quantum computing.",
    lessons: [
      { title: "Why Error Correction?", duration: "20 min", type: "lesson" },
      { title: "Bit Flip Code", duration: "25 min", type: "lab" },
      { title: "Phase Flip Code", duration: "25 min", type: "lab" },
      { title: "Shor's 9-Qubit Code", duration: "30 min", type: "lab" },
      { title: "Stabilizer Codes", duration: "30 min", type: "lesson" },
      { title: "Surface Codes", duration: "25 min", type: "lesson" },
      { title: "Fault-Tolerant Computing", duration: "30 min", type: "lesson" },
      { title: "Error Correction Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-cryptography-qkd": {
    name: "Quantum Cryptography",
    icon: "🔐",
    free: true,
    color: "quantum-purple",
    desc: "Learn quantum key distribution protocols BB84 and E91 for secure communication.",
    lessons: [
      { title: "Introduction to QKD", duration: "20 min", type: "lesson" },
      { title: "BB84 Protocol", duration: "30 min", type: "lab" },
      { title: "E91 Protocol", duration: "30 min", type: "lab" },
      { title: "Eavesdropping Detection", duration: "25 min", type: "lesson" },
      { title: "Quantum Cryptography Applications", duration: "20 min", type: "lesson" },
      { title: "Cryptography Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "variational-quantum-algorithms": {
    name: "VQE & QAOA",
    icon: "📡",
    free: true,
    color: "quantum-accent",
    desc: "Master variational quantum algorithms: VQE and QAOA for optimization problems.",
    lessons: [
      { title: "Introduction to Variational Algorithms", duration: "20 min", type: "lesson" },
      { title: "Variational Quantum Eigensolver (VQE)", duration: "35 min", type: "lab" },
      { title: "QAOA Basics", duration: "30 min", type: "lesson" },
      { title: "QAOA Implementation", duration: "35 min", type: "lab" },
      { title: "Ansatz Design", duration: "25 min", type: "lesson" },
      { title: "Optimization Techniques", duration: "30 min", type: "lab" },
      { title: "VQE/QAOA Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "quantum-machine-learning": {
    name: "Quantum Machine Learning",
    icon: "🤖",
    free: true,
    color: "quantum-purple",
    desc: "Explore quantum machine learning with quantum neural networks and feature maps.",
    lessons: [
      { title: "Introduction to QML", duration: "20 min", type: "lesson" },
      { title: "Quantum Feature Maps", duration: "30 min", type: "lab" },
      { title: "Quantum Neural Networks", duration: "35 min", type: "lab" },
      { title: "Quantum Kernels", duration: "30 min", type: "lab" },
      { title: "Classification with QML", duration: "35 min", type: "lab" },
      { title: "QML Applications", duration: "20 min", type: "lesson" },
      { title: "QML Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "advanced-qiskit-topics": {
    name: "Advanced Qiskit Topics",
    icon: "💻",
    free: true,
    color: "quantum-accent",
    desc: "Advanced Qiskit techniques, optimization strategies, and best practices.",
    lessons: [
      { title: "Advanced Circuit Techniques", duration: "30 min", type: "lesson" },
      { title: "Custom Gates and Operators", duration: "30 min", type: "lab" },
      { title: "Circuit Optimization", duration: "30 min", type: "lab" },
      { title: "Working with Real Devices", duration: "35 min", type: "lab" },
      { title: "Advanced Topics Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  "ibm-cert-exam-prep": {
    name: "IBM Cert Exam Prep",
    icon: "🎓",
    free: true,
    color: "quantum-purple",
    desc: "Full IBM Qiskit Developer Certification exam preparation with practice questions and mock exams.",
    lessons: [
      { title: "Exam Overview", duration: "15 min", type: "lesson" },
      { title: "Practice Set 1: Circuit Operations", duration: "30 min", type: "quiz" },
      { title: "Practice Set 2: Transpiler", duration: "25 min", type: "quiz" },
      { title: "Practice Set 3: Execution", duration: "25 min", type: "quiz" },
      { title: "Practice Set 4: Backends", duration: "20 min", type: "quiz" },
      { title: "Mock Exam 1", duration: "90 min", type: "quiz" },
      { title: "Mock Exam 2", duration: "90 min", type: "quiz" },
      { title: "Mock Exam 3", duration: "90 min", type: "quiz" },
      { title: "Mock Exam 4", duration: "90 min", type: "quiz" },
    ],
  },
};


export function generateStaticParams() {
  return Object.keys(trackData).map((slug) => ({ slug }));
}

/**
 * Extra facts about a track that only `TRACK_CONFIGS` knows — difficulty and
 * estimated hours. Both files key off the same 12 slugs; this looks the config
 * up rather than duplicating the numbers into `trackData` a third time.
 */
function trackConfig(slug: string) {
  return TRACK_CONFIGS.find((config) => config.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = trackData[slug];

  // A missing track 404s in the page body. Marking the metadata `noindex` as
  // well means a crawler that somehow reaches a bad slug is told not to keep it
  // rather than being left to infer that from the status code alone.
  if (!track) {
    return { title: "Track not found", robots: { index: false, follow: false } };
  }

  const config = trackConfig(slug);
  const lessonCount = track.lessons.length;

  /*
   * The description does real work here: it is the snippet under the search
   * result, so it states what the track covers *and* what it costs in time,
   * which is the question somebody searching "learn quantum gates" is actually
   * asking. The generic `track.desc` alone reads as marketing copy.
   */
  const description = `${track.desc} ${lessonCount} lessons${
    config?.estimatedHours ? `, about ${config.estimatedHours} hours` : ""
  }${track.free ? ", free and open to everyone" : ""}.`;

  return {
    title: track.name,
    description,
    alternates: { canonical: `/tracks/${slug}` },
    keywords: [
      track.name.toLowerCase(),
      `${track.name.toLowerCase()} tutorial`,
      "quantum computing course",
      "qiskit",
    ],
    openGraph: {
      title: `${track.name} · QuantumUI`,
      description,
      url: `/tracks/${slug}`,
      type: "article",
    },
  };
}

const LESSON_TONE = {
  lab: "accent",
  quiz: "warning",
  lesson: "neutral",
} as const;

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = trackData[slug];

  // A bad slug is a genuine 404 rather than a soft in-page message, so it
  // returns the right status to crawlers and the browser.
  if (!track) notFound();

  const imagery = getTrackImagery(slug);
  const lessonCount = track.lessons.filter((l) => l.type === "lesson").length;
  const labCount = track.lessons.filter((l) => l.type === "lab").length;
  const totalMin = track.lessons.reduce(
    (acc, l) => acc + (parseInt(l.duration, 10) || 0),
    0,
  );

  const config = trackConfig(slug);

  return (
    <Container size="narrow" className="py-10 sm:py-14">
      {/* Structured data: tells a search engine this page is a Course with a
          provider, a level and a workload — the difference between a plain blue
          link and an eligible course result. The breadcrumb renders the trail
          "QuantumUI › Tracks › <name>" under it. */}
      <JsonLd
        data={courseJsonLd({
          slug,
          name: track.name,
          description: track.desc,
          hours: config?.estimatedHours,
          difficulty: config?.difficulty,
          free: track.free,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "QuantumUI", path: "/" },
          { name: "Tracks", path: "/tracks" },
          { name: track.name, path: `/tracks/${slug}` },
        ])}
      />

      <Link
        href="/tracks"
        className="inline-flex items-center gap-1.5 font-mono text-sm text-content-muted transition-colors hover:text-accent"
      >
        ← All tracks
      </Link>

      <Card className="mt-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-overlay text-3xl"
          >
            {track.icon}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{track.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-content-muted sm:text-base">
              {track.desc}
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-content-subtle">
              <div className="flex gap-1.5">
                <dt>lessons</dt>
                <dd className="text-content-muted">{lessonCount}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>labs</dt>
                <dd className="text-content-muted">{labCount}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>total</dt>
                <dd className="text-content-muted">
                  {Math.floor(totalMin / 60)}h {totalMin % 60}m
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <Link href={`/tracks/${slug}/lessons/1`} className="quantum-btn mt-5 w-full sm:w-auto">
          Start track →
        </Link>
      </Card>

      {imagery?.overview && (
        <figure className="mt-6">
          <Card className="!p-3">
            <Image
              src={imagery.overview}
              alt={`Animated overview of the key concepts covered in ${track.name}`}
              width={1200}
              height={675}
              unoptimized
              className="w-full rounded-lg"
            />
            <figcaption className="mt-3 text-center text-xs text-content-subtle">
              Concepts covered in this track
            </figcaption>
          </Card>
        </figure>
      )}

      {imagery && imagery.gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-lg font-bold">Concept diagrams</h2>
          <p className="mt-1.5 text-sm text-content-muted">
            Reference figures for this track, adapted from QWorld&apos;s course
            notebooks.
          </p>

          {/* items-start: these diagrams vary a lot in aspect ratio, and
              stretching every card to the tallest in its row leaves large dead
              gaps under the short ones. */}
          <div className="mt-5 grid items-start gap-4 sm:grid-cols-2">
            {imagery.gallery.map((image) => (
              <figure key={image.src} className="m-0">
                <Card className="flex flex-col !p-3">
                  {/* White plate: these are line diagrams drawn in black on
                      transparent backgrounds, so they vanish in dark mode
                      without a light surface behind them. */}
                  <div className="rounded-lg bg-white p-3">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={720}
                      height={420}
                      unoptimized
                      className="mx-auto h-auto w-full object-contain"
                    />
                  </div>
                  <figcaption className="mt-3 text-xs leading-relaxed text-content-muted">
                    {image.caption}
                  </figcaption>
                </Card>
              </figure>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-10 font-mono text-lg font-bold">Curriculum</h2>
      <ol className="mt-4 space-y-2.5">
        {track.lessons.map((lesson, idx) => (
          <li key={lesson.title} id={`lesson-${idx + 1}`}>
            <Card href={`/tracks/${slug}/lessons/${idx + 1}`} className="!p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs text-content-muted"
                >
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {lesson.title}
                </span>
                <span className="hidden shrink-0 sm:block">
                  <Badge tone={LESSON_TONE[lesson.type as keyof typeof LESSON_TONE] ?? "neutral"}>
                    {lesson.type}
                  </Badge>
                </span>
                <span className="shrink-0 font-mono text-xs text-content-subtle">
                  {lesson.duration}
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </Container>
  );
}
