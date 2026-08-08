import Link from "next/link";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { parseApplicationStatusFilter } from "@/features/recruiter/services/recruiter-query";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  user: { name: string | null; email: string | null };
  job: { title: string };
  updatedAt?: Date;
};

export default async function RecruiterCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { status: rawStatus } = await searchParams;
  const status = parseApplicationStatusFilter(rawStatus);

  let applications: ApplicationRow[];
  try {
    applications = (await recruiterService.listApplications(user.id, { status })) as ApplicationRow[];
  } catch (error) {
    if (error instanceof RecruiterAccessError) redirect("/recruiter/company/onboarding");
    throw error;
  }

  const statuses: ApplicationStatus[] = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Ứng viên</h1>
      <nav className="flex flex-wrap gap-2" aria-label="Lọc trạng thái">
        <Link className="rounded-xl border border-border-light px-3 py-2 text-sm" href="/recruiter/candidates">Tất cả</Link>
        {statuses.map((item) => (
          <Link key={item} className="rounded-xl border border-border-light px-3 py-2 text-sm" href={`/recruiter/candidates?status=${item}`}>
            {item}
          </Link>
        ))}
      </nav>
      <div className="space-y-3">
        {applications.map((application) => (
          <Link key={application.id} className="block rounded-xl border border-border-light bg-white p-4" href={`/recruiter/candidates/${application.id}`}>
            <div className="flex flex-wrap justify-between gap-3">
              <span className="font-semibold">{application.user.name ?? application.user.email ?? "Ứng viên"}</span>
              <span className="text-sm text-text-muted">{application.status}</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{application.job.title}</p>
          </Link>
        ))}
        {applications.length === 0 ? <p className="text-sm text-text-muted">Chưa có ứng viên trong bộ lọc này.</p> : null}
      </div>
    </div>
  );
}
