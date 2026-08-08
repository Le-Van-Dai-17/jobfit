"use client";

import { useState } from "react";
import { Search, MapPin, Building2, DollarSign, Filter, Bookmark, ArrowUpRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

const allJobs = [
  {
    id: 1,
    title: "Senior Frontend Engineer (React/Next.js)",
    company: "TechVision AI Global",
    location: "TP. Hồ Chí Minh (Hybrid)",
    salary: "$2,500 - $3,500",
    match: 95,
    type: "Full-time",
    experience: "5+ năm",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "AI Integration"],
  },
  {
    id: 2,
    title: "Fullstack Developer (Node.js & AI Integration)",
    company: "Lumina Career Systems",
    location: "Hà Nội (Remote)",
    salary: "$2,000 - $3,000",
    match: 91,
    type: "Full-time",
    experience: "3+ năm",
    tags: ["React", "Node.js", "OpenAI API", "PostgreSQL"],
  },
  {
    id: 3,
    title: "Lead UI/UX Engineer & Design Systems Specialist",
    company: "Innovate Labs Platform",
    location: "Đà Nẵng (On-site)",
    salary: "$2,200 - $2,800",
    match: 87,
    type: "Full-time",
    experience: "4+ năm",
    tags: ["Design Systems", "Figma", "React", "Storybook"],
  },
  {
    id: 4,
    title: "Frontend Architect - Next.js Performance Expert",
    company: "Vanguard Tech Corp",
    location: "TP. Hồ Chí Minh (Remote)",
    salary: "$3,000 - $4,200",
    match: 84,
    type: "Full-time",
    experience: "6+ năm",
    tags: ["Performance Optimization", "Web Vitals", "Next.js"],
  },
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = allJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Tìm việc làm công nghệ phù hợp AI</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống AI khớp tự động tiêu chí kỹ năng và mức lương kỳ vọng của bạn.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo chức danh, công ty, hoặc kỹ năng (Next.js, AI...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors shrink-0">
            <Filter className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-md">
                    {job.match}% Match AI
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> <strong className="text-slate-900">{job.salary}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
                <Link
                  href="/tracker"
                  className="px-4 py-2.5 gradient-primary text-white font-semibold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <span>Ứng tuyển ngay</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/assessments"
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-700 outline-none transition-colors hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Tạo bài kỹ thuật</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {job.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-[11px] rounded-lg">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
