import JobOptimizationClient from "@/features/job-optimization/job-optimizationClient";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { redirect } from "next/navigation";

export default async function JobOptimizationPage() {
  const session = await auth();
  
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  return <JobOptimizationClient />;
}
