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

  async findApplicationContext(userId: string, applicationId: string) {
    return prisma.application.findFirst({
      where: { id: applicationId, userId, deletedAt: null, user: { deletedAt: null } },
      select: { id: true, userId: true, jobId: true, resumeVersionId: true },
    });
  }

  async createSession(input: {
    userId: string;
    resumeVersionId: string;
    jobId: string;
    applicationId?: string | null;
    roleTitle: string;
    seniority: Prisma.AssessmentSessionCreateInput["seniority"];
    summary: string;
    tasks: Prisma.AssessmentTaskCreateWithoutSessionInput[];
  }) {
    return prisma.$transaction(async (tx) => {
      const [resumeVersion, job, application] = await Promise.all([
        tx.resumeVersion.findFirst({
          where: { id: input.resumeVersionId, resume: { userId: input.userId, deletedAt: null, user: { deletedAt: null } } },
          select: { id: true },
        }),
        tx.job.findFirst({
          where: { id: input.jobId, isArchived: false },
          select: { id: true },
        }),
        input.applicationId
          ? tx.application.findFirst({
              where: {
                id: input.applicationId,
                userId: input.userId,
                jobId: input.jobId,
                resumeVersionId: input.resumeVersionId,
                deletedAt: null,
                user: { deletedAt: null },
              },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

      if (!resumeVersion || !job || (input.applicationId && !application)) {
        throw new AssessmentSessionStateError();
      }

      return tx.assessmentSession.create({
        data: {
          userId: input.userId,
          resumeVersionId: input.resumeVersionId,
          jobId: input.jobId,
          applicationId: input.applicationId,
          roleTitle: input.roleTitle,
          seniority: input.seniority,
          summary: input.summary,
          tasks: { create: input.tasks },
        },
        include: { tasks: { orderBy: { orderIndex: "asc" } }, result: true, job: true, resumeVersion: { include: { resume: true } } },
      });
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
    // 1. Pre-claim the session outside the main transaction
    const claimed = await prisma.assessmentSession.updateMany({
      where: { id: input.sessionId, userId: input.userId, status: "TASKS_GENERATED" },
      data: { status: "SUBMITTED" },
    });

    if (claimed.count !== 1) {
      throw new AssessmentSessionStateError();
    }

    const taskCount = await prisma.assessmentTask.count({
      where: {
        sessionId: input.sessionId,
        id: { in: input.submissions.map((submission) => submission.taskId) },
      },
    });
    if (taskCount !== input.submissions.length) {
      // Revert
      await prisma.assessmentSession.updateMany({ where: { id: input.sessionId }, data: { status: "TASKS_GENERATED" }});
      throw new AssessmentSessionStateError();
    }

    // 2. Evaluate using AI provider (Long running, do not hold DB transaction)
    let result;
    try {
      result = await evaluate();
    } catch (e) {
      // Revert if AI fails
      await prisma.assessmentSession.updateMany({ where: { id: input.sessionId }, data: { status: "TASKS_GENERATED" }});
      throw e;
    }

    // 3. Save submissions and result in a fast transaction
    return prisma.$transaction(async (tx) => {
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

      if (session.applicationId) {
        await tx.application.update({
          where: { id: session.applicationId },
          data: {
            status: "APPLIED",
            events: {
              create: {
                type: "STATUS_CHANGE",
                actorUserId: input.userId,
                fromStatus: "DRAFT",
                toStatus: "APPLIED",
                notes: "Ứng viên đã hoàn thành bài kiểm tra. Đơn ứng tuyển chính thức được nộp.",
              },
            },
          },
        });
      }

      return session;
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
