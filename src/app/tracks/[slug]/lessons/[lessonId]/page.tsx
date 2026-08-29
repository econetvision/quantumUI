import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, getAllLessons, hasRealContent, getTrackName } from "@/lib/lesson-loader";
import LessonLab from "@/components/LessonLab";
import { LAB_TOPIC_TRACK } from "@/lib/lab-access";
import { LessonComplete } from "@/components/learning/LessonComplete";
import StreakBadge from "@/components/StreakBadge";
import { Badge, Card, Container } from "@/components/ui/primitives";
import { TRACK_CONFIGS } from "@/lib/track-mapping";
import {
  JsonLd,
  breadcrumbJsonLd,
  lessonJsonLd,
} from "@/components/seo/JsonLd";

const LESSON_TONE = {
  lab: "accent",
  quiz: "warning",
  lesson: "neutral",
} as const;

/**
 * Which bank of lab questions a lesson in this track should offer.
 *
 * Nearly always the bank of the same name, so it is derived from
 * LAB_TOPIC_TRACK rather than restated — one list to keep correct instead of
 * two that must agree. The previous version was a hand-written table that had
 * drifted: it carried entries for both spellings of the four slugs that used to
 * differ, plus keys like "advanced-qiskit", "cert-exam-prep", "quantum-ml" and
 * "vqe-qaoa" that are not track slugs at all and could never match.
 *
 * BORROWED covers the real exception: two tracks have no lab bank of their own
 * and practise against the closest one that does.
 */
const BORROWED_LAB_TOPIC: Record<string, string> = {
  "advanced-qiskit-topics": "qiskit-sdk-deep-dive",
  "ibm-cert-exam-prep": "qiskit-sdk-deep-dive",
};

const LAB_TOPIC_BY_TRACK: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(LAB_TOPIC_TRACK)
      .filter(([, track]) => track !== null)
      .map(([topic, track]) => [track as string, topic]),
  ),
  ...BORROWED_LAB_TOPIC,
};

// Image type for lesson visuals
interface LessonImage {
  src: string;
  alt: string;
  caption: string;
}

// Code example type
interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

// Lesson type with all possible properties
interface Lesson {
  title: string;
  duration: string;
  type: string;
  content?: string;
  images?: LessonImage[];
  keyTakeaways?: string[];
  codeExamples?: CodeExample[];
}

