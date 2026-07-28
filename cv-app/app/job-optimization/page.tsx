"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, AlertCircle, Zap, RefreshCw, Layers } from "lucide-react";

export default function JobOptimizationPage() {
  const [analyzing, setAnalyzing] = useState(false);

  const missingKeywords = ["GraphQL", "Docker / Kubernetes", "Micro Frontends", "Unit Testing (Jest)"];
  const matchedKeywords = ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "State Management", "RESTful API"];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-md">
              AI ATS Engine 3.0
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Tối ưu CV theo Job Description</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dán mô tả công việc (JD) mục tiêu để AI tự động trích xuất từ khóa và đề xuất câu chỉnh sửa chuẩn ATS.
          </p>
        </div>

        <button
          onClick={() => {
            setAnalyzing(true);
            setTimeout(() => setAnalyzing(false), 1000);
          }}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white font-semibold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all shrink-0"
        >
          {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>Phân tích & Tối ưu AI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Job Description Input Box */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Mô tả công việc mục tiêu (Job Description)
          </h3>
          <textarea
            rows={14}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            defaultValue={`Chúng tôi đang tìm kiếm Senior Frontend Engineer kinh nghiệm làm việc với React, Next.js, TypeScript và GraphQL.
Yêu cầu ứng viên nắm vững State Management, tối ưu hóa Web Vitals, làm việc với Docker/Kubernetes và viết Unit Testing (Jest). Có tư duy sản phẩm tốt và kinh nghiệm Micro Frontends.`}
          />
        </div>

        {/* AI Recommendations Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {/* ATS Score Improvement Summary */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-300">Dự đoán kết quả tối ưu</span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">Điểm ATS có thể đạt 96/100</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-black text-amber-300 border border-white/20">
                +14%
              </div>
            </div>

            <p className="text-xs text-indigo-200 leading-relaxed">
              Bằng cách bổ sung thêm 4 từ khóa chuyên môn bên dưới vào phần Kinh nghiệm làm việc, hồ sơ của bạn sẽ xếp hạng nằm trong <strong className="text-white">Top 5% ứng viên sáng giá nhất</strong>.
            </p>
          </div>

          {/* Missing Keywords Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-4 h-4" />
              Từ khóa còn thiếu trong CV ({missingKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Matched Keywords Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              Từ khóa đã trùng khớp ({matchedKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>

          {/* AI Rephrase Suggestion */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">AI Đề xuất câu chỉnh sửa bullet point</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1.5">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Thay vì ghi:</p>
              <p className="text-slate-600 line-through">&ldquo;Đã viết code React và kết nối API backend cho ứng dụng dashboard.&rdquo;</p>
              <p className="text-[11px] text-indigo-600 font-bold uppercase pt-1">Đề xuất viết lại chuẩn ATS:</p>
              <p className="font-semibold text-slate-900 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/60">
                &ldquo;Phát triển ứng dụng Web SaaS bằng React.js, TypeScript và GraphQL API; xây dựng kiến trúc Micro Frontends giúp tối ưu điểm Web Vitals tăng 35%.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
