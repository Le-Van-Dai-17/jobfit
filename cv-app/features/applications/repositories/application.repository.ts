import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class ApplicationUniqueConstraintError extends Error {}

export class ApplicationRepository {
  findActiveJob(jobId: string) {
    return prisma.job.findFirst({
      where: { id: jobId, isArchived: false },
    });
  }

  findResumeVersionForUser(userId: string, resumeVersionId: string) {
    return prisma.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: { userId, deletedAt: null },
      },
      include: { resume: true },
    });
  }

  findApplicationForUserAndJob(userId: string, jobId: string) {
    return prisma.application.findFirst({
      where: { userId, jobId, deletedAt: null },
    });
  }

  async createApplication(userId: string, input: { jobId: string; resumeVersionId: string; notes?: string }) {
    try {
      return await prisma.application.create({
        data: {
          userId,
          jobId: input.jobId,
          resumeVersionId: input.resumeVersionId,
          notes: input.notes,
          status: "APPLIED",
          appliedAt: new Date(),
          events: {
            create: {
              type: "STATUS_CHANGE",
              actorUserId: userId,
              fromStatus: "DRAFT",
              toStatus: "APPLIED",
              notes: "Ung vien da nop don ung tuyen.",
            },
          },
        },
        include: { job: true, resumeVersion: { include: { resume: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApplicationUniqueConstraintError("Bạn đã ứng tuyển vị trí này.");
      }
      throw error;
    }
  }

  listApplicationsForUser(userId: string) {
    return prisma.application.findMany({
      where: { userId, deletedAt: null },
      include: {
        job: true,
        resumeVersion: { include: { resume: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  findApplicationForUser(userId: string, applicationId: string) {
    return prisma.application.findFirst({
      where: { id: applicationId, userId, deletedAt: null, user: { deletedAt: null } },
      include: {
        job: true,
        resumeVersion: { include: { resume: true } },
        events: { orderBy: { date: "desc" } },
        assessmentSessions: { include: { result: true }, orderBy: { updatedAt: "desc" } },
      },
    });
  }
}

export const applicationRepository = new ApplicationRepository();
