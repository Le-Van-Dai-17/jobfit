import type { ApplicationStatus } from "@prisma/client";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { parseRecruiterApplicationFilters } from "@/features/recruiter/services/recruiter-query";
import {
  RecruiterAccessError,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";
import { cn } from "@/lib/utils";

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  user: { name: string | null; email: string | null };
  job: { id: string; title: string; skills: string[] | string | null };
  updatedAt: Date;
  appliedAt: Date | null;
  resumeVersion?: { matchAnalyses?: Array<{ jobId: string; overallScore: number }> } | null;
  assessmentSessions?: Array<unknown>;
};

const statusLabels: Record<string, string> = {
  APPLIED: "UNG TUYEN",
  INTERVIEWING: "PHONG VAN",
  OFFER: "DE NGHI (OFFER)",
  REJECTED: "TU CHOI",
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function formatTimeAgo(date: Date) {
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  if (diffInMinutes < 60) return `${Math.max(1, diffInMinutes)} phut truoc`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} gio truoc`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Hom qua";
  if (diffInDays < 30) return `${diffInDays} ngay truoc`;
  return date.toLocaleDateString("vi-VN");
}

function parseSkills(skills: string[] | string | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.slice(0, 3);
  return skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 3);
}

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; jobId?: string | string[]; sort?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const filters = parseRecruiterApplicationFilters(await searchParams);

  let applications: ApplicationRow[];
  try {
    applications = (await recruiterService.listApplications(user.id, filters)) as ApplicationRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const kanbanStatuses = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];
  const currentSearch = filters.search || "";

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground">Pipeline Ung Vien</h1>
          <p className="mt-2 text-base text-text-muted">
            Quan ly va theo doi tien trinh cua ung vien qua tung vong tuyen dung.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          href="/recruiter/candidates/new"
        >
          <Plus className="h-5 w-5" />
          Them ung vien
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-[#F1F5F9] p-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          action="/recruiter/candidates"
          className="relative flex h-11 w-full max-w-lg items-center rounded-lg bg-white shadow-sm"
        >
          <Search className="absolute left-3 h-5 w-5 text-text-muted" />
          <input
            className="h-full w-full rounded-lg border-none bg-transparent pl-10 pr-4 text-sm font-medium text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            name="q"
            placeholder="Tim kiem ung vien, vi tri hoac ky nang..."
            defaultValue={currentSearch}
          />
        </form>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          <button className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-transparent px-4 text-sm font-semibold text-text-muted hover:bg-white hover:shadow-sm">
            <Filter className="h-4 w-4" />
            Loc
          </button>
          <Link href={`/recruiter/candidates?sort=match${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ""}`} className={`inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold hover:bg-white hover:shadow-sm ${filters.sort === "match" ? "bg-white text-[#2563EB] shadow-sm" : "bg-transparent text-text-muted"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-up"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            Sap xep: Do phu hop
          </Link>
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-2">
        {kanbanStatuses.map((columnStatus) => {
          const rows = applications.filter((app) => app.status === columnStatus);

          return (
            <section key={columnStatus} className="flex w-[350px] shrink-0 snap-center flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[13px] font-bold tracking-widest text-foreground">
                    {statusLabels[columnStatus]}
                  </h2>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-low text-xs font-bold text-text-muted">
                    {rows.length}
                  </span>
                </div>
                <button className="text-text-muted hover:text-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {rows.map((application) => {
                  const name = application.user.name ?? application.user.email ?? "Ung vien";
                  const initials = getInitials(name);
                  const skills = parseSkills(application.job.skills);
                  const dateText = formatTimeAgo(application.updatedAt);
                  const matchScore = application.resumeVersion?.matchAnalyses?.find((analysis) => analysis.jobId === application.job.id)?.overallScore;

                  let borderClass = "";
                  let commentBox = null;
                  let calendarBox = null;
                  let offerBox = null;
                  let customFooter = null;

                  if (columnStatus === "APPLIED") {
                    // Standard look
                  } else if (columnStatus === "INTERVIEWING") {
                    borderClass = "border-l-[4px] border-l-orange-400";
                    calendarBox = (
                      <div className="mt-3 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Calendar className="h-4 w-4 text-orange-500" /> Lich phong van
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Cho sap xep
                        </div>
                      </div>
                    );
                  } else if (columnStatus === "OFFER") {
                    borderClass = "border-l-[4px] border-l-green-500";
                    offerBox = (
                      <div className="mt-3 flex flex-col gap-1 rounded-lg bg-surface-low p-3 text-xs font-medium text-text-muted">
                        <div className="flex justify-between"><span>Offer Sent:</span> <span>Da gui</span></div>
                        <div className="flex justify-between"><span>Deadline:</span> <span>7 ngay toi</span></div>
                      </div>
                    );
                    customFooter = <span className="text-xs font-bold text-green-600">Pending Acceptance</span>;
                  } else if (columnStatus === "REJECTED") {
                    borderClass = "border-l-[4px] border-l-red-500";
                  }

                  if (columnStatus === "APPLIED" && application.id.charCodeAt(0) % 2 === 0) {
                    borderClass = "border-l-[4px] border-l-green-400";
                    commentBox = (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm italic text-blue-900">
                        CV kha tot, co nhieu kinh nghiem phu hop voi yeu cau...
                      </div>
                    );
                    customFooter = <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 className="h-3 w-3" /> Da duyet ho so</span>;
                  }

                  return (
                    <Link
                      href={`/recruiter/candidates/${application.id}`}
                      key={application.id}
                      className={cn(
                        "group flex flex-col overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-border-light transition-shadow hover:shadow-md block",
                        borderClass
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-sm font-bold text-[#0047AB]">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary group-hover:underline">
                              {name}
                            </h3>
                            <p className="text-xs text-text-muted">{application.job.title}</p>
                          </div>
                        </div>
                        {commentBox && <MessageSquare className="h-4 w-4 text-text-muted" />}
                      </div>

                      {commentBox}
                      {calendarBox}
                      {offerBox}

                      {typeof matchScore === "number" && (
                        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#EFF6FF] px-3 py-2 text-sm">
                          <span className="font-semibold text-[#1E40AF]">Do phu hop CV-JD</span>
                          <span className="font-bold text-[#1D4ED8]">{matchScore}/100</span>
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span key={skill} className="rounded bg-surface-low px-2 py-1 text-[11px] font-semibold text-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-border-light pt-3">
                        <div className="flex items-center gap-2">
                          {!customFooter && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock text-text-muted"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              <span className="text-xs font-medium text-text-muted">{dateText}</span>
                            </>
                          )}
                          {customFooter && customFooter}
                        </div>

                        <div className="flex items-center gap-1">
                          {columnStatus === "APPLIED" && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">A</div>
                          )}
                          {(columnStatus === "INTERVIEWING" || (columnStatus === "APPLIED" && commentBox)) && (
                            <>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-low text-text-muted"><ChevronLeft className="h-3 w-3" /></div>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-low text-text-muted"><ChevronRight className="h-3 w-3" /></div>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {rows.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border-light bg-surface-white">
                    <span className="text-sm text-text-muted">Chua co ung vien</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}