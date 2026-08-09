import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type AssessmentReportRow = {
  id: string;
  advisoryScore: number;
  reportSummary: string | null;
  session: {
    applicationId: string | null;
    roleTitle: string;
    application: {
      id: string;
      user: { name: string | null; email: string | null };
      job: { title: string };
    } | null;
  };
};

export default async function RecruiterAssessmentsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  let reports: AssessmentReportRow[];
  try {
    reports = (await recruiterService.listAssessmentReports(user.id)) as AssessmentReportRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">Đánh giá</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Báo cáo ứng viên</h1>
      </div>

      {reports.length === 0 ? (
        <section className="rounded-xl border border-border-light bg-surface-white p-6 text-sm text-text-muted shadow-sm">
          Chưa có báo cáo đánh giá cho ứng viên. Báo cáo sẽ xuất hiện sau khi ứng viên nộp bài và hệ thống chấm rubric.
        </section>
      ) : (
        <div className="grid gap-3">
          {reports.map((report) => {
            const application = report.session.application;
            if (!application) return null;
            return (
              <Link key={report.id} className="block rounded-xl border border-border-light bg-surface-white p-4 shadow-sm outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary" href={`/recruiter/assessments/${application.id}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <span className="font-semibold text-foreground">
                    {application.user.name ?? application.user.email ?? "Ứng viên"}
                  </span>
                  <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">
                    {report.advisoryScore}/100 tư vấn
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-muted">{application.job.title}</p>
                {report.reportSummary ? <p className="mt-2 line-clamp-2 text-sm text-text-muted">{report.reportSummary}</p> : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
