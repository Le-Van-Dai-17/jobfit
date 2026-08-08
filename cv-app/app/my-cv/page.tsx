import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/features/auth/services/role-redirects";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { resumeService } from "@/features/cv/services/resume.service";
import { CreateResumeForm } from "@/features/my-cv/CreateResumeForm";
import MyCvClient from "@/features/my-cv/my-cvClient";

export default async function MyCvPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const principal = await requireActiveRole(session.user, "CANDIDATE");
  if (!principal) {
    redirect(session.user.role === "CANDIDATE" ? "/login" : getDashboardPathForRole(session.user.role));
  }

  const resumes = await resumeService.getUserResumes(principal.id);
  const resume = resumes[0];
  if (!resume) return <CreateResumeForm />;

  const latestVersion = resume.versions?.[0];
  const initialData = latestVersion?.content && typeof latestVersion.content === "object" && !Array.isArray(latestVersion.content)
    ? latestVersion.content as Prisma.JsonObject
    : null;

  return <MyCvClient initialResumeId={resume.id} initialTitle={resume.title} initialData={initialData} />;
}
