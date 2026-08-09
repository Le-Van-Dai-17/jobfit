"use client";

import type { UserRole } from "@prisma/client";
import { LogOut, Sparkles, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { getNavItemsForRole } from "./navigation";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  role?: UserRole;
};

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ND"
  );
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
    const firstLink = asideRef.current?.querySelector<HTMLAnchorElement>("a[href]");
    firstLink?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        document.getElementById("mobile-menu-button")?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile, isOpen, setIsOpen]);

  function closeDrawer() {
    setIsOpen(false);
    if (isMobile) document.getElementById("mobile-menu-button")?.focus();
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
        />
      )}

      <aside
        aria-hidden={isMobile && !isOpen ? true : undefined}
        aria-modal={isMobile && isOpen ? true : undefined}
        id="app-sidebar"
        inert={isMobile && !isOpen ? true : undefined}
        ref={asideRef}
        role={isMobile ? "dialog" : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface-white border-r border-border-light shadow-xl transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border-light p-5">
          <div className="flex items-center gap-3">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                CV_<span className="gradient-text">KADA</span>
              </h1>
              <p className="text-xs font-medium text-text-muted">Recruiting MVP</p>
            </div>
          </div>
          <button
            aria-label="Đóng menu"
            className="rounded-lg p-2 text-text-muted hover:bg-surface-low md:hidden"
            onClick={closeDrawer}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Điều hướng chính">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Menu chính
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={closeDrawer}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-container/10 font-semibold text-primary shadow-sm"
                    : "text-text-muted hover:bg-surface-low hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted group-hover:bg-surface-container group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && <span className="h-5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-border-light p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-surface-container text-xs font-bold text-foreground shadow-sm">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">{displayName}</p>
            {user.role === "RECRUITER" ? (
              <p className="truncate text-[11px] font-medium text-primary" title={companyName ?? "Chưa thiết lập công ty"}>
                {companyName ?? "Chưa thiết lập công ty"}
              </p>
            ) : null}
            <p className="truncate text-[11px] text-text-muted">{user.role}</p>
          </div>
          <button
            aria-label="Đăng xuất"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error-container/20 hover:text-error"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
