import { Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { jobService } from "@/features/jobs/services/job.service";

export default async function JobsPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  const jobs = await jobService.getRecommendedJobs();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-primary">Việc làm</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
          Vị trí đang tuyển
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Danh sách lấy từ dữ liệu đã lưu. Chọn một vị trí để xem JD, chọn CV thuộc tài khoản của bạn và ứng tuyển.
        </p>
      </section>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-border-light bg-surface-white p-6 text-sm text-text-muted">
          Chưa có việc làm đang mở.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-lg border border-border-light bg-surface-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{job.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    )}
                  </div>
                  {job.salaryRange && <p className="mt-2 text-sm font-semibold text-foreground">{job.salaryRange}</p>}
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
