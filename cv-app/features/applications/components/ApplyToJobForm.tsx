"use client";

import { AlertCircle, Send, Bookmark, Share2, X } from "lucide-react";
import { useActionState, useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasCv = resumeVersions.length > 0;

  return (
    <div className="sticky top-24 space-y-5 rounded-3xl border border-border-light bg-white p-6 shadow-sm">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="jobId" value={jobId} />

        {/* Application Process Timeline */}
        <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
          <h4 className="text-sm font-bold text-[#0047AB] mb-4">Hành trình ứng tuyển năng lực thật</h4>
          <div className="space-y-0">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0047AB] text-white text-xs font-bold shadow-sm ring-2 ring-white">1</div>
                <div className="w-0.5 h-6 bg-blue-200 my-1 rounded-full"></div>
              </div>
              <div className="pb-3">
                <p className="text-sm font-bold text-foreground">Nộp hồ sơ</p>
                <p className="text-xs text-text-muted mt-0.5 font-medium leading-relaxed">Chọn CV phù hợp nhất với yêu cầu công việc.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-blue-200 text-[#0047AB] text-xs font-bold shadow-sm">2</div>
                <div className="w-0.5 h-6 bg-blue-200 my-1 rounded-full"></div>
              </div>
              <div className="pb-3">
                <p className="text-sm font-bold text-foreground">Kiểm tra năng lực thực tế</p>
                <p className="text-xs text-text-muted mt-0.5 font-medium leading-relaxed">AI đóng vai nhà tuyển dụng sẽ phỏng vấn nhanh kỹ năng kỹ thuật của bạn.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-blue-200 text-[#0047AB] text-xs font-bold shadow-sm">3</div>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Nhận kết quả tức thì</p>
                <p className="text-xs text-text-muted mt-0.5 font-medium leading-relaxed">Hệ thống gửi điểm số và phân tích điểm mạnh yếu của bạn cho HR.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border-light">
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
          <p className="mt-3 rounded-lg bg-surface-container px-3 py-2 text-xs font-medium leading-5 text-text-muted">
            Sẵn sàng chứng minh năng lực? Chọn CV và bắt đầu vòng phỏng vấn kỹ thuật với AI.
          </p>
        </div>

        {state.status === "error" ? (
          <p role="alert" className="flex gap-2 rounded-xl bg-error-container p-3 text-sm font-medium text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={pending || !hasCv}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0047AB] px-4 text-sm font-bold text-white outline-none transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-[#0047AB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Đang tạo phiên đánh giá..." : "Ứng tuyển & bắt đầu đánh giá"}
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Xác nhận đánh giá</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-8 text-sm leading-relaxed text-text-muted">
                <p>Bạn sắp bắt đầu bài kiểm tra năng lực kỹ thuật với AI.</p>
                <ul className="mt-4 space-y-2 list-disc pl-5">
                  <li>Bài kiểm tra kéo dài khoảng 10 - 15 phút.</li>
                  <li>Hãy chắc chắn bạn ở nơi yên tĩnh và kết nối mạng ổn định.</li>
                  <li>Bạn không thể tạm dừng hay thoát ngang giữa chừng.</li>
                </ul>
                <p className="mt-4 font-bold text-foreground">Bạn đã sẵn sàng?</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-xl bg-gray-100 font-bold text-foreground transition-colors hover:bg-gray-200"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0047AB] font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
                >
                  {pending ? "Đang xử lý..." : "Đồng ý bắt đầu"}
                </button>
              </div>
            </div>
          </div>
        )}
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
