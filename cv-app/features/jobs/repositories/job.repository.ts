import { prisma } from "@/lib/db/prisma";

export class JobRepository {
  /**
   * Find jobs matching some basic filters
   */
  async findActiveJobs() {
    return prisma.job.findMany({
      where: {
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveJobsForCandidate(userId: string) {
    return prisma.job.findMany({
      where: {
        isArchived: false,
      },
      include: {
        savedBy: { where: { userId } },
        applications: {
          where: { userId, deletedAt: null },
          include: { assessmentSessions: { orderBy: { updatedAt: "desc" }, take: 1 } },
        },
        assessmentSessions: {
          where: { userId },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find a specific job by ID
   */
  async findById(id: string) {
    return prisma.job.findFirst({
      where: { id, isArchived: false },
    });
  }

  /**
   * Find all jobs saved by a specific user
   */
  async findSavedJobs(userId: string) {
    return prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findSavedJob(userId: string, jobId: string) {
    return prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
  }

  deleteSavedJob(userId: string, jobId: string) {
    return prisma.savedJob.delete({
      where: { userId_jobId: { userId, jobId } },
    });
  }

  /**
   * Save a job for a user
   */
  async saveJob(userId: string, jobId: string) {
    return prisma.savedJob.upsert({
      where: {
        userId_jobId: { userId, jobId },
      },
      update: {
        status: "BOOKMARKED",
      },
      create: {
        userId,
        jobId,
        status: "BOOKMARKED",
      },
    });
  }
}

export const jobRepository = new JobRepository();
