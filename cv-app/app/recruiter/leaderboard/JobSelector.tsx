"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function JobSelector({ jobs, selectedJobId }: { jobs: { id: string; title: string }[]; selectedJobId: string }) {
  const router = useRouter();

  return (
    <div className="relative min-w-64">
      <label htmlFor="leaderboard-job" className="sr-only">
        Chọn vị trí tuyển dụng
      </label>
      <select
        id="leaderboard-job"
        className="w-full cursor-pointer appearance-none rounded-lg bg-primary-fixed px-4 py-2.5 pr-9 text-sm font-bold text-primary outline-none hover:bg-surface-container focus:ring-2 focus:ring-primary focus:ring-offset-2"
        value={selectedJobId}
        onChange={(event) => router.push(`/recruiter/leaderboard?jobId=${event.target.value}`)}
      >
        <option value="" disabled>
          Chọn vị trí tuyển dụng...
        </option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
    </div>
  );
}
