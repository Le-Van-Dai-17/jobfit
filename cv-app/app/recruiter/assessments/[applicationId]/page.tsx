import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { EmployerAssessmentReport } from "@/features/recruiter/components/EmployerAssessmentReport";
import { RecruiterAccessError, recruiterService } from "@/features/recruiter/services/recruiter.service";

type EmployerReport = {
  advisoryScore: number;
  reportSummary: string;
  strengths: string[];
  gaps: string[];
  limitations: string[];
  rubricBreakdown: Prisma.JsonValue;
  evidence: Prisma.JsonValue;
  session: { roleTitle: string; job: { title: string; company: string } };
};

export default async function RecruiterAssessmentReportPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { applicationId } = await params;

  let report: EmployerReport;
  try {
    report = (await recruiterService.getAssessmentReport(user.id, applicationId)) as EmployerReport;
  } catch (error) {
    if (error instanceof RecruiterAccessError) notFound();
    throw error;
  }

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-screen">
      <EmployerAssessmentReport result={report} />
    </div>
  );
}
