import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export class AssessmentRepository {
  async listResumeVersionsForUser(userId: string) {
    return prisma.resumeVersion.findMany({
      where: { resume: { userId, deletedAt: null } },
      include: { resume: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listJobs() {
    return prisma.job.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async findResumeVersionForUser(userId: string, resumeVersionId: string) {
    return prisma.resumeVersion.findFirst({
      where: { id: resumeVersionId, resume: { userId, deletedAt: null } },
      include: { resume: true },
    });
  }

  async findJob(jobId: string) {
    return prisma.job.findFirst({
      where: { id: jobId, isArchived: false },
    });
  }

  async createSession(input: {
    userId: string;
    resumeVersionId: string;
    jobId: string;
    roleTitle: string;
    seniority: Prisma.AssessmentSessionCreateInput["seniority"];
    summary: string;
    tasks: Prisma.AssessmentTaskCreateWithoutSessionInput[];
  }) {
    return prisma.assessmentSession.create({
      data: {
        userId: input.userId,
        resumeVersionId: input.resumeVersionId,
        jobId: input.jobId,
        roleTitle: input.roleTitle,
        seniority: input.seniority,
        summary: input.summary,
        tasks: { create: input.tasks },
      },
      include: { tasks: { orderBy: { orderIndex: "asc" } }, result: true, job: true, resumeVersion: { include: { resume: true } } },
    });
  }

  async listSessionsForUser(userId: string) {
    return prisma.assessmentSession.findMany({
      where: { userId },
      include: { job: true, result: true, tasks: { orderBy: { orderIndex: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findSessionForUser(userId: string, sessionId: string) {
    return prisma.assessmentSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        job: true,
        resumeVersion: { include: { resume: true } },
        tasks: { orderBy: { orderIndex: "asc" } },
        submissions: true,
        result: true,
      },
    });
  }

  async saveSubmissionsAndResult(input: {
    userId: string;
    sessionId: string;
    submissions: Array<{ taskId: string; answerText: string }>;
    result: {
      advisoryScore: number;
      rubricBreakdown: Prisma.InputJsonValue;
      strengths: string[];
      gaps: string[];
      evidence: Prisma.InputJsonValue;
      limitations: string[];
      reportSummary: string;
      evaluatorModel: string;
      promptVersion: string;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      for (const submission of input.submissions) {
        await tx.assessmentSubmission.upsert({
          where: { sessionId_taskId: { sessionId: input.sessionId, taskId: submission.taskId } },
          update: { answerText: submission.answerText },
          create: {
            sessionId: input.sessionId,
            taskId: submission.taskId,
            userId: input.userId,
            answerText: submission.answerText,
          },
        });
      }

      await tx.assessmentResult.upsert({
        where: { sessionId: input.sessionId },
        update: input.result,
        create: {
          sessionId: input.sessionId,
          userId: input.userId,
          ...input.result,
        },
      });

      return tx.assessmentSession.update({
        where: { id: input.sessionId },
        data: { status: "EVALUATED", completedAt: new Date() },
        include: {
          job: true,
          resumeVersion: { include: { resume: true } },
          tasks: { orderBy: { orderIndex: "asc" } },
          submissions: true,
          result: true,
        },
      });
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
