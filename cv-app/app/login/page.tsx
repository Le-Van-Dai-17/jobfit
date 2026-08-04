import LoginClient from "@/features/auth/LoginClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  // Redirect to dashboard if already authenticated
  if (session?.user) {
    redirect("/");
  }

  return <LoginClient />;
}
