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
    matchAnalysis: { findFirst: vi.fn(), create: vi.fn() },
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

  it("creates a draft timeline event until the candidate completes the assessment", async () => {
    (prisma.application.create as Mock).mockResolvedValue({ id: "application-1" });

    await new ApplicationRepository().createApplication("user-1", {
      jobId: "job-1",
      resumeVersionId: "version-1",
    });

    expect(prisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DRAFT",
          events: {
            create: expect.objectContaining({
              type: "STATUS_CHANGE",
              actorUserId: "user-1",
              fromStatus: "DRAFT",
              toStatus: "DRAFT",
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
  it("persists a deterministic CV-JD match analysis once per resume version and job", async () => {
    (prisma.matchAnalysis.findFirst as Mock).mockResolvedValue(null);
    (prisma.matchAnalysis.create as Mock).mockResolvedValue({ id: "match-1" });

    await new ApplicationRepository().createMatchAnalysis("version-1", "job-1", {
      overallScore: 82,
      keywordMatch: 70,
      experienceMatch: 80,
      skillsMatch: 90,
      details: { algorithm: "deterministic-cv-jd-v1" },
    });

    expect(prisma.matchAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        resumeVersionId: "version-1",
        jobId: "job-1",
        overallScore: 82,
      }),
    });
  });

  it("reuses an existing CV-JD match analysis for the same resume version and job", async () => {
    (prisma.matchAnalysis.findFirst as Mock).mockResolvedValue({ id: "match-existing" });

    await expect(new ApplicationRepository().createMatchAnalysis("version-1", "job-1", {
      overallScore: 82,
      keywordMatch: 70,
      experienceMatch: 80,
      skillsMatch: 90,
      details: { algorithm: "deterministic-cv-jd-v1" },
    })).resolves.toEqual({ id: "match-existing" });

    expect(prisma.matchAnalysis.create).not.toHaveBeenCalled();
  });
});
