import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="bg-background text-foreground flex min-h-screen font-sans">
        <SidebarProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
