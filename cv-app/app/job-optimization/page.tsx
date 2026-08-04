import JobOptimizationClient from "@/features/job-optimization/job-optimizationClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function JobOptimizationPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <JobOptimizationClient />;
}
