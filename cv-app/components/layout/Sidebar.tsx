"use client";

import type { UserRole } from "@prisma/client";
import { BriefcaseBusiness, LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./navigation";
import { useSidebar } from "./SidebarContext";

export type SidebarUser = { name?: string | null; email?: string | null; role?: UserRole };

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ND";
}

export default function Sidebar({ user, companyName }: { user: SidebarUser; companyName?: string | null }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const asideRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const navItems = getNavItemsForRole(user.role);
  const displayName = user.name || user.email || "Người dùng";

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const sidebar = asideRef.current;
    const focusable = sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])');
    focusable?.[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        document.getElementById("mobile-menu-button")?.focus();
      }
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile, isOpen, setIsOpen]);

  function closeDrawer() {
    setIsOpen(false);
    if (isMobile) document.getElementById("mobile-menu-button")?.focus();
  }

  return (
    <>
      {isOpen ? <button type="button" aria-label="Đóng menu" className="fixed inset-0 z-40 bg-foreground/45 backdrop-blur-sm md:hidden" onClick={closeDrawer} /> : null}
      <aside aria-hidden={isMobile && !isOpen ? true : undefined} aria-modal={isMobile && isOpen ? true : undefined} id="app-sidebar" inert={isMobile && !isOpen ? true : undefined} ref={asideRef} role={isMobile ? "dialog" : undefined} className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant/60 bg-surface-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-none", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-outline-variant/60 px-5">
          <Link href={user.role === "RECRUITER" ? "/recruiter" : "/dashboard"} onClick={closeDrawer} className="flex items-center gap-3 rounded-lg text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed"><BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /></span>
            <span><span className="block text-lg font-bold tracking-tight">CV_KADA</span><span className="block text-[11px] font-medium text-text-muted">Career Hub</span></span>
          </Link>
          <button type="button" aria-label="Đóng menu" className="rounded-lg p-2 text-text-muted hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden" onClick={closeDrawer}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Điều hướng chính">
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-outline">Menu chính</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/recruiter" || item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} onClick={closeDrawer} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", isActive ? "bg-primary-fixed text-primary" : "text-text-muted hover:bg-surface-low hover:text-foreground")}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="flex-1 truncate">{item.name}</span>{isActive ? <span className="h-5 w-1 rounded-full bg-primary" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-outline-variant/60 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{getInitials(displayName)}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{displayName}</p>{user.role === "RECRUITER" ? <p className="truncate text-xs font-medium text-primary" title={companyName ?? "Chưa thiết lập công ty"}>{companyName ?? "Chưa thiết lập công ty"}</p> : null}<p className="truncate text-xs text-text-muted">{user.role === "CANDIDATE" ? "Ứng viên" : user.role === "RECRUITER" ? "Nhà tuyển dụng" : "Quản trị"}</p></div>
          <button type="button" aria-label="Đăng xuất" onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-lg p-2 text-text-muted hover:bg-error-container hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Đăng xuất"><LogOut className="h-4 w-4" /></button>
        </div>
      </aside>
    </>
  );
}
