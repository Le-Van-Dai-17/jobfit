import InterviewClient from "@/features/interview/interviewClient";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { redirect } from "next/navigation";

export default async function InterviewPage() {
  const session = await auth();
  
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "CANDIDATE" });
  if (roleRedirect) redirect(roleRedirect);

  return <InterviewClient />;
}
