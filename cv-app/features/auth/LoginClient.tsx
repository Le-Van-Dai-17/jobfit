"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "./AuthShell";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (isPending) return;
    setError("");
    setIsPending(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Không thể đăng nhập lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthShell active="login">
      <Card className="mx-auto w-full max-w-[420px] border-outline-variant/50 p-6 shadow-[0_20px_40px_-15px_rgb(0_0_0/0.08),0_1px_3px_rgb(0_0_0/0.08)] sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary shadow-inner">
            <LockKeyhole className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-10">Đăng nhập</h1>
          <p className="mt-2 text-sm text-text-muted">Chào mừng bạn quay lại với CV_KADA</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <label className="block space-y-1.5 text-sm font-medium text-foreground">
            <span>Email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" aria-hidden="true" />
              <Input type="email" placeholder="Nhập địa chỉ email" value={email} autoComplete="email" disabled={isPending} required className="pl-10" onChange={(event) => setEmail(event.target.value)} />
            </span>
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-foreground">
            <span>Mật khẩu</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" aria-hidden="true" />
              <Input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" value={password} autoComplete="current-password" disabled={isPending} required className="pl-10 pr-12" onChange={(event) => setPassword(event.target.value)} />
              <button type="button" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword} disabled={isPending} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-outline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          {error ? <p role="alert" className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{error}</p> : null}

          <Button type="submit" size="lg" isLoading={isPending} disabled={!email || !password} className="mt-2 w-full text-base font-semibold">
            {isPending ? "Đang đăng nhập..." : <>Đăng nhập <ArrowRight className="h-5 w-5" aria-hidden="true" /></>}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="rounded-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Đăng ký ngay</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
