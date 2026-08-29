-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FREE', 'PRO', 'ENTERPRISE', 'STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "TrackDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LabType" AS ENUM ('INTERACTIVE', 'TUTORIAL', 'EXERCISE', 'PROJECT');

-- CreateEnum
CREATE TYPE "LabAttemptStatus" AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODE_OUTPUT');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('MILESTONE', 'STREAK', 'PERFECT_SCORE', 'SPEED', 'MASTERY', 'SPECIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FREE',
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "TrackDifficulty" NOT NULL,
    "order" INTEGER NOT NULL,
    "labCount" INTEGER NOT NULL DEFAULT 0,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" DOUBLE PRECISION,
    "qworldSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "LabType" NOT NULL DEFAULT 'INTERACTIVE',
    "notebookPath" TEXT,
    "markdown" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "solutionCode" TEXT,
    "expectedOutput" TEXT,
    "testCases" JSONB,
    "hints" JSONB,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabAttempt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "labId" INTEGER NOT NULL,
    "submittedCode" TEXT NOT NULL,
    "output" TEXT,
    "circuitSvg" TEXT,
    "status" "LabAttemptStatus" NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "question" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "ibmExamTopic" TEXT,
    "ibmExamWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION,
    "timeLimit" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "weakAreas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "labsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalLabs" INTEGER NOT NULL,
    "completionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "quantumState" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "assignedById" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trackSlug" TEXT,
    "labTopic" TEXT,
    "difficulty" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "type" "AchievementType" NOT NULL,
    "requirement" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentCache" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "userId" TEXT,
    "visitorId" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");

-- CreateIndex
CREATE INDEX "Track_slug_idx" ON "Track"("slug");

-- CreateIndex
CREATE INDEX "Track_order_idx" ON "Track"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_slug_key" ON "Lab"("slug");

-- CreateIndex
CREATE INDEX "Lab_trackId_order_idx" ON "Lab"("trackId", "order");

-- CreateIndex
CREATE INDEX "Lab_slug_idx" ON "Lab"("slug");

-- CreateIndex
CREATE INDEX "LabAttempt_userId_labId_idx" ON "LabAttempt"("userId", "labId");

-- CreateIndex
CREATE INDEX "LabAttempt_userId_createdAt_idx" ON "LabAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Question_trackId_idx" ON "Question"("trackId");

-- CreateIndex
CREATE INDEX "Question_ibmExamTopic_idx" ON "Question"("ibmExamTopic");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_createdAt_idx" ON "ExamAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_type_createdAt_idx" ON "ExamAttempt"("type", "createdAt");

-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_trackId_key" ON "UserProgress"("userId", "trackId");

-- CreateIndex
CREATE INDEX "Assignment_studentId_status_idx" ON "Assignment"("studentId", "status");

-- CreateIndex
CREATE INDEX "Assignment_assignedById_createdAt_idx" ON "Assignment"("assignedById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_earnedAt_idx" ON "UserAchievement"("userId", "earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "ContentCache_source_expiresAt_idx" ON "ContentCache"("source", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentCache_source_key_key" ON "ContentCache"("source", "key");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_id_endpoint_key" ON "RateLimit"("id", "endpoint");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_createdAt_idx" ON "AnalyticsEvent"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAttempt" ADD CONSTRAINT "LabAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAttempt" ADD CONSTRAINT "LabAttempt_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

