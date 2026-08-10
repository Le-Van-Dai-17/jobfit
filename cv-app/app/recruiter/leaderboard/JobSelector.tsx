"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function JobSelector({ jobs, selectedJobId }: { jobs: {id: string, title: string}[], selectedJobId: string }) {
  const router = useRouter();
  
  return (
    <div className="relative">
      <select 
        className="appearance-none flex items-center gap-2 rounded-lg bg-[#E5EEFF] px-4 py-2 pr-8 text-sm font-bold text-[#4648D4] hover:bg-[#D3E4FE] focus:outline-none focus:ring-2 focus:ring-[#4648D4] focus:ring-offset-2 cursor-pointer"
        value={selectedJobId}
        onChange={(e) => router.push(`/recruiter/leaderboard?jobId=${e.target.value}`)}
      >
        <option value="" disabled>Chọn vị trí công việc...</option>
        {jobs.map(job => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4648D4] pointer-events-none" />
    </div>
  );
}
