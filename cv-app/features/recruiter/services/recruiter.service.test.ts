import { describe, expect, it } from "vitest";
import type { ApplicationStatus } from "@prisma/client";
import {
  RecruiterAccessError,
  RecruiterStateTransitionError,
  RecruiterService,
  RecruiterValidationError,
  type RecruiterRepository,
} from "./recruiter.service";

function makeRepository(overrides: Partial<RecruiterRepository> = {}): RecruiterRepository {
  return {
    findMembership: async (userId) =>
      userId === "recruiter-a" ? { companyId: "company-a", role: "OWNER", company: { name: "Acme" } } : null,
    getDashboardCounts: async (companyId) => ({
      jobs: companyId === "company-a" ? 2 : 0,
      activeJobs: 1,
      archivedJobs: 1,
      applications: 2,
      assessmentReports: 1,
      awaitingReview: 1,
      awaitingAssessment: 1,
    }),
    createJob: async (companyId, input) => ({
      id: "job-new",
      companyId,
      isArchived: true,
      ...input,
    }),
    listRecentApplications: async (companyId, take) =>
      [
        {
          id: "app-a",
          status: "APPLIED" as ApplicationStatus,
          job: { title: "Frontend" },
          user: { name: "Candidate A", email: "a@example.com" },
          companyId,
        },
      ].slice(0, take),
    listJobs: async (companyId) => [
      { id: "job-a", companyId, title: "Frontend", company: "Acme", isArchived: false },
    ],
    findJobForCompany: async (companyId, jobId) =>
      companyId === "company-a" && jobId === "job-a"
        ? { id: "job-a", companyId, title: "Frontend", company: "Acme", isArchived: false }
        : null,
    setJobArchived: async (_companyId, jobId, isArchived) => ({
      id: jobId,
      companyId: "company-a",
      title: "Frontend",
      isArchived,
    }),
    setJobStatus: async (_companyId, jobId, status) => ({
      id: jobId,
      companyId: "company-a",
      title: "Frontend",
      status,
      isArchived: status !== "PUBLISHED",
    }),
    updateJob: async (companyId, jobId, input) =>
      companyId === "company-a" && jobId === "job-a" ? { id: jobId, companyId, ...input } : null,
    listApplications: async (companyId, status) => {
      const rows = [
        { id: "app-a", status: "APPLIED" as ApplicationStatus, job: { id: "job-a", companyId } },
        { id: "app-b", status: "INTERVIEWING" as ApplicationStatus, job: { id: "job-a", companyId } },
      ];
      return status ? rows.filter((row) => row.status === status) : rows;
    },
    findApplicationForCompany: async (companyId, applicationId) =>
      companyId === "company-a" && applicationId === "app-a"
        ? { id: "app-a", status: "APPLIED" as ApplicationStatus, job: { id: "job-a", companyId } }
        : null,
    updateApplicationStatusWithEvent: async (_companyId, applicationId, _actorUserId, _expectedStatus, nextStatus, notes) => ({
      application: { id: applicationId, status: nextStatus },
      event: { applicationId, type: "STATUS_CHANGE", notes: notes ?? null },
    }),
    findEmployerAssessmentReport: async (companyId, applicationId) =>
      companyId === "company-a" && applicationId === "app-a"
        ? {
            id: "result-a",
            advisoryScore: 82,
            reportSummary: "Evidence-based summary",
            strengths: ["Clear debugging"],
            gaps: ["Testing depth"],
            limitations: ["Text submission only"],
          }
        : null,
    ...overrides,
  };
}

