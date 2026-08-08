"use client";

import { useActionState } from "react";
import type { RecruiterActionState } from "../actions/recruiter.actions";

type RecruiterJobStatusFormProps = {
  action: (state: RecruiterActionState, formData: FormData) => Promise<RecruiterActionState>;
  buttonClassName: string;
  isArchived: boolean;
  jobId: string;
};

export function RecruiterJobStatusForm({
  action,
  buttonClassName,
  isArchived,
  jobId,
}: RecruiterJobStatusFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-2">
      <input name="jobId" type="hidden" value={jobId} />
      <button className={buttonClassName} disabled={pending}>
        {pending ? "Đang xử lý..." : isArchived ? "Đăng tuyển" : "Lưu trữ"}
      </button>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
    </form>
  );
}
