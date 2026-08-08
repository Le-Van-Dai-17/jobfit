"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { ResumeService, ResumeValidationError } from "@/features/cv/services/resume.service";
import { ResumeRepository } from "@/features/cv/repositories/resume.repository";

export type CreateResumeState = { error?: string };

export async function createResumeAction(
  _previousState: CreateResumeState,
  formData: FormData
): Promise<CreateResumeState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!principal) return { error: "Bạn không có quyền tạo CV." };

  try {
    const service = new ResumeService(new ResumeRepository());
    await service.createNewResume(principal.id, String(formData.get("title") ?? ""));
  } catch (error) {
    if (error instanceof ResumeValidationError) {
      return { error: error.issues[0]?.message ?? "Tên CV không hợp lệ." };
    }
    throw error;
  }

  revalidatePath("/my-cv");
  redirect("/my-cv");
}
