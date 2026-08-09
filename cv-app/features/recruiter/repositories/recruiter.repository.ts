import { prisma } from "@/lib/db/prisma";
import type { ApplicationStatus, JobStatus, Prisma } from "@prisma/client";
import type { RecruiterApplicationSort } from "../services/recruiter-query";
import type { RecruiterRepository as RecruiterRepositoryContract } from "../services/recruiter.service";

export class PrismaRecruiterRepository implements RecruiterRepositoryContract {
  async findMembership(userId: string) {
    return prisma.companyMembership.findFirst({
      where: { userId, user: { deletedAt: null } },
      select: {
        companyId: true,
        role: true,
        company: {
          select: {
            name: true,
            website: true,
            description: true,
            location: true,
            industry: true,
            size: true,
          },
        },
      },
    });
  }

  async getDashboardCounts(companyId: string) {
    const [jobs, activeJobs, archivedJobs, applications, assessmentReports, awaitingReview, awaitingAssessment, interviewing, offers, rejected] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: "PUBLISHED", isArchived: false } }),
      prisma.job.count({ where: { companyId, status: "ARCHIVED", isArchived: true } }),
      prisma.application.count({ where: { deletedAt: null, user: { deletedAt: null }, job: { companyId } } }),
      prisma.assessmentResult.count({
        where: { session: { application: { deletedAt: null, user: { deletedAt: null }, job: { companyId } } } },
      }),
      prisma.application.count({ where: { deletedAt: null, user: { deletedAt: null }, status: "APPLIED", job: { companyId } } }),
      prisma.application.count({
        where: {
          deletedAt: null,
          user: { deletedAt: null },
          status: { in: ["DRAFT", "APPLIED", "INTERVIEWING"] },
          job: { companyId },
          assessmentSessions: { some: { status: { in: ["TASKS_GENERATED", "SUBMITTED"] } } },
        },
      }),
      prisma.application.count({ where: { deletedAt: null, user: { deletedAt: null }, status: "INTERVIEWING", job: { companyId } } }),
      prisma.application.count({ where: { deletedAt: null, user: { deletedAt: null }, status: "OFFER", job: { companyId } } }),
      prisma.application.count({ where: { deletedAt: null, user: { deletedAt: null }, status: "REJECTED", job: { companyId } } }),
    ]);
    return {
      jobs, activeJobs, archivedJobs, applications, assessmentReports, awaitingReview, awaitingAssessment,
      pipeline: { APPLIED: awaitingReview, INTERVIEWING: interviewing, OFFER: offers, REJECTED: rejected },
    };
  }

  listRecentApplications(companyId: string, take: number) {
    return prisma.application.findMany({
      where: { deletedAt: null, user: { deletedAt: null }, job: { companyId } },
      include: {
        user: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
      orderBy: [{ appliedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take,
    });
  }

  createJob(companyId: string, input: Parameters<RecruiterRepositoryContract["createJob"]>[1]) {
    return prisma.job.create({
      data: { ...input, companyId, source: "MANUAL", isArchived: true, status: "DRAFT" },
    });
  }

  listJobs(companyId: string, filters?: { search?: string; status?: JobStatus }) {
    const where: Prisma.JobWhereInput = {
      companyId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { location: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { requirements: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return prisma.job.findMany({
      where,
      include: { _count: { select: { applications: true, assessmentSessions: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  findJobForCompany(companyId: string, jobId: string) {
    return prisma.job.findFirst({
      where: { id: jobId, companyId },
      include: { _count: { select: { applications: true, assessmentSessions: true } } },
    });
  }

  async setJobArchived(companyId: string, jobId: string, isArchived: boolean) {
    const updated = await prisma.job.updateMany({
      where: { id: jobId, companyId },
      data: { isArchived },
    });
    if (updated.count !== 1) return null;
    return this.findJobForCompany(companyId, jobId);
  }

  async setJobStatus(companyId: string, jobId: string, expectedStatus: JobStatus, status: JobStatus) {
    const updated = await prisma.job.updateMany({
      where: { id: jobId, companyId, status: expectedStatus },
      data: { status, isArchived: status !== "PUBLISHED" },
    });
    if (updated.count !== 1) return null;
    return this.findJobForCompany(companyId, jobId);
  }

  async updateJob(companyId: string, jobId: string, input: Parameters<RecruiterRepositoryContract["updateJob"]>[2]) {
    const updated = await prisma.job.updateMany({
      where: { id: jobId, companyId, status: { not: "ARCHIVED" } },
      data: input,
    });
    if (updated.count !== 1) return null;
    return this.findJobForCompany(companyId, jobId);
  }

  async listApplications(companyId: string, filters?: { status?: ApplicationStatus; search?: string; jobId?: string; sort?: RecruiterApplicationSort }) {
    const where: Prisma.ApplicationWhereInput = {
      deletedAt: null,
      ...(filters?.status ? { status: filters.status } : {}),
      user: {
        deletedAt: null,
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      job: {
        companyId,
        ...(filters?.jobId ? { id: filters.jobId } : {}),
      },
    };
    const applications = await prisma.application.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: true,
        resumeVersion: {
          include: {
            resume: true,
            matchAnalyses: {
              where: { job: { companyId } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        assessmentSessions: { include: { result: true }, orderBy: { updatedAt: "desc" } },
      },
      orderBy: filters?.sort === "oldest" ? { updatedAt: "asc" } : { updatedAt: "desc" },
    });

    if (filters?.sort !== "match") return applications;

    return applications.sort((a, b) => {
      const aScore = a.resumeVersion?.matchAnalyses.find((analysis) => analysis.jobId === a.jobId)?.overallScore ?? -1;
      const bScore = b.resumeVersion?.matchAnalyses.find((analysis) => analysis.jobId === b.jobId)?.overallScore ?? -1;
      return bScore - aScore || b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  findApplicationForCompany(companyId: string, applicationId: string) {
    return prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null, user: { deletedAt: null }, job: { companyId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: true,
        resumeVersion: { include: { resume: true } },
        events: { orderBy: { date: "desc" } },
        assessmentSessions: { include: { result: true, tasks: true }, orderBy: { updatedAt: "desc" } },
      },
    });
  }

  updateApplicationStatusWithEvent(
    companyId: string,
    applicationId: string,
    actorUserId: string,
    expectedStatus: ApplicationStatus,
    nextStatus: ApplicationStatus,
    notes?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.updateMany({
        where: { id: applicationId, deletedAt: null, status: expectedStatus, user: { deletedAt: null }, job: { companyId } },
        data: { status: nextStatus },
      });
      if (updated.count !== 1) {
        return null;
      }
      const [application, event] = await Promise.all([
        tx.application.findFirstOrThrow({ where: { id: applicationId, job: { companyId } }, include: { job: true } }),
        tx.applicationEvent.create({
          data: {
            applicationId,
            type: "STATUS_CHANGE",
            actorUserId,
            fromStatus: expectedStatus,
            toStatus: nextStatus,
            notes: notes?.trim() || null,
          },
        }),
      ]);
      return { application, event };
    });
  }

  listEmployerAssessmentReports(companyId: string) {
    return prisma.assessmentResult.findMany({
      where: {
        session: {
          status: "EVALUATED",
          application: { deletedAt: null, user: { deletedAt: null }, job: { companyId } },
        },
      },
      select: {
        id: true,
        advisoryScore: true,
        createdAt: true,
        reportSummary: true,
        session: {
          select: {
            applicationId: true,
            roleTitle: true,
            application: {
              select: {
                id: true,
                user: { select: { name: true, email: true } },
                job: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findEmployerAssessmentReport(companyId: string, applicationId: string) {
    return prisma.assessmentResult.findFirst({
      where: { session: { status: "EVALUATED", applicationId, application: { deletedAt: null, user: { deletedAt: null }, job: { companyId } } } },
      select: {
        id: true,
        advisoryScore: true,
        rubricBreakdown: true,
        strengths: true,
        gaps: true,
        evidence: true,
        limitations: true,
        reportSummary: true,
        createdAt: true,
        session: {
          select: {
            id: true,
            roleTitle: true,
            seniority: true,
            job: { select: { id: true, title: true, company: true } },
          },
        },
      },
    });
  }
}

export const recruiterRepository = new PrismaRecruiterRepository();
