"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { ResumeRepository } from "@/features/cv/repositories/resume.repository";
import { ResumeService, ResumeValidationError } from "@/features/cv/services/resume.service";
import { extractResumeTextFromImage } from "@/lib/ai/gemini";

const MAX_TEXT_FILE_BYTES = 256 * 1024;
const MAX_IMAGE_FILE_BYTES = 2 * 1024 * 1024;
const SUPPORTED_TEXT_FILE_TYPES = new Set(["text/plain", "text/markdown", "application/json", ""]);
const SUPPORTED_TEXT_FILE_EXTENSIONS = [".txt", ".md", ".markdown", ".json"];
const SUPPORTED_IMAGE_FILE_TYPES = new Set(["image/jpeg", "image/png"]);
const SUPPORTED_IMAGE_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export type ImportResumeState = { error?: string };

function isSupportedTextFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_TEXT_FILE_TYPES.has(file.type) || SUPPORTED_TEXT_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

function isSupportedImageFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_IMAGE_FILE_TYPES.has(file.type) || SUPPORTED_IMAGE_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

function getImageMimeType(file: File): "image/jpeg" | "image/png" | null {
  if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return "image/png";
  }
  return null;
}

async function readImportText(file: File | null, pastedText: string) {
  if (!file) return pastedText;

  if (isSupportedTextFile(file)) {
    if (file.size > MAX_TEXT_FILE_BYTES) {
      return { error: "File CV quá lớn. Vui lòng dùng file text dưới 256KB hoặc dán nội dung CV." };
    }
    return file.text();
  }

  if (isSupportedImageFile(file)) {
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      return { error: "Ảnh CV quá lớn. Vui lòng dùng ảnh JPG/PNG dưới 2MB." };
    }
    const mimeType = getImageMimeType(file);
    if (!mimeType) return { error: "Ảnh CV phải là JPG hoặc PNG." };
    if (!process.env.GEMINI_API_KEY) {
      return { error: "Import CV từ ảnh cần GEMINI_API_KEY để đọc chữ từ JPG/PNG." };
    }

    try {
      const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
      const extractedText = await extractResumeTextFromImage({ mimeType, base64Data });
      return [extractedText, pastedText].filter((text) => text.trim()).join("\n\n");
    } catch {
      return { error: "Không thể đọc chữ từ ảnh CV. Vui lòng thử ảnh rõ hơn hoặc dán nội dung CV vào ô text." };
    }
  }

  return { error: "Bản import hỗ trợ .txt, .md, .json, .jpg, .jpeg, .png hoặc nội dung copy từ PDF/DOCX." };
}

export async function importResumeAction(
  _previousState: ImportResumeState,
  formData: FormData
): Promise<ImportResumeState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "CANDIDATE");
  if (!principal) return { error: "Bạn không có quyền import CV." };

  const title = String(formData.get("title") ?? "");
  const pastedText = String(formData.get("resumeText") ?? "");
  const fileValue = formData.get("resumeFile");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const importedText = await readImportText(file, pastedText);
  if (typeof importedText !== "string") return importedText;

  try {
    const service = new ResumeService(new ResumeRepository());
    const resume = await service.createImportedResume(principal.id, title, importedText);
    revalidatePath("/my-cv");
    redirect(`/my-cv?id=${resume.id}`);
  } catch (error) {
    if (error instanceof ResumeValidationError) {
      return { error: error.issues[0]?.message ?? "Nội dung CV import không hợp lệ." };
    }
    throw error;
  }
}