// Fallback track data for tracks without real content yet
const trackData: Record<string, { name: string; icon: string; lessons: Lesson[] }> = {
  "quantum-fundamentals": {
    name: "Quantum Fundamentals",
    icon: "⚛️",
    lessons: [
      {
        title: "What is a Qubit?",
        duration: "15 min",
        type: "lesson",
        content: `# What is a Qubit?

A **qubit** (quantum bit) is the fundamental unit of quantum information, analogous to a classical bit but with quantum properties.

## Classical Bit vs Qubit

**Classical Bit:**
- Can be in state 0 or 1
- Deterministic
- Independent

**Qubit:**
- Can be in superposition: α|0⟩ + β|1⟩
- Probabilistic upon measurement
- Can be entangled with other qubits

## Mathematical Representation

A qubit state is represented as:
\`\`\`
|ψ⟩ = α|0⟩ + β|1⟩
\`\`\`

Where:
- α and β are complex numbers (probability amplitudes)
- |α|² + |β|² = 1 (normalization)
- |α|² = probability of measuring |0⟩
- |β|² = probability of measuring |1⟩

## Key Properties

1. **Superposition**: Qubit can be in multiple states simultaneously
2. **Measurement**: Collapses the superposition to |0⟩ or |1⟩
3. **Interference**: Probability amplitudes can interfere constructively or destructively

## Example in Qiskit

\`\`\`python
from qiskit import QuantumCircuit

# Create a single qubit circuit
qc = QuantumCircuit(1)

# Initialize to |0⟩ (default)
# Apply operations to create superposition
qc.h(0)  # Hadamard gate

qc.draw('mpl')
\`\`\`

This creates the state: |ψ⟩ = (|0⟩ + |1⟩)/√2`
      },
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


/**
 * Resolve a lesson from either source, in the same order the page body does.
 *
 * Shared by `generateMetadata` and the page so the two can never disagree about
 * which lesson a URL is — a `<title>` naming a different lesson than the page
 * shows is a real and very confusing bug, and duplicated resolution logic is
 * exactly how it happens.
 */
function resolveLesson(slug: string, lessonNumber: number) {
  if (hasRealContent(slug)) {
    const jsonLesson = getLesson(slug, lessonNumber);
    if (jsonLesson) {
      return {
        lesson: jsonLesson as Lesson,
        allLessons: getAllLessons(slug) as Lesson[],
        trackName: getTrackName(slug) || "Quantum Track",
        realContent: true,
      };
    }
  }

  const track = trackData[slug];
  if (!track) return null;

  const lesson = (track.lessons[lessonNumber - 1] as Lesson | undefined) ?? null;
  if (!lesson) return null;

  return {
    lesson,
    allLessons: track.lessons as Lesson[],
    trackName: track.name,
    realContent: false,
  };
}

/**
 * A one-sentence summary for the search snippet.
 *
 * Lesson bodies are markdown with headings and code fences; dropping the raw
 * first 160 characters into a description often yields "## Introduction ```py".
 * This strips the markup first and falls back to a constructed sentence when
 * there is no prose to draw on.
 */
function lessonDescription(lesson: Lesson, trackName: string): string {
  const prose = (lesson.content ?? "")
    .replace(/```[\s\S]*?```/g, " ")   // fenced code
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ") // links and images
    .replace(/[#*_>`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (prose.length > 60) {
    return prose.length > 155 ? `${prose.slice(0, 152).trimEnd()}…` : prose;
  }

  return `${lesson.title} — a ${lesson.duration} ${lesson.type} in the ${trackName} track on QuantumUI.`;
}

/**
 * Prerender every lesson that has real content.
 *
 * Two reasons, both SEO: a prerendered page is served as static HTML, so a
 * crawler gets the full text on the first byte rather than after a render; and
 * it guarantees these URLs exist at build time, matching what `sitemap.ts`
 * advertises. Tracks that are still outline-only are left to render on demand —
 * they are not in the sitemap either.
 */
export function generateStaticParams() {
  return TRACK_CONFIGS.flatMap((track) =>
    getAllLessons(track.slug).map((lesson) => ({
      slug: track.slug,
      lessonId: String(lesson.id),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const resolved = resolveLesson(slug, parseInt(lessonId, 10));

  if (!resolved) {
    return { title: "Lesson not found", robots: { index: false, follow: false } };
  }

  const { lesson, trackName } = resolved;
  const description = lessonDescription(lesson, trackName);

  return {
    // The root template appends "· QuantumUI"; naming the track here as well
    // gives the result the context a bare lesson title lacks.
    title: `${lesson.title} — ${trackName}`,
    description,
    alternates: { canonical: `/tracks/${slug}/lessons/${lessonId}` },
    openGraph: {
      title: `${lesson.title} · ${trackName}`,
      description,
      url: `/tracks/${slug}/lessons/${lessonId}`,
      type: "article",
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const lessonNumber = parseInt(lessonId, 10);

  // Same resolution the metadata uses — real notebook content when there is
  // any, the track outline otherwise. See `resolveLesson` above.
  const resolved = resolveLesson(slug, lessonNumber);
  if (!resolved) notFound();

  const { lesson, allLessons, trackName, realContent } = resolved;

  const prevLesson = lessonNumber > 1 ? lessonNumber - 1 : null;
  const nextLesson = lessonNumber < allLessons.length ? lessonNumber + 1 : null;
  const progress = Math.round((lessonNumber / allLessons.length) * 100);

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      {/* Structured data. `LearningResource` linked to its parent `Course` by
          @id is what lets a search engine present this as a lesson inside a
          course rather than a loose page that happens to mention quantum. */}
      <JsonLd
        data={lessonJsonLd({
          trackSlug: slug,
          trackName,
          lessonId: lessonNumber,
          title: lesson.title,
          description: lessonDescription(lesson, trackName),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "QuantumUI", path: "/" },
          { name: "Tracks", path: "/tracks" },
          { name: trackName, path: `/tracks/${slug}` },
          { name: lesson.title, path: `/tracks/${slug}/lessons/${lessonId}` },
        ])}
      />

      {/* Lesson header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/tracks/${slug}`}
          className="inline-flex min-w-0 items-center gap-1.5 font-mono text-sm text-content-muted transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          <span className="truncate">{trackName}</span>
        </Link>
        <StreakBadge />
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-accent">
            Lesson {lessonNumber} of {allLessons.length}
          </span>
          <Badge tone={LESSON_TONE[lesson.type as keyof typeof LESSON_TONE] ?? "neutral"}>
            {lesson.type}
          </Badge>
          <span className="font-mono text-xs text-content-subtle">
            {lesson.duration}
          </span>
          {realContent && <Badge tone="success">QWorld content</Badge>}
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {lesson.title}
        </h1>

        <div className="mt-5 flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Track progress"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs text-content-subtle">
            {progress}%
          </span>
        </div>
      </div>

      {/* Lesson body */}
      <Card className="animate-fade-up mt-8">
        {lesson.content ? (
          <div className="lesson-prose">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />

            {lesson.images && lesson.images.length > 0 && (
              <div className="mt-10 space-y-6">
                {lesson.images.map((image, idx) => (
                  <figure key={idx}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="mx-auto w-full rounded-lg border border-line"
                    />
                    {image.caption && (
                      <figcaption className="mt-3 text-center text-sm text-content-subtle">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
              <div className="mt-10 rounded-xl border border-accent/30 bg-accent-soft p-5">
                <h2 className="font-mono text-base font-bold text-accent">
                  Key takeaways
                </h2>
                <ul className="mt-3 space-y-2">
                  {lesson.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span aria-hidden="true" className="mt-0.5 text-accent">
                        ✓
                      </span>
                      <span className="text-content-muted">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-float text-5xl">⚛️</div>
            <h2 className="gradient-text mt-4 text-xl font-bold sm:text-2xl">
              {lesson.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-content-muted">
              This is a hands-on session. Work through the scenarios below and
              run your circuits on the live statevector simulator — no setup
              needed.
            </p>

            <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
              {[
                { icon: "🎯", title: "Scenario tasks", body: "Real problems from QWorld course notebooks, tiered by difficulty." },
                { icon: "▶️", title: "Live simulator", body: "Every run executes on the QpiAI statevector simulator." },
                { icon: "⚡", title: "Earn XP", body: "Solve scenarios to grow your streak and daily XP goal." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-line bg-surface-overlay p-4"
                >
                  <div aria-hidden="true" className="text-xl">
                    {item.icon}
                  </div>
                  <p className="mt-2 font-mono text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-content-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <a href="#lesson-lab" className="quantum-btn mt-7">
              Start the lab ↓
            </a>
          </div>
        )}
      </Card>

      {/* Embedded hands-on lab */}
      {lesson.type !== "quiz" && LAB_TOPIC_BY_TRACK[slug] && (
        <div id="lesson-lab" className="animate-fade-up-1 mt-8 scroll-mt-24">
          <LessonLab
            topic={LAB_TOPIC_BY_TRACK[slug]}
            lessonNumber={lessonNumber}
            count={lesson.type === "lab" ? 3 : 1}
          />
        </div>
      )}

      {/* Prev / next — stacks on small screens instead of squashing three
          buttons onto one row. */}
      {/* Recording completion is what opens this track's labs, so it sits
          above the navigation rather than below it — a learner who clicks
          "Next" straight away should still have passed it. */}
      <LessonComplete
        trackSlug={slug}
        lessonId={lessonNumber}
        totalLessons={allLessons.length}
        trackTitle={trackName}
      />

      <nav
        aria-label="Lesson navigation"
        className="mt-10 grid gap-3 sm:grid-cols-3 sm:items-center"
      >
        {prevLesson !== null ? (
          <Link
            href={`/tracks/${slug}/lessons/${prevLesson}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
          >
            ← Previous
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}

        <Link
          href={`/tracks/${slug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 font-mono text-sm text-content-muted transition-colors hover:text-content"
        >
          Back to track
        </Link>

        <Link
          href={
            nextLesson !== null
              ? `/tracks/${slug}/lessons/${nextLesson}`
              : `/tracks/${slug}`
          }
          className="quantum-btn"
        >
          {nextLesson !== null ? "Next →" : "Complete →"}
        </Link>
      </nav>
    </Container>
  );
}
