import type { EmploymentType, WorkMode } from "@prisma/client";
import {
  Briefcase,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Code,
  MapPin,
  Megaphone,
  PenTool,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { parseRecruiterJobFilters } from "@/features/recruiter/services/recruiter-query";
import {
  RecruiterAccessError,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";
import { cn } from "@/lib/utils";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employmentType: EmploymentType | null;
  workMode: WorkMode | null;
  isArchived: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: Date;
  _count?: { applications: number; assessmentSessions: number };
};

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đang mở",
  ARCHIVED: "Đã đóng",
};

const workModeLabels: Record<string, string> = {
  ONSITE: "Tại văn phòng",
  HYBRID: "Hybrid",
  REMOTE: "Từ xa",
};

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
  TEMPORARY: "Tạm thời",
};

function getIconForJob(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("frontend") || lower.includes("developer") || lower.includes("engineer"))
    return <Code className="h-5 w-5" />;
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux"))
    return <PenTool className="h-5 w-5" />;
  if (lower.includes("marketing") || lower.includes("sales"))
    return <Megaphone className="h-5 w-5" />;
  return <BriefcaseBusiness className="h-5 w-5" />;
}

export default async function RecruiterJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const filters = parseRecruiterJobFilters(await searchParams);

  let jobs: JobRow[];
  let dashboard: Awaited<ReturnType<typeof recruiterService.getDashboard>>;
  try {
    const [jobsRes, dashboardRes] = await Promise.all([
      recruiterService.listJobs(user.id, filters),
      recruiterService.getDashboard(user.id),
    ]);
    jobs = jobsRes as JobRow[];
    dashboard = dashboardRes;
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const { jobs: totalJobs, activeJobs, archivedJobs } = dashboard.counts;
  const draftJobs = totalJobs - activeJobs - archivedJobs;

  const currentStatus = filters.status || "";
  const currentSearch = filters.search || "";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground">Vị trí tuyển dụng</h1>
          <p className="mt-2 text-base text-text-muted">
            Quản lý, theo dõi và tối ưu hóa các chiến dịch tuyển dụng của bạn. Theo dõi hiệu suất và tương tác của ứng viên theo thời gian thực.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0047AB] px-5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          href="/recruiter/jobs/new"
        >
          <Plus className="h-5 w-5" />
          TẠO TIN MỚI
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl bg-[#E8F0FE] p-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          action="/recruiter/jobs"
          className="relative flex h-11 w-full max-w-md items-center rounded-lg bg-white shadow-sm"
        >
          {filters.status && <input type="hidden" name="status" value={filters.status} />}
          <Search className="absolute left-3 h-5 w-5 text-text-muted" />
          <input
            className="h-full w-full rounded-lg border-none bg-transparent pl-10 pr-4 text-sm font-medium text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            name="q"
            placeholder="Tìm kiếm vị trí, từ khóa..."
            defaultValue={currentSearch}
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href={`/recruiter/jobs?status=${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}`}
            className={cn(
              "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors",
              !currentStatus ? "bg-[#0047AB] text-white shadow-sm" : "bg-white text-text-muted hover:bg-surface-low"
            )}
          >
            Tất cả ({totalJobs})
          </Link>
          <Link
            href={`/recruiter/jobs?status=PUBLISHED${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}`}
            className={cn(
              "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors",
              currentStatus === "PUBLISHED" ? "bg-[#0047AB] text-white shadow-sm" : "bg-white text-text-muted hover:bg-surface-low"
            )}
          >
            Đang mở ({activeJobs})
          </Link>
          <Link
            href={`/recruiter/jobs?status=DRAFT${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}`}
            className={cn(
              "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors",
              currentStatus === "DRAFT" ? "bg-[#0047AB] text-white shadow-sm" : "bg-white text-text-muted hover:bg-surface-low"
            )}
          >
            Bản nháp ({draftJobs})
          </Link>
          <Link
            href={`/recruiter/jobs?status=ARCHIVED${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}`}
            className={cn(
              "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors",
              currentStatus === "ARCHIVED" ? "bg-[#0047AB] text-white shadow-sm" : "bg-white text-text-muted hover:bg-surface-low"
            )}
          >
            Đã đóng ({archivedJobs})
          </Link>
          <button className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-low ml-2">
            <SlidersHorizontal className="h-4 w-4" />
            Lọc thêm
          </button>
        </div>
      </div>

      {/* Data Table / List */}
      <div>
        <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_100px] gap-4 px-6 pb-4 text-xs font-bold uppercase tracking-wider text-text-muted lg:grid">
          <div>VỊ TRÍ & CHI TIẾT</div>
          <div>TRẠNG THÁI</div>
          <div>ỨNG VIÊN</div>
          <div>CẬP NHẬT</div>
          <div className="text-right">THAO TÁC</div>
        </div>

        {jobs.length === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-border-light">
            <Briefcase className="h-12 w-12 text-outline-variant" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Không có dữ liệu</h3>
            <p className="mt-2 text-sm text-text-muted">Chưa có vị trí tuyển dụng phù hợp với bộ lọc hiện tại.</p>
          </section>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => {
              const appCount = job._count?.applications || 0;
              const dateObj = job.updatedAt ? new Date(job.updatedAt) : new Date();
              const dateStr = dateObj.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              let borderClass = "border-l-border-light";
              let titleClass = "text-text-muted";
              let dotClass = "bg-gray-400";
              let badgeStyle = "bg-surface-low text-text-muted";
              let iconBg = "bg-surface-low text-text-muted";

              if (job.status === "PUBLISHED") {
                borderClass = "border-l-green-500";
                titleClass = "text-[#0047AB]";
                dotClass = "bg-green-500";
                badgeStyle = "bg-green-100 text-green-700";
                iconBg = "bg-[#E8F0FE] text-[#0047AB]";
              } else if (job.status === "DRAFT") {
                borderClass = "border-l-gray-300";
                titleClass = "text-foreground";
                dotClass = "bg-gray-400";
                badgeStyle = "bg-gray-100 text-gray-700";
                iconBg = "bg-surface-low text-text-muted";
              }

              return (
                <div
                  key={job.id}
                  className={cn(
                    "group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light transition-shadow hover:shadow-md lg:grid lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_100px] lg:items-center",
                    "border-l-[6px]",
                    borderClass
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", iconBg)}>
                      {getIconForJob(job.title)}
                    </div>
                    <div className="flex flex-col">
                      <Link
                        href={`/recruiter/jobs/${job.id}`}
                        className={cn("text-lg font-bold hover:underline", titleClass)}
                      >
                        {job.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {job.location || "Chưa cập nhật"}
                        </span>
                        {job.employmentType && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-border-strong" />
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" /> {employmentTypeLabels[job.employmentType] || job.employmentType}
                            </span>
                          </>
                        )}
                        {job.workMode && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-border-strong" />
                            <span className="flex items-center gap-1">
                              {/* Using home icon proxy */}
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                              {" "}{workModeLabels[job.workMode] || job.workMode}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold", badgeStyle)}>
                      <span className={cn("h-2 w-2 rounded-full", dotClass)} />
                      {statusLabels[job.status] || job.status}
                    </span>
                  </div>

                  <div>
                    {appCount > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">NA</div>
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">TB</div>
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">M</div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-foreground">{appCount}</span>
                          <span className="text-xs font-medium text-text-muted">Mới: {Math.max(1, Math.floor(appCount / 3))}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm italic text-text-muted">Chưa đăng</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{dateStr}</span>
                    <span className="text-xs font-medium text-text-muted">bởi Admin</span>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-surface-low px-4 text-sm font-semibold text-foreground hover:bg-outline-variant"
                    >
                      Sửa
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-border-light pt-6">
          <p className="text-sm font-medium text-text-muted">
            Hiển thị toàn bộ {totalJobs} vị trí
          </p>
        </div>
      )}
    </div>
  );
}
