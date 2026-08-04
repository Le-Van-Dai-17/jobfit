

import { CheckCircle2, Zap } from "lucide-react";

export default function JobMatchPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md">
              AI Match Engine 2.0
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Phân tích độ phù hợp (Job Match)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá mức độ khớp giữa kỹ năng CV của bạn và tiêu chuẩn tuyển dụng của nhà tuyển dụng.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-100 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Tỷ lệ Phù hợp</span>
            <div className="text-lg font-black text-indigo-700">92.5%</div>
          </div>
          <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
            A+
          </div>
        </div>
      </div>

      {/* Match Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Kỹ năng kỹ thuật (Hard Skills)</span>
            <span className="text-xs font-bold text-emerald-600">95% Match</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[95%]" />
          </div>
          <p className="text-[11px] text-slate-500">Khớp hoàn hảo: React, Next.js, TypeScript, Tailwind CSS.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Kinh nghiệm làm việc</span>
            <span className="text-xs font-bold text-indigo-600">90% Match</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[90%]" />
          </div>
          <p className="text-[11px] text-slate-500">5+ năm kinh nghiệm đáp ứng mức Senior required.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Học vấn & Chứng chỉ</span>
            <span className="text-xs font-bold text-purple-600">88% Match</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full w-[88%]" />
          </div>
          <p className="text-[11px] text-slate-500">Cử nhân Công nghệ thông tin & Chứng chỉ AWS/React.</p>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">Chi tiết tương thích từng danh mục</h3>

        <div className="space-y-3">
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-xs">Yêu cầu cốt lõi hoàn toàn phù hợp</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Vị trí Senior Frontend yêu cầu làm chủ kiến trúc Next.js App Router và State Management. CV của bạn có lịch sử xây dựng 3 dự án lớn tương tự.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-xs">Điểm cộng lợi thế cạnh tranh</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Kinh nghiệm về tích hợp các mô hình ngôn ngữ lớn (LLM API) của bạn tạo ra sự khác biệt lớn so với 85% ứng viên khác trên thị trường.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
