import Link from "next/link";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { parseApplicationStatusFilter } from "@/features/recruiter/services/recruiter-query";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  user: { name: string | null; email: string | null };
  job: { title: string };
  updatedAt?: Date;
};

const statusLabels: Record<ApplicationStatus, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Chờ review",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Có offer",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { status: rawStatus } = await searchParams;
  const status = parseApplicationStatusFilter(rawStatus);

  let applications: ApplicationRow[];
  try {
    applications = (await recruiterService.listApplications(user.id, { status })) as ApplicationRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const statuses: ApplicationStatus[] = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Ứng viên</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Pipeline ứng tuyển</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Danh sách chỉ gồm ứng viên đã ứng tuyển vào JD thuộc công ty của recruiter hiện tại.
        </p>
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Lọc trạng thái">
        <Link className="rounded-xl border border-border-light bg-white px-3 py-2 text-sm font-semibold" href="/recruiter/candidates">
          Tất cả
        </Link>
        {statuses.map((item) => (
          <Link
            key={item}
            className="rounded-xl border border-border-light bg-white px-3 py-2 text-sm font-semibold"
            href={`/recruiter/candidates?status=${item}`}
          >
            {statusLabels[item]}
          </Link>
        ))}
      </nav>

      <div className="space-y-3">
        {applications.map((application) => (
          <Link
            key={application.id}
            className="block rounded-2xl border border-border-light bg-white p-4 shadow-sm hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={`/recruiter/candidates/${application.id}`}
          >
            <div className="flex flex-wrap justify-between gap-3">
              <span className="font-semibold">{application.user.name ?? application.user.email ?? "Ứng viên"}</span>
              <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">
                {statusLabels[application.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
          </Link>
        ))}
        {applications.length === 0 ? (
          <p className="rounded-2xl border border-border-light bg-white p-5 text-sm text-text-muted">
            Chưa có ứng viên trong bộ lọc này.
          </p>
        ) : null}
      </div>
    </div>
  );
}
