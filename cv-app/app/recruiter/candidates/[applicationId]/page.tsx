import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ApplicationStatus, Prisma } from "@prisma/client";
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
      <div>
        <h1 className="text-2xl font-bold">{application.user.name ?? application.user.email ?? "Ung vien"}</h1>
        <p className="text-sm text-text-muted">
          {application.job.title} - {application.status}
        </p>
      </div>
      <ApplicationTransitionForm applicationId={application.id} nextStatuses={nextStatuses} />
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">CV va assessment</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">CV snapshot</dt>
            <dd className="font-medium">
              {application.resumeVersion
                ? `${application.resumeVersion.resume.title} v${application.resumeVersion.version}`
                : "Khong co CV snapshot"}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Assessment</dt>
            <dd className="font-medium">
              {latestAssessment
                ? latestAssessment.result
                  ? `Hoan tat - ${latestAssessment.result.advisoryScore}/100`
                  : `Dang cho - ${latestAssessment.status}`
                : "Chua co assessment"}
            </dd>
          </div>
        </dl>
      </section>
      {application.resumeVersion ? (
        <section className="rounded-xl border border-border-light bg-white p-5">
          <h2 className="font-semibold">Nội dung CV tại thời điểm ứng tuyển</h2>
          <ResumeSnapshot content={application.resumeVersion.content} />
        </section>
      ) : null}
      {application.assessmentSessions.some((item) => item.result) ? (
        <Link className="inline-flex rounded-xl border border-border-light px-4 py-2 text-sm font-semibold" href={`/recruiter/assessments/${application.id}`}>
          Xem bao cao danh gia
        </Link>
      ) : null}
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Nhat ky</h2>
        <div className="mt-3 space-y-2 text-sm text-text-muted">
          {application.events.map((event) => (
            <p key={event.id}>
              {event.type}: {event.notes ?? "Khong co ghi chu"}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
