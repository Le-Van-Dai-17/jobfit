"use server";

import { auth } from "@/auth";
import { CvData, CvSchema } from "../schemas/cv.schema";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { resumeRepository } from "../repositories/resume.repository";

export async function saveCvAction(resumeId: string, data: CvData) {
  try {
    const session = await auth();
    const principal = await requireActiveRole(session?.user, "CANDIDATE");
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    if (!principal) {
      return { success: false, error: "Forbidden" };
    }

    // Validate incoming data
    const parsedData = CvSchema.parse(data);

    const saved = await resumeRepository.saveVersionWithRetry(resumeId, principal.id, parsedData);

    if (!saved) return { success: false, error: "CV not found or access denied" };

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to save CV:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
