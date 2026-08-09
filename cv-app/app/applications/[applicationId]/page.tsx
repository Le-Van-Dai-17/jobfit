import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClipboardCheck, FileText, History } from "lucide-react";

import { auth } from "@/auth";
import { applicationService, ApplicationOwnershipError } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = {
  DRAFT: "Ban nhap",
  APPLIED: "Da ung tuyen",
  INTERVIEWING: "Dang phong van",
  OFFER: "Co offer",
  REJECTED: "Tu choi",
  WITHDRAWN: "Da rut",
};

const eventTypeLabels = {
  STATUS_CHANGE: "Cap nhat trang thai",
  NOTE_ADDED: "Ghi chu",
  INTERVIEW_SCHEDULED: "Lich phong van",
  EMAIL_RECEIVED: "Email",
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  const { applicationId } = await params;
  let application;
  try {
    application = await applicationService.getForCandidate(session!.user.id, applicationId);
  } catch (error) {
    if (error instanceof ApplicationOwnershipError) notFound();
    throw error;
  }

  const latestSession = application.assessmentSessions[0];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Don ung tuyen</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{application.job.title}</h1>
            <p className="mt-1 text-sm text-text-muted">{application.job.company}</p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-surface-low px-3 py-1 text-sm font-semibold text-foreground">
            {statusLabels[application.status]}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">CV snapshot da chon</h2>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          {application.resumeVersion?.resume.title ?? "CV"} - phien ban {application.resumeVersion?.version ?? "?"}
        </p>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-surface-low p-4 text-xs leading-5 text-foreground">
          {JSON.stringify(application.resumeVersion?.content ?? {}, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Danh gia theo don nay</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Bai danh gia dung dung JD va CV snapshot da ung tuyen de tao bang chung cho recruiter.
        </p>
        {latestSession ? (
          <Link
            href={`/assessments/${latestSession.id}`}
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Mo phien danh gia
          </Link>
        ) : (
          <Link
            href={`/assessments?applicationId=${application.id}&jobId=${application.jobId}&resumeVersionId=${application.resumeVersionId ?? ""}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ClipboardCheck className="h-4 w-4" />
            Tao bai danh gia
          </Link>
        )}
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Moc xu ly</h2>
        </div>
        {application.events.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            Chua co moc xu ly nao duoc ghi nhan cho don ung tuyen nay.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {application.events.map((event) => (
              <li key={event.id} className="rounded-xl border border-border-light bg-surface-low p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-foreground">{eventTypeLabels[event.type]}</p>
                  <time className="text-xs text-text-muted" dateTime={event.date.toISOString()}>
                    {dateFormatter.format(event.date)}
                  </time>
                </div>
                {event.fromStatus || event.toStatus ? (
                  <p className="mt-2 text-sm text-text-muted">
                    {event.fromStatus ? statusLabels[event.fromStatus] : "Chua co trang thai"} -&gt;{" "}
                    {event.toStatus ? statusLabels[event.toStatus] : "Chua co trang thai"}
                  </p>
                ) : null}
                {event.notes ? <p className="mt-2 text-sm leading-6 text-text-muted">{event.notes}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
