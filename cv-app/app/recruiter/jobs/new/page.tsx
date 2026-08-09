import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterJobForm } from "@/features/recruiter/components/RecruiterJobForm";

export default async function NewRecruiterJobPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);

  return (
    <div className="w-full">
      <RecruiterJobForm />
    </div>
  );
}
