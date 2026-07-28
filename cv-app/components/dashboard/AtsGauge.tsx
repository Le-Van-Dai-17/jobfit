"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface AtsGaugeProps {
  score: number;
}

export default function AtsGauge({ score }: AtsGaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Điểm ATS Score CV</h3>
          <p className="text-xs text-slate-500">Đánh giá khả năng vượt qua hệ thống lọc tự động</p>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-100">
          Chất lượng cao
        </span>
      </div>

      <div className="flex items-center justify-around py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#gradient-ats)"
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="gradient-ats" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4648d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center flex flex-col items-center">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              {score}
            </motion.span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">/ 100 điểm</span>
          </div>
        </div>

        <div className="space-y-2.5 max-w-[160px]">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Từ khóa chuẩn: <strong className="text-slate-900">92%</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 font-medium">Cấu trúc định dạng: <strong className="text-slate-900">Great</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Tác động hành động: <strong className="text-slate-900">84%</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          3 gợi ý nâng điểm ATS khả thi
        </span>
        <Link
          href="/job-optimization"
          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          Tối ưu ngay
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
