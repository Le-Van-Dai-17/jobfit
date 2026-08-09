import { ArrowLeft, BriefcaseBusiness, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AssessmentReport } from "@/features/assessments/components/AssessmentReport";
import { AssessmentSubmissionForm } from "@/features/assessments/components/AssessmentSubmissionForm";
import { AssessmentOwnershipError, assessmentService } from "@/features/assessments/services/assessment.service";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

import { AssessmentIDE } from "@/features/assessments/components/AssessmentIDE";

const statusLabels = { TASKS_GENERATED: "Đang làm bài", SUBMITTED: "Đã nộp", EVALUATED: "Đã có báo cáo", CANCELLED: "Đã hủy" } as const;
const seniorityLabels = { INTERN: "Thực tập", JUNIOR: "Mới vào nghề", MID: "Trung cấp", SENIOR: "Cao cấp", LEAD: "Dẫn dắt" } as const;

export default async function AssessmentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const authSession = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: authSession?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);
  const { sessionId } = await params;
  let session;
  try { session = await assessmentService.getSession(authSession!.user.id, sessionId); }
  catch (error) { if (error instanceof AssessmentOwnershipError) return <div className="rounded-xl bg-error-container p-4 text-sm text-error">Bạn không có quyền truy cập phiên đánh giá này.</div>; throw error; }

  // Render the immersive IDE if the assessment is in progress
  if (!session.result && session.status === "TASKS_GENERATED") {
    return <AssessmentIDE sessionId={session.id} roleTitle={session.roleTitle} tasks={session.tasks} />;
  }

  return (
    <div className="space-y-5">
      <Link href="/assessments" className="inline-flex items-center gap-2 text-sm font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft className="h-4 w-4" />Quay lại đánh giá</Link>
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7"><p className="text-sm font-semibold text-primary">{session.result ? "Báo cáo đánh giá" : "Không gian làm bài"}</p><h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{session.roleTitle}</h1><div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-text-muted"><span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1"><BriefcaseBusiness className="h-3.5 w-3.5" />{session.job.title} · {session.job.company}</span><span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1"><FileText className="h-3.5 w-3.5" />{session.resumeVersion.resume.title} · phiên bản {session.resumeVersion.version}</span><span className="rounded-full bg-surface-container px-3 py-1">Cấp độ: {seniorityLabels[session.seniority]}</span><span className="rounded-full bg-primary-fixed px-3 py-1 text-primary">{statusLabels[session.status]}</span></div></section>
      {session.result ? <><AssessmentReport result={session.result} /><div className="flex flex-wrap gap-3"><Link href="/my-cv" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Cập nhật CV từ phản hồi</Link>{session.applicationId ? <Link href={`/applications/${session.applicationId}`} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low">Quay lại đơn ứng tuyển</Link> : <Link href="/assessments" className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low">Danh sách đánh giá</Link>}</div></> : <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><aside className="h-fit rounded-xl bg-surface-white p-5 shadow-card lg:sticky lg:top-24"><h2 className="font-bold text-foreground">Hướng dẫn</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-muted"><li>Đọc kỹ nhiệm vụ và rubric bằng chứng.</li><li>Chỉ nêu thông tin bạn có thể giải thích.</li><li>Trình bày giải pháp, quyết định kỹ thuật, kiểm thử và rủi ro.</li><li>Nêu kế hoạch triển khai, quan sát và quay lui.</li></ul><p className="mt-4 rounded-lg bg-surface-low p-3 text-xs leading-5 text-text-muted">Bài nộp được lưu một lần và dùng để tạo báo cáo tư vấn. Không có thao tác tự chấm hoặc phê duyệt tuyển dụng.</p></aside><AssessmentSubmissionForm sessionId={session.id} tasks={session.tasks} /></div>}
    </div>
  );
}
