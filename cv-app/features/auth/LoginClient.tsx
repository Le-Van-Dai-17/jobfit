"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng.");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-high px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border-light bg-surface-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chào mừng đến với CV_<span className="gradient-text">KADA</span>
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Đăng nhập để tiếp tục hành trình ứng tuyển và tuyển dụng.
          </p>
        </div>

        <div className="space-y-4 pt-2 text-left">
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Email</span>
            <Input
              type="email"
              placeholder="Nhập email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Mật khẩu</span>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleLogin()}
            />
          </label>

          {error && <p className="text-sm font-medium text-error">{error}</p>}

          <button
            onClick={handleLogin}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <LogIn className="h-5 w-5" />
            Đăng nhập
          </button>

          <p className="pt-2 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
