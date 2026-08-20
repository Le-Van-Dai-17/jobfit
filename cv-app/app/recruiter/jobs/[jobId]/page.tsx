import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, Eye, FileText, Mail, MapPin, Pencil, UsersRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { archiveRecruiterJobAction, publishRecruiterJobAction, restoreRecruiterJobAction } from "@/features/recruiter/actions/recruiter.actions";
import { RecruiterJobStatusForm } from "@/features/recruiter/components/RecruiterJobStatusForm";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string | null;
  description: string | null;
  requirements: string | null;
  salaryRange: string | null;
  url: string | null;
  isArchived: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type ApplicationRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string | null };
  updatedAt: Date;
  resumeVersion?: { matchAnalyses?: Array<{ jobId: string; overallScore: number }> } | null;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Mới ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút hồ sơ",
};

const statusStyles: Record<string, string> = {
  APPLIED: "bg-surface-low text-primary",
  INTERVIEWING: "bg-blue-50 text-blue-700",
  OFFER: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-600",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function getJobDisplayStatus(job: JobDetail) {
  if (job.isArchived || job.status === "ARCHIVED") {
    return {
      label: "Đang ẩn",
      description: "Ứng viên sẽ không thấy tin này trên trang tìm việc.",
      className: "bg-slate-100 text-slate-700",
    };
  }

  if (job.status === "PUBLISHED") {
    return {
      label: "Đang hiển thị",
      description: "Ứng viên có thể xem và nộp CV vào tin này.",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Bản nháp",
    description: "Tin chưa được đăng, ứng viên chưa thể nhìn thấy.",
    className: "bg-amber-50 text-amber-700",
  };
}

function getStatusCount(applications: ApplicationRow[], status: string) {
  return applications.filter((application) => application.status === status).length;
}

function getMatchLabel(application: ApplicationRow, jobId: string) {
  const score = application.resumeVersion?.matchAnalyses?.find((analysis) => analysis.jobId === jobId)?.overallScore;

  if (typeof score !== "number" || score <= 0) {
    return "Chưa có điểm phù hợp";
  }

  return `${score}/100 phù hợp`;
}

export default async function RecruiterJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { jobId } = await params;

  let job: JobDetail;
  let applications: ApplicationRow[];
  try {
    job = (await recruiterService.getJob(user.id, jobId)) as JobDetail;
    applications = (await recruiterService.listApplications(user.id, { jobId })) as ApplicationRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) notFound();
    throw error;
  }

  const jobStatus = getJobDisplayStatus(job);
  const newApplications = getStatusCount(applications, "APPLIED");
  const interviewingApplications = getStatusCount(applications, "INTERVIEWING");
  const offeredApplications = getStatusCount(applications, "OFFER");

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border-light bg-surface-white shadow-sm">
        <div className="border-l-4 border-primary p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-primary">Chi tiết vị trí tuyển dụng</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{job.title}</h1>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Đây là trang xem nhanh tin tuyển dụng và toàn bộ ứng viên đã nộp CV vào vị trí này.
              </p>
            </div>

            <div className="rounded-xl border border-border-light bg-surface-low px-4 py-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${jobStatus.className}`}>{jobStatus.label}</span>
              <p className="mt-2 max-w-64 text-xs leading-5 text-text-muted">{jobStatus.description}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-surface-low p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                Công ty
              </div>
              <p className="mt-2 text-sm text-text-muted">{job.company}</p>
            </div>
            <div className="rounded-xl bg-surface-low p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Địa điểm
              </div>
              <p className="mt-2 text-sm text-text-muted">{job.location ?? "Chưa ghi địa điểm"}</p>
            </div>
            <div className="rounded-xl bg-surface-low p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                Hình thức
              </div>
              <p className="mt-2 text-sm text-text-muted">{job.type ?? "Chưa phân loại"}</p>
            </div>
            <div className="rounded-xl bg-primary-fixed p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <UsersRound className="h-4 w-4" />
                Ứng viên
              </div>
              <p className="mt-2 text-2xl font-bold text-primary">{applications.length}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <RecruiterJobStatusForm
              action={job.isArchived ? restoreRecruiterJobAction : job.status === "PUBLISHED" ? archiveRecruiterJobAction : publishRecruiterJobAction}
              buttonClassName="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
              isArchived={job.isArchived}
              isPublished={job.status === "PUBLISHED"}
              jobId={job.id}
            />
            <Link
              href={`/recruiter/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-surface-low px-4 py-2 text-sm font-semibold text-foreground outline-none hover:bg-outline-variant focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa JD
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Mô tả công việc</h2>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-muted">{job.description ?? "Chưa có mô tả."}</p>
        </article>

        <article className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Yêu cầu ứng viên</h2>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-muted">{job.requirements ?? "Chưa có yêu cầu."}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border-light bg-surface-white shadow-sm">
        <div className="border-b border-border-light p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Ứng viên của vị trí này</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Danh sách ứng viên đã nộp CV</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Mỗi dòng là một hồ sơ ứng tuyển vào đúng tin này. Bấm “Xem hồ sơ” để xem CV và cập nhật trạng thái tuyển dụng.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-low p-2 text-center text-xs">
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="font-bold text-primary">{newApplications}</p>
                <p className="text-text-muted">Mới</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="font-bold text-primary">{interviewingApplications}</p>
                <p className="text-text-muted">Phỏng vấn</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="font-bold text-primary">{offeredApplications}</p>
                <p className="text-text-muted">Đề nghị</p>
              </div>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-5 md:p-6">
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-low p-6 text-center">
              <UsersRound className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Chưa có ứng viên nào</h3>
              <p className="mt-2 text-sm text-text-muted">Khi có người nộp CV vào tin này, danh sách sẽ hiện trực tiếp ở đây.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-low text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ứng viên</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Độ phù hợp</th>
                  <th className="px-5 py-3 font-semibold">Cập nhật</th>
                  <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {applications.map((application) => {
                  const name = application.user.name ?? application.user.email ?? "Ứng viên";
                  const statusLabel = statusLabels[application.status] ?? application.status;
                  const statusClassName = statusStyles[application.status] ?? "bg-surface-low text-text-muted";

                  return (
                    <tr key={application.id} className="align-middle hover:bg-surface-low/60">
                      <td className="px-5 py-4">
                        <Link href={`/recruiter/candidates/${application.id}`} className="font-semibold text-foreground outline-none hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                          {name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                          <Mail className="h-3.5 w-3.5" />
                          {application.user.email ?? "Chưa có email"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>{statusLabel}</span>
                      </td>
                      <td className="px-5 py-4 text-text-muted">{getMatchLabel(application, job.id)}</td>
                      <td className="px-5 py-4 text-text-muted">{formatDate(application.updatedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/recruiter/candidates/${application.id}`}
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          <Eye className="h-4 w-4" />
                          Xem hồ sơ
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
