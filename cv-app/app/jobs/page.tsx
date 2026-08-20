import { Bookmark, BriefcaseBusiness, Building2, Clock3, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { saveJobAction } from "@/features/jobs/actions/save-job";
import { parseJobFeedFilters } from "@/features/jobs/services/job-feed-filter";
import { jobService } from "@/features/jobs/services/job.service";
import { translateJobInfo } from "@/lib/utils";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getSkillTags(requirements?: string | null) {
  if (!requirements) return [];
  const commonSkills = ["React", "Next.js", "TypeScript", "Node.js", "Java", "Python", "SQL", "AWS", "Docker", "Prisma"];
  return commonSkills.filter((skill) => requirements.toLocaleLowerCase("vi-VN").includes(skill.toLocaleLowerCase("vi-VN"))).slice(0, 5);
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; mode?: string | string[] }> }) {
  const session = await auth();

  const filters = parseJobFeedFilters(await searchParams);
  const { data: jobs, meta } = await jobService.getCandidateFeed(session?.user?.id, filters);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-surface-container p-5 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Việc làm</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Khám phá vị trí đang tuyển</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Tìm trong các JD đã được nhà tuyển dụng công khai và ứng tuyển bằng đúng phiên bản CV bạn chọn.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-white px-3 py-2 text-xs font-semibold text-text-muted">
            <BriefcaseBusiness className="h-4 w-4 text-primary" />{meta.total} vị trí phù hợp bộ lọc
          </span>
        </div>
        <form className="mt-5 grid overflow-hidden rounded-lg bg-surface-white shadow-card md:grid-cols-[1fr_220px_120px]" role="search">
          <label className="relative border-b border-outline-variant md:border-b-0 md:border-r">
            <span className="sr-only">Tìm theo chức danh hoặc công ty</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            <input className="h-12 w-full bg-transparent pl-11 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" defaultValue={filters.q} name="q" placeholder="Tên công việc hoặc công ty" type="search" />
          </label>
          <select aria-label="Lọc hình thức làm việc" className="h-12 bg-transparent px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" defaultValue={filters.mode} name="mode">
            <option value="all">Tất cả hình thức</option><option value="remote">Từ xa</option><option value="hybrid">Kết hợp</option><option value="onsite">Tại văn phòng</option>
          </select>
          <button className="m-1 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="submit">Tìm việc</button>
        </form>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Bộ lọc nhanh">
        {[{ label: "Tất cả", mode: "all" }, { label: "Từ xa", mode: "remote" }, { label: "Kết hợp", mode: "hybrid" }, { label: "Tại văn phòng", mode: "onsite" }].map((item) => (
          <Link key={item.mode} href={`/jobs?mode=${item.mode}${filters.q ? `&q=${encodeURIComponent(filters.q)}` : ""}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${filters.mode === item.mode ? "bg-primary-container text-white" : "bg-surface-container-highest text-text-muted"}`}>{item.label}</Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <section className="rounded-xl bg-surface-white p-6 text-sm text-text-muted shadow-card"><p>Không có vị trí công khai nào khớp bộ lọc hiện tại.</p><Link href="/jobs" className="mt-3 inline-flex font-semibold text-primary">Xóa bộ lọc</Link></section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            {jobs.map((job) => {
              const skills = getSkillTags(job.requirements);
              const application = job.applications[0];
              const assessment = application?.assessmentSessions[0] ?? job.assessmentSessions[0];
              const saved = job.savedBy.length > 0;
              return (
                <article key={job.id} className="group rounded-xl bg-surface-white p-4 shadow-card transition-shadow hover:shadow-card-hover md:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-lg font-bold text-primary" aria-hidden="true">{job.company.trim().charAt(0).toLocaleUpperCase("vi-VN") || "C"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div><Link href={`/jobs/${job.id}`} className="text-base font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary md:text-lg">{job.title}</Link><p className="mt-1 text-sm text-text-muted">{job.company} · Đăng {formatDate(job.createdAt)}</p></div>
                        <form action={saveJobAction}><input type="hidden" name="jobId" value={job.id} /><button type="submit" aria-label={saved ? `Bỏ lưu ${job.title}` : `Lưu ${job.title}`} className={`rounded-lg p-2 outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary ${saved ? "text-primary" : "text-outline"}`}><Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} /></button></form>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-text-muted">
                        {job.salaryRange ? <span className="rounded-md bg-secondary-container px-2.5 py-1 text-secondary">{job.salaryRange}</span> : null}
                        {job.location ? <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-highest px-2.5 py-1"><MapPin className="h-3.5 w-3.5" />{translateJobInfo(job.location)}</span> : null}
                        {job.type ? <span className="rounded-md bg-surface-container px-2.5 py-1">{translateJobInfo(job.type)}</span> : null}
                        {job.deadline ? <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2.5 py-1"><Clock3 className="h-3.5 w-3.5" />Hạn {formatDate(job.deadline)}</span> : null}
                      </div>
                      {job.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">{job.description}</p> : <p className="mt-3 text-sm text-text-muted">JD chưa công bố mô tả chi tiết.</p>}
                      {skills.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded bg-surface-container px-2 py-1 text-xs font-medium text-text-muted">{skill}</span>)}</div> : null}
                      <div className="mt-4 flex items-center gap-2 border-t border-outline-variant pt-3">
                        <Link href={`/jobs/${job.id}`} className="flex-1 rounded-lg py-2.5 text-center text-sm font-semibold text-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Chi tiết</Link>
                        <Link href={`/jobs/${job.id}#apply`} className="flex-1 rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Ứng tuyển</Link>
                      </div>
                      {application || assessment ? <p className="mt-3 text-xs text-text-muted">{application ? `Trạng thái đơn: ${application.status}` : ""}{application && assessment ? " · " : ""}{assessment ? `Đánh giá: ${assessment.status}` : ""}</p> : null}
                    </div>
                  </div>
                </article>
              );
            })}

            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4 border-t border-outline-variant/50 pt-6">
                {meta.page > 1 ? (
                  <Link href={`/jobs?page=${meta.page - 1}&mode=${filters.mode}${filters.q ? `&q=${encodeURIComponent(filters.q)}` : ""}`} className="rounded-lg px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-foreground">Trang trước</Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold text-outline">Trang trước</span>
                )}
                <span className="text-sm font-semibold text-foreground">
                  Trang {meta.page} / {meta.totalPages}
                </span>
                {meta.hasNextPage ? (
                  <Link href={`/jobs?page=${meta.page + 1}&mode=${filters.mode}${filters.q ? `&q=${encodeURIComponent(filters.q)}` : ""}`} className="rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-highest">Trang kế</Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold text-outline">Trang kế</span>
                )}
              </div>
            )}
          </div>
          <aside className="hidden space-y-4 lg:block">
            <section className="rounded-xl bg-surface-white p-5 shadow-card"><h2 className="flex items-center gap-2 font-semibold text-foreground"><Building2 className="h-5 w-5 text-primary" />Nguồn dữ liệu</h2><p className="mt-3 text-sm leading-6 text-text-muted">Chỉ hiển thị vị trí đang ở trạng thái công khai. Bộ lọc được áp dụng trực tiếp tại kho dữ liệu.</p></section>
            <section className="rounded-xl bg-surface-white p-5 shadow-card"><h2 className="font-semibold text-foreground">Tiếp tục hồ sơ</h2><p className="mt-2 text-sm leading-6 text-text-muted">Cập nhật CV trước khi nộp để snapshot phản ánh đúng thông tin của bạn.</p><Link href="/my-cv" className="mt-3 inline-flex text-sm font-semibold text-primary">Mở Hồ sơ & CV</Link></section>
          </aside>
        </div>
      )}
    </div>
  );
}
