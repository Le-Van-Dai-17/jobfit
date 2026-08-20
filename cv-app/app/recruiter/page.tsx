import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSearch,
  Plus,
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
  APPLIED: "Mới ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút hồ sơ",
};

const statusStyles: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  INTERVIEWING: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  OFFER: "bg-green-50 text-green-700 ring-1 ring-green-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  WITHDRAWN: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "UV";
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
  const newApplications = dashboard.counts.pipeline.APPLIED || 0;
  const interviewing = dashboard.counts.pipeline.INTERVIEWING || 0;
  const offers = dashboard.counts.pipeline.OFFER || 0;
  const rejected = dashboard.counts.pipeline.REJECTED || 0;
  const totalApplications = dashboard.counts.applications;
  const recentApplications = dashboard.recentApplications as RecentApplication[];
  const checklist = dashboard.onboardingChecklist as ChecklistItem[];
  const completedChecklistCount = checklist.filter((item) => item.completed).length;
  const checklistProgress = Math.round((completedChecklistCount / Math.max(checklist.length, 1)) * 100);

  const funnel = [
    { label: "Mới ứng tuyển", value: newApplications, href: "/recruiter/candidates?status=APPLIED" },
    { label: "Phỏng vấn", value: interviewing, href: "/recruiter/candidates?status=INTERVIEWING" },
    { label: "Đề nghị", value: offers, href: "/recruiter/candidates?status=OFFER" },
    { label: "Từ chối", value: rejected, href: "/recruiter/candidates?status=REJECTED" },
  ];

  const actionItems = [
    {
      title: "Sàng lọc hồ sơ mới",
      value: newApplications,
      description: "Ứng viên vừa nộp CV, chưa chuyển sang vòng tiếp theo.",
      href: "/recruiter/leaderboard",
      icon: FileSearch,
    },
    {
      title: "Theo dõi phỏng vấn",
      value: interviewing,
      description: "Ứng viên đang ở vòng phỏng vấn cần được cập nhật kết quả.",
      href: "/recruiter/candidates?status=INTERVIEWING",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0047AB] via-[#155EEF] to-[#6B38D4] p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/75">Tổng quan nhà tuyển dụng</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Chào mừng quay lại, {user.name || user.email || "Recruiter"}!
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              Theo dõi tin tuyển dụng, hồ sơ mới và tiến độ xử lý ứng viên trong một màn hình.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0047AB] shadow-sm hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Tạo tin tuyển dụng
            </Link>
            <Link
              href="/recruiter/candidates"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
            >
              <Search className="h-4 w-4" />
              Quản lý ứng viên
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={BriefcaseBusiness}
          label="Tin đang mở"
          value={activeJobs}
          description="Vị trí ứng viên có thể nộp CV"
          href="/recruiter/jobs?status=PUBLISHED"
        />
        <KpiCard
          icon={Users}
          label="Hồ sơ mới"
          value={newApplications}
          description="Cần sàng lọc ban đầu"
          href="/recruiter/leaderboard"
        />
        <KpiCard
          icon={CalendarClock}
          label="Đang phỏng vấn"
          value={interviewing}
          description="Cần theo dõi lịch và kết quả"
          href="/recruiter/candidates?status=INTERVIEWING"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Tổng hồ sơ"
          value={totalApplications}
          description="Tất cả ứng viên trong pipeline"
          href="/recruiter/candidates"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border-light md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Phễu tuyển dụng</h2>
                <p className="mt-1 text-sm text-text-muted">Xem nhanh ứng viên đang nằm ở từng giai đoạn.</p>
              </div>
              <Link href="/recruiter/candidates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Xem toàn bộ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {funnel.map((stage, index) => (
                <Link
                  key={stage.label}
                  href={stage.href}
                  className="group rounded-2xl border border-border-light bg-surface-low p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-muted">{stage.label}</span>
                    <span className="text-xs text-text-muted">#{index + 1}</span>
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-foreground">{stage.value}</p>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(8, (stage.value / Math.max(totalApplications, 1)) * 100))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border-light transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-text-muted">Cần xử lý</span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold text-foreground">{item.value}</p>
                  <h3 className="mt-2 font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{item.description}</p>
                </Link>
              );
            })}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-[#0047AB] p-5 text-white shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Thiết lập tuyển dụng</h2>
                <p className="mt-1 text-sm text-white/75">Các bước giúp hồ sơ nhà tuyển dụng rõ ràng hơn.</p>
              </div>
              <span className="text-2xl font-extrabold">{checklistProgress}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-[#4ADE80]" style={{ width: `${checklistProgress}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              {checklist.map((item) => (
                <div key={item.key} className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
                  <CheckCircle2 className={cn("mt-0.5 h-5 w-5", item.completed ? "text-[#4ADE80]" : "text-white/40")} />
                  <span className={cn("text-sm font-medium", item.completed ? "text-white/80 line-through" : "text-white")}>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border-light md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Ứng viên mới nhất</h2>
              <Link href="/recruiter/candidates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {recentApplications.length === 0 ? (
                <div className="rounded-xl bg-surface-low p-5 text-center text-sm text-text-muted">Chưa có ứng viên nào.</div>
              ) : (
                recentApplications.map((application) => {
                  const name = application.user.name ?? application.user.email ?? "Ứng viên";
                  const initials = getInitials(name);
                  const statusClass = statusStyles[application.status] ?? "bg-surface-low text-text-muted ring-1 ring-border-light";

                  return (
                    <Link key={application.id} href={`/recruiter/candidates/${application.id}`} className="flex gap-3 rounded-xl p-2 transition hover:bg-surface-low">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold text-foreground">{name}</p>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-text-muted">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatTimeAgo(application.appliedAt || application.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-text-muted">Nộp: {application.job.title}</p>
                        <span className={cn("mt-2 inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", statusClass)}>
                          {statusLabels[application.status] ?? application.status}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border-light transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowRight className="h-5 w-5 text-text-muted" />
      </div>
      <p className="mt-5 text-4xl font-extrabold text-foreground">{value}</p>
      <h2 className="mt-2 font-bold text-foreground">{label}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </Link>
  );
}
