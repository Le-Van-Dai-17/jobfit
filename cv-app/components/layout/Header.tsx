"use client";

import { Search, Bell, Sparkles, Plus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm công việc, vị trí, hoặc kỹ năng AI..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Actions & Notifications */}
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>ATS Engine Online</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/my-cv"
          className="flex items-center gap-2 px-3.5 py-2 gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow-indigo-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo CV mới</span>
        </Link>

        <Link
          href="/job-optimization"
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-xl text-xs font-semibold transition-all border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tối ưu AI</span>
        </Link>

        {/* Notification Icon */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-indigo-600 rounded-full absolute top-1.5 right-1.5 border border-white" />
        </button>
      </div>
    </header>
  );
}
