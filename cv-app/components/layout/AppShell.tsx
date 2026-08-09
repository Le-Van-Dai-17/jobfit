import type { UserRole } from "@prisma/client";
import type { ReactNode } from "react";

import { CandidateMobileNav } from "./CandidateMobileNav";
import { RecruiterDesktopNav } from "./RecruiterDesktopNav";
import { RecruiterMobileNav } from "./RecruiterMobileNav";
import Header from "./Header";
import Sidebar, { type SidebarUser } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

export function AppShell({ children, user, companyName, createResume }: { children: ReactNode; user: SidebarUser & { role: UserRole }; companyName?: string | null; createResume?: (formData: FormData) => void | Promise<void> }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar user={user} companyName={companyName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header role={user.role} createResume={createResume} />
          {user.role === "RECRUITER" ? <RecruiterDesktopNav /> : null}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 lg:px-10 lg:py-8">{children}</main>
          {user.role === "CANDIDATE" ? <CandidateMobileNav /> : null}
          {user.role === "RECRUITER" ? <RecruiterMobileNav /> : null}
        </div>
      </div>
    </SidebarProvider>
  );
}
