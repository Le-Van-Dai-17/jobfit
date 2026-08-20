"use client";

import { useActionState } from "react";
import type { ApplicationStatus } from "@prisma/client";

import {
  transitionRecruiterApplicationAction,
  type RecruiterActionState,
} from "../actions/recruiter.actions";

const initialState: RecruiterActionState = {};

const statusLabels: Record<ApplicationStatus, string> = {
  DRAFT: "Bản nháp",
  APPLIED: "Đã ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER: "Đề nghị nhận việc",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút",
};

export function ApplicationTransitionForm({
  applicationId,
  nextStatuses,
  compact = false,
}: {
  applicationId: string;
  nextStatuses: ApplicationStatus[];
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(transitionRecruiterApplicationAction, initialState);
  const disabled = pending || nextStatuses.length === 0;

  return (
    <form action={formAction} className={compact ? "space-y-2 rounded-lg border border-border-light bg-white p-3" : "flex flex-wrap items-end gap-3 rounded-xl border border-border-light bg-white p-4"}>
      <input name="applicationId" type="hidden" value={applicationId} />
      {state.error ? (
        <p role="alert" className="basis-full rounded-xl border border-error/30 bg-error-container px-3 py-2 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm font-medium">
        Trạng thái
        <select name="status" disabled={disabled} className="mt-1 block rounded-xl border border-border-light px-3 py-2">
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-64 flex-1 text-sm font-medium">
        Ghi chú
        <input name="notes" disabled={disabled} className="mt-1 w-full rounded-xl border border-border-light px-3 py-2" />
      </label>
      <button disabled={disabled} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Đang cập nhật" : "Cập nhật"}
      </button>
      {nextStatuses.length === 0 ? <p className="text-xs text-text-muted">Trạng thái hiện tại không còn bước chuyển hợp lệ.</p> : null}
    </form>
  );
}
