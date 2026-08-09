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

export type SimulationResult = {
  status: "success" | "error";
  message?: string;
  output?: {
    passed: number;
    total: number;
    logs: string[];
    errors: string[];
    executionTimeMs: number;
  };
};

export async function simulateCodeExecutionAction(
  code: string,
  taskId: string
): Promise<SimulationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để chạy code." };
  }

  // Simulate network delay for compiling and running
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!code || code.trim().length < 20) {
    return {
      status: "success",
      output: {
        passed: 0,
        total: 3,
        logs: ["Compiling...", "Error: Code is too short or empty."],
        errors: ["SyntaxError: Unexpected end of input"],
        executionTimeMs: 120,
      }
    };
  }

  const isJava = code.includes("class") || code.includes("public");
  const hasKeywords = code.toLowerCase().includes("function") || code.toLowerCase().includes("const") || isJava;
  const isGood = code.length > 100 && hasKeywords;

  if (isGood) {
    return {
      status: "success",
      output: {
        passed: 3,
        total: 3,
        logs: [
          "Compiling...",
          "Compilation successful.",
          "Running tests...",
          "✓ Test 1: Basic functionality passed (12ms)",
          "✓ Test 2: Edge cases handled (45ms)",
          "✓ Test 3: Performance test passed (124ms)"
        ],
        errors: [],
        executionTimeMs: 181,
      }
    };
  } else {
    return {
      status: "success",
      output: {
        passed: 1,
        total: 3,
        logs: [
          "Compiling...",
          "Compilation successful with warnings.",
          "Running tests...",
          "✓ Test 1: Basic functionality passed (15ms)",
          "✗ Test 2: Edge cases failed",
          "✗ Test 3: Performance test failed (timeout)"
        ],
        errors: [
          "NullPointerException at line 4: Cannot read properties of undefined",
          "TimeoutError: Execution exceeded 2000ms limit"
        ],
        executionTimeMs: 2015,
      }
    };
  }
}
