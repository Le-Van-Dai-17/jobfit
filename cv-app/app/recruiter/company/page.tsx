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
    industry: import("@prisma/client").CompanyIndustry | null;
    size: import("@prisma/client").CompanySize | null;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Cài đặt công ty</h1>
        <p className="mt-2 text-base text-text-muted">
          Cập nhật thông tin công ty của bạn. Thông tin này sẽ hiển thị trên các tin tuyển dụng và hồ sơ công ty.
        </p>
      </div>

      <CompanySettingsForm company={company} />
    </div>
  );
}
