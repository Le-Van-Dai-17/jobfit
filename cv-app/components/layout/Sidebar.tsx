"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Target,
  Briefcase,
  Bot,
  KanbanSquare,
  User,
  Zap,
  ChevronRight,
  X,
  LogOut
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "CV của tôi", href: "/my-cv", icon: FileText },
  { name: "Tối ưu CV theo Job", href: "/job-optimization", icon: Sparkles },
  { name: "Phân tích Job Match", href: "/job-match", icon: Target },
  { name: "Tìm việc phù hợp", href: "/jobs", icon: Briefcase },
  { name: "Phỏng vấn mô phỏng AI", href: "/interview", icon: Bot },
  { name: "Theo dõi ứng tuyển", href: "/tracker", icon: KanbanSquare },
  { name: "Hồ sơ nghề nghiệp", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface-white border-r border-border-light shadow-xl transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight tracking-tight">
                Lumina <span className="gradient-text">AI</span>
              </h1>
              <p className="text-xs text-text-muted font-medium">Career & Resume Platform</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            className="md:hidden p-2 text-text-muted hover:bg-surface-low rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Menu chính
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary-container/10 text-primary shadow-sm font-semibold"
                    : "text-text-muted hover:bg-surface-low hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted group-hover:text-foreground group-hover:bg-surface-container"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Widget */}
        <div className="p-4 m-3 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary text-white rounded-lg shadow-sm">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-primary">ATS Optimizer</span>
          </div>
          <p className="text-xs text-text-muted mb-3 leading-relaxed">
            CV của bạn đã sẵn sàng tối ưu với điểm <span className="font-bold text-primary">88/100</span>!
          </p>
          <Link
            href="/job-optimization"
            className="flex items-center justify-between text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Tối ưu ngay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* User Profile Badge + Sign Out */}
        <div className="p-3 border-t border-border-light flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container border-2 border-primary flex items-center justify-center font-bold text-foreground text-xs shadow-sm">
            VN
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Vũ Nguyễn</p>
            <p className="text-[11px] text-text-muted truncate">Senior Frontend Developer</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-text-muted hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

