"use client";

import type { UserRole } from "@prisma/client";
import { Menu, Plus } from "lucide-react";

import { useSidebar } from "./SidebarContext";

export default function Header({
  createResume,
  role,
}: {
  createResume?: (formData: FormData) => void | Promise<void>;
  role: UserRole;
}) {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-light bg-surface-white/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <button
          aria-controls="app-sidebar"
          aria-expanded={isOpen}
          aria-label="Mo menu"
          id="mobile-menu-button"
          onClick={toggle}
          className="-ml-2 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-low hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 justify-end">
        {role === "CANDIDATE" && createResume ? (
          <form action={createResume} className="hidden sm:block">
            <input type="hidden" name="title" value={`CV moi ${new Date().toLocaleDateString("vi-VN")}`} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tao CV moi</span>
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
