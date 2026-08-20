"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Search } from "lucide-react";
import Link from "next/link";

export type AppData = {
  id: string;
  name: string;
  email: string;
  cvMatch: number | null;
  status: string;
  updatedAt: string;
};

interface LeaderboardClientProps {
  initialCandidates: AppData[];
}

type SortField = "cvMatch" | "updatedAt" | "name";
type SortOrder = "asc" | "desc";

function getScoreLabel(score: number | null) {
  return typeof score === "number" ? `${score}/100` : "Chưa có điểm";
}

function getScoreBarWidth(score: number | null) {
  return `${Math.max(0, Math.min(score ?? 0, 100))}%`;
}

export function LeaderboardClient({ initialCandidates }: LeaderboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("cvMatch");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      return;
    }

    setSortField(field);
    setSortOrder(field === "name" ? "asc" : "desc");
  };

  const filteredAndSortedCandidates = useMemo(() => {
    return initialCandidates
      .filter((candidate) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return (
          normalizedQuery.length === 0 ||
          candidate.name.toLowerCase().includes(normalizedQuery) ||
          candidate.email.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }

        if (sortField === "updatedAt") {
          return sortOrder === "asc" ? a.updatedAt.localeCompare(b.updatedAt) : b.updatedAt.localeCompare(a.updatedAt);
        }

        const valA = a.cvMatch ?? -1;
        const valB = b.cvMatch ?? -1;
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [initialCandidates, searchQuery, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
  };

  return (
    <section className="rounded-2xl border border-border-light bg-surface-white shadow-sm">
      <div className="border-b border-border-light p-4 md:p-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Hồ sơ mới đang chờ sàng lọc</h2>
            <p className="mt-1 text-sm text-text-muted">Chỉ gồm ứng viên vừa nộp CV và chưa được chuyển sang vòng xử lý tiếp theo.</p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full rounded-lg bg-surface-low py-2.5 pl-10 pr-4 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-surface-low text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Hạng</th>
              <th className="px-5 py-3 font-semibold">
                <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => handleSort("name")}>
                  Ứng viên
                  {renderSortIcon("name")}
                </button>
              </th>
              <th className="px-5 py-3 font-semibold">
                <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => handleSort("cvMatch")}>
                  Độ khớp CV/JD
                  {renderSortIcon("cvMatch")}
                </button>
              </th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">
                <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => handleSort("updatedAt")}>
                  Cập nhật
                  {renderSortIcon("updatedAt")}
                </button>
              </th>
              <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filteredAndSortedCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="font-semibold text-foreground">Không có hồ sơ mới cần xếp hạng.</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Nếu ứng viên đã được chuyển sang phỏng vấn hoặc đã bị từ chối, họ sẽ nằm ở trang Quản lý ứng viên thay vì bảng này.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedCandidates.map((candidate, index) => (
                <tr key={candidate.id} className="hover:bg-surface-low/60">
                  <td className="px-5 py-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/recruiter/candidates/${candidate.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">
                      {candidate.name}
                    </Link>
                    <p className="mt-1 text-xs text-text-muted">{candidate.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-36 flex-col gap-1">
                      <span className="font-semibold text-foreground">{getScoreLabel(candidate.cvMatch)}</span>
                      <div className="h-2 rounded-full bg-surface-low">
                        <div className="h-2 rounded-full bg-primary" style={{ width: getScoreBarWidth(candidate.cvMatch) }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-surface-low px-3 py-1 text-xs font-semibold text-primary">Mới ứng tuyển</span>
                  </td>
                  <td className="px-5 py-4 text-text-muted">{candidate.updatedAt}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/recruiter/candidates/${candidate.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Xem hồ sơ
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border-light px-5 py-4 text-sm font-medium text-text-muted">
        Hiển thị {filteredAndSortedCandidates.length} / {initialCandidates.length} hồ sơ mới.
      </div>
    </section>
  );
}
