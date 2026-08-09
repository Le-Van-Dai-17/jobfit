import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { archiveRecruiterJobAction, publishRecruiterJobAction } from "@/features/recruiter/actions/recruiter.actions";
import { RecruiterJobEditForm } from "@/features/recruiter/components/RecruiterJobEditForm";
import { RecruiterJobStatusForm } from "@/features/recruiter/components/RecruiterJobStatusForm";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string | null;
  description: string | null;
  requirements: string | null;
  salaryRange: string | null;
  url: string | null;
  isArchived: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export default async function RecruiterJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { jobId } = await params;

  let job: JobDetail;
  try {
    job = (await recruiterService.getJob(user.id, jobId)) as JobDetail;
  } catch (error) {
    if (error instanceof RecruiterAccessError) notFound();
    throw error;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Chi tiết JD</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="mt-2 text-sm text-text-muted">
              {job.company} · {job.location ?? "Chưa ghi địa điểm"} · {job.type ?? "Chưa phân loại"}
            </p>
          </div>
          <span className="w-fit rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">
            {job.isArchived ? "Đã lưu trữ" : "Đang mở"}
          </span>
        </div>
        <div className="mt-4">
          <RecruiterJobStatusForm
            action={job.isArchived ? publishRecruiterJobAction : archiveRecruiterJobAction}
            buttonClassName="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
            isArchived={job.isArchived}
            jobId={job.id}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">Mô tả</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">
          {job.description ?? "Chưa có mô tả."}
        </p>
      </section>
      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">Yêu cầu</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">
          {job.requirements ?? "Chưa có yêu cầu."}
        </p>
      </section>
      <RecruiterJobEditForm job={job} />
    </div>
  );
}
