import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { JobRepository } from "./job.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    job: { findMany: vi.fn(), findFirst: vi.fn() },
    savedJob: { findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), upsert: vi.fn() },
    application: { findMany: vi.fn() },
    assessmentSession: { findMany: vi.fn() },
  },
}));

describe("JobRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.job.findMany as Mock).mockResolvedValue([]);
    (prisma.savedJob.findMany as Mock).mockResolvedValue([]);
    (prisma.application.findMany as Mock).mockResolvedValue([]);
    (prisma.assessmentSession.findMany as Mock).mockResolvedValue([]);
  });

  it("queries the candidate feed with lean job fields before loading user-specific status", async () => {
    (prisma.job.findMany as Mock).mockResolvedValue([{ id: "job-1", title: "Frontend", company: "Kada", createdAt: new Date() }]);

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
        select: expect.objectContaining({ id: true, title: true, company: true, requirements: true }),
      })
    );
    expect(prisma.savedJob.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", jobId: { in: ["job-1"] } },
      select: { id: true, jobId: true },
    });
    expect(prisma.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", deletedAt: null, jobId: { in: ["job-1"] } },
        select: { id: true, jobId: true, status: true },
      })
    );
    expect(prisma.assessmentSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", jobId: { in: ["job-1"] } },
        select: { id: true, jobId: true, applicationId: true, status: true, updatedAt: true },
      })
    );
  });

  it("maps saved, application, and assessment status back to the existing feed shape", async () => {
    const updatedAt = new Date("2026-08-10T00:00:00.000Z");
    (prisma.job.findMany as Mock).mockResolvedValue([{ id: "job-1", title: "Frontend", company: "Kada", createdAt: updatedAt }]);
    (prisma.savedJob.findMany as Mock).mockResolvedValue([{ id: "saved-1", jobId: "job-1" }]);
    (prisma.application.findMany as Mock).mockResolvedValue([{ id: "app-1", jobId: "job-1", status: "APPLIED" }]);
    (prisma.assessmentSession.findMany as Mock).mockResolvedValue([
      { id: "session-1", jobId: "job-1", applicationId: "app-1", status: "TASKS_GENERATED", updatedAt },
    ]);

    const jobs = await new JobRepository().findActiveJobsForCandidate("user-1");

    expect(jobs[0]).toMatchObject({
      id: "job-1",
      savedBy: [{ id: "saved-1" }],
      applications: [{ id: "app-1", status: "APPLIED", assessmentSessions: [{ id: "session-1" }] }],
      assessmentSessions: [{ id: "session-1" }],
    });
  });

  it("can skip candidate progress queries for lightweight dashboard job lists", async () => {
    const updatedAt = new Date("2026-08-10T00:00:00.000Z");
    (prisma.job.findMany as Mock).mockResolvedValue([{ id: "job-1", title: "Frontend", company: "Kada", createdAt: updatedAt }]);

    const jobs = await new JobRepository().findActiveJobsForCandidate(
      "user-1",
      { q: "", mode: "all" },
      { includeProgress: false }
    );

    expect(prisma.savedJob.findMany).toHaveBeenCalledOnce();
    expect(prisma.application.findMany).not.toHaveBeenCalled();
    expect(prisma.assessmentSession.findMany).not.toHaveBeenCalled();
    expect(jobs[0]).toMatchObject({ savedBy: [], applications: [], assessmentSessions: [] });
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
