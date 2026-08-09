import { Bookmark, BriefcaseBusiness, ClipboardCheck, FileText, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { candidateDashboardService } from "@/features/dashboard/services/candidate-dashboard.service";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { saveJobAction } from "@/features/jobs/actions/save-job";
import { jobService } from "@/features/jobs/services/job.service";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "CANDIDATE") redirect(getDashboardPathForRole(session.user.role));

  const [summary, jobs] = await Promise.all([
    candidateDashboardService.getSummary(session.user.id),
    jobService.getCandidateFeed(session.user.id, { q: "", mode: "all" }),
  ]);
  const featuredJobs = jobs.slice(0, 3);
  const latestJobs = jobs.slice(3, 6);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-surface-container px-5 py-10 text-center shadow-card md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-primary-fixed-dim/50" />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">Chào mừng bạn quay lại, <span className="text-primary">{summary.userName}</span></h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted md:text-base">Tìm cơ hội nghề nghiệp tiếp theo và theo dõi CV, đơn ứng tuyển, bài đánh giá trong một luồng dữ liệu thống nhất.</p>
          <form action="/jobs" className="mx-auto mt-6 flex max-w-2xl rounded-full bg-surface-white p-2 shadow-card" role="search">
            <label className="flex min-w-0 flex-1 items-center gap-2 pl-3"><BriefcaseBusiness className="h-5 w-5 shrink-0 text-outline" /><span className="sr-only">Tên công việc hoặc công ty</span><input name="q" type="search" placeholder="Tên công việc hoặc công ty" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
            <button type="submit" className="shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Tìm việc</button>
          </form>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-foreground">Việc làm mới dành cho bạn</h2><Link href="/jobs" className="text-sm font-semibold text-primary">Xem tất cả</Link></div>
            {featuredJobs.length === 0 ? <div className="rounded-xl bg-surface-white p-5 text-sm text-text-muted shadow-card">Chưa có vị trí công khai để gợi ý.</div> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{featuredJobs.map((job) => <article key={job.id} className="flex flex-col rounded-xl bg-surface-white p-4 shadow-card transition-shadow hover:shadow-card-hover"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed font-bold text-primary">{job.company.charAt(0).toLocaleUpperCase("vi-VN")}</div><form action={saveJobAction}><input type="hidden" name="jobId" value={job.id} /><button type="submit" aria-label={`${job.savedBy.length ? "Bỏ lưu" : "Lưu"} ${job.title}`} className="rounded-lg p-2 text-outline hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Bookmark className="h-5 w-5" fill={job.savedBy.length ? "currentColor" : "none"} /></button></form></div><Link href={`/jobs/${job.id}`} className="mt-4 line-clamp-2 font-semibold text-primary hover:underline">{job.title}</Link><p className="mt-1 text-sm text-text-muted">{job.company}</p><div className="mt-3 space-y-2 text-xs text-text-muted">{job.location ? <p className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</p> : null}{job.salaryRange ? <p className="font-medium text-foreground">{job.salaryRange}</p> : null}</div>{job.type ? <span className="mt-4 w-fit rounded bg-surface-container px-2 py-1 text-xs text-text-muted">{job.type}</span> : null}</article>)}</div>
            )}
          </section>
          {latestJobs.length > 0 ? <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="text-xl font-bold text-foreground">Tin tuyển dụng mới nhất</h2><div className="mt-4 divide-y divide-outline-variant">{latestJobs.map((job) => <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between gap-4 py-4 outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"><div className="min-w-0"><p className="truncate font-semibold text-primary">{job.title}</p><p className="truncate text-sm text-text-muted">{job.company}{job.location ? ` · ${job.location}` : ""}</p></div><span className="shrink-0 text-sm font-semibold text-primary">Chi tiết</span></Link>)}</div></section> : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="font-bold text-foreground">Hồ sơ & CV</h2><p className="mt-3 text-lg font-bold text-primary">{summary.cvReady ? "Đã sẵn sàng" : "Chưa sẵn sàng"}</p><p className="mt-1 text-sm text-text-muted">{summary.resumeCount} CV đã lưu · Hồ sơ {summary.profileComplete ? "đã hoàn thiện" : "chưa hoàn thiện"}.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/profile" className="text-sm font-semibold text-primary">Cập nhật hồ sơ</Link><Link href="/my-cv" className="text-sm font-semibold text-primary">Mở CV</Link></div></section>
          <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="font-bold text-foreground">Hoạt động của bạn</h2><div className="mt-3 space-y-2"><Link href="/applications" className="flex items-center justify-between rounded-lg p-3 hover:bg-surface-low"><span className="flex items-center gap-2 text-sm"><Send className="h-4 w-4 text-primary" />Đơn ứng tuyển</span><strong>{summary.applicationCounts.total}</strong></Link><Link href="/assessments" className="flex items-center justify-between rounded-lg p-3 hover:bg-surface-low"><span className="flex items-center gap-2 text-sm"><ClipboardCheck className="h-4 w-4 text-primary" />Đánh giá cần làm</span><strong>{summary.pendingAssessments.length}</strong></Link></div></section>
          <Link href={summary.nextAction.href} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FileText className="h-4 w-4" />{summary.nextAction.label}</Link>
        </aside>
      </div>
    </div>
  );
}
