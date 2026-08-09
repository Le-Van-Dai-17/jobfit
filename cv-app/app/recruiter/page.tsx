import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, ClipboardCheck, FileSearch, Users } from "lucide-react";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type RecentApplication = {
  id: string;
  status: string;
  user: { name: string | null; email: string | null };
  job: { title: string };
};

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Chờ review",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Có offer",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
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
    { label: "Vị trí đang mở", value: dashboard.counts.activeJobs, icon: BriefcaseBusiness },
    { label: "Tổng ứng viên", value: dashboard.counts.applications, icon: Users },
    { label: "Chờ review", value: dashboard.counts.awaitingReview, icon: FileSearch },
    { label: "Báo cáo đánh giá", value: dashboard.counts.assessmentReports, icon: ClipboardCheck },
  ];
  const recentApplications = dashboard.recentApplications as RecentApplication[];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Tổng quan</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bảng điều phối tuyển dụng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Số liệu được giới hạn theo công ty của recruiter hiện tại, gồm JD, pipeline và báo cáo đánh giá có bằng chứng.
            </p>
          </div>
          <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white" href="/recruiter/jobs/new">
            Tạo JD
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Ứng viên gần đây</h2>
            <p className="mt-1 text-sm text-text-muted">Các đơn mới nhất trong pipeline công ty.</p>
          </div>
          <Link className="text-sm font-semibold text-primary" href="/recruiter/candidates">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentApplications.map((application) => (
            <Link
              key={application.id}
              className="block rounded-xl border border-border-light p-3 hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={`/recruiter/candidates/${application.id}`}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{application.user.name ?? application.user.email ?? "Ứng viên"}</span>
                <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">
                  {statusLabels[application.status] ?? application.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
            </Link>
          ))}
          {recentApplications.length === 0 ? <p className="text-sm text-text-muted">Chưa có ứng viên nào.</p> : null}
        </div>
      </section>
    </div>
  );
}
