import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClipboardCheck, FileText, History } from "lucide-react";

import { auth } from "@/auth";
import { applicationService, ApplicationOwnershipError } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = {
  DRAFT: "Bản nháp",
  APPLIED: "Đã ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Có offer",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
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
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Đơn ứng tuyển</p>
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
          <h2 className="text-lg font-bold text-foreground">CV snapshot đã chọn</h2>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          {application.resumeVersion?.resume.title ?? "CV"} · phiên bản {application.resumeVersion?.version ?? "?"}
        </p>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-surface-low p-4 text-xs leading-5 text-foreground">
          {JSON.stringify(application.resumeVersion?.content ?? {}, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Đánh giá theo đơn này</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Bài đánh giá dùng đúng JD và CV snapshot đã ứng tuyển để tạo bằng chứng cho recruiter.
        </p>
        {latestSession ? (
          <Link
            href={`/assessments/${latestSession.id}`}
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Mở phiên đánh giá
          </Link>
        ) : (
          <Link
            href={`/assessments?applicationId=${application.id}&jobId=${application.jobId}&resumeVersionId=${application.resumeVersionId ?? ""}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ClipboardCheck className="h-4 w-4" />
            Tạo bài đánh giá
          </Link>
        )}
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Mốc xử lý</h2>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          Trạng thái hiện tại được cập nhật bởi recruiter trong pipeline công ty.
        </p>
      </section>
    </div>
  );
}
