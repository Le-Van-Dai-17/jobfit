import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { RecruiterJobForm } from "@/features/recruiter/components/RecruiterJobForm";

export default async function NewRecruiterJobPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">JD mới</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Tạo vị trí tuyển dụng</h1>
      </div>
      <RecruiterJobForm />
    </div>
  );
}
