"use client";

import { ArrowRight, Building2, Eye, EyeOff, Info, LockKeyhole, Mail, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "./AuthShell";
import { registerAction } from "./actions/register";

export default function RegisterClient() {
  const [state, formAction, pending] = useActionState(registerAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <AuthShell active="register">
      <Card className="mx-auto w-full max-w-[520px] border-outline-variant/50 p-6 shadow-[0_20px_40px_-15px_rgb(0_0_0/0.1),0_1px_3px_rgb(0_0_0/0.08)] max-sm:border-0 max-sm:bg-transparent max-sm:shadow-none sm:p-10">
        <form action={formAction} className="space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-primary-container text-white shadow-md shadow-primary/20">
              <UserPlus className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-10">Tạo tài khoản mới</h1>
            <p className="mt-2 text-sm text-text-muted sm:text-base">Bắt đầu hành trình nghề nghiệp của bạn cùng CV_KADA.</p>
          </div>

          <fieldset>
            <legend className="sr-only">Vai trò</legend>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1.5">
              <RoleChoice value="CANDIDATE" title="Ứng viên" icon={<UserRound className="h-5 w-5" />} defaultChecked disabled={pending} />
              <RoleChoice value="RECRUITER" title="Nhà tuyển dụng" icon={<Building2 className="h-5 w-5" />} disabled={pending} />
            </div>
          </fieldset>

          <div className="space-y-3">
            <Field label="Họ và tên" icon={<UserRound />}><Input name="name" autoComplete="name" placeholder="Họ và tên" disabled={pending} required className="pl-11" /></Field>
            <Field label="Email" icon={<Mail />}><Input name="email" type="email" autoComplete="email" placeholder="Email đăng nhập" disabled={pending} required className="pl-11" /></Field>
            <PasswordField label="Mật khẩu" name="password" show={showPassword} disabled={pending} onToggle={() => setShowPassword((value) => !value)} />
            <PasswordField label="Xác nhận mật khẩu" name="passwordConfirmation" show={showConfirmation} disabled={pending} onToggle={() => setShowConfirmation((value) => !value)} />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-surface-low p-3 text-sm text-text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>Mật khẩu phải có ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường và số.</p>
          </div>

          {state.error ? <p role="alert" className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}

          <Button type="submit" size="lg" isLoading={pending} className="w-full text-base font-semibold">
            {pending ? "Đang tạo tài khoản..." : <>Đăng ký tài khoản <ArrowRight className="h-5 w-5" aria-hidden="true" /></>}
          </Button>
          <p className="text-center text-sm text-text-muted">Đã có tài khoản?{" "}<Link href="/login" className="rounded-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Đăng nhập ngay</Link></p>
        </form>
      </Card>
    </AuthShell>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return <label className="block space-y-1 text-sm font-medium text-foreground"><span className="sr-only">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-muted [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">{icon}</span>{children}</span></label>;
}

function PasswordField({ label, name, show, disabled, onToggle }: { label: string; name: string; show: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <label className="block space-y-1 text-sm font-medium text-foreground">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <Input name={name} type={show ? "text" : "password"} autoComplete="new-password" placeholder={label} disabled={disabled} required minLength={12} className="pl-11 pr-12" />
        <button type="button" aria-label={show ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`} aria-pressed={show} disabled={disabled} onClick={onToggle} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
          {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </span>
    </label>
  );
}

function RoleChoice({ value, title, icon, defaultChecked = false, disabled }: { value: "CANDIDATE" | "RECRUITER"; title: string; icon: ReactNode; defaultChecked?: boolean; disabled: boolean }) {
  return (
    <label className="relative cursor-pointer rounded-md text-sm font-medium text-text-muted has-[:checked]:bg-surface-white has-[:checked]:text-primary has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
      <input type="radio" name="role" value={value} defaultChecked={defaultChecked} disabled={disabled} className="peer sr-only" />
      <span className="flex min-h-10 items-center justify-center gap-2 px-2 py-2">{icon}<span>{title}</span></span>
    </label>
  );
}
