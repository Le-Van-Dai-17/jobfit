"use client";

import { AlertCircle, Send, Bookmark, Share2 } from "lucide-react";
import { useActionState } from "react";
import { applyToJobAction, type ApplyToJobState } from "../actions/apply-to-job";

type ResumeVersionOption = {
  id: string;
  resumeTitle: string;
  version: number;
};

const initialState: ApplyToJobState = { status: "idle" };

export function ApplyToJobForm({
  jobId,
  resumeVersions,
  isSaved = false,
}: {
  jobId: string;
  resumeVersions: ResumeVersionOption[];
  isSaved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(applyToJobAction, initialState);
  const hasCv = resumeVersions.length > 0;

  return (
    <div className="sticky top-24 space-y-5 rounded-3xl border border-border-light bg-white p-6 shadow-sm">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="jobId" value={jobId} />
        
        <div>
          <label htmlFor="resumeVersionId" className="text-sm font-bold text-foreground">
            Chọn CV ứng tuyển
          </label>
          <select
            id="resumeVersionId"
            name="resumeVersionId"
            required
            disabled={pending || !hasCv}
            className="mt-2 w-full rounded-xl border border-border-light bg-surface-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0047AB] disabled:cursor-not-allowed disabled:opacity-60 font-medium"
          >
            <option value="">Chọn phiên bản CV</option>
            {resumeVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.resumeTitle} - phiên bản {version.version}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-text-muted">Sau khi ứng tuyển, hệ thống sẽ mở bài đánh giá kỹ thuật theo đúng JD và snapshot CV này.</p>
        </div>

        {state.status === "error" ? (
          <p role="alert" className="flex gap-2 rounded-xl bg-error-container p-3 text-sm font-medium text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !hasCv}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0047AB] px-4 text-sm font-bold text-white outline-none transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-[#0047AB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Đang tạo phiên đánh giá..." : "Ứng tuyển & bắt đầu đánh giá"}
        </button>
      </form>

      {/* Since the "Lưu việc làm" button traditionally requires its own server action form, 
          we structure it alongside the main form block. This is visually seamless. */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          form="saveJobForm"
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#0047AB] bg-white px-4 text-sm font-bold text-[#0047AB] transition-colors hover:bg-blue-50"
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          {isSaved ? "Đã lưu" : "Lưu việc làm"}
        </button>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-foreground transition-colors hover:bg-gray-50">
          <Share2 className="h-4 w-4 text-gray-500" />
          Chia sẻ
        </button>
      </div>

      <p className="text-center text-xs font-medium text-text-muted pt-2 border-t border-border-light">
        Đã có 45 người ứng tuyển vị trí này.
      </p>
    </div>
  );
}
