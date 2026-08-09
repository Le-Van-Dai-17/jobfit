import Link from "next/link";
import { ClipboardCheck, FileText } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AssessmentStartForm } from "@/features/assessments/components/AssessmentStartForm";
import { assessmentService } from "@/features/assessments/services/assessment.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ resumeVersionId?: string; jobId?: string; applicationId?: string }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const { resumeVersions, jobs, sessions } = await assessmentService.getStartOptions(user.id);
  const params = await searchParams;
  const selectedResumeVersionId = resumeVersions.some((version) => version.id === params?.resumeVersionId)
    ? params?.resumeVersionId
    : undefined;
  const selectedJobId = jobs.some((job) => job.id === params?.jobId) ? params?.jobId : undefined;
  const hasMissingData = resumeVersions.length === 0 || jobs.length === 0;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase text-primary">Đánh giá kỹ thuật</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
          CV + JD thành bài tập kỹ thuật có bằng chứng
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
          Chọn một phiên bản CV và JD để tạo bài tập thực tế, nộp giải pháp cùng kế hoạch triển khai, rồi nhận báo cáo tư vấn theo rubric và bằng chứng.
        </p>
      </section>

      {hasMissingData && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            {resumeVersions.length === 0
              ? "Bạn cần lưu ít nhất một phiên bản CV trước khi tạo đánh giá."
              : "Chưa có JD khả dụng trong hệ thống. Hãy thêm hoặc đồng bộ JD trước khi tạo đánh giá."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {resumeVersions.length === 0 && (
              <Link
                href="/my-cv"
                className="rounded-md bg-white px-3 py-2 font-semibold text-amber-900 outline-none ring-1 ring-amber-200 focus-visible:ring-2 focus-visible:ring-primary"
              >
                Tạo hoặc lưu CV
              </Link>
            )}
            {jobs.length === 0 && (
              <Link
                href="/jobs"
                className="rounded-md bg-white px-3 py-2 font-semibold text-amber-900 outline-none ring-1 ring-amber-200 focus-visible:ring-2 focus-visible:ring-primary"
              >
                Xem luồng JD
              </Link>
            )}
          </div>
        </div>
      )}

      <AssessmentStartForm
        resumeVersions={resumeVersions}
        jobs={jobs}
        selectedResumeVersionId={selectedResumeVersionId}
        selectedJobId={selectedJobId}
        applicationId={params?.applicationId}
      />

      <section className="rounded-lg border border-border-light bg-surface-white p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Phiên gần đây</h2>
        </div>
        {sessions.length === 0 ? (
          <div className="mt-4 rounded-md bg-surface-low p-4 text-sm text-text-muted">
            Chưa có phiên đánh giá nào. Sau khi tạo bài tập, phiên sẽ xuất hiện tại đây.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border-light">
            {sessions.map((item) => (
              <Link
                key={item.id}
                href={`/assessments/${item.id}`}
                className="flex flex-col gap-2 py-3 outline-none transition-colors hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{item.roleTitle}</p>
                    <p className="text-sm text-text-muted">
                      {item.job.company} - {item.status === "EVALUATED" ? "Đã có báo cáo" : "Đang chờ nộp bài"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {item.result ? `${item.result.advisoryScore}/100 tư vấn` : "Mở phiên"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
