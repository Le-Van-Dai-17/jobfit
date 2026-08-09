import { BriefcaseBusiness, Building2, Clock3, MapPin, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { jobService } from "@/features/jobs/services/job.service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getSkillTags(requirements?: string | null) {
  if (!requirements) return [];
  const commonSkills = ["React", "Next.js", "TypeScript", "Node.js", "Java", "Python", "SQL", "AWS", "Docker", "Prisma"];
  return commonSkills.filter((skill) => requirements.toLowerCase().includes(skill.toLowerCase())).slice(0, 5);
}

export default async function JobsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  const jobs = await jobService.getRecommendedJobs();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Việc làm</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Feed vị trí IT đang tuyển</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Dữ liệu lấy từ hệ thống đã lưu. Mở JD để chọn CV thuộc tài khoản của bạn, ứng tuyển và tạo bài đánh giá theo ngữ cảnh vị trí.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              CV snapshot khi ứng tuyển
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-3 py-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
              {jobs.length} vị trí đang mở
            </span>
          </div>
        </div>
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_140px]" role="search">
          <label className="relative">
            <span className="sr-only">Tìm theo chức danh hoặc công ty</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-border-light bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Tìm Frontend, Backend, DevOps..."
              type="search"
            />
          </label>
          <select
            aria-label="Lọc hình thức làm việc"
            className="h-11 rounded-xl border border-border-light bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option>Tất cả hình thức</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
          <button
            className="h-11 rounded-xl border border-border-light bg-surface-low px-4 text-sm font-semibold text-foreground"
            type="button"
          >
            Lọc
          </button>
        </form>
      </section>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-border-light bg-surface-white p-6 text-sm text-text-muted">
          Chưa có việc làm đang mở. Khi recruiter đăng JD, vị trí phù hợp sẽ xuất hiện tại đây.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const skills = getSkillTags(job.requirements);
            return (
              <article key={job.id} className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Đăng {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-foreground">{job.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-text-muted">
                      {job.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      ) : null}
                      {job.type ? <span>{job.type}</span> : null}
                      {job.salaryRange ? <span className="font-semibold text-foreground">{job.salaryRange}</span> : null}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                      {job.description ?? "JD chưa có mô tả chi tiết. Mở vị trí để xem yêu cầu và luồng ứng tuyển."}
                    </p>
                    {skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Xem JD
                    </Link>
                    <Link
                      href={`/assessments?jobId=${job.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-border-light px-4 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Đánh giá
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
