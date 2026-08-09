"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, ClipboardCheck, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  ["Tổng quan", "/recruiter", LayoutDashboard], ["Vị trí", "/recruiter/jobs", Briefcase],
  ["Ứng viên", "/recruiter/candidates", Users], ["Đánh giá", "/recruiter/assessments", ClipboardCheck],
  ["Công ty", "/recruiter/company", Building2],
] as const;
export function RecruiterMobileNav() {
  const pathname = usePathname();
  return <nav aria-label="Điều hướng nhà tuyển dụng" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-outline-variant/60 bg-white/95 px-1 py-2 backdrop-blur md:hidden">{items.map(([name,href,Icon]) => {
    const active = href === "/recruiter" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} aria-label={name} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[10px] font-medium focus-visible:ring-2 focus-visible:ring-primary", active ? "text-primary" : "text-text-muted")}><Icon className="h-5 w-5" /><span className="truncate">{name}</span></Link>;
  })}</nav>;
}
