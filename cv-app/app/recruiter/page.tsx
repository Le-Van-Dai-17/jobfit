import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Info,
  Lightbulb,
  Plus,
  Rocket,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";
import { cn } from "@/lib/utils";

type RecentApplication = {
  id: string;
  status: string;
  user: { name: string | null; email: string | null };
  job: { title: string };
  appliedAt?: Date | null;
  createdAt: Date;
};
type ChecklistItem = { key: string; label: string; completed: boolean };

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Chờ review",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Có offer",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "R";
}

function formatTimeAgo(date: Date) {
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Hôm qua`;
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default async function RecruiterDashboardPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  let dashboard;
  try {
    dashboard = await recruiterService.getDashboard(user.id);
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const activeJobs = dashboard.counts.activeJobs;
  const applications = dashboard.counts.applications;
  const interviewing = dashboard.counts.pipeline.INTERVIEWING;
  const assessmentReports = dashboard.counts.assessmentReports;

  const recentApplications = dashboard.recentApplications as RecentApplication[];
  const checklist = dashboard.onboardingChecklist as ChecklistItem[];
  const funnel = [
    ["Nộp CV", dashboard.counts.pipeline.APPLIED || 0],
    ["Screening", dashboard.counts.awaitingAssessment || 0],
    ["Phỏng vấn", dashboard.counts.pipeline.INTERVIEWING || 0],
    ["Đề nghị", dashboard.counts.pipeline.OFFER || 0],
    ["Đã tuyển", dashboard.counts.pipeline.REJECTED || 0], // Re-using rejected for demo of pipeline numbers
  ] as const;

  const completedChecklistCount = checklist.filter((item) => item.completed).length;
  const checklistProgress = Math.round((completedChecklistCount / Math.max(checklist.length, 1)) * 100);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <span className="text-base">👋</span> Chào buổi sáng,
          </p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">{user.name || user.email || "Recruiter"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-low px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-lowest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="h-4 w-4" /> Tạo tin tuyển dụng
          </Link>
          <Link
            href="/recruiter/candidates"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0047AB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Search className="h-4 w-4" /> Tìm ứng viên
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">

        {/* Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2 xl:space-y-8">

          {/* Stats Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">

            {/* Card 1: Jobs */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  <TrendingUpIcon className="h-3 w-3" /> +2 tuần này
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-foreground">{activeJobs}</p>
                <p className="mt-1 text-sm font-medium text-text-muted">Tin tuyển dụng đang mở</p>
              </div>
            </div>

            {/* Card 2: Candidates */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  <TrendingUpIcon className="h-3 w-3" /> +45 tuần này
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-foreground">{applications}</p>
                <p className="mt-1 text-sm font-medium text-text-muted">Tổng hồ sơ chưa xử lý</p>
              </div>
            </div>

            {/* Card 3: Interviews */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Calendar className="h-6 w-6" />
                </div>
                {/* No badge for this one according to design */}
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-foreground">{interviewing}</p>
                <p className="mt-1 text-sm font-medium text-text-muted">Lịch phỏng vấn tuần này</p>
              </div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-50/50" />
            </div>

            {/* Card 4: Assessments */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Cần xử lý
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-foreground">{assessmentReports}</p>
                <p className="mt-1 text-sm font-medium text-text-muted">Bài test chờ chấm điểm</p>
              </div>
            </div>

          </div>

          {/* Funnel Pipeline */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Phễu tuyển dụng</h2>
              <select
                className="rounded-lg border border-outline-variant/60 bg-surface-low px-3 py-1.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                defaultValue="all"
                aria-label="Chọn vị trí"
              >
                <option value="all">Tất cả vị trí</option>
              </select>
            </div>

            <div className="mt-6">
              {/* Fake Chart area (represented by empty space with lines in the mockup, but we'll adapt to show the data flow cleanly) */}
              <div className="relative mb-6 hidden h-32 w-full flex-col justify-end border-b border-l border-outline-variant/30 pb-4 pl-4 sm:flex">
                {/* Horizontal lines */}
                <div className="absolute inset-x-0 bottom-1/4 border-t border-dashed border-outline-variant/30" />
                <div className="absolute inset-x-0 bottom-2/4 border-t border-dashed border-outline-variant/30" />
                <div className="absolute inset-x-0 bottom-3/4 border-t border-dashed border-outline-variant/30" />
              </div>

              {/* Pipeline stages */}
              <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                {funnel.map(([label, value], index) => (
                  <div key={label} className="relative flex flex-1 flex-col items-center">
                    <p className="text-xs font-medium text-text-muted">{label}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
                    {index < funnel.length - 1 ? (
                      <ChevronRight className="absolute -right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline-variant/60 hidden sm:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Insight Alert */}
            <div className="mt-8 flex items-center justify-between rounded-xl bg-[#F0F4FA] p-4 text-sm text-[#3E5C8D]">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 shrink-0 text-[#0047AB]" />
                <p>Tỷ lệ chuyển đổi từ Phỏng vấn sang Đề nghị đang thấp hơn 10% so với tháng trước.</p>
              </div>
              <button className="shrink-0 font-semibold text-[#0047AB] hover:underline">
                Xem chi tiết
              </button>
            </div>
          </section>

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6 xl:space-y-8">

          {/* Onboarding Checklist Card */}
          <section className="relative overflow-hidden rounded-2xl bg-[#0047AB] p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6" />
              <h2 className="text-xl font-bold">Hoàn thiện hồ sơ</h2>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm font-medium">
              <span>Tiến độ</span>
              <span>{checklistProgress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#4ADE80] transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            <div className="mt-8 space-y-3">
              {checklist.map((item, idx) => {
                // Hardcoding some logic to match the mockup's visual state
                // "Xác thực email công ty", "Cập nhật logo & banner" -> Checked
                // "Thêm mẫu thư tự động" -> Active / Unchecked
                // "Kết nối Calendar" -> Unchecked

                // For a dynamic approach, let's map the DB state to the mockup state
                const isChecked = item.completed;
                const isActive = !isChecked && checklist.findIndex(c => !c.completed) === idx;

                return (
                  <div
                    key={item.key}
                    className={cn(
                      "flex items-start gap-4 rounded-xl p-4 transition-colors",
                      isActive ? "bg-white/10 ring-1 ring-white/20" : "",
                      !isActive && !isChecked ? "opacity-70" : ""
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[#4ADE80]">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40">
                          {isActive ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-medium", isChecked ? "text-white/80 line-through" : "text-white")}>
                        {item.label}
                      </p>
                      {isActive ? (
                        <>
                          <p className="mt-1 text-xs text-white/70">Giúp phản hồi ứng viên nhanh hơn.</p>
                          <Link href="/recruiter/company" className="mt-3 block w-full rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-[#0047AB] hover:bg-white/90">
                            Thiết lập ngay
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Candidates Card */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Ứng viên mới nhất</h2>
              <Link href="/recruiter/candidates" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0047AB] hover:underline">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 flex flex-col gap-5">
              {recentApplications.map((application) => {
                const name = application.user.name ?? application.user.email ?? "Ứng viên";
                const initials = getInitials(name);

                // Color mapping for mockup badges
                let badgeStyle = "bg-surface-low text-text-muted";
                let badgeLabel = statusLabels[application.status] ?? application.status;
                let avatarColor = "bg-primary";

                if (application.status === "APPLIED") {
                  badgeStyle = "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
                  badgeLabel = "MỚI";
                  avatarColor = "bg-blue-600";
                } else if (application.status === "INTERVIEWING") {
                  badgeStyle = "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
                  badgeLabel = "PHỎNG VẤN";
                  avatarColor = "bg-orange-500";
                } else if (application.status === "REJECTED") {
                  badgeStyle = "bg-red-50 text-red-700 ring-1 ring-red-200";
                  badgeLabel = "TỪ CHỐI";
                  avatarColor = "bg-red-500";
                } else {
                  badgeStyle = "bg-surface-low text-foreground ring-1 ring-border-light";
                  badgeLabel = "SCREENING";
                  avatarColor = "bg-slate-700";
                }

                return (
                  <div key={application.id} className="group flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm", avatarColor)}>
                      {initials}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/recruiter/candidates/${application.id}`} className="truncate text-sm font-bold text-foreground hover:text-primary">
                          {name}
                        </Link>
                        <span className="shrink-0 text-xs text-text-muted whitespace-nowrap">
                          {formatTimeAgo(application.appliedAt || application.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs font-medium text-text-muted">Nộp: {application.job.title}</p>
                      <div className="mt-2 flex">
                        <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", badgeStyle)}>
                          {badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {recentApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-text-muted">
                  <Info className="mb-2 h-8 w-8 text-outline-variant/60" />
                  <p className="text-sm">Chưa có ứng viên nào.</p>
                </div>
              ) : null}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
