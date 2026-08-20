"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import Link from "next/link";

import type { AppData } from "./LeaderboardClient";

const statusLabels: Record<string, string> = {
  APPLIED: "Mới ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút hồ sơ",
};

interface CandidateDrawerProps {
  candidate: AppData | null;
  onClose: () => void;
}

export function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        animate={{ x: 0 }}
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        exit={{ x: "100%" }}
        initial={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-white/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-lg font-bold uppercase text-primary">
              {candidate.name.substring(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{candidate.name}</h2>
              <p className="text-sm text-text-muted">{candidate.email}</p>
            </div>
          </div>
          <button className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-low hover:text-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border-light bg-surface-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Độ khớp CV/JD</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{candidate.cvMatch === null ? "--" : candidate.cvMatch}</p>
            </div>
            <div className="rounded-xl border border-border-light bg-surface-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Trạng thái</p>
              <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">
                {statusLabels[candidate.status] ?? candidate.status}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border-light pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Hành động nhanh</h3>
            <Link
              href={`/recruiter/candidates/${candidate.id}`}
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Xem hồ sơ ứng viên
            </Link>
            <a
              className="flex items-center justify-center gap-2 rounded-lg bg-surface-low px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-outline-variant"
              href={`mailto:${candidate.email}`}
            >
              <Mail className="h-4 w-4" />
              Gửi email liên hệ
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
