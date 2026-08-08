"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { profileService, ProfileValidationError } from "../services/profile.service";

export type CandidateProfileActionState = { error?: string; success?: string };

export async function updateCandidateProfileAction(
  _state: CandidateProfileActionState,
  formData: FormData
): Promise<CandidateProfileActionState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!principal) return { error: "Bạn không có quyền cập nhật hồ sơ này." };

  try {
    await profileService.updateCandidateProfile(principal.id, {
      headline: String(formData.get("headline") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      location: String(formData.get("location") ?? ""),
      website: String(formData.get("website") ?? ""),
      linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
      githubUrl: String(formData.get("githubUrl") ?? ""),
    });
  } catch (error) {
    if (error instanceof ProfileValidationError) {
      return { error: error.issues[0]?.message ?? "Thông tin hồ sơ không hợp lệ." };
    }
    throw error;
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Đã lưu hồ sơ." };
}
