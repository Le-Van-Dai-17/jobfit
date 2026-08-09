import type { ApplicationEventType, ApplicationStatus, CompanyMembershipRole, JobStatus } from "@prisma/client";
import { z } from "zod";
import { recruiterRepository } from "../repositories/recruiter.repository";

export class RecruiterAccessError extends Error {}
export class RecruiterValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Recruiter input is invalid.");
  }
}
export class RecruiterStateTransitionError extends Error {}

type Membership = { companyId: string; role: CompanyMembershipRole; company: { name: string } };

export type RecruiterJobInput = {
  title?: string;
  location?: string | null;
  type?: string | null;
  salaryRange?: string | null;
  description?: string | null;
  requirements?: string | null;
  url?: string | null;
};

export type RecruiterRepository = {
  findMembership(userId: string): Promise<Membership | null>;
  getDashboardCounts(companyId: string): Promise<{
    jobs: number;
    activeJobs: number;
    archivedJobs: number;
    applications: number;
    assessmentReports: number;
    awaitingReview: number;
    awaitingAssessment: number;
  }>;
  listRecentApplications(companyId: string, take: number): Promise<unknown[]>;
  createJob(companyId: string, input: Required<RecruiterJobInput> & { company: string }): Promise<unknown>;
  listJobs(companyId: string): Promise<unknown[]>;
  findJobForCompany(companyId: string, jobId: string): Promise<unknown | null>;
  setJobArchived(companyId: string, jobId: string, isArchived: boolean): Promise<unknown>;
  setJobStatus(companyId: string, jobId: string, status: JobStatus): Promise<unknown>;
  updateJob(companyId: string, jobId: string, input: Required<RecruiterJobInput> & { company: string }): Promise<unknown>;
  listApplications(companyId: string, status?: ApplicationStatus): Promise<unknown[]>;
  findApplicationForCompany(
    companyId: string,
    applicationId: string
  ): Promise<{ id: string; status: ApplicationStatus } | null>;
  updateApplicationStatusWithEvent(
    companyId: string,
    applicationId: string,
    actorUserId: string,
    expectedStatus: ApplicationStatus,
    nextStatus: ApplicationStatus,
    notes?: string
  ): Promise<{ application: unknown; event: { applicationId: string; type: ApplicationEventType; notes: string | null } }>;
  findEmployerAssessmentReport(companyId: string, applicationId: string): Promise<unknown | null>;
};

const JobInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  location: z.string().trim().max(160).optional().nullable().transform(emptyToNull),
  type: z.string().trim().max(80).optional().nullable().transform(emptyToNull),
  salaryRange: z.string().trim().max(120).optional().nullable().transform(emptyToNull),
  description: z.string().trim().min(20).max(12000),
  requirements: z.string().trim().min(10).max(12000),
  url: z.string().trim().url().optional().nullable().or(z.literal("")).transform(emptyToNull),
});

const ListApplicationsSchema = z.object({
  status: z
    .enum(["DRAFT", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"])
    .optional(),
});

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["INTERVIEWING", "REJECTED", "WITHDRAWN"],
  INTERVIEWING: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["REJECTED", "WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
};

export function getAllowedApplicationTransitions(status: ApplicationStatus) {
  return allowedTransitions[status] ?? [];
}

function emptyToNull(value: string | null | undefined) {
  return value && value.length > 0 ? value : null;
}

export class RecruiterService {
  constructor(private readonly repository: RecruiterRepository = recruiterRepository) {}

  async getDashboard(userId: string) {
    const membership = await this.requireMembership(userId);
    const [counts, recentApplications] = await Promise.all([
      this.repository.getDashboardCounts(membership.companyId),
      this.repository.listRecentApplications(membership.companyId, 5),
    ]);
    return { companyId: membership.companyId, counts, recentApplications };
  }

  async createJob(userId: string, input: RecruiterJobInput) {
    const membership = await this.requireMembership(userId);
    const parsed = JobInputSchema.safeParse(input);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues);

    return this.repository.createJob(membership.companyId, { ...parsed.data, company: membership.company.name });
  }

  async listJobs(userId: string) {
    const membership = await this.requireMembership(userId);
    return this.repository.listJobs(membership.companyId);
  }

  async getJob(userId: string, jobId: string) {
    const membership = await this.requireMembership(userId);
    const job = await this.repository.findJobForCompany(membership.companyId, jobId);
    if (!job) throw new RecruiterAccessError("Resource is not available.");
    return job;
  }

  async publishJob(userId: string, jobId: string) {
    const membership = await this.requireMembership(userId);
    const job = await this.repository.setJobStatus(membership.companyId, jobId, "PUBLISHED");
    if (!job) throw new RecruiterAccessError("Resource is not available.");
    return job;
  }

  async archiveJob(userId: string, jobId: string) {
    const membership = await this.requireMembership(userId);
    const job = await this.repository.setJobStatus(membership.companyId, jobId, "ARCHIVED");
    if (!job) throw new RecruiterAccessError("Resource is not available.");
    return job;
  }

  async updateJob(userId: string, jobId: string, input: RecruiterJobInput) {
    const membership = await this.requireMembership(userId);
    const parsed = JobInputSchema.safeParse(input);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues);
    const job = await this.repository.updateJob(membership.companyId, jobId, {
      ...parsed.data,
      company: membership.company.name,
    });
    if (!job) throw new RecruiterAccessError("Resource is not available.");
    return job;
  }

  async listApplications(userId: string, filters: { status?: ApplicationStatus } = {}) {
    const membership = await this.requireMembership(userId);
    const parsed = ListApplicationsSchema.safeParse(filters);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues);
    return this.repository.listApplications(membership.companyId, parsed.data.status);
  }

  async getApplication(userId: string, applicationId: string) {
    const membership = await this.requireMembership(userId);
    const application = await this.repository.findApplicationForCompany(membership.companyId, applicationId);
    if (!application) throw new RecruiterAccessError("Resource is not available.");
    return application;
  }

  async transitionApplication(
    userId: string,
    applicationId: string,
    nextStatus: ApplicationStatus,
    notes?: string
  ) {
    const membership = await this.requireMembership(userId);
    const application = await this.repository.findApplicationForCompany(membership.companyId, applicationId);
    if (!application) throw new RecruiterAccessError("Resource is not available.");
    if (!allowedTransitions[application.status].includes(nextStatus)) {
      throw new RecruiterStateTransitionError("Application status transition is not allowed.");
    }

    return this.repository.updateApplicationStatusWithEvent(
      membership.companyId,
      applicationId,
      userId,
      application.status,
      nextStatus,
      notes
    );
  }

  async getAssessmentReport(userId: string, applicationId: string) {
    const membership = await this.requireMembership(userId);
    const report = await this.repository.findEmployerAssessmentReport(membership.companyId, applicationId);
    if (!report) throw new RecruiterAccessError("Resource is not available.");
    return report;
  }

  private async requireMembership(userId: string) {
    const membership = await this.repository.findMembership(userId);
    if (!membership) throw new RecruiterAccessError("Recruiter company membership is required.");
    return membership;
  }
}

export const recruiterService = new RecruiterService();
