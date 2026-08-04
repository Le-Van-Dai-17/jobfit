import TrackerClient from "@/features/tracker/trackerClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TrackerPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <TrackerClient />;
}
