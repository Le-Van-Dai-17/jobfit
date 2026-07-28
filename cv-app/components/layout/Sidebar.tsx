"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronRight
} from "lucide-react";

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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-40 shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
            Lumina <span className="gradient-text">AI</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Career & Resume Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu chính
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 truncate">{item.name}</span>
              {isActive && (
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant Widget */}
      <div className="p-4 m-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/80">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-indigo-900">ATS Optimizer</span>
        </div>
        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          CV của bạn đã sẵn sàng tối ưu với điểm <span className="font-bold text-indigo-700">88/100</span>!
        </p>
        <Link
          href="/job-optimization"
          className="flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>Tối ưu ngay</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* User Profile Badge */}
      <div className="p-3 border-t border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-indigo-500 flex items-center justify-center font-bold text-slate-700 text-xs shadow-xs">
          VN
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">Vũ Nguyễn</p>
          <p className="text-[11px] text-slate-500 truncate">Senior Frontend Developer</p>
        </div>
      </div>
    </aside>
  );
}
