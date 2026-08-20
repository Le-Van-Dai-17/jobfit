import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { CandidateDashboardService } from "./candidate-dashboard.service";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    resume: { findMany: vi.fn() },
    application: { findMany: vi.fn() },
  },
}));

describe("CandidateDashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates persisted current-user data without fixed demo counts", async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      name: "An Nguyen",
      email: "an@example.com",
      profile: {
        headline: "Frontend Engineer",
        summary: "Builds accessible products.",
        phone: "0901234567",
        location: "TP. Hồ Chí Minh",
        skills: [],
        experiences: [],
        educations: [],
      },
    });
    (prisma.resume.findMany as Mock).mockResolvedValue([
      {
        id: "resume-1",
        versions: [{
          id: "version-1",
          content: {
            personalInfo: {
              fullName: "An Nguyen",
              title: "Frontend Engineer",
              email: "an@example.com",
            },
            experiences: [],
            educations: [],
            skills: [{ id: "skill-1", name: "TypeScript", level: 4 }],
          },
        }],
      },
    ]);
    (prisma.application.findMany as Mock).mockResolvedValue([
      { status: "APPLIED" },
      { status: "INTERVIEWING" },
      { status: "INTERVIEWING" },
    ]);
    await expect(new CandidateDashboardService().getSummary("user-1")).resolves.toMatchObject({
      userName: "An Nguyen",
      cvReady: true,
      profileComplete: true,
      resumeCount: 1,
      latestResumeVersionId: "version-1",
      nextAction: { label: "Theo dõi ứng tuyển", href: "/applications" },
      applicationCounts: { total: 3, applied: 1, interviewing: 2 },
    });
  });

  it("does not mark blank or malformed persisted CV versions as ready", async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      name: "An Nguyen",
      email: "an@example.com",
      profile: null,
    });
    (prisma.resume.findMany as Mock).mockResolvedValue([
      { id: "resume-1", versions: [{ id: "version-blank", content: { personalInfo: {} } }] },
      { id: "resume-2", versions: [{ id: "version-invalid", content: "not-json-object" }] },
    ]);
    (prisma.application.findMany as Mock).mockResolvedValue([]);
    await expect(new CandidateDashboardService().getSummary("user-1")).resolves.toMatchObject({
      cvReady: false,
      profileComplete: false,
      latestResumeVersionId: undefined,
      nextAction: { label: "Hoàn thiện hồ sơ", href: "/profile" },
    });
  });
});
