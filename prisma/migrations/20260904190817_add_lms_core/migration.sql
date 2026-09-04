-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WeekKind" AS ENUM ('LEARNING', 'REVIEW', 'EXAM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('VIDEO', 'TEXT', 'PDF', 'IMAGE', 'LINK');

-- CreateEnum
CREATE TYPE "LinkKind" AS ENUM ('ARTICLE', 'SITE', 'PODCAST', 'VIDEO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverMediaId" INTEGER,
    "durationWeeks" INTEGER,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWeek" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT,
    "kind" "WeekKind" NOT NULL DEFAULT 'LEARNING',
    "opensAt" TIMESTAMP(3),

    CONSTRAINT "ProgramWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSession" (
    "id" SERIAL NOT NULL,
    "weekId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderInWeek" INTEGER NOT NULL DEFAULT 0,
    "instructor" TEXT,
    "durationMin" INTEGER,
    "publishAt" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "type" "ContentBlockType" NOT NULL,
    "isSupplementary" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "videoUrl" TEXT,
    "videoTitle" TEXT,
    "videoInstructor" TEXT,
    "videoDurationMin" INTEGER,
    "textBody" TEXT,
    "mediaFileId" INTEGER,
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "linkKind" "LinkKind",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionProgress" (
    "userId" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionProgress_pkey" PRIMARY KEY ("userId","sessionId")
);

-- CreateTable
CREATE TABLE "PersonalNote" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_status_idx" ON "Program"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramWeek_programId_weekNumber_key" ON "ProgramWeek"("programId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSession_slug_key" ON "ProgramSession"("slug");

-- CreateIndex
CREATE INDEX "ProgramSession_weekId_idx" ON "ProgramSession"("weekId");

-- CreateIndex
CREATE INDEX "ProgramSession_publishAt_idx" ON "ProgramSession"("publishAt");

-- CreateIndex
CREATE INDEX "ContentBlock_sessionId_idx" ON "ContentBlock"("sessionId");

-- CreateIndex
CREATE INDEX "Enrollment_programId_idx" ON "Enrollment"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_programId_key" ON "Enrollment"("userId", "programId");

-- CreateIndex
CREATE INDEX "PersonalNote_userId_sessionId_idx" ON "PersonalNote"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWeek" ADD CONSTRAINT "ProgramWeek_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSession" ADD CONSTRAINT "ProgramSession_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ProgramWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionProgress" ADD CONSTRAINT "SessionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionProgress" ADD CONSTRAINT "SessionProgress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalNote" ADD CONSTRAINT "PersonalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalNote" ADD CONSTRAINT "PersonalNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
