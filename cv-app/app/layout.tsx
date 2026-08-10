import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { PrismaCompanyRepository } from "@/features/companies/repositories/company.repository";
import { createResumeAction } from "@/features/my-cv/actions/create-resume";

const beVietnamPro = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], variable: "--font-be-vietnam-pro", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "CV_KADA - Platform Quản lý CV & Tối ưu Nghề nghiệp Thông minh",
  description: "Trình tạo CV, tối ưu ATS, phân tích Job Match bằng AI và quản lý quá trình ứng tuyển.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  let companyName: string | null = null;
  if (session?.user?.role === "RECRUITER") {
    const membership = await new PrismaCompanyRepository().findMembership(session.user.id);
    companyName = membership?.company.name ?? null;
  }

  async function createResumeFromHeader(formData: FormData) {
    "use server";
    await createResumeAction({}, formData);
  }

  return (
    <html lang="vi" className={`h-full antialiased ${beVietnamPro.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {session?.user ? <AppShell user={session.user} companyName={companyName} createResume={createResumeFromHeader}>{children}</AppShell> : children}
        <ToastContainer />
      </body>
    </html>
  );
}
