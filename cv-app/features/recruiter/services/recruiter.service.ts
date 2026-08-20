import type {
  ApplicationEventType, ApplicationStatus, CompanyMembershipRole, EmploymentType,
  ExperienceLevel, JobDepartment, JobStatus, WorkMode,
} from "@prisma/client";
import { z } from "zod";
import { recruiterRepository } from "../repositories/recruiter.repository";
import type { RecruiterApplicationSort } from "./recruiter-query";

export class RecruiterAccessError extends Error {}
export class RecruiterValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) { super("Recruiter input is invalid."); }
}
export class RecruiterStateTransitionError extends Error {}

type Membership = {
  companyId: string;
  role: CompanyMembershipRole;
  company: {
    name: string;
    website?: string | null;
    description?: string | null;
    location?: string | null;
    industry?: string | null;
    size?: string | null;
  };
};
export type RecruiterJobInput = {
  title?: string; location?: string | null; type?: string | null; salaryRange?: string | null;
  description?: string | null; requirements?: string | null; url?: string | null; deadline?: string | Date | null;
  department?: JobDepartment | "" | null; employmentType?: EmploymentType | "" | null;
  workMode?: WorkMode | "" | null; experienceLevel?: ExperienceLevel | "" | null;
  salaryMin?: string | number | null; salaryMax?: string | number | null; salaryCurrency?: string | null;
  salaryNegotiable?: boolean | string | null; skills?: string[] | string | null; benefits?: string | null;
};

type JobWrite = {
  title: string; location: string | null; type: string | null; salaryRange: string | null;
  description: string; requirements: string; url: string | null; deadline: Date | null;
  department: JobDepartment | null; employmentType: EmploymentType | null; workMode: WorkMode | null;
  experienceLevel: ExperienceLevel | null; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryNegotiable: boolean; skills: string[]; benefits: string | null; company: string;
};
export type RecruiterRepository = {
  findMembership(userId: string): Promise<Membership | null>;
  getDashboardCounts(companyId: string): Promise<{ jobs: number; activeJobs: number; archivedJobs: number; applications: number; assessmentReports: number; awaitingReview: number; awaitingAssessment: number; pipeline: { APPLIED: number; INTERVIEWING: number; OFFER: number; REJECTED: number } }>;
  listRecentApplications(companyId: string, take: number): Promise<unknown[]>;
  createJob(companyId: string, input: JobWrite): Promise<unknown>;
  listJobs(companyId: string, filters?: { search?: string; status?: JobStatus }): Promise<unknown[]>;
  findJobForCompany(companyId: string, jobId: string): Promise<({ id: string; status: JobStatus; isArchived: boolean } & Record<string, unknown>) | null>;
  setJobArchived(companyId: string, jobId: string, isArchived: boolean): Promise<unknown>;
  setJobStatus(companyId: string, jobId: string, expectedStatus: JobStatus, status: JobStatus): Promise<unknown>;
  updateJob(companyId: string, jobId: string, input: JobWrite): Promise<unknown>;
  listApplications(companyId: string, filters?: { status?: ApplicationStatus; search?: string; jobId?: string; sort?: RecruiterApplicationSort }): Promise<unknown[]>;
  findApplicationForCompany(companyId: string, applicationId: string): Promise<{ id: string; status: ApplicationStatus } | null>;
  updateApplicationStatusWithEvent(companyId: string, applicationId: string, actorUserId: string, expectedStatus: ApplicationStatus, nextStatus: ApplicationStatus, notes?: string): Promise<{ application: unknown; event: { applicationId: string; type: ApplicationEventType; notes: string | null } } | null>;
  listEmployerAssessmentReports(companyId: string): Promise<unknown[]>;
  findEmployerAssessmentReport(companyId: string, applicationId: string): Promise<unknown | null>;
};

