"use client";

import { Download } from "lucide-react";

type ExportData = {
  name: string;
  email: string;
  cvMatch: number;
  techScore: number;
  totalScore: number;
  status: string;
}[];

export function ExportCsvButton({ data, jobTitle }: { data: ExportData; jobTitle?: string }) {
  const handleExport = () => {
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const headers = ["Candidate Name", "Email", "CV Match Score", "Tech Assessment Score", "Total Score", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...data.map(row => [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.email}"`,
        row.cvMatch,
        row.techScore,
        row.totalScore,
        `"${row.status}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const safeTitle = (jobTitle || "leaderboard").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.download = `candidates_${safeTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#4648D4] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4648D4] focus:ring-offset-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
