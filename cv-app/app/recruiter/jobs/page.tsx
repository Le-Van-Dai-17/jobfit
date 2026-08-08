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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Vị trí tuyển dụng</h1>
        <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white" href="/recruiter/jobs/new">
          Tạo vị trí
        </Link>
      </div>
      <div className="space-y-3">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl border border-border-light bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link className="font-semibold text-foreground hover:text-primary" href={`/recruiter/jobs/${job.id}`}>
                {job.title}
              </Link>
              <span className="text-sm text-text-muted">{job.isArchived ? "Đã lưu trữ" : "Đang mở"}</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              {job.company} · {job.location ?? "Không ghi địa điểm"}
            </p>
            <div className="mt-3">
              <RecruiterJobStatusForm
                action={job.isArchived ? publishRecruiterJobAction : archiveRecruiterJobAction}
                buttonClassName="rounded-xl border border-border-light px-3 py-2 text-sm font-semibold disabled:opacity-60"
                isArchived={job.isArchived}
                jobId={job.id}
              />
            </div>
          </article>
        ))}
        {jobs.length === 0 ? <p className="text-sm text-text-muted">Chưa có vị trí tuyển dụng.</p> : null}
      </div>
    </div>
  );
}
