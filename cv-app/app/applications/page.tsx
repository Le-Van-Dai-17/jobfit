import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { applicationService } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = { DRAFT: "Bản nháp", APPLIED: "Đã ứng tuyển", INTERVIEWING: "Đang phỏng vấn", OFFER: "Có đề nghị", REJECTED: "Đã từ chối", WITHDRAWN: "Đã rút" } as const;
type StatusKey = keyof typeof statusLabels;
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

function first(value?: string | string[]) { return Array.isArray(value) ? value[0] : value; }

export default async function ApplicationsPage({ searchParams }: { searchParams?: Promise<{ applied?: string | string[]; q?: string | string[]; status?: string | string[] }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const params = await searchParams;
  const allApplications = await applicationService.listForCandidate(session!.user.id);
  const query = (first(params?.q) ?? "").trim().toLocaleLowerCase("vi-VN");
  const requestedStatus = first(params?.status);
  const status = requestedStatus && requestedStatus in statusLabels ? requestedStatus as StatusKey : "all";
  const applications = allApplications.filter((application) => {
    const matchesText = !query || `${application.job.title} ${application.job.company}`.toLocaleLowerCase("vi-VN").includes(query);
    return matchesText && (status === "all" || application.status === status);
  });
  const appliedId = first(params?.applied);
  const appliedApplication = appliedId ? allApplications.find((application) => application.id === appliedId) : null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><p className="text-sm font-semibold text-primary">Ứng tuyển</p><h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Đơn ứng tuyển của tôi</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Theo dõi trạng thái ứng tuyển, CV snapshot đã nộp và các bước tiếp theo từ nhà tuyển dụng.</p>
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_120px]" role="search"><label className="relative"><span className="sr-only">Tìm theo vị trí hoặc công ty</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" /><input name="q" type="search" defaultValue={query} placeholder="Vị trí hoặc công ty" className="h-11 w-full rounded-lg border border-outline-variant bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" /></label><select name="status" defaultValue={status} aria-label="Lọc trạng thái đơn" className="h-11 rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"><option value="all">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" className="rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Lọc</button></form>
      </section>

      {appliedApplication ? <section role="status" className="rounded-2xl border border-primary/30 bg-primary-fixed p-5"><p className="font-semibold text-primary">Ứng tuyển thành công</p><p className="mt-2 text-sm leading-6 text-foreground">Bạn đã nộp đơn cho <strong>{appliedApplication.job.title}</strong> bằng snapshot <strong>{appliedApplication.resumeVersion?.resume.title ?? "CV"} · phiên bản {appliedApplication.resumeVersion?.version ?? "không xác định"}</strong>.</p><Link href={`/applications/${appliedApplication.id}?applied=1`} className="mt-3 inline-flex text-sm font-semibold text-primary">Xem xác nhận và snapshot chính xác</Link></section> : appliedId ? <section role="alert" className="rounded-xl bg-error-container p-4 text-sm text-error">Không tìm thấy đơn ứng tuyển thuộc tài khoản hiện tại.</section> : null}

      <div className="flex gap-2 overflow-x-auto md:hidden">{[{ value: "all", label: "Tất cả" }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))].map((item) => <Link key={item.value} href={`/applications?status=${item.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${status === item.value ? "bg-primary text-white" : "bg-surface-container-highest text-text-muted"}`}>{item.label}</Link>)}</div>

      {applications.length === 0 ? <section className="rounded-2xl bg-surface-white p-6 shadow-card"><p className="text-sm text-text-muted">Không có đơn ứng tuyển nào khớp bộ lọc.</p><Link href="/jobs" className="mt-4 inline-flex text-sm font-semibold text-primary">Xem việc làm đang mở</Link></section> : <div className="space-y-4">{applications.map((application) => <article key={application.id} className="rounded-xl bg-surface-white p-5 shadow-card"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-foreground">{application.job.title}</h2><span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary">{statusLabels[application.status]}</span></div><p className="mt-1 text-sm text-text-muted">{application.job.company}</p>{application.appliedAt ? <p className="mt-2 text-xs text-text-muted">Nộp ngày {dateFormatter.format(application.appliedAt)}</p> : null}{application.resumeVersion?.resume ? <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-surface-low px-3 py-2 text-sm text-text-muted"><FileText className="h-4 w-4 text-primary" />{application.resumeVersion.resume.title} · phiên bản {application.resumeVersion.version}</p> : null}</div><div className="flex flex-wrap gap-2"><Link href={`/applications/${application.id}`} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-low">Chi tiết</Link></div></div></article>)}</div>}
    </div>
  );
}
