"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import {
  ApplicationDuplicateError,
  ApplicationOwnershipError,
  ApplicationValidationError,
  applicationService,
} from "../services/application.service";
import { assessmentService } from "@/features/assessments/services/assessment.service";

const ApplyToJobSchema = z.object({
  jobId: z.string().min(1),
  resumeVersionId: z.string().min(1, "Vui lòng chọn CV"),
});

export type ApplyToJobState = {
  status: "idle" | "error";
  message?: string;
};

export async function applyToJobAction(
  _previousState: ApplyToJobState,
  formData: FormData
): Promise<ApplyToJobState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để ứng tuyển." };
  }
  if (!principal) {
    return { status: "error", message: "Chỉ tài khoản ứng viên đang hoạt động mới có thể ứng tuyển." };
  }

  const parsed = ApplyToJobSchema.safeParse({
    jobId: formData.get("jobId"),
    resumeVersionId: formData.get("resumeVersionId"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  let application;
  try {
    application = await applicationService.applyToJob(principal.id, parsed.data);
  } catch (error) {
    if (
      error instanceof ApplicationDuplicateError ||
      error instanceof ApplicationOwnershipError ||
      error instanceof ApplicationValidationError
    ) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Không thể ứng tuyển lúc này." };
  }

  // Attempt to automatically create an assessment session and redirect to it
  let assessmentSession;
  try {
    assessmentSession = await assessmentService.createSession(principal.id, {
      jobId: parsed.data.jobId,
      resumeVersionId: parsed.data.resumeVersionId,
      applicationId: application.id
    });
  } catch (error) {
    console.error("Auto Assessment Session Creation Failed:", error);
    // Silently fall back to standard application redirect if session creation fails
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  
  if (assessmentSession) {
    redirect(`/assessments/${assessmentSession.id}`);
  } else {
    redirect(`/applications/${application.id}?applied=1`);
  }
}
