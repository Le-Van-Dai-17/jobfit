import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AssessmentEvaluationProvider } from "../providers/assessment.provider";
import type { AssessmentRepository } from "../repositories/assessment.repository";
import { AssessmentOwnershipError, AssessmentValidationError, AssessmentService } from "./assessment.service";

function createRepositoryMock() {
  return {
    listResumeVersionsForUser: vi.fn(),
    listJobs: vi.fn(),
    listSessionsForUser: vi.fn(),
    findResumeVersionForUser: vi.fn(),
    findJob: vi.fn(),
    createSession: vi.fn(),
    findSessionForUser: vi.fn(),
    saveSubmissionsAndResult: vi.fn(),
  } satisfies Record<keyof AssessmentRepository, ReturnType<typeof vi.fn>>;
}

function createProviderMock() {
  return {
    evaluate: vi.fn().mockResolvedValue({
      advisoryScore: 80,
      rubricBreakdown: [],
      strengths: ["Tốt"],
      gaps: ["Cần thêm bằng chứng"],
      evidence: [],
      limitations: ["Điểm tư vấn"],
      reportSummary: "Báo cáo tư vấn dựa trên bài nộp.",
      evaluatorModel: "mock",
      promptVersion: "test",
    }),
  } satisfies AssessmentEvaluationProvider;
}

describe("AssessmentService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let provider: ReturnType<typeof createProviderMock>;
  let service: AssessmentService;

  beforeEach(() => {
    repository = createRepositoryMock();
    provider = createProviderMock();
    service = new AssessmentService(repository as unknown as AssessmentRepository, provider);
  });

  it("creates tasks only after checking the selected CV version belongs to the server-scoped user", async () => {
    repository.findResumeVersionForUser.mockResolvedValue({
      id: "version-1",
      resume: { title: "CV chính" },
    });
    repository.findJob.mockResolvedValue({
      id: "job-1",
      title: "Senior Frontend Engineer",
      company: "Kada",
      description: "React Next.js TypeScript PostgreSQL",
      requirements: "5+ years, testing",
    });
    repository.createSession.mockResolvedValue({ id: "session-1" });

    await expect(
      service.createSession("user-1", { resumeVersionId: "version-1", jobId: "job-1" })
    ).resolves.toEqual({ id: "session-1" });

    expect(repository.findResumeVersionForUser).toHaveBeenCalledWith("user-1", "version-1");
    expect(repository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        resumeVersionId: "version-1",
        jobId: "job-1",
        seniority: "SENIOR",
      })
    );
  });

  it("rejects creating a session when the CV version is not owned by the current user", async () => {
    repository.findResumeVersionForUser.mockResolvedValue(null);
    repository.findJob.mockResolvedValue({ id: "job-1" });

    await expect(
      service.createSession("user-1", { resumeVersionId: "foreign-version", jobId: "job-1" })
    ).rejects.toBeInstanceOf(AssessmentOwnershipError);
  });

  it("rejects submissions that do not match the tasks in the owned session", async () => {
    repository.findSessionForUser.mockResolvedValue({
      id: "session-1",
      roleTitle: "Backend Engineer",
      seniority: "MID",
      tasks: [{ id: "task-1", title: "Task", prompt: "Prompt", expectedEvidence: [], rubric: [] }],
    });

    await expect(
      service.submitAndEvaluate("user-1", {
        sessionId: "session-1",
        answers: [{ taskId: "foreign-task", answerText: "x".repeat(140) }],
      })
    ).rejects.toBeInstanceOf(AssessmentValidationError);

    expect(provider.evaluate).not.toHaveBeenCalled();
    expect(repository.saveSubmissionsAndResult).not.toHaveBeenCalled();
  });

  it("rejects duplicated task answers that omit a required task", async () => {
    repository.findSessionForUser.mockResolvedValue({
      id: "session-1",
      roleTitle: "Backend Engineer",
      seniority: "MID",
      tasks: [
        { id: "task-1", title: "Task 1", prompt: "Prompt", expectedEvidence: [], rubric: [] },
        { id: "task-2", title: "Task 2", prompt: "Prompt", expectedEvidence: [], rubric: [] },
      ],
    });

    await expect(
      service.submitAndEvaluate("user-1", {
        sessionId: "session-1",
        answers: [
          { taskId: "task-1", answerText: "x".repeat(140) },
          { taskId: "task-1", answerText: "y".repeat(140) },
        ],
      })
    ).rejects.toBeInstanceOf(AssessmentValidationError);

    expect(provider.evaluate).not.toHaveBeenCalled();
    expect(repository.saveSubmissionsAndResult).not.toHaveBeenCalled();
  });
});
