import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  MapPin,
  Send,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
  Banknote,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/auth";
import { candidateDashboardService } from "@/features/dashboard/services/candidate-dashboard.service";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { saveJobAction } from "@/features/jobs/actions/save-job";
import { formatJobPostedLabel } from "@/features/jobs/services/job-posted-label";
import { jobService } from "@/features/jobs/services/job.service";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "CANDIDATE") redirect(getDashboardPathForRole(session.user.role));

  const summary = await candidateDashboardService.getSummary(session.user.id);
  const { data: jobs } = await jobService.getCandidateFeed(
    session.user.id,
    { q: "", location: summary.profileLocation ?? "", mode: "all", page: 1, limit: 10 },
    { includeProgress: false }
  );
  const featuredJobs = jobs.slice(0, 3);
  const latestJobs = jobs.slice(3, 6);

  const userName = summary.userName || "Ứng viên";

  return (
    <div className="bg-[#F8FAFC] -m-6 pb-12">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F0FE] to-[#DCE3FE] px-4 py-16 text-center md:px-10 md:py-20 rounded-b-[40px] md:rounded-b-[80px]">
        {/* Subtle decorative curves (mockup feel) */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#0047AB]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Chào mừng bạn quay lại, <span className="text-[#0047AB]">{userName}</span>!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
            Tìm kiếm cơ hội nghề nghiệp tiếp theo của bạn với hàng ngàn việc làm được cập nhật mỗi ngày.
          </p>

          <form action="/jobs" className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg md:flex-row md:rounded-full md:items-center" role="search">

            <label className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="sr-only">Tên công việc, vị trí...</span>
              <input name="q" type="search" placeholder="Tên công việc, vị trí..." className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none text-foreground placeholder:text-gray-400" />
            </label>

            <div className="hidden h-8 w-px bg-gray-200 md:block" />

            <label className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2 border-t border-gray-100 md:border-none">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="sr-only">Địa điểm...</span>
              <input name="location" type="search" placeholder="Địa điểm..." className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none text-foreground placeholder:text-gray-400" />
            </label>

            <button type="submit" className="mt-2 w-full shrink-0 rounded-xl md:rounded-full bg-[#0047AB] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047AB] md:mt-0 md:w-auto">
              Tìm việc
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-text-muted">
            <span className="uppercase tracking-wider text-xs font-bold text-gray-500">Từ khóa phổ biến:</span>
            <span className="cursor-pointer rounded-full bg-white/60 px-4 py-1.5 hover:bg-white transition-colors">Marketing</span>
            <span className="cursor-pointer rounded-full bg-white/60 px-4 py-1.5 hover:bg-white transition-colors">IT Phần mềm</span>
            <span className="cursor-pointer rounded-full bg-white/60 px-4 py-1.5 hover:bg-white transition-colors">Nhân sự</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* Left Column */}
        <div className="space-y-10">

          {/* Việc làm gợi ý */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#0047AB]">
                  <BriefcaseBusiness className="h-4 w-4" />
                </span>
                Việc làm gợi ý cho bạn
              </h2>
              <Link href="/jobs" className="flex items-center gap-1 text-sm font-bold text-[#0047AB] hover:underline">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {featuredJobs.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-sm font-medium text-text-muted shadow-sm ring-1 ring-border-light">
                Chưa có vị trí công khai để gợi ý.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredJobs.map((job) => (
                  <article key={job.id} className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border-light transition-all hover:shadow-md hover:ring-[#0047AB]/20">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-low text-xl font-bold text-[#0047AB]">
                        {job.company.charAt(0).toLocaleUpperCase("vi-VN")}
                      </div>
                      <form action={saveJobAction}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button type="submit" aria-label={`${job.savedBy.length ? "Bỏ lưu" : "Lưu"} ${job.title}`} className="rounded-full p-2 text-gray-400 hover:bg-blue-50 hover:text-[#0047AB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047AB] transition-colors">
                          <Bookmark className="h-5 w-5" fill={job.savedBy.length ? "currentColor" : "none"} />
                        </button>
                      </form>
                    </div>

                    <div className="mt-5 flex-1">
                      <Link href={`/jobs/${job.id}`} className="line-clamp-2 text-lg font-bold text-[#0047AB] group-hover:underline">
                        {job.title}
                      </Link>
                      <p className="mt-2 text-sm font-medium text-foreground">{job.company}</p>
                    </div>

                    <div className="mt-4 space-y-2 text-sm font-semibold text-text-muted">
                      {job.salaryRange && (
                        <p className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />{job.salaryRange}
                        </p>
                      )}
                      {job.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />{job.location}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.type && <span className="rounded bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0047AB]">Toàn thời gian</span>}
                      <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">Từ xa</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Tin tuyển dụng mới nhất */}
          {latestJobs.length > 0 && (
            <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border-light">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Tin tuyển dụng mới nhất</h2>
                <div className="flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-border-light">
                {latestJobs.map((job) => (
                  <div key={job.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-low font-bold text-[#0047AB]">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link href={`/jobs/${job.id}`} className="text-base font-bold text-[#0047AB] hover:underline">
                          {job.title}
                        </Link>
                        <p className="text-sm font-medium text-text-muted">{job.company}</p>
                        <div className="flex items-center gap-4 text-xs font-semibold text-text-muted mt-1">
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
                          {job.salaryRange && <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5" /> {job.salaryRange}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                        {formatJobPostedLabel(job.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center pt-4">
                <Link href="/jobs" className="text-sm font-bold text-[#0047AB] hover:underline">
                  Xem thêm việc làm mới
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <aside className="space-y-6">

          {/* Profile Card */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light text-center">
            <div className="relative mx-auto h-20 w-20">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl font-bold text-[#0047AB]">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>

            <h3 className="mt-4 text-lg font-bold text-foreground">{userName}</h3>
            <p className="text-sm font-medium text-text-muted">UI/UX Designer</p>

            <div className="mt-6 text-left">
              <div className="flex justify-between text-xs font-bold text-foreground mb-2">
                <span>Mức độ hoàn thiện hồ sơ</span>
                <span className="text-[#0047AB]">75%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#0047AB]" style={{ width: "75%" }} />
              </div>
              <p className="mt-2 text-xs font-medium text-text-muted text-center">Cập nhật kinh nghiệm để đạt 100%</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link href="/profile" className="flex-1 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-[#0047AB] hover:bg-blue-100 transition-colors">
                Cập nhật CV
              </Link>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </section>

          {/* Activity Card */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <h3 className="mb-4 text-base font-bold text-foreground border-l-4 border-[#0047AB] pl-3">Hoạt động của bạn</h3>

            <div className="space-y-4">
              <Link href="/saved-jobs" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0047AB] group-hover:bg-[#0047AB] group-hover:text-white transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-[#0047AB] transition-colors">Việc làm đã lưu</span>
                </div>
                <span className="text-base font-bold text-[#0047AB]">12</span>
              </Link>

              <Link href="/applications" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Send className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-green-600 transition-colors">Việc làm đã ứng tuyển</span>
                </div>
                <span className="text-base font-bold text-green-600">{summary.applicationCounts.total}</span>
              </Link>

              <Link href="/profile-views" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors">Nhà tuyển dụng xem hồ sơ</span>
                </div>
                <span className="text-base font-bold text-orange-600">5</span>
              </Link>
            </div>
          </section>

          {/* Promo Card */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <h3 className="mb-2 text-base font-bold text-foreground">Tải ứng dụng Jobfit</h3>
            <p className="text-sm font-medium text-text-muted mb-5 leading-relaxed">
              Cập nhật việc làm mới nhất và ứng tuyển nhanh chóng mọi lúc mọi nơi.
            </p>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-black transition-colors">
                <svg viewBox="0 0 384 512" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                App Store
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-black transition-colors">
                <svg viewBox="0 0 512 512" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                Google Play
              </button>
            </div>
          </section>

        </aside>

      </div>
    </div>
  );
}
