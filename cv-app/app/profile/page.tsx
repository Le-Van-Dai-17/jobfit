"use client";

import { Mail, Phone, MapPin, Award, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-200">
            VN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Vũ Nguyễn</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-md border border-emerald-200/60">
                Verified Candidate
              </span>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">Senior Frontend Engineer & UI Specialist</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> vu.nguyen@example.com</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> +84 901 234 567</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors shrink-0">
          Chỉnh sửa thông tin
        </button>
      </div>

      {/* Skill Matrix & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Ma trận Kỹ năng Chuyên môn (Skill Matrix)
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>React.js / Next.js (App Router)</span>
                <span className="text-indigo-600">Expert (95%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[95%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>TypeScript & State Architecture</span>
                <span className="text-purple-600">Advanced (90%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Tailwind CSS & Design Systems</span>
                <span className="text-emerald-600">Expert (98%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Xác minh Hồ sơ & Chứng chỉ
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">AWS Certified Developer - Associate</p>
                <p className="text-[11px] text-slate-500">Cấp bởi Amazon Web Services</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">Active</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Meta Frontend Developer Professional</p>
                <p className="text-[11px] text-slate-500">Cấp bởi Meta / Coursera</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
