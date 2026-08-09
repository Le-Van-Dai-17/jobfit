"use client";

import type { UserRole } from "@prisma/client";
import { Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { getNavItemsForRole } from "./navigation";
import { useSidebar } from "./SidebarContext";

export default function Header({ createResume, role }: { createResume?: (formData: FormData) => void | Promise<void>; role: UserRole }) {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();
  const current = [...getNavItemsForRole(role)].sort((a, b) => b.href.length - a.href.length).find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/60 bg-surface-white/95 px-4 shadow-[0_1px_8px_rgb(0_0_0/0.04)] backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button aria-controls="app-sidebar" aria-expanded={isOpen} aria-label="Mở menu" id="mobile-menu-button" onClick={toggle} className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-surface-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="truncate text-base font-semibold text-foreground md:text-lg">{current?.name ?? "CV_KADA"}</p>
      </div>
      <div className="flex items-center gap-3">
        {role === "CANDIDATE" && createResume ? (
          <form action={createResume} className="hidden sm:block">
            <input type="hidden" name="title" value={`CV mới ${new Date().toLocaleDateString("vi-VN")}`} />
            <Button type="submit" size="md" className="rounded-lg bg-primary text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tạo CV mới</span>
            </Button>
          </form>
        ) : null}
        <span className="hidden rounded-full bg-primary-fixed px-3 py-1.5 text-xs font-medium text-primary sm:inline">{role === "RECRUITER" ? "Nhà tuyển dụng" : role === "CANDIDATE" ? "Ứng viên" : "Quản trị"}</span>
      </div>
    </header>
  );
}
