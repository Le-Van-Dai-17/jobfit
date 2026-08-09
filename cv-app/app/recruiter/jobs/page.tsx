import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { archiveRecruiterJobAction, publishRecruiterJobAction } from "@/features/recruiter/actions/recruiter.actions";
import { RecruiterJobStatusForm } from "@/features/recruiter/components/RecruiterJobStatusForm";
import { parseRecruiterJobFilters } from "@/features/recruiter/services/recruiter-query";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  isArchived: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const statusLabels: Record<JobRow["status"], string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đang mở",
  ARCHIVED: "Đã lưu trữ",
};

export default async function RecruiterJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const filters = parseRecruiterJobFilters(await searchParams);

  let jobs: JobRow[];
  try {
    jobs = (await recruiterService.listJobs(user.id, filters)) as JobRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Vị trí tuyển dụng</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">JD của công ty</h1>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          href="/recruiter/jobs/new"
        >
          <Plus className="h-4 w-4" />
          Tạo vị trí
        </Link>
      </div>

      <form action="/recruiter/jobs" className="grid gap-3 rounded-xl border border-border-light bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Tìm kiếm</span>
          <input
            className="h-11 w-full rounded-lg border border-outline-variant px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            name="q"
            placeholder="Tên vị trí, địa điểm, mô tả"
            defaultValue={filters.search ?? ""}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Trạng thái</span>
          <select
            className="h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            name="status"
            defaultValue={filters.status ?? ""}
          >
            <option value="">Tất cả</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đang mở</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </label>
        <button className="h-11 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Lọc
        </button>
      </form>

      {jobs.length === 0 ? (
        <section className="rounded-xl border border-border-light bg-surface-white p-6 text-sm text-text-muted shadow-sm">
          Chưa có vị trí tuyển dụng phù hợp với bộ lọc hiện tại.
        </section>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-xl border border-border-light bg-surface-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link
                  className="inline-flex items-center gap-2 font-semibold text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                  href={`/recruiter/jobs/${job.id}`}
                >
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  {job.title}
                </Link>
                <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">
                  {statusLabels[job.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-muted">
                {job.company} · {job.location ?? "Chưa ghi địa điểm"}
              </p>
              <div className="mt-4">
                <RecruiterJobStatusForm
                  action={job.isArchived ? publishRecruiterJobAction : archiveRecruiterJobAction}
                  buttonClassName="rounded-md border border-border-light px-3 py-2 text-sm font-semibold outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                  isArchived={job.isArchived}
                  jobId={job.id}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
