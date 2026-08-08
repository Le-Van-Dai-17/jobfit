import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { AssessmentRepository } from "./assessment.repository";

type TransactionCallback = Parameters<typeof prisma.$transaction>[0];

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

const result = {
  advisoryScore: 75,
  rubricBreakdown: [],
  strengths: ["Có bằng chứng"],
  gaps: ["Cần thêm kiểm thử"],
  evidence: [],
  limitations: ["Điểm tư vấn"],
  reportSummary: "Báo cáo tư vấn dựa trên bài nộp.",
  evaluatorModel: "test",
  promptVersion: "test",
};

const input = {
  userId: "user-1",
  sessionId: "session-1",
  submissions: [{ taskId: "task-1", answerText: "answer text" }],
};

describe("AssessmentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atomically claims only a generated session before creating immutable submissions and result", async () => {
    const tx = {
      application: { findFirst: vi.fn() },
      assessmentSubmission: { create: vi.fn() },
      assessmentResult: { create: vi.fn() },
      assessmentTask: { count: vi.fn().mockResolvedValue(1) },
      assessmentSession: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi.fn().mockResolvedValue({ id: "session-1", userId: "user-1" }),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0])
    );

    const repository = new AssessmentRepository();
    await repository.completeSubmission(input, async () => result);

    expect(tx.assessmentSession.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "session-1", userId: "user-1", status: "TASKS_GENERATED" },
      data: { status: "SUBMITTED" },
    });
    expect(tx.assessmentSubmission.create).toHaveBeenCalledWith({
      data: {
        sessionId: "session-1",
        taskId: "task-1",
        userId: "user-1",
        answerText: "answer text",
      },
    });
    expect(tx.assessmentResult.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sessionId: "session-1", userId: "user-1", advisoryScore: 75 }),
    });
    expect(tx.assessmentSession.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: "session-1", userId: "user-1", status: "SUBMITTED" },
      data: { status: "EVALUATED", completedAt: expect.any(Date) },
    });
    expect(tx.application.findFirst).not.toHaveBeenCalled();
    expect("update" in tx.assessmentSession).toBe(false);
  });

  it("creates a session only after transactionally matching application, CV version, job, and active user", async () => {
    const tx = {
      resumeVersion: { findFirst: vi.fn().mockResolvedValue({ id: "version-1" }) },
      job: { findFirst: vi.fn().mockResolvedValue({ id: "job-1" }) },
      application: { findFirst: vi.fn().mockResolvedValue({ id: "app-1" }) },
      assessmentSession: { create: vi.fn().mockResolvedValue({ id: "session-1" }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0])
    );

    const repository = new AssessmentRepository();
    await expect(
      repository.createSession({
        userId: "user-1",
        resumeVersionId: "version-1",
        jobId: "job-1",
        applicationId: "app-1",
        roleTitle: "Engineer",
        seniority: "MID",
        summary: "summary",
        tasks: [],
      })
    ).resolves.toEqual({ id: "session-1" });

    expect(tx.resumeVersion.findFirst).toHaveBeenCalledWith({
      where: { id: "version-1", resume: { userId: "user-1", deletedAt: null, user: { deletedAt: null } } },
      select: { id: true },
    });
    expect(tx.application.findFirst).toHaveBeenCalledWith({
      where: {
        id: "app-1",
        userId: "user-1",
        jobId: "job-1",
        resumeVersionId: "version-1",
        deletedAt: null,
        user: { deletedAt: null },
      },
      select: { id: true },
    });
    expect(tx.assessmentSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          resumeVersionId: "version-1",
          jobId: "job-1",
          applicationId: "app-1",
        }),
      })
    );
  });

  it("rejects a stale claim without writing submissions or replacing a result", async () => {
    const evaluate = vi.fn();
    const tx = {
      assessmentSubmission: { create: vi.fn() },
      assessmentResult: { create: vi.fn() },
      assessmentTask: { count: vi.fn() },
      assessmentSession: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn(),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0])
    );

    const repository = new AssessmentRepository();
    await expect(repository.completeSubmission(input, evaluate)).rejects.toThrow(
      "Assessment session is not accepting submissions"
    );

    expect(evaluate).not.toHaveBeenCalled();
    expect(tx.assessmentSubmission.create).not.toHaveBeenCalled();
    expect(tx.assessmentResult.create).not.toHaveBeenCalled();
  });

  it("allows only one of two concurrent requests to claim the session", async () => {
    let status = "TASKS_GENERATED";
    const createdResults: unknown[] = [];
    const makeTx = () => ({
      assessmentSubmission: { create: vi.fn() },
      assessmentResult: { create: vi.fn(async ({ data }) => createdResults.push(data)) },
      assessmentTask: { count: vi.fn().mockResolvedValue(1) },
      assessmentSession: {
        updateMany: vi.fn(async ({ where, data }) => {
          if (where.status && status !== where.status) return { count: 0 };
          status = data.status;
          return { count: 1 };
        }),
        findFirst: vi.fn().mockResolvedValue({ id: "session-1", userId: "user-1" }),
      },
    });
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = makeTx();
      return (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0]);
    });

    const repository = new AssessmentRepository();
    const attempts = await Promise.allSettled([
      repository.completeSubmission(input, async () => result),
      repository.completeSubmission(input, async () => ({ ...result, advisoryScore: 10 })),
    ]);

    expect(attempts.map((attempt) => attempt.status).sort()).toEqual(["fulfilled", "rejected"]);
    expect(createdResults).toHaveLength(1);
    expect(createdResults[0]).toMatchObject({ advisoryScore: 75 });
  });
});
