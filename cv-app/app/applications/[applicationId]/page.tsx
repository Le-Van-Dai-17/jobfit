import { FileText, History } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CandidateResumeSnapshot } from "@/features/applications/components/CandidateResumeSnapshot";
import { ApplicationStepper } from "@/features/applications/components/ApplicationStepper";
import { ApplicationOwnershipError, applicationService } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = { DRAFT: "Bản nháp", APPLIED: "Đã ứng tuyển", INTERVIEWING: "Đang phỏng vấn", OFFER: "Có đề nghị", REJECTED: "Đã từ chối", WITHDRAWN: "Đã rút" } as const;

export default async function ApplicationDetailPage({ params, searchParams }: { params: Promise<{ applicationId: string }>; searchParams?: Promise<{ applied?: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const { applicationId } = await params;
  let application;
  try { application = await applicationService.getForCandidate(session!.user.id, applicationId); }
  catch (error) { if (error instanceof ApplicationOwnershipError) notFound(); throw error; }
  const applied = (await searchParams)?.applied === "1";
  const latestSession = application.assessmentSessions[0];

  return (
    <div className="space-y-5">
      {applied ? <section role="status" className="rounded-2xl bg-primary-fixed p-5"><p className="font-semibold text-primary">Ứng tuyển thành công</p><p className="mt-2 text-sm leading-6 text-foreground">CV của bạn đã được gửi tới nhà tuyển dụng. Nếu hồ sơ phù hợp, công ty sẽ chủ động mời bạn vào vòng phỏng vấn hoặc làm bài đánh giá trực tiếp.</p></section> : null}
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><p className="text-sm font-semibold text-primary">Đơn ứng tuyển</p><div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h1 className="text-2xl font-bold text-foreground md:text-3xl">{application.job.title}</h1><p className="mt-1 text-sm text-text-muted">{application.job.company}</p></div><span className="w-fit rounded-full bg-surface-container px-3 py-1 text-sm font-semibold text-primary">{statusLabels[application.status]}</span></div></section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Tiến trình ứng tuyển</h2>
        </div>
        <div className="mt-6 mb-2">
          <ApplicationStepper
            hasResume={!!application.resumeVersionId}
            status={application.status}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-foreground">CV đã nộp</h2></div><p className="mt-2 text-sm text-text-muted">{application.resumeVersion?.resume.title ?? "CV"} · phiên bản {application.resumeVersion?.version ?? "không xác định"}</p>{application.resumeVersion ? <CandidateResumeSnapshot content={application.resumeVersion.content} /> : <p className="mt-4 rounded-lg bg-surface-low p-4 text-sm text-text-muted">Đơn này không liên kết với phiên bản CV.</p>}</section>

      {latestSession?.result ? <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="text-lg font-bold text-foreground">Báo cáo đánh giá đã có</h2><p className="mt-2 text-sm leading-6 text-text-muted">Đây là báo cáo từ phiên đánh giá cũ đã hoàn tất trước khi tắt luồng tự làm bài đánh giá.</p><Link href={`/assessments/${latestSession.id}`} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Xem báo cáo đánh giá</Link></section> : <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="text-lg font-bold text-foreground">Vòng đánh giá kỹ thuật</h2><p className="mt-2 text-sm leading-6 text-text-muted">Ứng viên không cần tự làm bài đánh giá trong lúc nộp CV. Nếu công ty muốn đánh giá thêm, recruiter sẽ mời bạn làm bài trực tiếp hoặc theo lịch riêng để khách quan hơn.</p></section>}
    </div>
  );
}
