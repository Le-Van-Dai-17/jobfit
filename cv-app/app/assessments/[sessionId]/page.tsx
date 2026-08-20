import { ArrowLeft, BriefcaseBusiness, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AssessmentReport } from "@/features/assessments/components/AssessmentReport";
import { AssessmentOwnershipError, assessmentService } from "@/features/assessments/services/assessment.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

const statusLabels = { TASKS_GENERATED: "Chờ recruiter mời", SUBMITTED: "Đã nộp", EVALUATED: "Đã có báo cáo", CANCELLED: "Đã hủy" } as const;
const seniorityLabels = { INTERN: "Thực tập", JUNIOR: "Mới vào nghề", MID: "Trung cấp", SENIOR: "Cao cấp", LEAD: "Dẫn dắt" } as const;

export default async function AssessmentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const authSession = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: authSession?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const { sessionId } = await params;
  let session;
  try { session = await assessmentService.getSession(authSession!.user.id, sessionId); }
  catch (error) { if (error instanceof AssessmentOwnershipError) return <div className="rounded-xl bg-error-container p-4 text-sm text-error">Bạn không có quyền truy cập phiên đánh giá này.</div>; throw error; }

  return (
    <div className="space-y-5">
      <Link href={session.applicationId ? `/applications/${session.applicationId}` : "/assessments"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft className="h-4 w-4" />Quay lại</Link>
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><p className="text-sm font-semibold text-primary">{session.result ? "Báo cáo đánh giá" : "Vòng đánh giá kỹ thuật"}</p><h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{session.roleTitle}</h1><div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-text-muted"><span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1"><BriefcaseBusiness className="h-3.5 w-3.5" />{session.job.title} · {session.job.company}</span><span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1"><FileText className="h-3.5 w-3.5" />{session.resumeVersion.resume.title} · phiên bản {session.resumeVersion.version}</span><span className="rounded-full bg-surface-container px-3 py-1">Cấp độ: {seniorityLabels[session.seniority]}</span><span className="rounded-full bg-primary-fixed px-3 py-1 text-primary">{statusLabels[session.status]}</span></div></section>
      {session.result ? <><AssessmentReport result={session.result} /><div className="flex flex-wrap gap-3"><Link href="/my-cv" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Cập nhật CV từ phản hồi</Link>{session.applicationId ? <Link href={`/applications/${session.applicationId}`} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low">Quay lại đơn ứng tuyển</Link> : <Link href="/assessments" className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low">Quay lại đánh giá</Link>}</div></> : <section className="rounded-2xl bg-surface-white p-5 shadow-card"><h2 className="text-lg font-bold text-foreground">Không còn nhận bài test tự làm</h2><p className="mt-2 text-sm leading-6 text-text-muted">Luồng ứng viên tự tạo hoặc tự làm bài test trong quá trình nộp CV đã được tắt. Sau khi bạn ứng tuyển, nhà tuyển dụng sẽ xem hồ sơ và chủ động mời phỏng vấn hoặc làm bài đánh giá trực tiếp nếu phù hợp.</p>{session.applicationId ? <Link href={`/applications/${session.applicationId}`} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Quay lại đơn ứng tuyển</Link> : null}</section>}
    </div>
  );
}
