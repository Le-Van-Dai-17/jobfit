"use client";

import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Input } from "@/components/ui/Input";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (isPending) return;
    setError("");
    setIsPending(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

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
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border-light bg-surface-white p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <Sparkles className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Đăng nhập CV_KADA</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Tiếp tục quản lý CV, ứng tuyển và đánh giá kỹ thuật.
          </p>
        </div>

        <div className="space-y-4 pt-2 text-left">
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Email</span>
            <Input
              type="email"
              placeholder="ban@example.com"
              value={email}
              autoComplete="email"
              disabled={isPending}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Mật khẩu</span>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                autoComplete="current-password"
                disabled={isPending}
                required
                className="pr-11"
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
                disabled={isPending}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted outline-none hover:bg-surface-low hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? (
            <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            disabled={isPending || !email || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" />
            {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="pt-2 text-center text-sm text-text-muted">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
