"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { CandidateDrawer } from "./CandidateDrawer";
import { useToast } from "@/hooks/use-toast";

export type AppData = {
  id: string;
  name: string;
  email: string;
  cvMatch: number;
  techScore: number;
  totalScore: number;
  status: string;
};

interface LeaderboardClientProps {
  initialCandidates: AppData[];
}

type SortField = "totalScore" | "cvMatch" | "techScore";
type SortOrder = "asc" | "desc";

export function LeaderboardClient({ initialCandidates }: LeaderboardClientProps) {
  const [candidates, setCandidates] = useState<AppData[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("totalScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerCandidate, setDrawerCandidate] = useState<AppData | null>(null);
  const { addToast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // default to desc when switching fields
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedCandidates.map(c => c.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (newStatus: string) => {
    if (selectedIds.size === 0) return;

    // In a real app, this would call an API. Here we just update local state.
    setCandidates(prev => prev.map(c =>
      selectedIds.has(c.id) ? { ...c, status: newStatus } : c
    ));

    addToast(`Đã chuyển trạng thái ${selectedIds.size} ứng viên thành ${newStatus}`, "success");
    setSelectedIds(new Set());
  };

  const filteredAndSortedCandidates = candidates
    .filter((candidate) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch = candidate.name.toLowerCase().includes(normalizedQuery)
        || candidate.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus = selectedStatus === "ALL" || candidate.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortOrder === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      }
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    });

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-t-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full rounded-lg bg-[#F8F9FF] py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4648D4]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg bg-[#F8F9FF] px-4 py-2.5 text-sm font-semibold text-[#0B1C30] hover:bg-gray-100 focus:outline-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Status: All</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3 border border-indigo-100">
          <span className="text-sm font-semibold text-indigo-900">Đã chọn {selectedIds.size} ứng viên</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("INTERVIEWING")}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm border border-indigo-200 hover:bg-indigo-100"
            >
              Phỏng vấn
            </button>
            <button
              onClick={() => handleBulkAction("REJECTED")}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm border border-red-200 hover:bg-red-50"
            >
              Từ chối
            </button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#4648D4] focus:ring-[#4648D4]"
                  checked={filteredAndSortedCandidates.length > 0 && selectedIds.size === filteredAndSortedCandidates.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-16 text-center">Rank</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Candidate</th>
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-32 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("cvMatch")}
              >
                <div className="flex items-center gap-1">CV Match {sortField === "cvMatch" && (sortOrder === "desc" ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>)}</div>
              </th>
              <th
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-32 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("techScore")}
              >
                <div className="flex items-center gap-1">Tech Test {sortField === "techScore" && (sortOrder === "desc" ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>)}</div>
              </th>
              <th
                className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-32 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("totalScore")}
              >
                <div className="flex items-center justify-center gap-1">Total Score {sortField === "totalScore" && (sortOrder === "desc" ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>)}</div>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-32">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy ứng viên nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredAndSortedCandidates.map((candidate, index) => {
                let badgeBg = "bg-gray-100";
                let badgeText = "text-gray-700";
                if (candidate.status === "OFFER" || candidate.status === "INTERVIEWING") {
                  badgeBg = "bg-[#E0E7FF]";
                  badgeText = "text-[#4338CA]";
                } else if (candidate.status === "REJECTED") {
                  badgeBg = "bg-[#FEE2E2]";
                  badgeText = "text-[#DC2626]";
                } else if (candidate.totalScore >= 70) {
                  badgeBg = "bg-[#D1FAE5]";
                  badgeText = "text-[#059669]";
                }

                return (
                  <tr key={candidate.id} className={`hover:bg-gray-50/50 ${selectedIds.has(candidate.id) ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#4648D4] focus:ring-[#4648D4]"
                        checked={selectedIds.has(candidate.id)}
                        onChange={() => handleSelectRow(candidate.id)}
                      />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index < 3 && sortField === 'totalScore' && sortOrder === 'desc' ? 'bg-[#B45309] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2E8F0] font-bold text-[#475569] shadow-sm uppercase">
                          {candidate.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0B1C30]">{candidate.name}</div>
                          <div className="text-xs text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#059669]">{candidate.cvMatch}%</span>
                        <div className="h-1.5 w-full max-w-[80px] rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-[#059669]" style={{ width: `${candidate.cvMatch}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#0044C7]">{candidate.techScore}%</span>
                        <div className="h-1.5 w-full max-w-[80px] rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-[#0044C7]" style={{ width: `${candidate.techScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-base font-bold ${candidate.totalScore >= 70 ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                        {candidate.totalScore}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${badgeBg} ${badgeText}`}>
                        {candidate.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => setDrawerCandidate(candidate)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#4648D4] transition-colors"
                        title="Xem chi tiết ứng viên"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
          <span className="text-sm font-medium text-gray-500">Hiển thị {filteredAndSortedCandidates.length} ứng viên.</span>
        </div>
      </div>

      <CandidateDrawer candidate={drawerCandidate} onClose={() => setDrawerCandidate(null)} />
    </>
  );
}
