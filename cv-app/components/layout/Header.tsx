"use client";

import { Search, Bell, Sparkles, Plus, CheckCircle2, Menu } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-surface-white/90 backdrop-blur-md border-b border-border-light px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Mobile Hamburger Menu */}
      <div className="flex items-center gap-2 md:hidden">
        <button 
          onClick={toggle}
          className="p-2 -ml-2 text-text-muted hover:text-foreground rounded-lg hover:bg-surface-low transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-[200px] md:max-w-md relative hidden sm:block ml-4 md:ml-0">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm công việc, kỹ năng..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-surface-low border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 sm:hidden"></div>

      {/* Actions & Notifications */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200/60 rounded-full text-xs text-green-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          <span>ATS Engine Online</span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/my-cv"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo CV mới</span>
        </Link>
        
        {/* Mobile Quick Action */}
        <Link
          href="/my-cv"
          className="sm:hidden p-2 text-primary bg-primary-container/10 rounded-lg hover:bg-primary-container/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Link>

        <Link
          href="/job-optimization"
          className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-semibold transition-all border border-transparent"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Tối ưu AI</span>
        </Link>

        {/* Notification Icon */}
        <button className="p-2 text-text-muted hover:text-foreground hover:bg-surface-low rounded-xl transition-colors relative ml-1 md:ml-0">
          <Bell className="w-5 h-5 md:w-4 md:h-4" />
          <span className="w-2 h-2 bg-error rounded-full absolute top-1.5 right-1.5 border border-white" />
        </button>
      </div>
    </header>
  );
}
