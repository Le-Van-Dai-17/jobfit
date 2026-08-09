import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { CompanySettingsForm } from "@/features/companies/CompanySettingsForm";
import { PrismaCompanyRepository } from "@/features/companies/repositories/company.repository";

export default async function RecruiterCompanyPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const membership = await new PrismaCompanyRepository().findMembership(user.id);
  if (!membership || typeof membership !== "object" || !("company" in membership)) {
    redirect("/recruiter/company/onboarding");
  }

  const company = membership.company as {
    name: string;
    slug: string;
    website: string | null;
    description: string | null;
    location: string | null;
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Công ty</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{company.name}</h1>
        <p className="mt-2 text-sm text-text-muted">Thông tin công ty đang gắn với tài khoản nhà tuyển dụng hiện tại.</p>
      </section>

      <dl className="grid gap-4 rounded-xl border border-border-light bg-surface-white p-5 text-sm shadow-sm sm:grid-cols-2">
        <div className="rounded-lg bg-surface-low p-3">
          <dt className="font-semibold text-text-muted">Slug</dt>
          <dd className="mt-1 text-foreground">{company.slug}</dd>
        </div>
        <div className="rounded-lg bg-surface-low p-3">
          <dt className="font-semibold text-text-muted">Địa điểm</dt>
          <dd className="mt-1 text-foreground">{company.location ?? "Chưa cập nhật"}</dd>
        </div>
        <div className="rounded-lg bg-surface-low p-3">
          <dt className="font-semibold text-text-muted">Website</dt>
          <dd className="mt-1 text-foreground">{company.website ?? "Chưa cập nhật"}</dd>
        </div>
      </dl>
      <CompanySettingsForm company={company} />
    </div>
  );
}
