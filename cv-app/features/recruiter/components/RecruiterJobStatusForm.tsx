"use client";

import { useActionState } from "react";
import type { RecruiterActionState } from "../actions/recruiter.actions";

type RecruiterJobStatusFormProps = {
  action: (state: RecruiterActionState, formData: FormData) => Promise<RecruiterActionState>;
  buttonClassName: string;
  isArchived: boolean;
  isPublished: boolean;
  jobId: string;
};

export function RecruiterJobStatusForm({
  action,
  buttonClassName,
  isArchived,
  isPublished,
  jobId,
}: RecruiterJobStatusFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-2">
      <input name="jobId" type="hidden" value={jobId} />
      <button className={buttonClassName} disabled={pending}>
        {pending ? "Đang xử lý..." : isArchived ? "Hiện lại tin" : isPublished ? "Ẩn tin" : "Đăng tuyển"}
      </button>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
    </form>
  );
}
