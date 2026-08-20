import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterJobEditForm } from "@/features/recruiter/components/RecruiterJobEditForm";
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

export default async function RecruiterJobEditPage({ params }: { params: Promise<{ jobId: string }> }) {
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
        <p className="text-sm font-semibold text-primary">Chỉnh sửa JD</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{job.title}</h1>
        <p className="mt-2 text-sm text-text-muted">Chỉnh sửa nội dung tin tuyển dụng. Trạng thái đăng tuyển được quản lý ở trang xem thông tin job.</p>
        <Link href={`/recruiter/jobs/${job.id}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
          Quay lại xem thông tin job
        </Link>
      </section>

      <RecruiterJobEditForm job={job} />
    </div>
  );
}
