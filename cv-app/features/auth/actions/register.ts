"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { PrismaAuthUserRepository } from "../repositories/auth.repository";
import { AuthService, DuplicateEmailError, RegistrationValidationError } from "../services/auth.service";

export type RegisterActionState = {
  error?: string;
};

export async function registerAction(
  _previousState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const service = new AuthService(new PrismaAuthUserRepository());
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await service.register({
      name: String(formData.get("name") ?? ""),
      email,
      password,
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
      role: String(formData.get("role") ?? ""),
    });
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof RegistrationValidationError) {
      return { error: error.issues[0]?.message ?? "Thông tin đăng ký không hợp lệ." };
    }
    if (error instanceof DuplicateEmailError) {
      return { error: "Email này đã được đăng ký." };
    }
    if (error instanceof AuthError) {
      return { error: "Tài khoản đã tạo nhưng đăng nhập tự động thất bại. Vui lòng đăng nhập." };
    }
    throw error;
  }

  redirect("/login");
}
