-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('TASKS_GENERATED', 'SUBMITTED', 'EVALUATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssessmentSeniority" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD');

-- CreateEnum
CREATE TYPE "AssessmentTaskType" AS ENUM ('SYSTEM_DESIGN', 'DEBUGGING', 'IMPLEMENTATION_PLAN', 'CODE_REVIEW');

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'TASKS_GENERATED',
    "roleTitle" TEXT NOT NULL,
    "seniority" "AssessmentSeniority" NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentTask" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" "AssessmentTaskType" NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "skills" TEXT[],
    "rubric" JSONB NOT NULL,
    "expectedEvidence" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSubmission" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advisoryScore" INTEGER NOT NULL,
    "rubricBreakdown" JSONB NOT NULL,
    "strengths" TEXT[],
    "gaps" TEXT[],
    "evidence" JSONB NOT NULL,
    "limitations" TEXT[],
    "reportSummary" TEXT NOT NULL,
    "evaluatorModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentSession_userId_idx" ON "AssessmentSession"("userId");

-- CreateIndex
CREATE INDEX "AssessmentSession_resumeVersionId_idx" ON "AssessmentSession"("resumeVersionId");

-- CreateIndex
CREATE INDEX "AssessmentSession_jobId_idx" ON "AssessmentSession"("jobId");

-- CreateIndex
CREATE INDEX "AssessmentTask_sessionId_idx" ON "AssessmentTask"("sessionId");

-- CreateIndex
CREATE INDEX "AssessmentSubmission_userId_idx" ON "AssessmentSubmission"("userId");

-- CreateIndex
CREATE INDEX "AssessmentSubmission_taskId_idx" ON "AssessmentSubmission"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSubmission_sessionId_taskId_key" ON "AssessmentSubmission"("sessionId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResult_sessionId_key" ON "AssessmentResult"("sessionId");

-- CreateIndex
CREATE INDEX "AssessmentResult_userId_idx" ON "AssessmentResult"("userId");

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentTask" ADD CONSTRAINT "AssessmentTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AssessmentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;