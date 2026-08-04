"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Sparkles, LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function LoginClient() {
  const [email, setEmail] = useState("demo@cvkada.com");
  const [password, setPassword] = useState("123456");
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
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-surface-white p-8 shadow-xl border border-border-light text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Chào mừng đến với CV_<span className="gradient-text">KADA</span>
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Đăng nhập để tạo CV chuyên nghiệp và theo dõi ứng tuyển
          </p>
        </div>

        <div className="space-y-4 pt-2 text-left">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Mật khẩu</label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 h-12 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            Đăng nhập
          </button>

          <p className="text-xs text-center text-slate-500 pt-2">
            Demo: email <strong className="text-slate-700">demo@cvkada.com</strong> / mật khẩu <strong className="text-slate-700">123456</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
