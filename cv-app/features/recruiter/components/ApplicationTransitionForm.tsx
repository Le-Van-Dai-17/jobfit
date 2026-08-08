"use client";

import { useActionState } from "react";
import type { ApplicationStatus } from "@prisma/client";

import {
  transitionRecruiterApplicationAction,
  type RecruiterActionState,
} from "../actions/recruiter.actions";

const initialState: RecruiterActionState = {};

export function ApplicationTransitionForm({
  applicationId,
  nextStatuses,
}: {
  applicationId: string;
  nextStatuses: ApplicationStatus[];
}) {
  const [state, formAction, pending] = useActionState(transitionRecruiterApplicationAction, initialState);
  const disabled = pending || nextStatuses.length === 0;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-border-light bg-white p-4">
      <input name="applicationId" type="hidden" value={applicationId} />
      {state.error ? (
        <p role="alert" className="basis-full rounded-xl border border-error/30 bg-error-container px-3 py-2 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm font-medium">
        Trang thai
        <select name="status" disabled={disabled} className="mt-1 block rounded-xl border border-border-light px-3 py-2">
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-64 flex-1 text-sm font-medium">
        Ghi chu
        <input name="notes" disabled={disabled} className="mt-1 w-full rounded-xl border border-border-light px-3 py-2" />
      </label>
      <button disabled={disabled} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Dang cap nhat" : "Cap nhat"}
      </button>
    </form>
  );
}
