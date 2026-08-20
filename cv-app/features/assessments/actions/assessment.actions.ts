"use server";

import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import type { AssessmentActionState } from "./assessment.action-state";

export async function createAssessmentSessionAction(
  _prevState: AssessmentActionState,
  _formData: FormData
): Promise<AssessmentActionState> {
  void _prevState;
  void _formData;

  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để tạo bài đánh giá." };
  }
  if (!principal) {
    return { status: "error", message: "Chỉ tài khoản ứng viên đang hoạt động mới có thể tạo bài đánh giá." };
  }

  return { status: "error", message: "Luồng ứng viên tự tạo bài đánh giá đã được tắt. Nhà tuyển dụng sẽ chủ động mời nếu cần." };
}

export async function submitAssessmentAction(
  _prevState: AssessmentActionState,
  _formData: FormData
): Promise<AssessmentActionState> {
  void _prevState;
  void _formData;

  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!session?.user?.id) {
    return { status: "error", message: "Bạn cần đăng nhập để nộp bài đánh giá." };
  }
  if (!principal) {
    return { status: "error", message: "Chỉ tài khoản ứng viên đang hoạt động mới có thể nộp bài đánh giá." };
  }

  return { status: "error", message: "Luồng ứng viên tự nộp bài đánh giá đã được tắt. Nhà tuyển dụng sẽ tổ chức vòng đánh giá riêng nếu cần." };
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
  void taskId;

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
