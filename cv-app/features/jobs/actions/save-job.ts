"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { jobService } from "../services/job.service";

const SaveJobSchema = z.object({
  jobId: z.string().min(1),
});

export async function saveJobAction(formData: FormData) {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!principal) return;

  const parsed = SaveJobSchema.safeParse({ jobId: formData.get("jobId") });
  if (!parsed.success) return;

  await jobService.toggleSaveJob(principal.id, parsed.data.jobId);
  revalidatePath("/jobs");
}
