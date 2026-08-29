-- AlterTable: email lifecycle stamps and the digest opt-out
ALTER TABLE "User" ADD COLUMN "welcomeEmailSentAt" TIMESTAMP(3),
ADD COLUMN "weeklyDigestSentAt" TIMESTAMP(3),
ADD COLUMN "monthlyDigestSentAt" TIMESTAMP(3),
ADD COLUMN "emailOptOut" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackSlug" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certificate_userId_issuedAt_idx" ON "Certificate"("userId", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_trackSlug_key" ON "Certificate"("userId", "trackSlug");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
