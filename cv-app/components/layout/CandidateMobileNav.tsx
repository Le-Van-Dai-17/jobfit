"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./navigation";

export function CandidateMobileNav() {
  const pathname = usePathname();
  const items = getNavItemsForRole("CANDIDATE");

  return (
    <nav
      aria-label="Điều hướng ứng viên trên di động"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgb(0_0_0_/_0.05)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {items.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/" || pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "text-primary" : "text-text-muted hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
