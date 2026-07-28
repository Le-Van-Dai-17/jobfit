"use client";

import { useState } from "react";
import { Bot, Mic, Award, Sparkles, Volume2, Video } from "lucide-react";

export default function InterviewPage() {
  const [inSession, setInSession] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const questions = [
    {
      id: 1,
      category: "React & Next.js Core",
      question: "Hãy giải thích cơ chế Server Components (RSC) trong Next.js App Router khác gì với Client Components và khi nào nên dùng?",
      hint: "Hãy tập trung vào kích thước Bundle size, SEO rendering và khả năng truy cập trực tiếp tài nguyên Server.",
    },
    {
      id: 2,
      category: "Web Performance",
      question: "Làm thế nào để cải thiện chỉ số Largest Contentful Paint (LCP) và Cumulative Layout Shift (CLS) trên dự án Next.js?",
      hint: "Nêu tác dụng của next/image, font optimization và CDN layout shift prevention.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 font-bold text-xs rounded-md">
              AI Interview Agent
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Phỏng vấn mô phỏng AI</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Luyện tập trả lời các câu hỏi kỹ thuật trực tiếp với AI Mentor và nhận chấm điểm phản hồi tức thì.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Điểm trung bình: 9.2/10</span>
          </div>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Video Simulator */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white space-y-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Interviewer: Alex (Senior Tech Lead)</span>
            </div>
            <span className="text-xs font-mono text-slate-400">02:45 / 05:00</span>
          </div>

          {/* Avatar representation */}
          <div className="flex flex-col items-center justify-center my-auto space-y-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bot className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 rounded-full border-2 border-slate-900">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-indigo-200 text-center max-w-md">
              &ldquo;{questions[currentQuestionIdx].question}&rdquo;
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 z-10 pt-4 border-t border-slate-800">
            <button className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setInSession(!inSession)}
              className={`px-6 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg ${
                inSession
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "gradient-primary text-white hover:opacity-95"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{inSession ? "Đang ghi âm câu trả lời..." : "Bắt đầu trả lời bằng Mic"}</span>
            </button>
          </div>
        </div>

        {/* Right Side AI Realtime Feedback */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Nhận xét AI tức thì
            </h3>
            <span className="text-xs font-bold text-indigo-600">Câu hỏi 1 / 5</span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Gợi ý trả lời tối ưu:</span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {questions[currentQuestionIdx].hint}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Độ chính xác kỹ thuật</span>
                <strong className="text-indigo-600">9.5 / 10</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[95%]" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Khả năng diễn đạt (Clarity)</span>
                <strong className="text-purple-600">9.0 / 10</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-[90%]" />
              </div>
            </div>

            <button
              onClick={() => setCurrentQuestionIdx((prev) => (prev + 1) % questions.length)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Chuyển sang câu hỏi tiếp theo ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
