import type { ApplicationStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { ApplicationTransitionForm } from "@/features/recruiter/components/ApplicationTransitionForm";
import { ResumeSnapshot } from "@/features/recruiter/components/ResumeSnapshot";
import {
  RecruiterAccessError,
  getAllowedApplicationTransitions,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";

type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  notes: string | null;
  user: { name: string | null; email: string | null };
  job: { title: string; company: string };
  resumeVersion: { version: number; content: Prisma.JsonValue; resume: { title: string } } | null;
  events: Array<{ id: string; type: string; notes: string | null; date: Date }>;
  assessmentSessions: Array<{
    id: string;
    status: string;
    result: { id: string; advisoryScore: number } | null;
  }>;
};

export default async function RecruiterApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { applicationId } = await params;

  let application: ApplicationDetail;
  try {
    application = (await recruiterService.getApplication(user.id, applicationId)) as ApplicationDetail;
  } catch (error) {
    if (error instanceof RecruiterAccessError) notFound();
    throw error;
  }

  const nextStatuses = getAllowedApplicationTransitions(application.status);
  const latestAssessment = application.assessmentSessions[0];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Hồ sơ ứng viên</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {application.user.name ?? application.user.email ?? "Ứng viên"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {application.job.title} · {application.status}
        </p>
        <div className="mt-4">
          <ApplicationTransitionForm applicationId={application.id} nextStatuses={nextStatuses} />
        </div>
      </section>

      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">CV và đánh giá</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-surface-low p-3">
            <dt className="text-text-muted">CV snapshot</dt>
            <dd className="mt-1 font-medium text-foreground">
              {application.resumeVersion
                ? `${application.resumeVersion.resume.title} v${application.resumeVersion.version}`
                : "Không có CV snapshot"}
            </dd>
          </div>
          <div className="rounded-lg bg-surface-low p-3">
            <dt className="text-text-muted">Đánh giá</dt>
            <dd className="mt-1 font-medium text-foreground">
              {latestAssessment
                ? latestAssessment.result
                  ? `Hoàn tất · ${latestAssessment.result.advisoryScore}/100`
                  : `Đang chờ · ${latestAssessment.status}`
                : "Chưa có đánh giá"}
            </dd>
          </div>
        </dl>
      </section>

      {application.resumeVersion ? (
        <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Nội dung CV tại thời điểm ứng tuyển</h2>
          <ResumeSnapshot content={application.resumeVersion.content} />
        </section>
      ) : null}

      {application.assessmentSessions.some((item) => item.result) ? (
        <Link
          className="inline-flex rounded-md border border-border-light bg-surface-white px-4 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"
          href={`/recruiter/assessments/${application.id}`}
        >
          Xem báo cáo đánh giá
        </Link>
      ) : null}

      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">Nhật ký</h2>
        <div className="mt-3 space-y-2 text-sm text-text-muted">
          {application.events.length === 0 ? (
            <p>Chưa có sự kiện.</p>
          ) : (
            application.events.map((event) => (
              <p key={event.id}>
                {event.type}: {event.notes ?? "Không có ghi chú"}
              </p>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
