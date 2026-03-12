-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('SUCCESS', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL DEFAULT '',
    "accountAvatar" TEXT NOT NULL DEFAULT '',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishLog" (
    "id" TEXT NOT NULL,
    "scheduledPostId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL,
    "platformPostId" TEXT,
    "errorMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PublishLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialAccount_userId_idx" ON "SocialAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_userId_platform_key" ON "SocialAccount"("userId", "platform");

-- CreateIndex
CREATE INDEX "PublishLog_scheduledPostId_idx" ON "PublishLog"("scheduledPostId");

-- CreateIndex
CREATE INDEX "PublishLog_status_idx" ON "PublishLog"("status");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishLog" ADD CONSTRAINT "PublishLog_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
