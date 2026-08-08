import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { CandidateProfileForm } from "@/features/profile/components/CandidateProfileForm";
import { CandidateProfileView } from "@/features/profile/components/CandidateProfileView";
import { profileService } from "@/features/profile/services/profile.service";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const principal = await requireActiveRole(session.user, "CANDIDATE");
  if (!principal) {
    redirect(session.user.role === "CANDIDATE" ? "/login" : getDashboardPathForRole(session.user.role));
  }

  const profile = await profileService.getCandidateProfile(principal.id);
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/my-cv" className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary">
          Mở và cập nhật CV
        </Link>
      </div>
      <CandidateProfileView profile={profile} />
      <CandidateProfileForm initialValues={profile} />
    </div>
  );
}
