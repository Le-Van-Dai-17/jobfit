import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { JobRepository } from "./job.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    job: { findMany: vi.fn(), findFirst: vi.fn() },
    savedJob: { findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), upsert: vi.fn() },
  },
}));

describe("JobRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.job.findMany as Mock).mockResolvedValue([]);
  });

  it("queries the candidate feed with validated repository-backed filters and published availability", async () => {
    await new JobRepository().findActiveJobsForCandidate("user-1", { q: "frontend", mode: "remote" });

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isArchived: false,
          status: "PUBLISHED",
          AND: [
            { OR: [{ title: { contains: "frontend", mode: "insensitive" } }, { company: { contains: "frontend", mode: "insensitive" } }] },
            { type: { contains: "remote", mode: "insensitive" } },
          ],
        },
        include: expect.objectContaining({
          savedBy: { where: { userId: "user-1" } },
          applications: expect.objectContaining({
            where: { userId: "user-1", deletedAt: null },
          }),
          assessmentSessions: expect.objectContaining({
            where: { userId: "user-1" },
          }),
        }),
      })
    );
  });

  it("loads job detail only when the job is published and available", async () => {
    (prisma.job.findFirst as Mock).mockResolvedValue({ id: "job-1" });
    await new JobRepository().findPublishedById("job-1");
    expect(prisma.job.findFirst).toHaveBeenCalledWith({
      where: { id: "job-1", isArchived: false, status: "PUBLISHED" },
    });
  });

  it("persists saved jobs against the authenticated user id", async () => {
    (prisma.savedJob.upsert as Mock).mockResolvedValue({ id: "saved-1" });

    await new JobRepository().saveJob("user-1", "job-1");

    expect(prisma.savedJob.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_jobId: { userId: "user-1", jobId: "job-1" } },
        create: expect.objectContaining({ userId: "user-1", jobId: "job-1" }),
      })
    );
  });
});
