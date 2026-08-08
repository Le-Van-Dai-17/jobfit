import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { PrismaCompanyRepository } from "@/features/companies/repositories/company.repository";
import { redirect } from "next/navigation";

export default async function RecruiterCompanyPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const membership = await new PrismaCompanyRepository().findMembership(user.id);
  if (!membership || typeof membership !== "object" || !("company" in membership)) {
    redirect("/recruiter/company/onboarding");
  }

  const company = membership.company as { name: string; slug: string; website: string | null; location: string | null };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
      <dl className="grid gap-4 rounded-2xl border border-border-light bg-white p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-text-muted">Slug</dt>
          <dd className="mt-1 text-foreground">{company.slug}</dd>
        </div>
        <div>
          <dt className="font-semibold text-text-muted">Địa điểm</dt>
          <dd className="mt-1 text-foreground">{company.location ?? "Chưa cập nhật"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-text-muted">Website</dt>
          <dd className="mt-1 text-foreground">{company.website ?? "Chưa cập nhật"}</dd>
        </div>
      </dl>
    </div>
  );
}
