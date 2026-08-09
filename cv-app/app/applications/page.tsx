import { ClipboardCheck, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { applicationService } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = {
  DRAFT: "Bản nháp",
  APPLIED: "Đã ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Có offer",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

export default async function ApplicationsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const applications = await applicationService.listForCandidate(user.id);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Ứng tuyển</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Đơn ứng tuyển của bạn</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Theo dõi trạng thái, CV snapshot đã nộp và mở bài đánh giá kỹ thuật theo từng JD.
        </p>
      </section>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-border-light bg-surface-white p-6">
          <p className="text-sm text-text-muted">Bạn chưa ứng tuyển vị trí nào.</p>
          <Link href="/jobs" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Xem việc làm đang mở
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <article key={application.id} className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{application.job.title}</h2>
                    <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">
                      {statusLabels[application.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{application.job.company}</p>
                  {application.resumeVersion?.resume ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2 text-sm text-text-muted">
                      <FileText className="h-4 w-4 text-primary" />
                      {application.resumeVersion.resume.title} · v{application.resumeVersion.version}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/jobs/${application.jobId}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border-light px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    JD <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/applications/${application.id}`}
                    className="inline-flex rounded-xl border border-border-light px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Chi tiết
                  </Link>
                  <Link
                    href={`/assessments?applicationId=${application.id}&jobId=${application.jobId}&resumeVersionId=${application.resumeVersionId ?? ""}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Đánh giá
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
