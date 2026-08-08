import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { PrismaRecruiterRepository } from "./recruiter.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    job: { count: vi.fn() },
    application: { count: vi.fn(), findMany: vi.fn() },
    assessmentResult: { count: vi.fn() },
  },
}));

describe("PrismaRecruiterRepository dashboard queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.job.count as Mock).mockResolvedValue(0);
    (prisma.application.count as Mock).mockResolvedValue(0);
    (prisma.assessmentResult.count as Mock).mockResolvedValue(0);
    (prisma.application.findMany as Mock).mockResolvedValue([]);
  });

  it("counts awaiting assessments only for nonterminal applications with actionable sessions", async () => {
    await new PrismaRecruiterRepository().getDashboardCounts("company-a");

    expect(prisma.application.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        user: { deletedAt: null },
        status: { in: ["DRAFT", "APPLIED", "INTERVIEWING"] },
        job: { companyId: "company-a" },
        assessmentSessions: {
          some: { status: { in: ["TASKS_GENERATED", "SUBMITTED"] } },
        },
      },
    });
  });

  it("sorts recent applications by applied time then creation time", async () => {
    await new PrismaRecruiterRepository().listRecentApplications("company-a", 5);

    expect(prisma.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ appliedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        take: 5,
      })
    );
  });
});
