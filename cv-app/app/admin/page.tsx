import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";

export default async function AdminDashboardPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "ADMIN" });
  if (roleRedirect) redirect(roleRedirect);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-foreground">Quản trị Jobfit</h1>
      <p className="text-sm text-text-muted">Khu vực quản trị nền tảng.</p>
    </div>
  );
}
