import { prisma } from "@/lib/db/prisma";
import type { ApplicationStatus, JobStatus } from "@prisma/client";
import type { RecruiterRepository as RecruiterRepositoryContract } from "../services/recruiter.service";

export class PrismaRecruiterRepository implements RecruiterRepositoryContract {
  async findMembership(userId: string) {
    return prisma.companyMembership.findFirst({
      where: { userId, user: { deletedAt: null } },
      select: { companyId: true, role: true, company: { select: { name: true } } },
    });
  }

  async getDashboardCounts(companyId: string) {
    const [jobs, activeJobs, archivedJobs, applications, assessmentReports, awaitingReview, awaitingAssessment] = await Promise.all([
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
    ]);
    return { jobs, activeJobs, archivedJobs, applications, assessmentReports, awaitingReview, awaitingAssessment };
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

  listJobs(companyId: string) {
    return prisma.job.findMany({
      where: { companyId },
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

  listApplications(companyId: string, status?: ApplicationStatus) {
    return prisma.application.findMany({
      where: { deletedAt: null, status, user: { deletedAt: null }, job: { companyId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: true,
        resumeVersion: { include: { resume: true } },
        assessmentSessions: { include: { result: true }, orderBy: { updatedAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
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
        throw new Error("Application status update failed.");
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
