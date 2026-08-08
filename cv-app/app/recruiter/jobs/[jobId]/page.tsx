import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { archiveRecruiterJobAction, publishRecruiterJobAction } from "@/features/recruiter/actions/recruiter.actions";
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
  isArchived: boolean;
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
      <div>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-sm text-text-muted">
          {job.company} · {job.location ?? "Không ghi địa điểm"} · {job.type ?? "Chưa phân loại"}
        </p>
      </div>
      <RecruiterJobStatusForm
        action={job.isArchived ? publishRecruiterJobAction : archiveRecruiterJobAction}
        buttonClassName="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        isArchived={job.isArchived}
        jobId={job.id}
      />
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Mô tả</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{job.description}</p>
      </section>
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Yêu cầu</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{job.requirements}</p>
      </section>
    </div>
  );
}
