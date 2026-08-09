"use client";

import { AlertCircle, Send } from "lucide-react";
import Link from "next/link";
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
}: {
  jobId: string;
  resumeVersions: ResumeVersionOption[];
}) {
  const [state, formAction, pending] = useActionState(applyToJobAction, initialState);
  const hasCv = resumeVersions.length > 0;

  return (
    <form action={formAction} className="sticky top-24 space-y-4 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <p className="text-sm font-semibold text-primary">Ứng tuyển vị trí này</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">Chọn CV snapshot</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Hệ thống sẽ lưu đúng phiên bản CV được chọn để nhà tuyển dụng xem lại sau khi bạn nộp.
        </p>
      </div>

      <div>
        <label htmlFor="resumeVersionId" className="text-sm font-semibold text-foreground">
          Phiên bản CV
        </label>
        <select
          id="resumeVersionId"
          name="resumeVersionId"
          required
          disabled={pending || !hasCv}
          className="mt-2 w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Chọn phiên bản CV</option>
          {resumeVersions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.resumeTitle} - phiên bản {version.version}
            </option>
          ))}
        </select>
      </div>

      {!hasCv ? (
        <div className="rounded-lg border border-border-light bg-surface-low p-4 text-sm text-text-muted">
          Bạn cần lưu ít nhất một CV trước khi ứng tuyển.{" "}
          <Link href="/my-cv" className="font-semibold text-primary outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary">
            Tạo CV
          </Link>
        </div>
      ) : null}

      {state.status === "error" ? (
        <p role="alert" className="flex gap-2 rounded-md bg-error-container p-3 text-sm font-medium text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !hasCv}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {pending ? "Đang ứng tuyển..." : "Nộp ứng tuyển"}
      </button>
    </form>
  );
}
