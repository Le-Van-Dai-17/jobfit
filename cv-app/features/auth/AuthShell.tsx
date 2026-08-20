import { BriefcaseBusiness, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthShellProps = { active: "login" | "register"; children: ReactNode };

export function AuthShell({ active, children }: AuthShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="relative z-20 h-16 border-b border-outline-variant/40 bg-surface-white/80 shadow-[0_1px_8px_rgb(0_0_0/0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 lg:px-10">
          <Link href="/login" className="flex items-center gap-2 rounded-lg text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-fixed" aria-hidden="true">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Jobfit</span>
          </Link>
          <nav aria-label="Tài khoản" className="hidden items-center gap-6 text-sm md:flex">
            <AuthLink href="/login" active={active === "login"}>Đăng nhập</AuthLink>
            <AuthLink href="/register" active={active === "register"}>Tạo tài khoản</AuthLink>
          </nav>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white md:hidden" aria-hidden="true">
            <UserRound className="h-5 w-5" />
          </span>
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:py-16">
        <div className="pointer-events-none absolute -left-48 top-1/4 h-[520px] w-[520px] rounded-full bg-primary-fixed/55 blur-3xl" />
        <div className="pointer-events-none absolute -right-48 bottom-0 h-[520px] w-[520px] rounded-full bg-secondary-container/25 blur-3xl" />
        <div className="relative z-10 w-full">{children}</div>
      </main>
      <footer className="border-t border-outline-variant/30 bg-surface-low px-4 py-5 text-center text-xs text-text-muted">
        © {currentYear} Jobfit. Nền tảng tuyển dụng chuyên nghiệp.
      </footer>
    </div>
  );
}

function AuthLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-1 py-2 font-medium text-text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active && "font-semibold text-primary"
      )}
    >
      {children}
    </Link>
  );
}
