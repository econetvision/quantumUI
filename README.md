# QuantumUI

> **Interactive quantum computing learning platform** — Master IBM Qiskit, prepare for certification, and build quantum algorithms with interactive labs.

![Quantum Computing](https://img.shields.io/badge/Quantum-Computing-00d2ff?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js-16.2.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

---

## 🌌 Vision

**Think KodeCloud but for Quantum Computing & IBM Qiskit certification prep.**

QuantumUI is a comprehensive learning platform that takes you from zero knowledge to quantum expert through:
- **12 structured learning tracks** (Fundamentals → Advanced Algorithms → IBM Certification)
- **80+ interactive labs** with live Qiskit code execution
- **240+ practice questions** aligned with IBM exam blueprint
- **Real-time circuit visualizations** (Bloch sphere, gate sequences, measurement histograms)
- **Secure learning environment** (sandboxed execution, user authentication)

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 + Custom Quantum Theme
- **Code Editor**: Monaco Editor (VS Code engine)
- **3D Visualization**: Three.js + React Three Fiber (Bloch sphere, circuit animations)

### Backend
- **Authentication**: NextAuth.js v5 (JWT + role-based access control)
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Redis (sessions, content cache)
- **Code Execution**: Sandboxed Python/Qiskit containers (Docker)

### Security
- ✅ JWT-based authentication with role hierarchy (FREE/PRO/ENTERPRISE)
- ✅ Input sanitization on all lab submissions
- ✅ Sandboxed Python execution (isolated containers)
- ✅ SQL injection prevention (Prisma ORM)

---

## 📚 Learning Curriculum

### Free Tracks (1-4)
1. **Quantum Fundamentals** — Qubits, superposition, Bloch sphere, Dirac notation
2. **Quantum Gates & Circuits** — Pauli, Hadamard, CNOT, Toffoli gates
3. **Qiskit SDK Deep Dive** — Transpiler, simulators, noise models
4. **Quantum Entanglement** — Bell states, EPR paradox, GHZ states

### PRO Tracks (5-10)
5. **Quantum Algorithms** — Grover, Shor, Deutsch-Jozsa, QFT
6. **Quantum Teleportation & Protocols** — Teleportation, superdense coding
7. **Quantum Error Correction** — Stabilizer codes, fault-tolerance
8. **Quantum Cryptography / QKD** — BB84, E91 protocols
9. **Variational Quantum Algorithms** — VQE, QAOA
10. **Quantum Machine Learning** — Quantum neural networks

### Enterprise Tracks (11-12)
11. **Advanced Qiskit Topics** — Advanced techniques and best practices
12. **IBM Cert Exam Prep** — 60-question timed mock exams

---

## 🎨 Design System

### Quantum Aesthetic
- **Background**: `#04080f` (deep space black)
- **Accent**: `#00d2ff` (quantum blue)
- **Secondary**: `#7c3aed` (entanglement purple)
- **Fonts**: Space Mono (headings/code) + DM Sans (body)
- **Animations**: Circuit flow, particle effects, Bloch sphere rotations

### Component Library
- Quantum cards with glow effects
- Circuit background patterns
- Animated quantum state symbols (`|ψ⟩`)
- Progress tracking as quantum state (0% = `|0⟩`, 100% = `|1⟩`)

---

## 🛠️ Getting Started

### Prerequisites
```bash
# Required
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (for Qiskit sandbox)
```

### Installation

1. **Clone the repository**
```bash
cd quantumui-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local — it holds the secrets and is gitignored.
# .env is for non-secret defaults only; .env.local overrides it.
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with QWorld content (this will parse all notebooks!)
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the quantum magic! ✨

---

## 📦 Project Structure

```
quantumui-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Homepage with quantum aesthetic
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Quantum theme + animations
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── lab/           # Lab execution endpoints
│   │       └── tracks/        # Track & progress APIs
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── rbac.ts           # Role-based access control
│   │   ├── notebook-parser.ts # QWorld .ipynb parser
│   │   └── track-mapping.ts  # 12 tracks configuration
│   ├── middleware.ts          # Auth + RBAC middleware
│   └── types/
│       └── next-auth.d.ts    # NextAuth type extensions
├── prisma/
│   ├── schema.prisma         # Database schema (14 models!)
│   └── seed.ts               # QWorld content importer
├── public/                   # Static assets
├── tailwind.config.ts        # Quantum color system
└── package.json

# QWorld Content (parent directory)
../qbook101/                  # Quantum fundamentals course
../silver-qcourse511/         # Advanced algorithms
../qec/                       # Quantum error correction
../qkd/                       # Quantum key distribution
```

---

## 🔬 Database Schema Highlights

### Core Models
- **User** — Authentication + role (FREE/PRO/ENTERPRISE)
- **Track** — 12 learning tracks
- **Lab** — 80+ interactive exercises from QWorld notebooks
- **Question** — 240+ MCQs for quizzes & exams

### Progress Tracking
- **UserProgress** — Track completion, XP, streaks
- **LabAttempt** — Code submissions, auto-grading
- **ExamAttempt** — Mock exam results, analytics

### Gamification
- **Achievement** — Unlockable badges ("Entangled Learner", "Gate Master")
- **UserAchievement** — User's earned achievements

### Analytics
- **AnalyticsEvent** — First-party page views and interactions. Anonymous
  (random per-browser id, no cookies, no stored IP), and the source for the
  instructor dashboard at `/admin/dashboard`.
- **User.lastLoginAt / loginCount** — Denormalised sign-in summary; the full
  history lives in `AuditLog`.

### Infrastructure
- **ContentCache** — Redis-backed cache for external APIs (IBM Docs, arXiv)
- **AuditLog** — Security audit trail: sign-in, sign-out and account creation,
  with IP and user agent
- **RateLimit** — Request throttling per user/IP

---

## 🎯 IBM Certification Alignment

The exam prep track covers the official IBM Qiskit Developer Certification blueprint:

| Topic | Weight | Coverage |
|-------|--------|----------|
| Performing operations on quantum circuits | 47% | ✅ Tracks 2, 3, 5 |
| Executing circuits & representing states | 20% | ✅ Tracks 1, 3, 11 |
| Using the transpiler | 13% | ✅ Track 3 |
| Working with quantum backends | 10% | ✅ Track 11 |
| Other Qiskit SDK features | 10% | ✅ Tracks 7, 9, 10 |

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based sessions (30-day expiry)
- Role hierarchy: FREE < PRO < ENTERPRISE
- Protected routes via Next.js middleware
- Granular feature access control

### Code Execution Safety
- Isolated Docker containers per user
- Timeout limits (30s max execution)
- Resource quotas (CPU, memory)
- Input sanitization (Zod schemas)

### Data Protection
- Parameterized queries (Prisma ORM)
- HTTPS-only in production
- Secrets via environment variables (never client-exposed)

---

## 📊 Data Sources

### Internal (QWorld Content)
- **qbook101**: Quantum fundamentals, gates, algorithms
- **silver-qcourse511**: Advanced topics (VQE, QAOA, QML)
- **qec**: Quantum error correction
- **qkd**: Quantum key distribution

### External (Cached)
- **IBM Quantum Docs**: `https://docs.quantum.ibm.com`
- **Qiskit API Docs**: `https://qiskit.org/documentation`
- **arXiv Quantum Physics**: `https://arxiv.org/list/quant-ph/recent`
- **IBM Quantum Learning**: `https://learning.quantum.ibm.com`

All external content is cached in Redis with 24h TTL and stale-while-revalidate strategy.

---

## 🧪 Lab Environment

### Features
- **Monaco Editor**: Full VS Code experience in browser
- **Live Execution**: Run Qiskit code and see results instantly
- **Circuit Visualizer**: SVG circuit diagrams generated server-side
- **Bloch Sphere**: Interactive 3D visualization (Three.js)
- **Measurement Histogram**: Bar charts of quantum measurement outcomes
- **Auto-Grading**: Compare output with expected results
- **Hints System**: 3 hints per lab (costs XP)
- **Save/Load**: Persist circuits to user profile

### Execution Flow
```
User writes code → Submit to /api/lab/run → Docker sandbox → Qiskit execution
→ Generate circuit SVG + histogram → Return results → Display in UI
```

---

## 🚧 Development Roadmap

### ✅ Phase 1: Foundation (Current)
- [x] Database schema (Prisma)
- [x] Authentication (NextAuth + JWT)
- [x] QWorld notebook parser
- [x] 12 tracks mapping
- [x] Quantum UI theme
- [x] Homepage design

### 🔨 Phase 2: Core Features (In Progress)
- [ ] Track listing page with progress
- [ ] Lab environment (Monaco + visualizers)
- [ ] Sandboxed Qiskit execution API
- [ ] Bloch sphere 3D component
- [ ] Enhanced user authentication

### 📅 Phase 3: Advanced Features
- [ ] Exam prep module (60-question mocks)
- [ ] External data fetching (IBM Docs, arXiv)
- [ ] Achievement system
- [ ] User dashboard & analytics
- [ ] Advanced simulator features

### 🎨 Phase 4: Polish
- [ ] Circuit drag-and-drop builder
- [ ] Spaced repetition flashcards
- [ ] Weak-area detection
- [ ] Team/Enterprise features
- [ ] Mobile responsive optimizations

---

## 🤝 Contributing

This project uses content from [QWorld](https://qworld.net/) under their open education initiative.

### QWorld Content Attribution
- **qbook101**: QWorld Bronze/Silver courses
- **License**: [MIT/Apache 2.0] (check individual repos)
- **Authors**: QWorld global team

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

**QWorld Content**: Attributed to [QWorld](https://qworld.net/) and licensed under their respective licenses.

---

## 🌟 Acknowledgments

- **QWorld** — For open quantum education materials
- **IBM Quantum** — For Qiskit and quantum computing research
- **Next.js Team** — For the amazing framework
- **Vercel** — For deployment platform

---

<div align="center">
  <strong>Built with |ψ⟩ by quantum enthusiasts, for quantum learners</strong>
  <br><br>
  <a href="https://quantumui.dev">quantumui.dev</a> •
  <a href="https://twitter.com/quantumui">@quantumui</a> •
  <a href="https://discord.gg/quantumui">Discord</a>
</div>
