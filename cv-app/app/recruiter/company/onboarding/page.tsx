import { auth } from "@/auth";
import { CompanyOnboardingForm } from "@/features/companies/CompanyOnboardingForm";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { PrismaCompanyRepository } from "@/features/companies/repositories/company.repository";
import { redirect } from "next/navigation";

export default async function RecruiterCompanyOnboardingPage() {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;

  const membership = await new PrismaCompanyRepository().findMembership(user.id);
  if (membership) {
    redirect("/recruiter");
  }

  return <CompanyOnboardingForm />;
}
