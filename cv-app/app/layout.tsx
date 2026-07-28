import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Lumina AI - Platform Quản lý CV & Tối ưu Nghề nghiệp Thông minh",
  description:
    "Nền tảng tạo CV, phân tích điểm ATS, tối ưu từ khóa nghề nghiệp và phỏng vấn mô phỏng với trí tuệ nhân tạo AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="bg-slate-50 text-slate-900 flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
