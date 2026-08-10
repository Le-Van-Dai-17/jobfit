"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Code, Download } from "lucide-react";
import Link from "next/link";
import type { AppData } from "./LeaderboardClient"; // We will export this type from LeaderboardClient

interface CandidateDrawerProps {
  candidate: AppData | null;
  onClose: () => void;
}

export function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0] text-lg font-bold text-[#475569] uppercase">
              {candidate.name.substring(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1C30]">{candidate.name}</h2>
              <p className="text-sm text-gray-500">{candidate.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-8">
          {/* Status & Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Score</p>
              <p className={`text-3xl font-extrabold ${candidate.totalScore >= 70 ? 'text-[#059669]' : 'text-[#475569]'}`}>
                {candidate.totalScore}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <div className="mt-1 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4648D4] shadow-sm border border-gray-100">
                {candidate.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center">
               <span className="font-bold text-[#059669] text-xl mb-2">{candidate.cvMatch}%</span>
               <span className="text-xs font-medium text-gray-500">CV Match</span>
               <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                 <div className="h-full bg-[#059669] rounded-full" style={{ width: `${candidate.cvMatch}%` }}></div>
               </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center">
               <span className="font-bold text-[#0044C7] text-xl mb-2">{candidate.techScore}%</span>
               <span className="text-xs font-medium text-gray-500">Tech Test</span>
               <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                 <div className="h-full bg-[#0044C7] rounded-full" style={{ width: `${candidate.techScore}%` }}></div>
               </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Hành động nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href={`/recruiter/assessments/${candidate.id}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#4648D4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3435A0] transition-colors"
              >
                <Code className="h-4 w-4" />
                Chi tiết đánh giá
              </Link>
              <button 
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                onClick={() => alert("Tính năng tải CV PDF sẽ được hỗ trợ sớm!")}
              >
                <Download className="h-4 w-4" />
                Tải CV
              </button>
            </div>
            <a 
              href={`mailto:${candidate.email}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#F8F9FF] px-4 py-2.5 text-sm font-semibold text-[#0B1C30] hover:bg-[#E0E7FF] transition-colors"
            >
              <Mail className="h-4 w-4" />
              Gửi Email Liên Hệ
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
