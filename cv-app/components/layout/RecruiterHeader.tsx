"use client";

import { Bell, BriefcaseBusiness, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./navigation";
import { useSidebar } from "./SidebarContext";

type RecruiterHeaderProps = {
  userName?: string | null;
  companyName?: string | null;
};

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "R";
}

export function RecruiterHeader({ userName, companyName }: RecruiterHeaderProps) {
  const { toggle } = useSidebar();
  const pathname = usePathname();
  const items = getNavItemsForRole("RECRUITER");
  
  const displayName = userName || "Recruiter";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/60 bg-surface-white px-4 shadow-[0_1px_8px_rgb(0_0_0/0.04)] md:px-8">
      {/* Left: Logo & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Mở menu"
          onClick={toggle}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-surface-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/recruiter" className="flex items-center gap-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BriefcaseBusiness className="h-4 w-4" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight md:block">Jobfit</span>
        </Link>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-6">
        {items.map((item) => {
          const active = item.href === "/recruiter" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
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

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-text-muted hover:bg-surface-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {/* Unread badge placeholder */}
          {/* <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" /> */}
        </button>
        
        <div className="hidden h-8 w-px bg-outline-variant/60 md:block" />

        <div className="hidden items-center gap-3 text-right md:flex">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Nhà tuyển dụng</span>
            <span className="text-xs font-medium text-text-muted">{displayName}</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
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
    </header>
  );
}
