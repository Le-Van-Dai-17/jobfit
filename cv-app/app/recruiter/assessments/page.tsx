import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type ApplicationWithAssessment = {
  id: string;
  user: { name: string | null; email: string | null };
  job: { title: string };
  assessmentSessions: Array<{ result: { advisoryScore: number } | null }>;
};

export default async function RecruiterAssessmentsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  let applications: ApplicationWithAssessment[];
  try {
    applications = (await recruiterService.listApplications(user.id)) as ApplicationWithAssessment[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }
  const withReports = applications.filter((application) =>
    application.assessmentSessions.some((sessionItem) => sessionItem.result)
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Đánh giá</h1>
      <div className="space-y-3">
        {withReports.map((application) => {
          const result = application.assessmentSessions.find((item) => item.result)?.result;
          return (
            <Link key={application.id} className="block rounded-xl border border-border-light bg-white p-4" href={`/recruiter/assessments/${application.id}`}>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="font-semibold">{application.user.name ?? application.user.email ?? "Ứng viên"}</span>
                <span className="text-sm text-text-muted">{result?.advisoryScore}/100</span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
            </Link>
          );
        })}
        {withReports.length === 0 ? <p className="text-sm text-text-muted">Chưa có báo cáo đánh giá cho ứng viên.</p> : null}
      </div>
    </div>
  );
}
