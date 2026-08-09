"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { PrismaCompanyRepository } from "../repositories/company.repository";
import { CompanyAccessError, CompanyService, CompanyValidationError } from "../services/company.service";

export type CompanyOnboardingState = {
  error?: string;
};

export async function onboardCompanyAction(
  _previousState: CompanyOnboardingState,
  formData: FormData
): Promise<CompanyOnboardingState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "RECRUITER");
  if (!principal) {
    return { error: "Bạn không có quyền tạo công ty tuyển dụng." };
  }

  const service = new CompanyService(new PrismaCompanyRepository());
  try {
    await service.onboardRecruiterCompany(principal.id, {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      website: String(formData.get("website") ?? ""),
      description: String(formData.get("description") ?? ""),
      location: String(formData.get("location") ?? ""),
    });
  } catch (error) {
    if (error instanceof CompanyValidationError) {
      return { error: error.issues[0]?.message ?? "Thông tin công ty không hợp lệ." };
    }
    if (error instanceof CompanyAccessError) {
      return { error: "Không thể tạo công ty với tài khoản này." };
    }
    throw error;
  }

  revalidatePath("/recruiter");
  redirect("/recruiter");
}

export async function updateCompanySettingsAction(
  _previousState: CompanyOnboardingState,
  formData: FormData
): Promise<CompanyOnboardingState> {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "RECRUITER");
  if (!principal) {
    return { error: "Ban khong co quyen cap nhat cong ty tuyen dung." };
  }

  const service = new CompanyService(new PrismaCompanyRepository());
  try {
    await service.updateRecruiterCompany(principal.id, {
      name: String(formData.get("name") ?? ""),
      website: String(formData.get("website") ?? ""),
      description: String(formData.get("description") ?? ""),
      location: String(formData.get("location") ?? ""),
    });
  } catch (error) {
    if (error instanceof CompanyValidationError) {
      return { error: error.issues[0]?.message ?? "Thong tin cong ty khong hop le." };
    }
    if (error instanceof CompanyAccessError) {
      return { error: "Khong the cap nhat cong ty voi tai khoan nay." };
    }
    throw error;
  }

  revalidatePath("/recruiter/company");
  revalidatePath("/recruiter");
  return {};
}