const nullableText = (max: number) => z.string().trim().max(max).optional().nullable().transform(emptyToNull);
const money = z.union([z.string(), z.number()]).optional().nullable().transform((value, ctx) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value.replace(/[^0-9]/g, ""));
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 2_000_000_000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Má»©c lÆ°Æ¡ng khÃ´ng há»£p lá»‡." });
    return z.NEVER;
  }
  return parsed;
});
const JobInputSchema = z.object({
  title: z.string().trim().min(3, "TÃªn vá»‹ trÃ­ pháº£i cÃ³ Ã­t nháº¥t 3 kÃ½ tá»±.").max(160),
  location: nullableText(160), type: nullableText(80), salaryRange: nullableText(120),
  description: z.string().trim().min(20, "MÃ´ táº£ cÃ´ng viá»‡c pháº£i cÃ³ Ã­t nháº¥t 20 kÃ½ tá»±.").max(12000),
  requirements: z.string().trim().min(10, "YÃªu cáº§u á»©ng viÃªn pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±.").max(12000),
  benefits: nullableText(12000),
  url: z.string().trim().url("LiÃªn káº¿t JD khÃ´ng há»£p lá»‡.").optional().nullable().or(z.literal("")).transform(emptyToNull),
  deadline: z.union([z.string(), z.date()]).optional().nullable().transform((value, ctx) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Háº¡n á»©ng tuyá»ƒn khÃ´ng há»£p lá»‡." }); return z.NEVER; }
    return date;
  }),
  department: z.enum(["ENGINEERING","PRODUCT","DESIGN","DATA","MARKETING","SALES","OPERATIONS","HUMAN_RESOURCES","FINANCE","OTHER"]).optional().nullable().or(z.literal("")).transform(emptyToNull),
  employmentType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","TEMPORARY"]).optional().nullable().or(z.literal("")).transform(emptyToNull),
  workMode: z.enum(["ONSITE","HYBRID","REMOTE"]).optional().nullable().or(z.literal("")).transform(emptyToNull),
  experienceLevel: z.enum(["INTERN","JUNIOR","MID","SENIOR","LEAD","MANAGER"]).optional().nullable().or(z.literal("")).transform(emptyToNull),
  salaryMin: money, salaryMax: money,
  salaryCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional().nullable().transform((v) => v || "VND"),
  salaryNegotiable: z.union([z.boolean(), z.string()]).optional().nullable().transform((v) => v === true || v === "true" || v === "on"),
  skills: z.union([z.array(z.string()), z.string()]).optional().nullable().transform((value) => {
    const list = Array.isArray(value) ? value : (value ?? "").split(",");
    return [...new Set(list.map((item) => item.trim()).filter(Boolean))].slice(0, 30);
  }),
}).superRefine((data, ctx) => {
  if (data.salaryMin !== null && data.salaryMax !== null && data.salaryMin > data.salaryMax) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["salaryMax"], message: "LÆ°Æ¡ng tá»‘i Ä‘a pháº£i lá»›n hÆ¡n hoáº·c báº±ng lÆ°Æ¡ng tá»‘i thiá»ƒu." });
  }
});

const ListApplicationsSchema = z.object({
  status: z.enum(["DRAFT","APPLIED","INTERVIEWING","OFFER","REJECTED","WITHDRAWN"]).optional(),
  search: z.string().trim().max(160).optional().transform((value) => value || undefined),
  jobId: z.string().trim().max(160).optional().transform((value) => value || undefined),
  sort: z.enum(["match", "recent", "oldest"]).optional().default("recent"),
});
const ListJobsSchema = z.object({
  search: z.string().trim().max(160).optional().transform((value) => value || undefined),
  status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).optional(),
});
const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["APPLIED", "WITHDRAWN"], APPLIED: ["INTERVIEWING", "REJECTED", "WITHDRAWN"],
  INTERVIEWING: ["OFFER", "REJECTED", "WITHDRAWN"], OFFER: ["REJECTED", "WITHDRAWN"], REJECTED: [], WITHDRAWN: [],
};
export function getAllowedApplicationTransitions(status: ApplicationStatus) { return allowedTransitions[status] ?? []; }
function emptyToNull(value: string | null | undefined) { return value && value.length > 0 ? value : null; }
function legacyType(employmentType: EmploymentType | null, workMode: WorkMode | null, fallback: string | null) {
  return [employmentType, workMode].filter(Boolean).join(" Â· ") || fallback;
}
function legacySalary(min: number | null, max: number | null, currency: string, negotiable: boolean, fallback: string | null) {
  if (negotiable) return "Thá»a thuáº­n";
  if (min === null && max === null) return fallback;
  return `${min?.toLocaleString("vi-VN") ?? "?"} â€“ ${max?.toLocaleString("vi-VN") ?? "?"} ${currency}`;
}

