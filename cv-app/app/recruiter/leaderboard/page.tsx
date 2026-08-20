import { ArrowLeft, FileSpreadsheet, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { recruiterService } from "@/features/recruiter/services/recruiter.service";
import { ExportCsvButton } from "./ExportCsvButton";
import { JobSelector } from "./JobSelector";
import { LeaderboardClient } from "./LeaderboardClient";

type ApplicationForLeaderboard = {
  id: string;
  status: string;
  updatedAt: Date;
  user: { name: string | null; email: string | null };
  resumeVersion?: { matchAnalyses?: Array<{ jobId: string; overallScore: number }> } | null;
};

function getMatchScore(application: ApplicationForLeaderboard, jobId: string) {
  return application.resumeVersion?.matchAnalyses?.find((analysis) => analysis.jobId === jobId)?.overallScore ?? null;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);

  const user = session!.user;
  const rawJobs = await recruiterService.listJobs(user.id, {});
  const jobs = rawJobs as { id: string; title: string; status?: string; isArchived?: boolean }[];
  const params = await searchParams;
  const selectedJobId = params.jobId || jobs[0]?.id || "";
  const selectedJobTitle = jobs.find((job) => job.id === selectedJobId)?.title;

  const applicationsData = selectedJobId
    ? ((await recruiterService.listApplications(user.id, { jobId: selectedJobId, sort: "match" })) as ApplicationForLeaderboard[])
    : [];

  const newApplications = applicationsData.filter((application) => application.status === "APPLIED");

  const candidates = newApplications
    .map((application) => {
      const cvMatch = getMatchScore(application, selectedJobId);

      return {
        id: application.id,
        name: application.user.name || application.user.email || "Ứng viên chưa có tên",
        email: application.user.email || "Chưa có email",
        cvMatch,
        status: application.status,
        updatedAt: formatDate(application.updatedAt),
      };
    })
    .sort((a, b) => (b.cvMatch ?? -1) - (a.cvMatch ?? -1));

  const scoredCandidates = candidates.filter((candidate) => typeof candidate.cvMatch === "number");
  const averageMatch =
    scoredCandidates.length > 0
      ? Math.round(scoredCandidates.reduce((sum, candidate) => sum + (candidate.cvMatch ?? 0), 0) / scoredCandidates.length)
      : null;
  const waitingForAnalysis = candidates.length - scoredCandidates.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách vị trí
            </Link>
            <p className="mt-5 text-sm font-semibold text-primary">Bảng xếp hạng ứng viên mới</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Sàng lọc hồ sơ vừa nộp vào job</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
              Bảng này chỉ hiển thị ứng viên đang ở trạng thái “Mới ứng tuyển”. Ứng viên đã chuyển sang phỏng vấn, đã bị từ chối, đã rút hồ sơ hoặc đã nhận offer sẽ không còn nằm trong bảng xếp hạng này.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <JobSelector jobs={jobs} selectedJobId={selectedJobId} />
            <ExportCsvButton data={candidates} jobTitle={selectedJobTitle} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-primary p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <UsersRound className="h-4 w-4" />
            Hồ sơ mới cần sàng lọc
          </div>
          <p className="mt-3 text-4xl font-extrabold">{candidates.length}</p>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Điểm khớp CV/JD trung bình
          </div>
          <p className="mt-3 text-4xl font-extrabold text-foreground">{averageMatch === null ? "--" : averageMatch}</p>
          <p className="mt-1 text-sm text-text-muted">{scoredCandidates.length} hồ sơ mới đã có điểm phân tích</p>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Chưa có điểm khớp
          </div>
          <p className="mt-3 text-4xl font-extrabold text-foreground">{waitingForAnalysis}</p>
          <p className="mt-1 text-sm text-text-muted">Hồ sơ mới chưa được phân tích CV/JD</p>
        </div>
      </section>

      <LeaderboardClient initialCandidates={candidates} />
    </div>
  );
}
