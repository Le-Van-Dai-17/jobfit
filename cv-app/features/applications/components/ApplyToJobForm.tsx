"use client";

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

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border-light bg-surface-white p-5">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <label htmlFor="resumeVersionId" className="text-sm font-semibold text-foreground">
          Chọn CV để ứng tuyển
        </label>
        <select
          id="resumeVersionId"
          name="resumeVersionId"
          required
          className="mt-2 w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">Chọn phiên bản CV</option>
          {resumeVersions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.resumeTitle} - phiên bản {version.version}
            </option>
          ))}
        </select>
      </div>
      {state.status === "error" && (
        <p className="rounded-md border border-error/20 bg-error-container p-3 text-sm text-error">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || resumeVersions.length === 0}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang ứng tuyển..." : "Ứng tuyển"}
      </button>
      {resumeVersions.length === 0 && (
        <p className="text-sm text-text-muted">Bạn cần lưu ít nhất một CV trước khi ứng tuyển.</p>
      )}
    </form>
  );
}
