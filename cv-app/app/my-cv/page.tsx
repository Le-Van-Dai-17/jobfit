import MyCvClient from "@/features/my-cv/my-cvClient";
import { auth } from "@/auth";
import { resumeService } from "@/features/cv/services/resume.service";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export default async function MyCvPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's primary resume
  const resumes = await resumeService.getUserResumes(session.user.id);
  
  let resume = resumes[0];
  let initialData = null;

  // If no resume exists, create a blank one
  if (!resume) {
    resume = await resumeService.createNewResume(session.user.id, "Frontend Developer CV - 2024");
  }

  // Extract the JSON content from the latest version
  const latestVersion = resume.versions?.[0];
  if (latestVersion && latestVersion.content) {
    initialData = latestVersion.content as Prisma.JsonObject;
  }

  return (
    <MyCvClient 
      initialResumeId={resume.id}
      initialData={initialData}
    />
  );
}
