import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AssessmentReport } from "@/features/assessments/components/AssessmentReport";
import { AssessmentSubmissionForm } from "@/features/assessments/components/AssessmentSubmissionForm";
import { AssessmentOwnershipError, assessmentService } from "@/features/assessments/services/assessment.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

export default async function AssessmentSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const authSession = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: authSession?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const user = authSession!.user;

  const { sessionId } = await params;
  let session;
  try {
    session = await assessmentService.getSession(user.id, sessionId);
  } catch (error) {
    if (error instanceof AssessmentOwnershipError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Bạn không có quyền truy cập phiên đánh giá này.
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/assessments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đánh giá
      </Link>

      <section className="rounded-lg border border-border-light bg-surface-white p-4">
        <p className="text-sm font-semibold uppercase text-primary">Phiên đánh giá</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{session.roleTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          JD: {session.job.title} tại {session.job.company}. CV: {session.resumeVersion.resume.title} v{session.resumeVersion.version}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">
            Seniority: {session.seniority}
          </span>
          <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">
            Trạng thái: {session.status}
          </span>
        </div>
      </section>

      {session.result ? (
        <AssessmentReport result={session.result} />
      ) : (
        <AssessmentSubmissionForm sessionId={session.id} tasks={session.tasks} />
      )}
    </div>
  );
}
