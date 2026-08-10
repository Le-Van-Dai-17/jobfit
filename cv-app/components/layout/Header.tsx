"use client";

import type { UserRole } from "@prisma/client";
import { BriefcaseBusiness, LogOut, Plus, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./navigation";
import { useSidebar } from "./SidebarContext";
import { type SidebarUser } from "./Sidebar";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ND";
}

export default function Header({ createResume, role, user }: { createResume?: (formData: FormData) => void | Promise<void>; role: UserRole; user: SidebarUser }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const items = getNavItemsForRole(role);
  const displayName = user.name || user.email || "Người dùng";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-outline-variant/60 bg-surface-white shadow-[0_1px_8px_rgb(0_0_0/0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-10">
        {/* Left: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
        {/* We keep the menu button for mobile just in case they need sidebar on mobile, though candidate uses bottom nav. */}
        {role !== "CANDIDATE" && (
          <button
            aria-label="Mở menu"
            onClick={toggle}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-surface-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link href={role === "RECRUITER" ? "/recruiter" : "/dashboard"} className="flex items-center gap-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BriefcaseBusiness className="h-4 w-4" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight md:block">CV_KADA</span>
        </Link>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-6">
        {items.map((item) => {
          const active = item.href === "/dashboard" || item.href === "/recruiter" ? pathname === item.href || pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "text-primary" : "text-text-muted hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right: Action & Profile */}
      <div className="flex items-center gap-4">
        {role === "CANDIDATE" && createResume ? (
          <form action={createResume} className="hidden sm:block">
            <input type="hidden" name="title" value={`CV mới ${new Date().toLocaleDateString("vi-VN")}`} />
            <Button type="submit" size="sm" className="rounded-lg bg-primary text-white">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              <span>Tạo CV mới</span>
            </Button>
          </form>
        ) : null}
        
        <div className="hidden h-8 w-px bg-outline-variant/60 md:block" />

        <div className="hidden items-center gap-3 text-right md:flex">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{role === "CANDIDATE" ? "Ứng viên" : "Nhà tuyển dụng"}</span>
            <span className="text-xs font-medium text-text-muted">{displayName}</span>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
            {getInitials(displayName)}
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full p-2 text-text-muted hover:bg-error-container hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ml-2"
          title="Đăng xuất"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
      </div>
    </header>
  );
}
