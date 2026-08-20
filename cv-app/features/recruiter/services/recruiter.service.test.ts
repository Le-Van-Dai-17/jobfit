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
      userId === "recruiter-a"
        ? {
            companyId: "company-a",
            role: "OWNER",
            company: {
              name: "Acme",
              website: "https://acme.test",
              description: "Builds developer tools.",
              location: "TP. Hồ Chí Minh",
              industry: "SOFTWARE",
              size: "SIZE_10_49",
            },
          }
        : null,
    getDashboardCounts: async (companyId) => ({
      jobs: companyId === "company-a" ? 2 : 0,
      activeJobs: 1,
      archivedJobs: 1,
      applications: 2,
      assessmentReports: 1,
      awaitingReview: 1,
      awaitingAssessment: 1,
      pipeline: { APPLIED: 1, INTERVIEWING: 1, OFFER: 0, REJECTED: 0 },
    }),
    createJob: async (companyId, input) => ({
      id: "job-new",
      companyId,
      status: "DRAFT",
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
        ? { id: "job-a", companyId, title: "Frontend", company: "Acme", status: "DRAFT", isArchived: false }
        : null,
    setJobArchived: async (_companyId, jobId, isArchived) => ({
      id: jobId,
      companyId: "company-a",
      title: "Frontend",
      isArchived,
    }),
    setJobStatus: async (_companyId, jobId, _expectedStatus, status) => ({
      id: jobId,
      companyId: "company-a",
      title: "Frontend",
      status,
      isArchived: status === "ARCHIVED",
    }),
    updateJob: async (companyId, jobId, input) =>
      companyId === "company-a" && jobId === "job-a" ? { id: jobId, companyId, ...input } : null,
    listApplications: async (companyId, filters) => {
      const rows = [
        { id: "app-a", status: "APPLIED" as ApplicationStatus, job: { id: "job-a", companyId } },
        { id: "app-b", status: "INTERVIEWING" as ApplicationStatus, job: { id: "job-a", companyId } },
      ];
      return filters?.status ? rows.filter((row) => row.status === filters.status) : rows;
    },
    findApplicationForCompany: async (companyId, applicationId) =>
      companyId === "company-a" && applicationId === "app-a"
        ? { id: "app-a", status: "APPLIED" as ApplicationStatus, job: { id: "job-a", companyId } }
        : null,
    updateApplicationStatusWithEvent: async (_companyId, applicationId, _actorUserId, _expectedStatus, nextStatus, notes) => ({
      application: { id: applicationId, status: nextStatus },
      event: { applicationId, type: "STATUS_CHANGE", notes: notes ?? null },
    }),
    listEmployerAssessmentReports: async (companyId) => [
      {
        id: "result-a",
        advisoryScore: 82,
        session: { applicationId: "app-a", application: { id: "app-a", job: { companyId } } },
      },
    ],
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
      onboardingChecklist: [
        { key: "companyProfile", completed: true },
        { key: "firstJob", completed: true },
        { key: "publishedJob", completed: true },
        { key: "candidatePipeline", completed: true },
      ],
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
        deadline: "2026-09-30",
      })
    ).resolves.toMatchObject({
      id: "job-a",
      companyId: "company-a",
      title: "Frontend Lead",
      company: "Acme",
      deadline: new Date("2026-09-30T00:00:00.000Z"),
    });
  });

  it("persists draft, published and archived JD lifecycle states", async () => {
    let currentStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "DRAFT";
    const service = new RecruiterService(
      makeRepository({
        findJobForCompany: async (companyId, jobId) =>
          companyId === "company-a" && jobId === "job-a"
            ? { id: "job-a", companyId, title: "Frontend", company: "Acme", status: currentStatus, isArchived: currentStatus === "ARCHIVED" }
            : null,
        setJobStatus: async (_companyId, jobId, _expectedStatus, status) => {
          currentStatus = status;
          return {
            id: jobId,
            companyId: "company-a",
            title: "Frontend",
            status,
            isArchived: status === "ARCHIVED",
          };
        },
      })
    );

    await expect(service.createJob("recruiter-a", {
      title: "Backend Engineer",
      description: "Build reliable recruiter services with strict authorization boundaries.",
      requirements: "Node.js, PostgreSQL, tests.",
    })).resolves.toMatchObject({ status: "DRAFT", isArchived: true });
    await expect(service.publishJob("recruiter-a", "job-a")).resolves.toMatchObject({
      status: "PUBLISHED",
      isArchived: false,
    });
    await expect(service.archiveJob("recruiter-a", "job-a")).resolves.toMatchObject({
      status: "ARCHIVED",
      isArchived: true,
    });
    await expect(service.restoreJob("recruiter-a", "job-a")).resolves.toMatchObject({
      status: "DRAFT",
      isArchived: false,
    });
  });

  it("filters applications to company-owned jobs by status", async () => {
    const service = new RecruiterService(makeRepository());

    await expect(service.listApplications("recruiter-a", { status: "INTERVIEWING" })).resolves.toHaveLength(1);
  });

  it("forwards candidate search, job, status, and sort filters to the company-scoped repository", async () => {
    let receivedFilters: unknown;
    const service = new RecruiterService(makeRepository({
      listApplications: async (_companyId, filters) => {
        receivedFilters = filters;
        return [];
      },
    }));

    await service.listApplications("recruiter-a", {
      search: " Nguyen ",
      status: "APPLIED",
      jobId: "job-a",
      sort: "oldest",
    });

    expect(receivedFilters).toEqual({
      search: "Nguyen",
      status: "APPLIED",
      jobId: "job-a",
      sort: "oldest",
    });
  });

  it("filters company-owned jobs by persisted search text and lifecycle status", async () => {
    const seen: unknown[] = [];
    const service = new RecruiterService(makeRepository({
      listJobs: async (_companyId, filters) => {
        seen.push(filters);
        return [{ id: "job-a", title: "Frontend", status: filters?.status }];
      },
    }));

    await expect(service.listJobs("recruiter-a", { search: " frontend ", status: "PUBLISHED" })).resolves.toHaveLength(1);
    expect(seen).toEqual([{ search: "frontend", status: "PUBLISHED" }]);
  });

  it("maps a stale repository CAS result to a recruiter lifecycle conflict", async () => {
    const service = new RecruiterService(makeRepository({
      updateApplicationStatusWithEvent: async () => null,
    }));

    await expect(service.transitionApplication("recruiter-a", "app-a", "INTERVIEWING")).rejects.toBeInstanceOf(
      RecruiterStateTransitionError
    );
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

  it("lists employer-safe assessment reports through the recruiter company membership", async () => {
    let scopedCompanyId: string | undefined;
    const service = new RecruiterService(makeRepository({
      listEmployerAssessmentReports: async (companyId) => {
        scopedCompanyId = companyId;
        return [{ id: "result-a" }];
      },
    }));

    await expect(service.listAssessmentReports("recruiter-a")).resolves.toEqual([{ id: "result-a" }]);
    expect(scopedCompanyId).toBe("company-a");
  });

  it("normalizes and persists structured Stitch JD fields", async () => {
    const service = new RecruiterService(makeRepository());
    await expect(service.createJob("recruiter-a", {
      title: "Senior Frontend Engineer",
      description: "Xây dựng trải nghiệm tuyển dụng có khả năng truy cập và kiểm thử tốt.",
      requirements: "React, TypeScript và kiểm thử tự động.",
      department: "ENGINEERING",
      employmentType: "FULL_TIME",
      workMode: "HYBRID",
      experienceLevel: "SENIOR",
      salaryMin: "25000000",
      salaryMax: "40000000",
      salaryCurrency: "VND",
      salaryNegotiable: false,
      skills: ["React", "TypeScript", "React"],
      benefits: "Bảo hiểm sức khỏe và ngân sách học tập.",
    })).resolves.toMatchObject({
      department: "ENGINEERING",
      employmentType: "FULL_TIME",
      workMode: "HYBRID",
      experienceLevel: "SENIOR",
      salaryMin: 25000000,
      salaryMax: 40000000,
      salaryCurrency: "VND",
      salaryNegotiable: false,
      skills: ["React", "TypeScript"],
    });
  });

  it("preserves legacy type and salary values while an old JD has no structured fields", async () => {
    let written: unknown;
    const service = new RecruiterService(makeRepository({
      updateJob: async (_companyId, _jobId, input) => {
        written = input;
        return input;
      },
    }));

    await service.updateJob("recruiter-a", "job-a", {
      title: "Legacy Backend Engineer",
      description: "Mô tả công việc legacy vẫn hợp lệ để chỉnh sửa an toàn.",
      requirements: "Node.js, PostgreSQL và kiểm thử tự động.",
      type: "Full-time · Tại văn phòng",
      salaryRange: "25–40 triệu VND",
    });

    expect(written).toMatchObject({
      type: "Full-time · Tại văn phòng",
      salaryRange: "25–40 triệu VND",
      employmentType: null,
      workMode: null,
      salaryMin: null,
      salaryMax: null,
    });
  });

  it("rejects invalid salary bounds before repository writes", async () => {
    const service = new RecruiterService(makeRepository());
    await expect(service.createJob("recruiter-a", {
      title: "Backend Engineer",
      description: "Xây dựng dịch vụ tuyển dụng an toàn và có khả năng quan sát tốt.",
      requirements: "Node.js, PostgreSQL và kiểm thử tự động.",
      salaryMin: "50000000",
      salaryMax: "20000000",
    })).rejects.toBeInstanceOf(RecruiterValidationError);
  });

  it("rejects publishing an archived JD instead of silently reopening it", async () => {
    const service = new RecruiterService(makeRepository({
      findJobForCompany: async () => ({ id: "job-a", status: "ARCHIVED", isArchived: true }),
    }));
    await expect(service.publishJob("recruiter-a", "job-a")).rejects.toBeInstanceOf(
      RecruiterStateTransitionError
    );
  });
});
