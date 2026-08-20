import type { Prisma, WorkMode } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export class JobRepository {
  /**
   * Find jobs matching some basic filters
   */
  async findActiveJobs() {
    return prisma.job.findMany({
      where: {
        isArchived: false,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveJobsForCandidate(userId: string | undefined, filters: { q: string; mode: "all" | "remote" | "hybrid" | "onsite"; page: number; limit: number } = { q: "", mode: "all", page: 1, limit: 10 }, options: { includeProgress?: boolean } = { includeProgress: true }) {
    const conditions: Prisma.JobWhereInput[] = [];
    if (filters.q) {
      conditions.push({
        OR: [
          { title: { contains: filters.q, mode: "insensitive" as const } },
          { company: { contains: filters.q, mode: "insensitive" as const } },
        ],
      });
    }
    if (filters.mode !== "all") {
      const modeUpper = filters.mode.toUpperCase();
      const modeConditions: Prisma.JobWhereInput[] = [
        { type: { contains: filters.mode, mode: "insensitive" } },
        { location: { contains: filters.mode, mode: "insensitive" } },
      ];
      if (modeUpper === "REMOTE" || modeUpper === "HYBRID" || modeUpper === "ONSITE") {
        modeConditions.push({ workMode: modeUpper as WorkMode });
      }
      conditions.push({ OR: modeConditions });
    }

    const jobs = await prisma.job.findMany({
      where: {
        isArchived: false,
        status: "PUBLISHED",
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      },
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        location: true,
        salaryRange: true,
        type: true,
        deadline: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    const total = await prisma.job.count({
      where: {
        isArchived: false,
        status: "PUBLISHED",
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      }
    });

    const jobIds = jobs.map((job) => job.id);
    if (jobIds.length === 0) return { data: [], total };

    if (!userId) {
      return {
        data: jobs.map((job) => ({
          ...job,
          savedBy: [],
          applications: [],
          assessmentSessions: [],
        })),
        total
      };
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId, jobId: { in: jobIds } },
      select: { id: true, jobId: true },
    });
    const [applications, assessmentSessions] = options.includeProgress === false
      ? [[], []]
      : await Promise.all([
          prisma.application.findMany({
            where: { userId, deletedAt: null, jobId: { in: jobIds } },
            select: { id: true, jobId: true, status: true },
            orderBy: { updatedAt: "desc" },
          }),
          prisma.assessmentSession.findMany({
            where: { userId, jobId: { in: jobIds } },
            select: { id: true, jobId: true, applicationId: true, status: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
          }),
        ]);

    const savedByJobId = new Map(savedJobs.map((savedJob) => [savedJob.jobId, savedJob]));
    const latestApplicationByJobId = new Map<string, (typeof applications)[number]>();
    for (const application of applications) {
      if (!latestApplicationByJobId.has(application.jobId)) latestApplicationByJobId.set(application.jobId, application);
    }

    const latestAssessmentByJobId = new Map<string, (typeof assessmentSessions)[number]>();
    const latestAssessmentByApplicationId = new Map<string, (typeof assessmentSessions)[number]>();
    for (const assessmentSession of assessmentSessions) {
      if (!latestAssessmentByJobId.has(assessmentSession.jobId)) latestAssessmentByJobId.set(assessmentSession.jobId, assessmentSession);
      if (assessmentSession.applicationId && !latestAssessmentByApplicationId.has(assessmentSession.applicationId)) {
        latestAssessmentByApplicationId.set(assessmentSession.applicationId, assessmentSession);
      }
    }

    return {
      data: jobs.map((job) => {
        const savedJob = savedByJobId.get(job.id);
        const application = latestApplicationByJobId.get(job.id);
        const applicationAssessment = application ? latestAssessmentByApplicationId.get(application.id) : undefined;
        const jobAssessment = latestAssessmentByJobId.get(job.id);

        return {
          ...job,
          savedBy: savedJob ? [{ id: savedJob.id }] : [],
          applications: application
            ? [{ id: application.id, status: application.status, assessmentSessions: applicationAssessment ? [applicationAssessment] : [] }]
            : [],
          assessmentSessions: jobAssessment ? [jobAssessment] : [],
        };
      }),
      total
    };
  }

  async findPublishedById(id: string) {
    return prisma.job.findFirst({
      where: { id, isArchived: false, status: "PUBLISHED" },
    });
  }

  /**
   * Find a specific job by ID
   */
  async findById(id: string) {
    return this.findPublishedById(id);
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
