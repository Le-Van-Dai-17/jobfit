"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./navigation";

export function RecruiterDesktopNav() {
  const pathname = usePathname();
  const items = getNavItemsForRole("RECRUITER");

  return (
    <nav aria-label="Điều hướng nhà tuyển dụng" className="hidden border-b border-outline-variant/60 bg-surface-white px-10 py-2 md:block">
      <div className="mx-auto flex max-w-7xl gap-2">
        {items.map((item) => {
          const active = item.href === "/recruiter" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-primary-fixed text-primary" : "text-text-muted hover:bg-surface-low hover:text-foreground")}>
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
