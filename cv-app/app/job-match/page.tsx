import JobMatchClient from "@/features/job-match/job-matchClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function JobMatchPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <JobMatchClient />;
}
