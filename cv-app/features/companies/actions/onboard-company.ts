"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import { PrismaCompanyRepository } from "../repositories/company.repository";
import { CompanyAccessError, CompanyService, CompanyValidationError } from "../services/company.service";
import type { CompanyIndustry, CompanySize } from "@prisma/client";

export type CompanyOnboardingState = { error?: string; success?: boolean };
const field = (formData: FormData, name: string) => String(formData.get(name) ?? "");
function companyFields(formData: FormData) {
  return {
    name: field(formData, "name"), website: field(formData, "website"),
    description: field(formData, "description"), location: field(formData, "location"),
    industry: (field(formData, "industry") || undefined) as CompanyIndustry | undefined,
    size: (field(formData, "size") || undefined) as CompanySize | undefined,
  };
}
function errorState(error: unknown): CompanyOnboardingState {
  if (error instanceof CompanyValidationError) return { error: error.issues[0]?.message ?? "Thông tin công ty không hợp lệ." };
  if (error instanceof CompanyAccessError) return { error: "Không thể cập nhật công ty với tài khoản này." };
  throw error;
}

export async function onboardCompanyAction(_state: CompanyOnboardingState, formData: FormData): Promise<CompanyOnboardingState> {
  const principal = await requireActiveRole((await auth())?.user, "RECRUITER");
  if (!principal) return { error: "Bạn không có quyền tạo công ty tuyển dụng." };
  try {
    await new CompanyService(new PrismaCompanyRepository()).onboardRecruiterCompany(principal.id, {
      ...companyFields(formData), slug: field(formData, "slug"),
    });
  } catch (error) { return errorState(error); }
  revalidatePath("/recruiter");
  redirect("/recruiter");
}

export async function updateCompanySettingsAction(_state: CompanyOnboardingState, formData: FormData): Promise<CompanyOnboardingState> {
  const principal = await requireActiveRole((await auth())?.user, "RECRUITER");
  if (!principal) return { error: "Bạn không có quyền cập nhật công ty tuyển dụng." };
  try {
    await new CompanyService(new PrismaCompanyRepository()).updateRecruiterCompany(principal.id, companyFields(formData));
  } catch (error) { return errorState(error); }
  revalidatePath("/recruiter/company");
  revalidatePath("/recruiter");
  return { success: true };
}
