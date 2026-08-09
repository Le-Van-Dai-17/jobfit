import { Bookmark, Building2, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ApplyToJobForm } from "@/features/applications/components/ApplyToJobForm";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { resumeRepository } from "@/features/cv/repositories/resume.repository";
import { saveJobAction } from "@/features/jobs/actions/save-job";
import { jobRepository } from "@/features/jobs/repositories/job.repository";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const { jobId } = await params;
  const [job, resumes, saved] = await Promise.all([
    jobRepository.findPublishedById(jobId),
    resumeRepository.findByUserId(session!.user.id),
    jobRepository.findSavedJob(session!.user.id, jobId),
  ]);
  if (!job) notFound();

  const resumeVersions = resumes.flatMap((resume) => resume.versions.map((version) => ({ id: version.id, resumeTitle: resume.title, version: version.version })));

  return (
    <div className="space-y-5">
      <nav aria-label="Đường dẫn" className="text-sm text-text-muted"><Link href="/jobs" className="font-semibold text-primary">Việc làm</Link><span aria-hidden="true"> / </span><span>{job.title}</span></nav>
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-2xl font-bold text-primary">{job.company.charAt(0).toLocaleUpperCase("vi-VN")}</div><div><h1 className="text-2xl font-bold text-foreground md:text-3xl">{job.title}</h1><p className="mt-2 flex items-center gap-2 text-sm text-text-muted"><Building2 className="h-4 w-4" />{job.company}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-text-muted">{job.location ? <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2.5 py-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span> : null}{job.type ? <span className="rounded-md bg-surface-container px-2.5 py-1">{job.type}</span> : null}{job.deadline ? <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2.5 py-1"><CalendarDays className="h-3.5 w-3.5" />Hạn {dateFormatter.format(job.deadline)}</span> : null}</div></div></div>
          <form action={saveJobAction}><input type="hidden" name="jobId" value={job.id} /><button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />{saved ? "Đã lưu" : "Lưu việc làm"}</button></form>
        </div>
        {job.salaryRange ? <p className="mt-5 font-semibold text-secondary">Mức lương công khai: {job.salaryRange}</p> : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="space-y-7 rounded-2xl bg-surface-white p-5 shadow-card md:p-7">
          <section><h2 className="text-lg font-bold text-foreground">Mô tả công việc</h2>{job.description ? <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">{job.description}</p> : <p className="mt-3 text-sm text-text-muted">Nhà tuyển dụng chưa công bố mô tả chi tiết.</p>}</section>
          <section><h2 className="text-lg font-bold text-foreground">Yêu cầu ứng viên</h2>{job.requirements ? <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">{job.requirements}</p> : <p className="mt-3 text-sm text-text-muted">Nhà tuyển dụng chưa công bố yêu cầu chi tiết.</p>}</section>
          <section className="border-t border-outline-variant pt-5"><h2 className="text-lg font-bold text-foreground">Ngữ cảnh tiếp theo</h2><div className="mt-3 flex flex-wrap gap-4"><Link href={`/job-match?jobId=${job.id}`} className="text-sm font-semibold text-primary">Phân tích mức độ phù hợp</Link><Link href={`/assessments?jobId=${job.id}`} className="text-sm font-semibold text-primary">Tạo bài đánh giá theo JD</Link></div></section>
        </article>
        <aside id="apply" className="scroll-mt-24"><ApplyToJobForm jobId={job.id} resumeVersions={resumeVersions} /></aside>
      </div>
    </div>
  );
}
