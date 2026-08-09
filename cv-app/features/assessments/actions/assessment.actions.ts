"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import {
  AssessmentOwnershipError,
  AssessmentValidationError,
  assessmentService,
} from "../services/assessment.service";
import { AssessmentStartSchema } from "../schemas/assessment.schema";
import type { AssessmentActionState } from "./assessment.action-state";

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function toActionError(error: unknown): AssessmentActionState {
  if (error instanceof ZodError) {
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại dữ liệu.",
      fieldErrors: error.flatten().fieldErrors,
    };
  }
  if (error instanceof AssessmentOwnershipError) {
    return { status: "error", message: "Bạn không có quyền truy cập dữ liệu này." };
  }
  if (error instanceof AssessmentValidationError) {
    return { status: "error", message: error.message };
  }
  return { status: "error", message: "Không thể xử lý đánh giá lúc này. Vui lòng thử lại." };
}

export async function createAssessmentSessionAction(
  _prevState: AssessmentActionState,
  formData: FormData
): Promise<AssessmentActionState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để tạo bài đánh giá." };
  }
  if (!principal) {
    return { status: "error", message: "Chỉ tài khoản ứng viên đang hoạt động mới có thể tạo bài đánh giá." };
  }

  let createdSessionId: string | null = null;
  try {
    const input = AssessmentStartSchema.parse({
      resumeVersionId: formValue(formData, "resumeVersionId"),
      jobId: formValue(formData, "jobId"),
      applicationId: formValue(formData, "applicationId") || null,
    });
    const created = await assessmentService.createSession(principal.id, input);
    createdSessionId = created.id;
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/assessments");
  redirect(`/assessments/${createdSessionId}`);
}

export async function submitAssessmentAction(
  _prevState: AssessmentActionState,
  formData: FormData
): Promise<AssessmentActionState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để nộp bài đánh giá." };
  }
  if (!principal) {
    return { status: "error", message: "Chỉ tài khoản ứng viên đang hoạt động mới có thể nộp bài đánh giá." };
  }

  const sessionId = formValue(formData, "sessionId");
  const taskIds = formData.getAll("taskId").filter((value): value is string => typeof value === "string");
  const answers = taskIds.map((taskId) => ({
    taskId,
    answerText: [
      "## Giải pháp và bằng chứng",
      formValue(formData, `answer-${taskId}`),
      "## Kế hoạch triển khai",
      formValue(formData, `deployment-${taskId}`),
    ].join("\n\n"),
  }));

  try {
    await assessmentService.submitAndEvaluate(principal.id, { sessionId, answers });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/assessments");
  revalidatePath(`/assessments/${sessionId}`);
  redirect(`/assessments/${sessionId}`);
}
