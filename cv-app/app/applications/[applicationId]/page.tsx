import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClipboardCheck, FileText } from "lucide-react";

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
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-primary">Don ung tuyen</p>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{application.job.title}</h1>
        <p className="text-sm text-text-muted">{application.job.company}</p>
        <span className="inline-flex rounded-full bg-surface-low px-3 py-1 text-sm font-semibold text-foreground">
          {statusLabels[application.status]}
        </span>
      </section>

      <section className="rounded-lg border border-border-light bg-surface-white p-5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">CV snapshot da chon</h2>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          {application.resumeVersion?.resume.title ?? "CV"} - v{application.resumeVersion?.version ?? "?"}
        </p>
        <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-surface-low p-4 text-xs text-foreground">
          {JSON.stringify(application.resumeVersion?.content ?? {}, null, 2)}
        </pre>
      </section>

      <section className="rounded-lg border border-border-light bg-surface-white p-5">
        <h2 className="text-lg font-bold text-foreground">Danh gia theo don nay</h2>
        {latestSession ? (
          <Link
            href={`/assessments/${latestSession.id}`}
            className="mt-3 inline-flex rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Mo phien danh gia
          </Link>
        ) : (
          <Link
            href={`/assessments?applicationId=${application.id}&jobId=${application.jobId}&resumeVersionId=${application.resumeVersionId ?? ""}`}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <ClipboardCheck className="h-4 w-4" />
            Tao bai danh gia
          </Link>
        )}
      </section>
    </div>
  );
}
