import type { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { ApplicationTransitionForm } from "@/features/recruiter/components/ApplicationTransitionForm";
import { parseRecruiterApplicationFilters } from "@/features/recruiter/services/recruiter-query";
import {
  RecruiterAccessError,
  getAllowedApplicationTransitions,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  user: { name: string | null; email: string | null };
  job: { id: string; title: string };
};
type JobOption = { id: string; title: string };

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
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; jobId?: string | string[]; sort?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const filters = parseRecruiterApplicationFilters(await searchParams);

  let applications: ApplicationRow[];
  let jobs: JobOption[];
  try {
    [applications, jobs] = await Promise.all([
      recruiterService.listApplications(user.id, filters) as Promise<ApplicationRow[]>,
      recruiterService.listJobs(user.id) as Promise<JobOption[]>,
    ]);
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const filterStatuses: ApplicationStatus[] = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"];
  const kanbanStatuses = filterStatuses;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Ứng viên</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Pipeline ứng tuyển</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Danh sách chỉ gồm ứng viên đã ứng tuyển vào JD thuộc công ty của recruiter hiện tại.
        </p>
      </section>

      <form action="/recruiter/candidates" className="grid gap-3 rounded-xl border border-border-light bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_180px_160px_auto]">
        <label className="text-sm font-semibold text-foreground">
          Tìm kiếm
          <input name="q" defaultValue={filters.search ?? ""} className="mt-1 h-11 w-full rounded-lg border border-border-light px-3" placeholder="Tên hoặc email" />
        </label>
        <label className="text-sm font-semibold text-foreground">
          Vị trí
          <select name="jobId" defaultValue={filters.jobId ?? ""} className="mt-1 h-11 w-full rounded-lg border border-border-light px-3">
            <option value="">Tất cả vị trí</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-foreground">
          Trạng thái
          <select name="status" defaultValue={filters.status ?? ""} className="mt-1 h-11 w-full rounded-lg border border-border-light px-3">
            <option value="">Tất cả</option>
            {filterStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-foreground">
          Sắp xếp
          <select name="sort" defaultValue={filters.sort} className="mt-1 h-11 w-full rounded-lg border border-border-light px-3">
            <option value="recent">Mới cập nhật</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </label>
        <button className="h-11 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-white">Lọc</button>
      </form>

      {applications.length === 0 ? (
        <p className="rounded-2xl border border-border-light bg-white p-5 text-sm text-text-muted">
          Chưa có ứng viên trong bộ lọc này.
        </p>
      ) : null}

      <div className="hidden gap-3 xl:grid xl:grid-cols-5">
        {kanbanStatuses.map((columnStatus) => {
          const rows = applications.filter((application) => application.status === columnStatus);
          return (
            <section key={columnStatus} className="min-h-64 rounded-xl border border-border-light bg-surface-low p-3" aria-label={statusLabels[columnStatus]}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-foreground">{statusLabels[columnStatus]}</h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-text-muted">{rows.length}</span>
              </div>
              <div className="space-y-3">
                {rows.map((application) => (
                  <article key={application.id} className="rounded-xl border border-border-light bg-white p-3 shadow-sm">
                    <Link className="font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={`/recruiter/candidates/${application.id}`}>
                      {application.user.name ?? application.user.email ?? "Ứng viên"}
                    </Link>
                    <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
                    <div className="mt-3">
                      <ApplicationTransitionForm applicationId={application.id} nextStatuses={getAllowedApplicationTransitions(application.status)} compact />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="space-y-3 xl:hidden">
        {applications.map((application) => (
          <article key={application.id} className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <Link className="font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={`/recruiter/candidates/${application.id}`}>
                {application.user.name ?? application.user.email ?? "Ứng viên"}
              </Link>
              <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">{statusLabels[application.status]}</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
            <div className="mt-3">
              <ApplicationTransitionForm applicationId={application.id} nextStatuses={getAllowedApplicationTransitions(application.status)} compact />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
