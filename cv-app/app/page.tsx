import { ClipboardCheck, FileCheck2, FileText, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { candidateDashboardService } from "@/features/dashboard/services/candidate-dashboard.service";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "CANDIDATE") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const summary = await candidateDashboardService.getSummary(session.user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border-light bg-surface-white p-6">
        <p className="text-sm font-semibold text-primary">Tổng quan ứng viên</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Chào {summary.userName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Theo dõi mức sẵn sàng của CV, các đơn ứng tuyển và những bài đánh giá cần hoàn thành.
            </p>
          </div>
          <Link
            href={summary.nextAction.href}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary"
          >
            {summary.nextAction.label}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-border-light bg-surface-white p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Hồ sơ & CV</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-foreground">
            {summary.cvReady ? "Đã sẵn sàng" : "Chưa sẵn sàng"}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {summary.resumeCount} CV đã lưu · Hồ sơ {summary.profileComplete ? "đã hoàn thiện" : "chưa hoàn thiện"}.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/profile" className="inline-flex text-sm font-semibold text-primary">
              Cập nhật hồ sơ
            </Link>
            <Link href="/my-cv" className="inline-flex text-sm font-semibold text-primary">
              Cập nhật CV
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-border-light bg-surface-white p-5">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Ứng tuyển</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-foreground">
            {summary.applicationCounts.total}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {summary.applicationCounts.applied} đã nộp, {summary.applicationCounts.interviewing} đang phỏng vấn.
          </p>
          <Link href="/applications" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Xem đơn ứng tuyển
          </Link>
        </section>

        <section className="rounded-lg border border-border-light bg-surface-white p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Đánh giá cần làm</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-foreground">
            {summary.pendingAssessments.length}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Bài kỹ thuật đang chờ nộp từ các đơn hoặc JD đã chọn.
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-border-light bg-surface-white p-5">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">Việc cần chú ý</h2>
        </div>
        {summary.pendingAssessments.length === 0 ? (
          <p className="mt-4 rounded-md bg-surface-low p-4 text-sm text-text-muted">
            Chưa có bài đánh giá nào đang chờ. Khi bạn tạo bài từ một vị trí ứng tuyển, hành động tiếp theo sẽ xuất hiện ở đây.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border-light">
            {summary.pendingAssessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={assessment.href}
                className="flex flex-col gap-1 py-3 outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="font-semibold text-foreground">{assessment.roleTitle}</span>
                <span className="text-sm text-text-muted">{assessment.company}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
