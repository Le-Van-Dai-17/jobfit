import type { ApplicationStatus } from "@prisma/client";
import type { JobStatus } from "@prisma/client";

const applicationStatuses = new Set<ApplicationStatus>([
  "DRAFT",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export function parseApplicationStatusFilter(
  value: string | string[] | undefined
): ApplicationStatus | undefined {
  if (typeof value !== "string") return undefined;
  return applicationStatuses.has(value as ApplicationStatus) ? (value as ApplicationStatus) : undefined;
}

const applicationSorts = new Set(["match", "recent", "oldest"] as const);
export type RecruiterApplicationSort = "match" | "recent" | "oldest";

export function parseRecruiterApplicationFilters(searchParams: {
  q?: string | string[];
  status?: string | string[];
  jobId?: string | string[];
  sort?: string | string[];
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 160) : "";
  const status = parseApplicationStatusFilter(searchParams.status);
  const jobId = typeof searchParams.jobId === "string" ? searchParams.jobId.trim().slice(0, 160) : "";
  const sort =
    typeof searchParams.sort === "string" && applicationSorts.has(searchParams.sort as RecruiterApplicationSort)
      ? (searchParams.sort as RecruiterApplicationSort)
      : "recent";

  return { search: search || undefined, status, jobId: jobId || undefined, sort };
}

const jobStatuses = new Set<JobStatus>(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export function parseRecruiterJobFilters(searchParams: {
  q?: string | string[];
  status?: string | string[];
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 160) : "";
  const status = typeof searchParams.status === "string" && jobStatuses.has(searchParams.status as JobStatus)
    ? (searchParams.status as JobStatus)
    : undefined;
  return { search: search || undefined, status };
}