describe("RecruiterService", () => {
  it("returns dashboard counts scoped to the authenticated recruiter company", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.getDashboard("recruiter-a")).resolves.toMatchObject({
      companyId: "company-a",
      counts: { jobs: 2, applications: 2, assessmentReports: 1 },
      recentApplications: [{ id: "app-a", status: "APPLIED" }],
    });
  });

  it("fails closed when a recruiter has no company membership", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.listJobs("candidate-a")).rejects.toBeInstanceOf(RecruiterAccessError);
  });

  it("validates and creates company-owned draft jobs", async () => {
    const service = new RecruiterService(makeRepository());

    const job = await service.createJob("recruiter-a", {
      title: " Senior Frontend Engineer ",
      location: "Ha Noi",
      type: "Full-time",
      description: "Build recruiter-facing assessment workflows with React and TypeScript.",
      requirements: "React, TypeScript, accessibility, testing.",
    });

    expect(job).toMatchObject({
      companyId: "company-a",
      title: "Senior Frontend Engineer",
      company: "Acme",
      isArchived: true,
    });
  });

  it("derives the job company display name from recruiter membership", async () => {
    let writtenCompany: string | undefined;
    const service = new RecruiterService(
      makeRepository({
        createJob: async (_companyId, input) => {
          writtenCompany = input.company;
          return { id: "job-new", ...input };
        },
      })
    );

    await service.createJob("recruiter-a", {
      title: "Backend Engineer",
      location: "Ha Noi",
      type: "Full-time",
      description: "Build reliable recruiter services with strict authorization boundaries.",
      requirements: "Node.js, PostgreSQL, tests.",
    });

    expect(writtenCompany).toBe("Acme");
  });

  it("rejects invalid job payloads before repository writes", async () => {
    let called = false;
    const service = new RecruiterService(
      makeRepository({
        createJob: async () => {
          called = true;
          throw new Error("should not write");
        },
      })
    );

    await expect(service.createJob("recruiter-a", { title: "" })).rejects.toBeInstanceOf(
      RecruiterValidationError
    );
    expect(called).toBe(false);
  });

  it("denies cross-company job access without leaking existence", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.getJob("recruiter-a", "job-other")).rejects.toBeInstanceOf(RecruiterAccessError);
  });

  it("updates only company-owned jobs with validated JD content", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(
      service.updateJob("recruiter-a", "job-a", {
        title: "Frontend Lead",
        location: "Remote",
        type: "Full-time",
        description: "Own the candidate application and assessment experience end to end.",
        requirements: "React, TypeScript, accessibility, testing.",
      })
    ).resolves.toMatchObject({ id: "job-a", companyId: "company-a", title: "Frontend Lead", company: "Acme" });
  });

  it("persists draft, published and archived JD lifecycle states", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.createJob("recruiter-a", {
      title: "Backend Engineer",
      description: "Build reliable recruiter services with strict authorization boundaries.",
      requirements: "Node.js, PostgreSQL, tests.",
    })).resolves.toMatchObject({ isArchived: true });
    await expect(service.publishJob("recruiter-a", "job-a")).resolves.toMatchObject({
      status: "PUBLISHED",
      isArchived: false,
    });
    await expect(service.archiveJob("recruiter-a", "job-a")).resolves.toMatchObject({
      status: "ARCHIVED",
      isArchived: true,
    });
  });

  it("filters applications to company-owned jobs by status", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.listApplications("recruiter-a", { status: "INTERVIEWING" })).resolves.toHaveLength(1);
  });

  it("allows recruiter status transitions and creates an audit event atomically", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.transitionApplication("recruiter-a", "app-a", "INTERVIEWING", "Passed screen")).resolves
      .toMatchObject({
        application: { status: "INTERVIEWING" },
        event: { applicationId: "app-a", type: "STATUS_CHANGE", notes: "Passed screen" },
      });
  });

  it("rejects invalid recruiter status transitions", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.transitionApplication("recruiter-a", "app-a", "OFFER")).rejects.toBeInstanceOf(
      RecruiterStateTransitionError
    );
  });

  it("returns employer-safe assessment reports only for own company applications", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.getAssessmentReport("recruiter-a", "app-a")).resolves.toMatchObject({
      advisoryScore: 82,
      reportSummary: "Evidence-based summary",
    });
    await expect(service.getAssessmentReport("recruiter-a", "app-other")).rejects.toBeInstanceOf(
      RecruiterAccessError
    );
  });
});
