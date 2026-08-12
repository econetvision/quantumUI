import { PrismaClient, LabType, AchievementType, QuestionDifficulty } from "@prisma/client";
import { glob } from "glob";
import path from "path";
import { notebookParser } from "../src/lib/notebook-parser";
import { TRACK_CONFIGS } from "../src/lib/track-mapping";
import { QWORLD_CONTENT_ROOT, hasQworldContent, missingContentMessage } from "../src/lib/content-paths";

const prisma = new PrismaClient();

async function main() {
  console.log("🌌 Starting QuantumUI database seeding...");

  // Notebooks are vendored under content/qworld/ — see content/qworld/SOURCES.md
  const qworldParentDir = QWORLD_CONTENT_ROOT;

  if (!hasQworldContent()) {
    console.warn(`\n⚠️  ${missingContentMessage()}`);
    console.warn("   Tracks will still be created; labs parsed from notebooks will be skipped.\n");
  }

  // ===== 1. CREATE TRACKS =====
  console.log("\n📚 Creating tracks...");

  for (const config of TRACK_CONFIGS) {
    const track = await prisma.track.upsert({
      where: { slug: config.slug },
      update: {
        title: config.title,
        description: config.description,
        difficulty: config.difficulty,
        order: config.order,
        labCount: config.labCount,
        questionCount: config.questionCount,
        estimatedHours: config.estimatedHours,
        qworldSource: config.qworldSource,
      },
      create: {
        slug: config.slug,
        title: config.title,
        description: config.description,
        difficulty: config.difficulty,
        order: config.order,
        labCount: config.labCount,
        questionCount: config.questionCount,
        estimatedHours: config.estimatedHours,
        qworldSource: config.qworldSource,
      },
    });

    console.log(`✓ Track ${config.order}: ${track.title}`);
  }

  // ===== 2. PARSE & CREATE LABS FROM QWORLD NOTEBOOKS =====
  console.log("\n🔬 Parsing QWorld notebooks and creating labs...");

  for (const config of TRACK_CONFIGS) {
    if (!config.qworldSource || config.notebookPatterns.length === 0) {
      console.log(`⊘ Skipping ${config.title} (no notebooks)`);
      continue;
    }

    console.log(`\n📖 Processing: ${config.title}`);

    const sourcePath = path.join(qworldParentDir, config.qworldSource);

    try {
      // Find matching notebooks using glob patterns
      let notebookFiles: string[] = [];
      for (const pattern of config.notebookPatterns) {
        const matches = await glob(pattern, {
          cwd: sourcePath,
          absolute: true,
          ignore: ["**/node_modules/**", "**/.ipynb_checkpoints/**"],
        });
        notebookFiles = [...notebookFiles, ...matches];
      }

      // Remove duplicates
      notebookFiles = [...new Set(notebookFiles)];

      console.log(`  Found ${notebookFiles.length} notebooks`);

      let labOrder = 1;
      for (const notebookPath of notebookFiles.slice(0, config.labCount)) {
        try {
          const parsed = await notebookParser.parseNotebook(notebookPath);
          const fileName = path.basename(notebookPath, ".ipynb");
          const slug = `${config.slug}-${fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          const lab = await prisma.lab.upsert({
            where: { slug },
            update: {
              title: parsed.title,
              description: parsed.description,
              markdown: parsed.markdown,
              starterCode: parsed.starterCode,
              solutionCode: parsed.solutionCode,
              type: parsed.isExercise ? LabType.EXERCISE : LabType.TUTORIAL,
              hints: parsed.hints.length > 0 ? parsed.hints : undefined,
              xpReward: parsed.isExercise ? 20 : 10,
              difficulty: Math.min(5, Math.ceil(labOrder / 3)),
            },
            create: {
              trackId: config.id,
              slug,
              title: parsed.title,
              description: parsed.description,
              order: labOrder,
              type: parsed.isExercise ? LabType.EXERCISE : LabType.TUTORIAL,
              notebookPath: path.relative(qworldParentDir, notebookPath),
              markdown: parsed.markdown,
              starterCode: parsed.starterCode,
              solutionCode: parsed.solutionCode,
              hints: parsed.hints.length > 0 ? parsed.hints : undefined,
              xpReward: parsed.isExercise ? 20 : 10,
              difficulty: Math.min(5, Math.ceil(labOrder / 3)),
            },
          });

          console.log(`  ✓ Lab ${labOrder}: ${lab.title}`);
          labOrder++;
        } catch (error) {
          console.error(`  ✗ Failed to parse ${path.basename(notebookPath)}:`, error);
        }
      }
    } catch (error) {
      console.error(`  ✗ Error processing track ${config.title}:`, error);
    }
  }

  // ===== 3. CREATE SAMPLE QUESTIONS =====
  console.log("\n❓ Creating sample questions...");

  const sampleQuestions = [
    // Track 1: Quantum Fundamentals
    {
      trackId: 1,
      question: "What is the main difference between a classical bit and a qubit?",
      options: [
        "A qubit can only be 0 or 1",
        "A qubit can exist in superposition of 0 and 1",
        "A qubit is faster than a classical bit",
        "A qubit uses less energy",
      ],
      correctAnswer: "A qubit can exist in superposition of 0 and 1",
      explanation:
        "Unlike classical bits that can only be in state 0 or 1, qubits can exist in a superposition of both states simultaneously until measured.",
      difficulty: "EASY",
    },
    {
      trackId: 1,
      question:
        "In Dirac notation, what does the symbol |ψ⟩ represent?",
      options: [
        "A classical state vector",
        "A quantum state vector (ket)",
        "A probability amplitude",
        "A measurement operator",
      ],
      correctAnswer: "A quantum state vector (ket)",
      explanation:
        "The |ψ⟩ symbol is called a 'ket' and represents a quantum state vector in Dirac notation.",
      difficulty: "EASY",
    },

    // Track 2: Quantum Gates
    {
      trackId: 2,
      question: "What does the Hadamard gate do to the |0⟩ state?",
      options: [
        "Flips it to |1⟩",
        "Creates an equal superposition of |0⟩ and |1⟩",
        "Leaves it unchanged",
        "Measures the qubit",
      ],
      correctAnswer: "Creates an equal superposition of |0⟩ and |1⟩",
      explanation:
        "The Hadamard gate transforms |0⟩ into (|0⟩ + |1⟩)/√2, creating an equal superposition.",
      difficulty: "MEDIUM",
    },

    // Track 3: Qiskit
    {
      trackId: 3,
      question: "Which Qiskit class is used to create a quantum circuit?",
      options: ["QuantumRegister", "QuantumCircuit", "QuantumSimulator", "QuantumBackend"],
      correctAnswer: "QuantumCircuit",
      explanation:
        "The QuantumCircuit class is the main class for creating and manipulating quantum circuits in Qiskit.",
      difficulty: "EASY",
      ibmExamTopic: "Performing operations on quantum circuits",
      ibmExamWeight: 47,
    },

    // Track 4: Entanglement
    {
      trackId: 4,
      question: "What is a Bell state?",
      options: [
        "A single qubit superposition",
        "A maximally entangled two-qubit state",
        "A three-qubit GHZ state",
        "A quantum error correction code",
      ],
      correctAnswer: "A maximally entangled two-qubit state",
      explanation:
        "Bell states are four specific maximally entangled quantum states of two qubits.",
      difficulty: "MEDIUM",
    },

    // Track 5: Algorithms
    {
      trackId: 5,
      question: "What is the time complexity of Grover's search algorithm?",
      options: ["O(N)", "O(√N)", "O(log N)", "O(N²)"],
      correctAnswer: "O(√N)",
      explanation:
        "Grover's algorithm provides a quadratic speedup over classical search, running in O(√N) time.",
      difficulty: "MEDIUM",
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.question.create({
      data: {
        trackId: q.trackId,
        type: "MULTIPLE_CHOICE",
        difficulty: q.difficulty as QuestionDifficulty,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        ibmExamTopic: q.ibmExamTopic,
        ibmExamWeight: q.ibmExamWeight,
      },
    });
  }

  console.log(`✓ Created ${sampleQuestions.length} sample questions`);

  // ===== 4. CREATE ACHIEVEMENTS =====
  console.log("\n🏆 Creating achievements...");

  const achievements = [
    {
      slug: "first-lab",
      name: "First Steps in Quantum",
      description: "Complete your first lab",
      icon: "🌟",
      type: AchievementType.MILESTONE,
      requirement: { type: "labs_completed", count: 1 },
    },
    {
      slug: "entangled-learner",
      name: "Entangled Learner",
      description: "Complete the Quantum Entanglement track",
      icon: "🔗",
      type: AchievementType.MASTERY,
      requirement: { type: "track_completed", trackId: 4 },
    },
    {
      slug: "gate-master",
      name: "Gate Master",
      description: "Complete the Quantum Gates & Circuits track with 100% score",
      icon: "⚡",
      type: AchievementType.PERFECT_SCORE,
      requirement: { type: "track_perfect", trackId: 2 },
    },
    {
      slug: "week-streak",
      name: "Quantum Consistency",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      type: AchievementType.STREAK,
      requirement: { type: "streak_days", count: 7 },
    },
    {
      slug: "certified-qubit",
      name: "Certified Qubit",
      description: "Pass the IBM Certification mock exam with 80%+",
      icon: "🎓",
      type: AchievementType.SPECIAL,
      requirement: { type: "exam_score", score: 80 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✓ Created ${achievements.length} achievements`);

  console.log("\n✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
