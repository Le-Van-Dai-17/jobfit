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

  /**
   * Find a specific job by ID
   */
  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
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
