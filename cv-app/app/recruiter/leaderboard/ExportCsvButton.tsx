"use client";

import { Download } from "lucide-react";

type ExportData = {
  name: string;
  email: string;
  cvMatch: number | null;
  status: string;
  updatedAt: string;
}[];

const statusLabels: Record<string, string> = {
  APPLIED: "Mới ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút hồ sơ",
};

export function ExportCsvButton({ data, jobTitle }: { data: ExportData; jobTitle?: string }) {
  const handleExport = () => {
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const headers = ["Tên ứng viên", "Email", "Độ khớp CV/JD", "Trạng thái", "Cập nhật"];

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [
          `"${row.name.replace(/"/g, '""')}"`,
          `"${row.email.replace(/"/g, '""')}"`,
          row.cvMatch === null ? `"Chưa có điểm"` : row.cvMatch,
          `"${statusLabels[row.status] ?? row.status}"`,
          `"${row.updatedAt}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const safeTitle = (jobTitle || "ung_vien").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.download = `ung_vien_${safeTitle}_${new Date().toISOString().split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-surface-low px-4 py-2.5 text-sm font-semibold text-primary shadow-sm outline-none hover:bg-outline-variant focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Download className="h-4 w-4" />
      Xuất CSV
    </button>
  );
}
