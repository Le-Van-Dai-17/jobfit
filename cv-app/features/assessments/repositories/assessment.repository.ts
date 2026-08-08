import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export class AssessmentSessionStateError extends Error {
  constructor() {
    super("Assessment session is not accepting submissions.");
    this.name = "AssessmentSessionStateError";
  }
}

type AssessmentResultInput = {
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

  async completeSubmission(input: {
    userId: string;
    sessionId: string;
    submissions: Array<{ taskId: string; answerText: string }>;
  }, evaluate: () => Promise<AssessmentResultInput>) {
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.assessmentSession.updateMany({
        where: { id: input.sessionId, userId: input.userId, status: "TASKS_GENERATED" },
        data: { status: "SUBMITTED" },
      });

      if (claimed.count !== 1) {
        throw new AssessmentSessionStateError();
      }

      const result = await evaluate();

      for (const submission of input.submissions) {
        await tx.assessmentSubmission.create({
          data: {
            sessionId: input.sessionId,
            taskId: submission.taskId,
            userId: input.userId,
            answerText: submission.answerText,
          },
        });
      }

      await tx.assessmentResult.create({
        data: {
          sessionId: input.sessionId,
          userId: input.userId,
          ...result,
        },
      });

      const updated = await tx.assessmentSession.updateMany({
        where: { id: input.sessionId, userId: input.userId, status: "SUBMITTED" },
        data: { status: "EVALUATED", completedAt: new Date() },
      });

      if (updated.count !== 1) {
        throw new AssessmentSessionStateError();
      }

      const session = await tx.assessmentSession.findFirst({
        where: { id: input.sessionId, userId: input.userId },
        include: {
          job: true,
          resumeVersion: { include: { resume: true } },
          tasks: { orderBy: { orderIndex: "asc" } },
          submissions: true,
          result: true,
        },
      });

      if (!session) {
        throw new Error("Assessment session was not found after saving the result.");
      }

      return session;
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
