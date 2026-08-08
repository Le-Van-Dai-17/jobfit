import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { auth } from "@/auth";
import { PrismaCompanyRepository } from "@/features/companies/repositories/company.repository";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

import { SidebarProvider } from "@/components/layout/SidebarContext";

export const metadata: Metadata = {
  title: "CV_KADA - Platform Quản lý CV & Tối ưu Nghề nghiệp Thông minh",
  description:
    "Trình tạo CV, tối ưu ATS, phân tích Job Match bằng AI và quản lý quá trình ứng tuyển.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let companyName: string | null = null;
  if (session?.user?.role === "RECRUITER") {
    const membership = await new PrismaCompanyRepository().findMembership(session.user.id);
    companyName = membership?.company.name ?? null;
  }

  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="bg-background text-foreground flex min-h-screen font-sans">
        {session?.user ? (
          <SidebarProvider>
            <Sidebar user={session.user} companyName={companyName} />
            <div className="flex-1 flex flex-col min-w-0">
              <Header role={session.user.role} />
              <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
            </div>
          </SidebarProvider>
        ) : (
          <main className="min-h-screen w-full">{children}</main>
        )}
      </body>
    </html>
  );
}
