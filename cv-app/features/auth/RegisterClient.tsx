"use client";

import { Building2, Eye, EyeOff, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";

import { Input } from "@/components/ui/Input";
import { registerAction } from "./actions/register";

export default function RegisterClient() {
  const [state, formAction, pending] = useActionState(registerAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <form
        action={formAction}
        className="w-full max-w-2xl space-y-5 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm sm:p-8"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Tạo tài khoản CV_KADA</h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-text-muted">
            Chọn đúng vai trò để vào luồng ứng viên hoặc nhà tuyển dụng.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Họ tên</span>
            <Input name="name" autoComplete="name" disabled={pending} required />
          </label>

          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Email</span>
            <Input name="email" type="email" autoComplete="email" disabled={pending} required />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Mật khẩu"
            name="password"
            show={showPassword}
            disabled={pending}
            onToggle={() => setShowPassword((value) => !value)}
          />
          <PasswordField
            label="Xác nhận mật khẩu"
            name="passwordConfirmation"
            show={showConfirmation}
            disabled={pending}
            onToggle={() => setShowConfirmation((value) => !value)}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">Vai trò</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <RoleCard
              value="CANDIDATE"
              title="Ứng viên"
              description="Quản lý CV, ứng tuyển và làm bài đánh giá."
              icon={<UserRound className="h-5 w-5" />}
              defaultChecked
              disabled={pending}
            />
            <RoleCard
              value="RECRUITER"
              title="Nhà tuyển dụng"
              description="Đăng vị trí, theo dõi ứng viên và xem báo cáo."
              icon={<Building2 className="h-5 w-5" />}
              disabled={pending}
            />
          </div>
        </fieldset>

        {state.error ? (
          <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>

        <p className="text-center text-sm text-text-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}

function PasswordField({
  label,
  name,
  show,
  disabled,
  onToggle,
}: {
  label: string;
  name: string;
  show: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <div className="relative">
        <Input
          name={name}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          disabled={disabled}
          required
          minLength={12}
          className="pr-11"
        />
        <button
          type="button"
          aria-label={show ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          aria-pressed={show}
          disabled={disabled}
          onClick={onToggle}
          className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted outline-none hover:bg-surface-low hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

function RoleCard({
  value,
  title,
  description,
  icon,
  defaultChecked = false,
  disabled,
}: {
  value: "CANDIDATE" | "RECRUITER";
  title: string;
  description: string;
  icon: ReactNode;
  defaultChecked?: boolean;
  disabled: boolean;
}) {
  return (
    <label className="group relative flex cursor-pointer gap-3 rounded-xl border border-border-light bg-surface-white p-4 text-sm outline-none transition-colors has-[:checked]:border-primary has-[:checked]:bg-surface-low has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-low text-primary group-has-[:checked]:bg-primary group-has-[:checked]:text-white">
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="mt-1 block leading-5 text-text-muted">{description}</span>
      </span>
    </label>
  );
}
