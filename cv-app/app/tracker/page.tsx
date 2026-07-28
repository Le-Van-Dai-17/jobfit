"use client";

import { useState } from "react";
import { Plus, Building2, Calendar } from "lucide-react";

interface Application {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: "applied" | "interview" | "offer" | "rejected";
  date: string;
}

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      title: "Senior Frontend Engineer",
      company: "TechVision AI Global",
      location: "TP. Hồ Chí Minh",
      salary: "$3,000",
      status: "interview",
      date: "25/07/2026",
    },
    {
      id: "2",
      title: "React Specialist Lead",
      company: "Innovate Software Hub",
      location: "Remote",
      salary: "$2,800",
      status: "offer",
      date: "20/07/2026",
    },
    {
      id: "3",
      title: "Frontend Architect",
      company: "Vanguard Tech Corp",
      location: "Hà Nội",
      salary: "$3,500",
      status: "applied",
      date: "27/07/2026",
    },
    {
      id: "4",
      title: "Fullstack Engineer",
      company: "Lumina Career Systems",
      location: "Đà Nẵng",
      salary: "$2,500",
      status: "applied",
      date: "26/07/2026",
    },
  ]);

  const columns = [
    { key: "applied", label: "Đã nộp CV", color: "border-slate-300 bg-slate-50", badge: "bg-slate-200 text-slate-700" },
    { key: "interview", label: "Đang Phỏng vấn", color: "border-indigo-300 bg-indigo-50/40", badge: "bg-indigo-100 text-indigo-800" },
    { key: "offer", label: "Nhận Offer 🎉", color: "border-emerald-300 bg-emerald-50/40", badge: "bg-emerald-100 text-emerald-800" },
    { key: "rejected", label: "Từ chối / Khác", color: "border-rose-200 bg-rose-50/30", badge: "bg-rose-100 text-rose-800" },
  ];

  const moveStatus = (id: string, newStatus: Application["status"]) => {
    setApplications(
      applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-md">
              Kanban Board
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Theo dõi trạng thái ứng tuyển</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý quy trình ứng tuyển từ lúc nộp CV đến khi nhận Offer công việc thành công.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white font-semibold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span>Thêm công ty mới</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colApps = applications.filter((a) => a.status === col.key);

          return (
            <div
              key={col.key}
              className={`rounded-2xl border ${col.color} p-4 space-y-3 min-h-[500px] flex flex-col justify-start`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-900 text-xs">{col.label}</span>
                <span className={`px-2 py-0.5 font-bold text-[11px] rounded-full ${col.badge}`}>
                  {colApps.length}
                </span>
              </div>

              {/* Application Cards */}
              <div className="space-y-3 flex-1">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2.5 group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                        {app.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" /> {app.company}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-medium">
                      <span>{app.salary}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {app.date}</span>
                    </div>

                    {/* Quick Move Status buttons */}
                    <div className="flex items-center gap-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {col.key !== "applied" && (
                        <button
                          onClick={() => moveStatus(app.id, "applied")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-semibold"
                        >
                          ← Nộp
                        </button>
                      )}
                      {col.key !== "interview" && (
                        <button
                          onClick={() => moveStatus(app.id, "interview")}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-semibold"
                        >
                          Phỏng vấn
                        </button>
                      )}
                      {col.key !== "offer" && (
                        <button
                          onClick={() => moveStatus(app.id, "offer")}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold"
                        >
                          Offer 🎉
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
