import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { archiveRecruiterJobAction, publishRecruiterJobAction } from "@/features/recruiter/actions/recruiter.actions";
import { RecruiterJobStatusForm } from "@/features/recruiter/components/RecruiterJobStatusForm";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type JobRow = { id: string; title: string; company: string; location: string | null; isArchived: boolean };

export default async function RecruiterJobsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  let jobs: JobRow[];
  try {
    jobs = (await recruiterService.listJobs(user.id)) as JobRow[];
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

      {jobs.length === 0 ? (
        <section className="rounded-xl border border-border-light bg-surface-white p-6 text-sm text-text-muted shadow-sm">
          Chưa có vị trí tuyển dụng. Tạo JD đầu tiên để bắt đầu nhận ứng viên và báo cáo đánh giá.
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
                  {job.isArchived ? "Đã lưu trữ" : "Đang mở"}
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
