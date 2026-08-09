import { BriefcaseBusiness, Building2, Clock3, MapPin, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { saveJobAction } from "@/features/jobs/actions/save-job";
import { filterJobFeed, parseJobFeedFilters } from "@/features/jobs/services/job-feed-filter";
import { jobService } from "@/features/jobs/services/job.service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getSkillTags(requirements?: string | null) {
  if (!requirements) return [];
  const commonSkills = ["React", "Next.js", "TypeScript", "Node.js", "Java", "Python", "SQL", "AWS", "Docker", "Prisma"];
  return commonSkills.filter((skill) => requirements.toLowerCase().includes(skill.toLowerCase())).slice(0, 5);
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; mode?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  const filters = parseJobFeedFilters(await searchParams);
  const allJobs = await jobService.getCandidateFeed(session!.user.id);
  const jobs = filterJobFeed(allJobs, filters);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Viec lam</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Feed vi tri IT dang tuyen</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Du lieu lay tu he thong da luu. Mo JD de chon CV cua ban, ung tuyen va tao bai danh gia theo ngu canh vi tri.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              CV snapshot khi ung tuyen
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-3 py-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
              {jobs.length} vi tri dang mo
            </span>
          </div>
        </div>
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_140px]" role="search">
          <label className="relative">
            <span className="sr-only">Tim theo chuc danh hoac cong ty</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-border-light bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              defaultValue={filters.q}
              name="q"
              placeholder="Tim Frontend, Backend, DevOps..."
              type="search"
            />
          </label>
          <select
            aria-label="Loc hinh thuc lam viec"
            className="h-11 rounded-xl border border-border-light bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            defaultValue={filters.mode}
            name="mode"
          >
            <option value="all">Tat ca hinh thuc</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <button
            className="h-11 rounded-xl border border-border-light bg-surface-low px-4 text-sm font-semibold text-foreground"
            type="submit"
          >
            Loc
          </button>
        </form>
      </section>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-border-light bg-surface-white p-6 text-sm text-text-muted">
          {allJobs.length === 0
            ? "Chua co viec lam dang mo. Khi recruiter dang JD, vi tri phu hop se xuat hien tai day."
            : "Khong co vi tri nao khop tu khoa va hinh thuc lam viec da chon."}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const skills = getSkillTags(job.requirements);
            const application = job.applications[0];
            const assessment = application?.assessmentSessions[0] ?? job.assessmentSessions[0];
            return (
              <article key={job.id} className="rounded-2xl border border-border-light bg-surface-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Dang {formatDate(job.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {job.deadline ? `Han ${formatDate(job.deadline)}` : "Chua cong bo han ung tuyen"}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-foreground">{job.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-text-muted">
                      {job.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      ) : null}
                      {job.type ? <span>{job.type}</span> : null}
                      {job.salaryRange ? <span className="font-semibold text-foreground">{job.salaryRange}</span> : null}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                      {job.description ?? "JD chua co mo ta chi tiet. Mo vi tri de xem yeu cau va luong ung tuyen."}
                    </p>
                    {skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
                      {job.savedBy.length > 0 ? <span className="rounded-full bg-surface-low px-3 py-1">Da luu</span> : null}
                      <span className="rounded-full bg-surface-low px-3 py-1">
                        {application ? `Don ung tuyen: ${application.status}` : "Chua ung tuyen"}
                      </span>
                      <span className="rounded-full bg-surface-low px-3 py-1">
                        {assessment ? `Danh gia: ${assessment.status}` : "San sang tao danh gia theo JD"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
                    <form action={saveJobAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        className="inline-flex w-full items-center justify-center rounded-xl border border-border-light px-4 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"
                        type="submit"
                      >
                        {job.savedBy.length > 0 ? "Da luu" : "Luu"}
                      </button>
                    </form>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Xem JD
                    </Link>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-border-light px-4 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Ung tuyen
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
