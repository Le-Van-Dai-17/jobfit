import InterviewClient from "@/features/interview/interviewClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function InterviewPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <InterviewClient />;
}