export class RecruiterService {
  constructor(private readonly repository: RecruiterRepository = recruiterRepository) {}
  private async requireMembership(userId: string) {
    const membership = await this.repository.findMembership(userId);
    if (!membership) throw new RecruiterAccessError("Recruiter company membership is required.");
    return membership;
  }
  private parseJob(input: RecruiterJobInput, company: string): JobWrite {
    const parsed = JobInputSchema.safeParse(input);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues);
    return { ...parsed.data, company,
      department: parsed.data.department as JobDepartment | null,
      employmentType: parsed.data.employmentType as EmploymentType | null,
      workMode: parsed.data.workMode as WorkMode | null,
      experienceLevel: parsed.data.experienceLevel as ExperienceLevel | null,
      type: legacyType(parsed.data.employmentType as EmploymentType | null, parsed.data.workMode as WorkMode | null, parsed.data.type),
      salaryRange: legacySalary(parsed.data.salaryMin, parsed.data.salaryMax, parsed.data.salaryCurrency, parsed.data.salaryNegotiable, parsed.data.salaryRange),
    };
  }
  async getDashboard(userId: string) {
    const membership = await this.requireMembership(userId);
    const counts = await this.repository.getDashboardCounts(membership.companyId);
    const recentApplications = await this.repository.listRecentApplications(membership.companyId, 5);
    const hasCompanyProfile = Boolean(
      membership.company.name &&
        membership.company.website &&
        membership.company.description &&
        membership.company.location &&
        membership.company.industry &&
        membership.company.size
    );
    return {
      companyId: membership.companyId,
      counts,
      onboardingChecklist: [
        { key: "companyProfile", label: "Hoàn thiện hồ sơ công ty", completed: hasCompanyProfile },
        { key: "firstJob", label: "Tạo JD đầu tiên", completed: counts.jobs > 0 },
        { key: "publishedJob", label: "Đăng vị trí đang mở", completed: counts.activeJobs > 0 },
        { key: "candidatePipeline", label: "Có ứng viên trong pipeline", completed: counts.applications > 0 },
      ],
      recentApplications,
    };
  }
  async createJob(userId: string, input: RecruiterJobInput) {
    const membership = await this.requireMembership(userId);
    return this.repository.createJob(membership.companyId, this.parseJob(input, membership.company.name));
  }
  async listJobs(userId: string, filters: { search?: string; status?: JobStatus } = {}) {
    const m = await this.requireMembership(userId);
    const parsed = ListJobsSchema.safeParse(filters);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues);
    return this.repository.listJobs(m.companyId, parsed.data);
  }
  async getJob(userId: string, jobId: string) {
    const m = await this.requireMembership(userId); const job = await this.repository.findJobForCompany(m.companyId, jobId);
    if (!job) throw new RecruiterAccessError("Resource is not available."); return job;
  }
  private async transitionJob(userId: string, jobId: string, next: JobStatus, from: JobStatus[]) {
    const m = await this.requireMembership(userId); const job = await this.repository.findJobForCompany(m.companyId, jobId);
    if (!job) throw new RecruiterAccessError("Resource is not available.");
    if (!from.includes(job.status)) throw new RecruiterStateTransitionError("Job status transition is not allowed.");
    const updated = await this.repository.setJobStatus(m.companyId, jobId, job.status, next);
    if (!updated) throw new RecruiterStateTransitionError("Job status changed concurrently."); return updated;
  }
  publishJob(userId: string, jobId: string) { return this.transitionJob(userId, jobId, "PUBLISHED", ["DRAFT"]); }
  archiveJob(userId: string, jobId: string) { return this.transitionJob(userId, jobId, "ARCHIVED", ["DRAFT", "PUBLISHED"]); }
  restoreJob(userId: string, jobId: string) { return this.transitionJob(userId, jobId, "DRAFT", ["ARCHIVED"]); }
  async updateJob(userId: string, jobId: string, input: RecruiterJobInput) {
    const m = await this.requireMembership(userId); const current = await this.repository.findJobForCompany(m.companyId, jobId);
    if (!current) throw new RecruiterAccessError("Resource is not available.");
    if (current.status === "ARCHIVED") throw new RecruiterStateTransitionError("Archived jobs cannot be edited.");
    const job = await this.repository.updateJob(m.companyId, jobId, this.parseJob(input, m.company.name));
    if (!job) throw new RecruiterAccessError("Resource is not available."); return job;
  }
  async listApplications(userId: string, filters: { status?: ApplicationStatus; search?: string; jobId?: string; sort?: RecruiterApplicationSort } = {}) {
    const m = await this.requireMembership(userId); const parsed = ListApplicationsSchema.safeParse(filters);
    if (!parsed.success) throw new RecruiterValidationError(parsed.error.issues); return this.repository.listApplications(m.companyId, parsed.data);
  }
  async getApplication(userId: string, applicationId: string) {
    const m = await this.requireMembership(userId); const application = await this.repository.findApplicationForCompany(m.companyId, applicationId);
    if (!application) throw new RecruiterAccessError("Resource is not available."); return application;
  }
  async transitionApplication(userId: string, applicationId: string, nextStatus: ApplicationStatus, notes?: string) {
    const m = await this.requireMembership(userId); const app = await this.repository.findApplicationForCompany(m.companyId, applicationId);
    if (!app) throw new RecruiterAccessError("Resource is not available.");
    if (!allowedTransitions[app.status].includes(nextStatus)) throw new RecruiterStateTransitionError("Application status transition is not allowed.");
    const result = await this.repository.updateApplicationStatusWithEvent(m.companyId, applicationId, userId, app.status, nextStatus, notes);
    if (!result) throw new RecruiterStateTransitionError("Application status changed concurrently.");
    return result;
  }
  async listAssessmentReports(userId: string) {
    const m = await this.requireMembership(userId);
    return this.repository.listEmployerAssessmentReports(m.companyId);
  }
  async getAssessmentReport(userId: string, applicationId: string) {
    const m = await this.requireMembership(userId); const report = await this.repository.findEmployerAssessmentReport(m.companyId, applicationId);
    if (!report) throw new RecruiterAccessError("Resource is not available."); return report;
  }
}
export const recruiterService = new RecruiterService();
