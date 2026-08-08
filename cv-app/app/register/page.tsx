import { auth } from "@/auth";
import RegisterClient from "@/features/auth/RegisterClient";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  return <RegisterClient />;
}
