"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { registerAction } from "./actions/register";

export default function RegisterClient() {
  const [state, formAction, pending] = useActionState(registerAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-high px-4 py-10">
      <form
        action={formAction}
        className="w-full max-w-lg space-y-5 rounded-2xl border border-border-light bg-surface-white p-6 shadow-xl"
      >
        <div className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Đăng ký CV_KADA</h1>
          <p className="text-sm text-text-muted">Tạo tài khoản ứng viên hoặc nhà tuyển dụng.</p>
        </div>

        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Họ tên</span>
          <Input name="name" autoComplete="name" required />
        </label>

        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Email</span>
          <Input name="email" type="email" autoComplete="email" required />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Mật khẩu</span>
            <Input name="password" type="password" autoComplete="new-password" required minLength={12} />
          </label>
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Xác nhận mật khẩu</span>
            <Input
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
            />
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-foreground">Vai trò</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border-light p-3 text-sm">
              <input type="radio" name="role" value="CANDIDATE" defaultChecked className="h-4 w-4" />
              Ứng viên
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border-light p-3 text-sm">
              <input type="radio" name="role" value="RECRUITER" className="h-4 w-4" />
              Nhà tuyển dụng
            </label>
          </div>
        </fieldset>

        {state.error && <p className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>

        <p className="text-center text-sm text-text-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
