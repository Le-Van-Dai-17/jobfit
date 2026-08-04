"use client";

import { signIn } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginClient() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-high px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-surface-white p-8 shadow-xl border border-border-light text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Chào mừng đến với Lumina <span className="gradient-text">AI</span>
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Đăng nhập để tạo CV chuyên nghiệp và theo dõi ứng tuyển
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-12 text-base font-medium"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            {/* Simple Google SVG Icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4" />
            </svg>
            Tiếp tục với Google
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-12 text-base font-medium"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Tiếp tục với GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
