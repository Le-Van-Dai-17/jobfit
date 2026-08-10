import type { UserRole } from "@prisma/client";
import type { ReactNode } from "react";

import { CandidateMobileNav } from "./CandidateMobileNav";
import { RecruiterHeader } from "./RecruiterHeader";
import { RecruiterMobileNav } from "./RecruiterMobileNav";
import { RouteProgress } from "./RouteProgress";
import Header from "./Header";
import Sidebar, { type SidebarUser } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

export function AppShell({ children, user, companyName, createResume }: { children: ReactNode; user: SidebarUser & { role: UserRole }; companyName?: string | null; createResume?: (formData: FormData) => void | Promise<void> }) {
  if (user.role === "RECRUITER") {
    return (
      <SidebarProvider>
        <RouteProgress />
        <div className="flex min-h-screen w-full flex-col bg-surface-low">
          {/* We still keep the Sidebar for mobile. On desktop it's hidden by default for recruiter via its own classes, but we can just render it. */}
          <Sidebar user={user} companyName={companyName} />
          <RecruiterHeader userName={user.name || user.email} companyName={companyName} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 lg:px-10">
            {children}
          </main>
          <RecruiterMobileNav />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <RouteProgress />
      <div className="flex min-h-screen w-full bg-background">
        <div className="flex min-w-0 flex-1 flex-col">
          <Header role={user.role} user={user} createResume={createResume} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 lg:px-10 lg:py-8">{children}</main>
          {user.role === "CANDIDATE" ? <CandidateMobileNav /> : null}
        </div>
      </div>
    </SidebarProvider>
  );
}
