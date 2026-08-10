import { ClipboardCheck, FileText, History } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { AssessmentStartForm } from "@/features/assessments/components/AssessmentStartForm";
import { CandidateResumeSnapshot } from "@/features/applications/components/CandidateResumeSnapshot";
import { ApplicationOwnershipError, applicationService } from "@/features/applications/services/application.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = { DRAFT: "Bản nháp", APPLIED: "Đã ứng tuyển", INTERVIEWING: "Đang phỏng vấn", OFFER: "Có đề nghị", REJECTED: "Đã từ chối", WITHDRAWN: "Đã rút" } as const;
const eventTypeLabels = { STATUS_CHANGE: "Cập nhật trạng thái", NOTE_ADDED: "Ghi chú tiến trình", INTERVIEW_SCHEDULED: "Lịch phỏng vấn", EMAIL_RECEIVED: "Email đã ghi nhận" } as const;
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

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
  const assessmentResumeVersions = application.resumeVersion
    ? [
        {
          id: application.resumeVersion.id,
          version: application.resumeVersion.version,
          createdAt: application.resumeVersion.createdAt,
          resume: { title: application.resumeVersion.resume.title },
        },
      ]
    : [];
  const assessmentJobs = [
    {
      id: application.job.id,
      title: application.job.title,
      company: application.job.company,
    },
  ];

  return (
    <div className="space-y-5">
      {applied ? <section role="status" className="rounded-2xl bg-primary-fixed p-5"><p className="font-semibold text-primary">Đơn đã được lưu</p><p className="mt-2 text-sm leading-6 text-foreground">Xác nhận này thuộc tài khoản hiện tại và tham chiếu đúng CV snapshot bên dưới. Không có cam kết email hoặc thời gian phản hồi.</p></section> : null}
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><p className="text-sm font-semibold text-primary">Đơn ứng tuyển</p><div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h1 className="text-2xl font-bold text-foreground md:text-3xl">{application.job.title}</h1><p className="mt-1 text-sm text-text-muted">{application.job.company}</p></div><span className="w-fit rounded-full bg-surface-container px-3 py-1 text-sm font-semibold text-primary">{statusLabels[application.status]}</span></div></section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-foreground">CV snapshot bất biến đã nộp</h2></div><p className="mt-2 text-sm text-text-muted">{application.resumeVersion?.resume.title ?? "CV"} · phiên bản {application.resumeVersion?.version ?? "không xác định"}</p>{application.resumeVersion ? <CandidateResumeSnapshot content={application.resumeVersion.content} /> : <p className="mt-4 rounded-lg bg-surface-low p-4 text-sm text-text-muted">Đơn này không liên kết với phiên bản CV.</p>}</section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Bài đánh giá theo đơn</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Bài đánh giá dùng JD và CV snapshot của đơn này, với kết quả tư vấn dựa trên rubric và bằng chứng.
        </p>
        {latestSession ? (
          <Link href={`/assessments/${latestSession.id}`} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            {latestSession.result ? "Xem báo cáo đánh giá" : "Tiếp tục bài đánh giá"}
          </Link>
        ) : application.resumeVersionId ? (
          <div className="mt-4">
            <AssessmentStartForm
              resumeVersions={assessmentResumeVersions}
              jobs={assessmentJobs}
              selectedResumeVersionId={application.resumeVersionId}
              selectedJobId={application.jobId}
              applicationId={application.id}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-surface-white p-5 shadow-card"><div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-foreground">Dòng thời gian đã ghi nhận</h2></div>{application.events.length === 0 ? <p className="mt-3 text-sm text-text-muted">Chưa có mốc xử lý nào được ghi nhận.</p> : <ol className="relative mt-5 space-y-4 border-l border-outline-variant pl-6">{application.events.map((event) => <li key={event.id} className="relative rounded-xl bg-surface-low p-4 before:absolute before:-left-[29px] before:top-5 before:h-3 before:w-3 before:rounded-full before:bg-primary"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-foreground">{eventTypeLabels[event.type]}</p><time className="text-xs text-text-muted" dateTime={event.date.toISOString()}>{dateFormatter.format(event.date)}</time></div>{event.fromStatus || event.toStatus ? <p className="mt-2 text-sm text-text-muted">{event.fromStatus ? statusLabels[event.fromStatus] : "Chưa có trạng thái"} → {event.toStatus ? statusLabels[event.toStatus] : "Chưa có trạng thái"}</p> : null}{event.notes ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-muted">{event.notes}</p> : null}</li>)}</ol>}</section>
    </div>
  );
}
