import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-outline-variant/60 bg-surface-white shadow-[0_1px_8px_rgb(0_0_0/0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BriefcaseBusiness className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Jobfit</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Đăng nhập
          </Link>
          <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}
