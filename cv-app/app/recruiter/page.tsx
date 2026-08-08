import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type RecentApplication = {
  id: string;
  status: string;
  user: { name: string | null; email: string | null };
  job: { title: string };
};

export default async function RecruiterDashboardPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  let dashboard;
  try {
    dashboard = await recruiterService.getDashboard(user.id);
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const stats = [
    ["Vi tri", dashboard.counts.jobs],
    ["Dang mo", dashboard.counts.activeJobs],
    ["Ung vien", dashboard.counts.applications],
    ["Cho review", dashboard.counts.awaitingReview],
    ["Cho assessment", dashboard.counts.awaitingAssessment],
    ["Bao cao", dashboard.counts.assessmentReports],
  ];
  const recentApplications = dashboard.recentApplications as RecentApplication[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tong quan tuyen dung</h1>
        <p className="text-sm text-text-muted">Chi so duoc gioi han theo cong ty cua recruiter hien tai.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border-light bg-white p-5">
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white" href="/recruiter/jobs">
          Quan ly vi tri
        </Link>
        <Link className="rounded-xl border border-border-light px-4 py-2 text-sm font-semibold" href="/recruiter/candidates">
          Xem ung vien
        </Link>
      </div>
      <section className="rounded-xl border border-border-light bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Ung vien gan day</h2>
          <Link className="text-sm font-semibold text-primary" href="/recruiter/candidates">
            Xem tat ca
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {recentApplications.map((application) => (
            <Link key={application.id} className="block rounded-xl border border-border-light p-3" href={`/recruiter/candidates/${application.id}`}>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{application.user.name ?? application.user.email ?? "Ung vien"}</span>
                <span className="text-sm text-text-muted">{application.status}</span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
            </Link>
          ))}
          {recentApplications.length === 0 ? <p className="text-sm text-text-muted">Chua co ung vien nao.</p> : null}
        </div>
      </section>
    </div>
  );
}
