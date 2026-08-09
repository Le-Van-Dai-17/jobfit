export type JobFeedMode = "all" | "remote" | "hybrid" | "onsite";

export type JobFeedFilters = {
  q: string;
  mode: JobFeedMode;
};

type JobFeedSearchParams = {
  q?: string | string[];
  mode?: string | string[];
};

type FilterableJob = {
  title: string;
  company: string;
  type?: string | null;
};

const allowedModes = new Set<JobFeedMode>(["all", "remote", "hybrid", "onsite"]);

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseJobFeedFilters(searchParams: JobFeedSearchParams): JobFeedFilters {
  const q = (firstValue(searchParams.q) ?? "").trim().toLocaleLowerCase("vi-VN");
  const requestedMode = (firstValue(searchParams.mode) ?? "all").trim().toLowerCase();
  const mode = allowedModes.has(requestedMode as JobFeedMode) ? (requestedMode as JobFeedMode) : "all";

  return { q, mode };
}

export function filterJobFeed<T extends FilterableJob>(jobs: T[], filters: JobFeedFilters): T[] {
  return jobs.filter((job) => {
    const searchableText = `${job.title} ${job.company}`.toLocaleLowerCase("vi-VN");
    const matchesQuery = !filters.q || searchableText.includes(filters.q);
    const normalizedType = (job.type ?? "").toLowerCase();
    const matchesMode = filters.mode === "all" || normalizedType.includes(filters.mode);

    return matchesQuery && matchesMode;
  });
}
