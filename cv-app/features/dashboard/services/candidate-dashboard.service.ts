import { prisma } from "@/lib/db/prisma";
import { CvSchema, type CvData } from "@/features/cv/schemas/cv.schema";

export type CandidateDashboardSummary = {
  userName: string;
  cvReady: boolean;
  profileComplete: boolean;
  profileLocation?: string;
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

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function hasMeaningfulCvContent(content: CvData) {
  return Boolean(
    hasText(content.personalInfo.fullName) ||
      hasText(content.personalInfo.title) ||
      hasText(content.personalInfo.email) ||
      hasText(content.personalInfo.phone) ||
      hasText(content.personalInfo.summary) ||
      content.skills.some((skill) => hasText(skill.name)) ||
      content.experiences.some((experience) => hasText(experience.company) || hasText(experience.role) || hasText(experience.description)) ||
      content.educations.some((education) => hasText(education.institution) || hasText(education.degree) || hasText(education.field))
  );
}

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
      .find((version) => {
        if (!version) return false;
        const parsed = CvSchema.safeParse(version.content);
        return parsed.success && hasMeaningfulCvContent(parsed.data);
      });
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
      profileLocation: user?.profile?.location?.trim() || undefined,
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
