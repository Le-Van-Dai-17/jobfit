import {
  ArrowLeft,
  Home,
  TrendingUp,
  User,
  FileText,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { recruiterService } from "@/features/recruiter/services/recruiter.service";
import { JobSelector } from "./JobSelector";
import { ExportCsvButton } from "./ExportCsvButton";
import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const session = await auth();
  if (!session?.user) return null;
  
  const rawJobs = await recruiterService.listJobs(session.user.id, { status: "PUBLISHED" });
  const jobs = rawJobs as { id: string, title: string }[];
  const params = await searchParams;
  const selectedJobId = params.jobId || (jobs.length > 0 ? jobs[0].id : "");

  // Fetch applications
  const applicationsData = selectedJobId ? await recruiterService.listApplications(session.user.id, { jobId: selectedJobId }) : [];
  
  // Transform and calculate scores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidates = applicationsData.map((app: any) => {
    const cvMatch = app.resumeVersion?.matchAnalyses?.[0]?.overallScore || 0;
    const techScore = app.assessmentSessions?.[0]?.result?.advisoryScore || 0;
    const totalScore = (cvMatch > 0 && techScore > 0) ? (cvMatch + techScore) / 2 : Math.max(cvMatch, techScore);
    
    return {
      id: app.id,
      name: app.user.name || "Unknown",
      email: app.user.email || "",
      cvMatch: Math.round(cvMatch),
      techScore: Math.round(techScore),
      totalScore: parseFloat(totalScore.toFixed(1)),
      status: app.status
    };
  }).sort((a: {totalScore: number}, b: {totalScore: number}) => b.totalScore - a.totalScore);

  const totalCandidates = candidates.length;
  const appsWithTechScore = candidates.filter((c: {techScore: number}) => c.techScore > 0);
  const averageTechScore = appsWithTechScore.length > 0 
    ? Math.round(appsWithTechScore.reduce((sum: number, c: {techScore: number}) => sum + c.techScore, 0) / appsWithTechScore.length) 
    : 0;
  const passCount = candidates.filter((c: {totalScore: number}) => c.totalScore >= 70).length;
  const passRate = totalCandidates > 0 ? Math.round((passCount / totalCandidates) * 100) : 0;
  
  const selectedJobTitle = jobs.find(j => j.id === selectedJobId)?.title;


  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] pb-24 font-sans text-[#0B1C30]">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/candidates" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">Ứng Tuyển</h1>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
          <User className="h-4 w-4" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title & Actions */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0B1C30]">
            Candidate Leaderboard
          </h1>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Evaluating
              </span>
              <JobSelector jobs={jobs} selectedJobId={selectedJobId} />
            </div>
            <div className="flex items-center gap-3">
              <ExportCsvButton data={candidates} jobTitle={selectedJobTitle} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-xl bg-[#2552D8] p-6 shadow-sm">
            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                Total Candidates
              </h3>
              <p className="mt-2 text-5xl font-extrabold text-white">{totalCandidates}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#A5E57F]">
                <TrendingUp className="h-4 w-4" />
                <span>+12 this week</span>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent"></div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-xl bg-[#E8EEFF] p-6 shadow-sm">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#464554]">
                Average Technical Score
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-[#0B1C30]">{averageTechScore || "--"}</span>
                <span className="text-lg font-semibold text-[#464554]">/ 100</span>
              </div>
            </div>
            {/* Background Chart Simulation */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-60">
              <div className="h-8 w-4 rounded-t-sm bg-[#D3E4FE]"></div>
              <div className="h-12 w-4 rounded-t-sm bg-[#D3E4FE]"></div>
              <div className="h-10 w-4 rounded-t-sm bg-[#D3E4FE]"></div>
              <div className="h-16 w-4 rounded-t-sm bg-[#D3E4FE]"></div>
              <div className="h-24 w-4 rounded-t-sm bg-[#2552D8]"></div>
              <div className="h-14 w-4 rounded-t-sm bg-[#D3E4FE]"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-xl bg-[#E8EEFF] p-6 shadow-sm">
            <div className="flex h-full flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#464554]">
                Pass Rate
              </h3>
              <div className="mt-4 flex items-center">
                {/* Circular Progress (64%) */}
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-[#D3E4FE]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    {/* Progress Circle (64%) */}
                    <path
                      className="text-[#059669]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${passRate}, 100`}
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#0B1C30]">{passRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LeaderboardClient initialCandidates={candidates} />
      </main>

      {/* Bottom Mobile Tab Bar (Visible only on small screens) */}
      <div className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-gray-100 bg-white px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#0B1C30]">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </Link>
        <Link href="/recruiter/jobs" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#0B1C30]">
          <Briefcase className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Việc làm</span>
        </Link>
        <Link href="/recruiter/candidates" className="flex flex-col items-center gap-1 text-[#4648D4]">
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Ứng tuyển</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#0B1C30]">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Hồ sơ</span>
        </Link>
      </div>
    </div>
  );
}
