import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { AssessmentRepository } from "./assessment.repository";

type TransactionCallback = Parameters<typeof prisma.$transaction>[0];

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe("AssessmentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes the final assessment session update by the authenticated user", async () => {
    const tx = {
      assessmentSubmission: {
        upsert: vi.fn(),
      },
      assessmentResult: {
        upsert: vi.fn(),
      },
      assessmentSession: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi.fn().mockResolvedValue({ id: "session-1", userId: "user-1" }),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0])
    );

    const repository = new AssessmentRepository();
    await repository.saveSubmissionsAndResult({
      userId: "user-1",
      sessionId: "session-1",
      submissions: [{ taskId: "task-1", answerText: "answer text" }],
      result: {
        advisoryScore: 75,
        rubricBreakdown: [],
        strengths: ["Có bằng chứng"],
        gaps: ["Cần thêm kiểm thử"],
        evidence: [],
        limitations: ["Điểm tư vấn"],
        reportSummary: "Báo cáo tư vấn dựa trên bài nộp.",
        evaluatorModel: "test",
        promptVersion: "test",
      },
    });

    expect(tx.assessmentSession.updateMany).toHaveBeenCalledWith({
      where: { id: "session-1", userId: "user-1" },
      data: { status: "EVALUATED", completedAt: expect.any(Date) },
    });
    expect(tx.assessmentSession.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "session-1", userId: "user-1" },
      })
    );
  });

  it("fails when an owned session is no longer owned during the save transaction", async () => {
    const tx = {
      assessmentSubmission: {
        upsert: vi.fn(),
      },
      assessmentResult: {
        upsert: vi.fn(),
      },
      assessmentSession: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn(),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      (callback as TransactionCallback)(tx as unknown as Parameters<TransactionCallback>[0])
    );

    const repository = new AssessmentRepository();
    await expect(
      repository.saveSubmissionsAndResult({
        userId: "user-1",
        sessionId: "session-1",
        submissions: [{ taskId: "task-1", answerText: "answer text" }],
        result: {
          advisoryScore: 75,
          rubricBreakdown: [],
          strengths: [],
          gaps: [],
          evidence: [],
          limitations: ["Điểm tư vấn"],
          reportSummary: "Báo cáo tư vấn dựa trên bài nộp.",
          evaluatorModel: "test",
          promptVersion: "test",
        },
      })
    ).rejects.toThrow("Assessment session ownership changed");
  });
});
