-- CreateTable
CREATE TABLE "CommunityThread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReply" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityThread_createdAt_idx" ON "CommunityThread"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityThread_authorId_idx" ON "CommunityThread"("authorId");

-- CreateIndex
CREATE INDEX "CommunityReply_threadId_createdAt_idx" ON "CommunityReply"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "CommunityThread" ADD CONSTRAINT "CommunityThread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReply" ADD CONSTRAINT "CommunityReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunityThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReply" ADD CONSTRAINT "CommunityReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

