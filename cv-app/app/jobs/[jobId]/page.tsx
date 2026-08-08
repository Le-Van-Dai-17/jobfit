import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ApplyToJobForm } from "@/features/applications/components/ApplyToJobForm";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { jobRepository } from "@/features/jobs/repositories/job.repository";
import { resumeRepository } from "@/features/cv/repositories/resume.repository";

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const { jobId } = await params;
  const [job, resumes] = await Promise.all([
    jobRepository.findById(jobId),
    resumeRepository.findByUserId(user.id),
  ]);

  if (!job) notFound();

  const resumeVersions = resumes.flatMap((resume) =>
    resume.versions.map((version) => ({
      id: version.id,
      resumeTitle: resume.title,
      version: version.version,
    }))
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-6 rounded-lg border border-border-light bg-surface-white p-6">
        <div>
          <Link href="/jobs" className="text-sm font-semibold text-primary">
            Quay lại việc làm
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{job.title}</h1>
          <p className="mt-2 text-sm text-text-muted">
            {job.company}
            {job.location ? ` - ${job.location}` : ""}
          </p>
          {job.salaryRange && <p className="mt-2 text-sm font-semibold text-foreground">{job.salaryRange}</p>}
        </div>

        {job.description && (
          <section>
            <h2 className="font-bold text-foreground">Mô tả công việc</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">{job.description}</p>
          </section>
        )}

        {job.requirements && (
          <section>
            <h2 className="font-bold text-foreground">Yêu cầu</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">{job.requirements}</p>
          </section>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border-light pt-4">
          <Link href={`/job-match?jobId=${job.id}`} className="text-sm font-semibold text-primary">
            Phân tích match từ vị trí này
          </Link>
          <Link href={`/assessments?jobId=${job.id}`} className="text-sm font-semibold text-primary">
            Tạo bài đánh giá theo JD
          </Link>
        </div>
      </article>

      <aside>
        <ApplyToJobForm jobId={job.id} resumeVersions={resumeVersions} />
      </aside>
    </div>
  );
}
