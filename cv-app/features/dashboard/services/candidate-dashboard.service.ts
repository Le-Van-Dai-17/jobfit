import { prisma } from "@/lib/db/prisma";
import { CvSchema } from "@/features/cv/schemas/cv.schema";

export type CandidateDashboardSummary = {
  userName: string;
  cvReady: boolean;
  profileComplete: boolean;
  resumeCount: number;
  latestResumeVersionId?: string;
  nextAction: {
    label: string;
    href: string;
  };
  applicationCounts: {
    total: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
    withdrawn: number;
  };
  pendingAssessments: Array<{
    id: string;
    roleTitle: string;
    company: string;
    href: string;
  }>;
};

export class CandidateDashboardService {
  async getSummary(userId: string): Promise<CandidateDashboardSummary> {
    const [user, resumes, applications, pendingAssessments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          profile: {
            select: {
              headline: true,
              summary: true,
              phone: true,
              location: true,
            },
          },
        },
      }),
      prisma.resume.findMany({
        where: { userId, deletedAt: null },
        include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.application.findMany({
        where: { userId, deletedAt: null },
        select: { status: true },
      }),
      prisma.assessmentSession.findMany({
        where: { userId, status: "TASKS_GENERATED" },
        include: { job: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    const readyVersion = resumes
      .map((resume) => resume.versions[0])
      .find((version) => version && CvSchema.safeParse(version.content).success);
    const latestResumeVersionId = readyVersion?.id;
    const cvReady = Boolean(readyVersion);
    const profileComplete = Boolean(
      user?.name?.trim() &&
      user.email?.trim() &&
      user.profile?.headline?.trim() &&
      user.profile.summary?.trim() &&
      user.profile.location?.trim()
    );
    const counts = {
      total: applications.length,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const application of applications) {
      if (application.status === "APPLIED") counts.applied += 1;
      if (application.status === "INTERVIEWING") counts.interviewing += 1;
      if (application.status === "OFFER") counts.offer += 1;
      if (application.status === "REJECTED") counts.rejected += 1;
      if (application.status === "WITHDRAWN") counts.withdrawn += 1;
    }

    let nextAction = profileComplete
      ? { label: "Tạo hoặc lưu CV", href: "/my-cv" }
      : { label: "Hoàn thiện hồ sơ", href: "/profile" };
    if (profileComplete && cvReady && applications.length === 0) {
      nextAction = { label: "Tìm việc phù hợp", href: "/jobs" };
    } else if (profileComplete && pendingAssessments.length > 0) {
      nextAction = { label: "Hoàn thành đánh giá", href: `/assessments/${pendingAssessments[0].id}` };
    } else if (profileComplete && cvReady) {
      nextAction = { label: "Theo dõi ứng tuyển", href: "/applications" };
    }

    return {
      userName: user?.name || user?.email || "Ứng viên",
      cvReady,
      profileComplete,
      resumeCount: resumes.length,
      latestResumeVersionId,
      nextAction,
      applicationCounts: counts,
      pendingAssessments: pendingAssessments.map((session) => ({
        id: session.id,
        roleTitle: session.roleTitle,
        company: session.job.company,
        href: `/assessments/${session.id}`,
      })),
    };
  }
}

export const candidateDashboardService = new CandidateDashboardService();
