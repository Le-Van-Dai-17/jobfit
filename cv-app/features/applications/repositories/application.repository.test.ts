import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { ApplicationRepository } from "./application.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    application: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    job: { findFirst: vi.fn() },
    resumeVersion: { findFirst: vi.fn() },
  },
}));

describe("ApplicationRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves an active application target only when the job is published", async () => {
    (prisma.job.findFirst as Mock).mockResolvedValue({ id: "job-1" });
    await new ApplicationRepository().findActiveJob("job-1");
    expect(prisma.job.findFirst).toHaveBeenCalledWith({
      where: { id: "job-1", isArchived: false, status: "PUBLISHED" },
    });
  });

  it("creates an applied timeline event with the candidate application", async () => {
    (prisma.application.create as Mock).mockResolvedValue({ id: "application-1" });

    await new ApplicationRepository().createApplication("user-1", {
      jobId: "job-1",
      resumeVersionId: "version-1",
    });

    expect(prisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "APPLIED",
          events: {
            create: expect.objectContaining({
              type: "STATUS_CHANGE",
              actorUserId: "user-1",
              fromStatus: "DRAFT",
              toStatus: "APPLIED",
            }),
          },
        }),
      })
    );
  });

  it("loads persisted application events for candidate detail newest first", async () => {
    (prisma.application.findFirst as Mock).mockResolvedValue({ id: "application-1", events: [] });

    await new ApplicationRepository().findApplicationForUser("user-1", "application-1");

    expect(prisma.application.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          events: { orderBy: { date: "desc" } },
        }),
      })
    );
  });
});
