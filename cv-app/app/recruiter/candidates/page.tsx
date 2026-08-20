import type { ApplicationStatus } from "@prisma/client";
import {
  BriefcaseBusiness,
  Clock3,
  Mail,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { parseRecruiterApplicationFilters } from "@/features/recruiter/services/recruiter-query";
import {
  RecruiterAccessError,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";
import { cn } from "@/lib/utils";

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  user: { name: string | null; email: string | null };
  job: { id: string; title: string; skills: string[] | string | null };
  updatedAt: Date;
  appliedAt: Date | null;
  resumeVersion?: { matchAnalyses?: Array<{ jobId: string; overallScore: number }> } | null;
  assessmentSessions?: Array<unknown>;
};

type JobOption = {
  id: string;
  title: string;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Ứng tuyển",
  INTERVIEWING: "Phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

const statusDescriptions: Record<string, string> = {
  APPLIED: "Mới nộp CV, cần sàng lọc",
  INTERVIEWING: "Đang ở vòng phỏng vấn",
  OFFER: "Đã gửi đề nghị nhận việc",
  REJECTED: "Không tiếp tục quy trình",
  WITHDRAWN: "Ứng viên đã rút hồ sơ",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-low text-text-muted",
  APPLIED: "bg-blue-50 text-blue-700",
  INTERVIEWING: "bg-orange-50 text-orange-700",
  OFFER: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-600",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatTimeAgo(date: Date) {
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  if (diffInMinutes < 60) return `${Math.max(1, diffInMinutes)} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function parseSkills(skills: string[] | string | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.slice(0, 3);
  return skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 3);
}

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; jobId?: string | string[]; sort?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);

  const user = session!.user;
  const filters = parseRecruiterApplicationFilters(await searchParams);

  let applications: ApplicationRow[];
  let jobs: JobOption[];
  try {
    jobs = (await recruiterService.listJobs(user.id, {})) as JobOption[];
    applications = (await recruiterService.listApplications(user.id, filters)) as ApplicationRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const currentSearch = filters.search || "";
  const currentStatus = filters.status || "";
  const currentJobId = filters.jobId || "";
  const selectedJobTitle = currentJobId ? jobs.find((job) => job.id === currentJobId)?.title ?? "vị trí đã chọn" : null;
  const totalCandidates = applications.length;
  const statusCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.status] = (counts[application.status] ?? 0) + 1;
    return counts;
  }, {});
  const averageMatch = Math.round(
    applications.reduce((sum, application) => {
      const matchScore = application.resumeVersion?.matchAnalyses?.find((analysis) => analysis.jobId === application.job.id)?.overallScore ?? 0;
      return sum + matchScore;
    }, 0) / Math.max(1, applications.length)
  );
  const statusFilterItems = [
    { value: "", label: "Tất cả", count: totalCandidates },
    { value: "APPLIED", label: "Ứng tuyển", count: statusCounts.APPLIED ?? 0 },
    { value: "INTERVIEWING", label: "Phỏng vấn", count: statusCounts.INTERVIEWING ?? 0 },
    { value: "OFFER", label: "Đề nghị", count: statusCounts.OFFER ?? 0 },
    { value: "REJECTED", label: "Từ chối", count: statusCounts.REJECTED ?? 0 },
  ];
  const buildFilterHref = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (currentSearch) params.set("q", currentSearch);
    if (currentJobId) params.set("jobId", currentJobId);
    if (filters.sort) params.set("sort", filters.sort);
    const query = params.toString();
    return `/recruiter/candidates${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground">Quản lý ứng viên</h1>
          <p className="mt-2 text-base text-text-muted">
            {selectedJobTitle
              ? `Đang xem ứng viên đã ứng tuyển vào ${selectedJobTitle}.`
              : "Theo dõi ứng viên theo từng vị trí, trạng thái xử lý và mức độ phù hợp CV-JD."}
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          href="/recruiter/candidates/new"
        >
          <UserRound className="h-5 w-5" />
          Thêm ứng viên
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-text-muted">Tổng ứng viên</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{totalCandidates}</p>
          <p className="mt-1 text-xs text-text-muted">Trong bộ lọc hiện tại</p>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-text-muted">Đang phỏng vấn</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{statusCounts.INTERVIEWING ?? 0}</p>
          <p className="mt-1 text-xs text-text-muted">Cần sắp lịch / theo dõi</p>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-text-muted">Độ phù hợp TB</p>
          <p className="mt-2 text-3xl font-bold text-primary">{averageMatch}/100</p>
          <p className="mt-1 text-xs text-text-muted">Dựa trên điểm CV-JD</p>
        </section>
      </div>

      {selectedJobTitle ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary-fixed p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Bộ lọc theo vị trí</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{selectedJobTitle}</h2>
            <p className="mt-1 text-sm text-text-muted">Danh sách bên dưới chỉ gồm ứng viên đã apply vào vị trí này.</p>
          </div>
          <Link href="/recruiter/candidates" className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-primary hover:bg-surface-low">
            Xem tất cả ứng viên
          </Link>
        </section>
      ) : null}

      <div className="space-y-4 rounded-2xl bg-[#F1F5F9] p-4 shadow-sm">
        <form action="/recruiter/candidates" className="grid gap-3 rounded-xl bg-white p-3 shadow-sm lg:grid-cols-[minmax(260px,1fr)_auto_auto] lg:items-end">
          {currentSearch ? <input type="hidden" name="q" value={currentSearch} /> : null}
          {currentStatus ? <input type="hidden" name="status" value={currentStatus} /> : null}
          {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
          <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
            Lọc theo vị trí tuyển dụng
            <select
              className="h-11 rounded-lg border border-border-light bg-surface-low px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
              name="jobId"
              defaultValue={currentJobId}
            >
              <option value="">Tất cả vị trí tuyển dụng</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover">
            Áp dụng bộ lọc
          </button>
          {currentJobId ? (
            <Link href="/recruiter/candidates" className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-low px-5 text-sm font-semibold text-primary hover:bg-outline-variant">
              Xóa lọc job
            </Link>
          ) : null}
        </form>

        <form
          action="/recruiter/candidates"
          className="relative flex h-11 w-full items-center rounded-lg bg-white shadow-sm md:max-w-xl"
        >
          {currentStatus ? <input type="hidden" name="status" value={currentStatus} /> : null}
          {currentJobId ? <input type="hidden" name="jobId" value={currentJobId} /> : null}
          {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
          <Search className="absolute left-3 h-5 w-5 text-text-muted" />
          <input
            className="h-full w-full rounded-lg border-none bg-transparent pl-10 pr-4 text-sm font-medium text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            name="q"
            placeholder="Tìm theo tên, email hoặc vị trí ứng tuyển..."
            defaultValue={currentSearch}
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {statusFilterItems.map((item) => (
            <Link
              key={item.value || "all"}
              href={buildFilterHref(item.value)}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                currentStatus === item.value ? "bg-primary text-white shadow-sm" : "bg-white text-text-muted hover:bg-surface-low"
              )}
            >
              {item.label}
              <span className={cn("rounded-full px-2 py-0.5 text-xs", currentStatus === item.value ? "bg-white/20 text-white" : "bg-surface-low text-text-muted")}>
                {item.count}
              </span>
            </Link>
          ))}
          <Link href={`/recruiter/candidates?sort=match${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}${currentStatus ? `&status=${currentStatus}` : ""}${currentJobId ? `&jobId=${currentJobId}` : ""}`} className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold hover:bg-white hover:shadow-sm ${filters.sort === "match" ? "bg-white text-[#2563EB] shadow-sm" : "bg-transparent text-text-muted"}`}>
            <SlidersHorizontal className="h-4 w-4" />
            Sắp xếp theo độ phù hợp
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(180px,0.9fr)_160px_160px_120px] gap-4 border-b border-border-light px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted max-lg:hidden">
          <span>Ứng viên</span>
          <span>Vị trí ứng tuyển</span>
          <span>Trạng thái</span>
          <span>Cập nhật</span>
          <span className="text-right">Thao tác</span>
        </div>

        <div className="divide-y divide-border-light">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">Không có ứng viên nào khớp bộ lọc hiện tại.</div>
          ) : (
            applications.map((application) => {
              const name = application.user.name ?? application.user.email ?? "Ứng viên";
              const initials = getInitials(name);
              const skills = parseSkills(application.job.skills);
              const dateText = formatTimeAgo(application.updatedAt);
              const matchScore = application.resumeVersion?.matchAnalyses?.find((analysis) => analysis.jobId === application.job.id)?.overallScore ?? 0;
              const statusClass = statusStyles[application.status] ?? "bg-surface-low text-text-muted";

              return (
                <article key={application.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-surface-low/60 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.9fr)_160px_160px_120px] lg:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-primary">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/recruiter/candidates/${application.id}`} className="font-bold text-foreground hover:text-primary hover:underline">
                        {name}
                      </Link>
                      <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                        <Mail className="h-3.5 w-3.5" />
                        {application.user.email ?? "Chưa có email"}
                      </p>
                      {skills.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <BriefcaseBusiness className="h-4 w-4 text-primary" />
                      {application.job.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      Điểm phù hợp: {matchScore}/100
                    </p>
                  </div>

                  <div>
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", statusClass)}>
                      {statusLabels[application.status] ?? application.status}
                    </span>
                    <p className="mt-1 text-xs text-text-muted">{statusDescriptions[application.status] ?? "Theo dõi trong quy trình tuyển dụng"}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-text-muted">
                    <Clock3 className="h-4 w-4" />
                    {dateText}
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <Link href={`/recruiter/candidates/${application.id}`} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">
                      Xem hồ sơ
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
