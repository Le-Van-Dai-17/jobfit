"use client";

import { useActionState } from "react";
import { ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { createAssessmentSessionAction } from "../actions/assessment.actions";
import { initialAssessmentActionState } from "../actions/assessment.action-state";

type ResumeOption = {
  id: string;
  version: number;
  createdAt: Date;
  resume: { title: string };
};

type JobOption = {
  id: string;
  title: string;
  company: string;
};

export function AssessmentStartForm({
  resumeVersions,
  jobs,
  selectedResumeVersionId,
  selectedJobId,
}: {
  resumeVersions: ResumeOption[];
  jobs: JobOption[];
  selectedResumeVersionId?: string;
  selectedJobId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createAssessmentSessionAction,
    initialAssessmentActionState
  );
  const disabled = resumeVersions.length === 0 || jobs.length === 0;

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-border-light bg-surface-white p-4 md:grid-cols-[1fr_1fr_auto]">
      <div className="space-y-2">
        <label htmlFor="resumeVersionId" className="text-sm font-semibold text-foreground">
          Phiên bản CV
        </label>
        <select
          id="resumeVersionId"
          name="resumeVersionId"
          defaultValue={selectedResumeVersionId ?? ""}
          disabled={disabled || pending}
          className="h-10 w-full rounded-md border border-border-light bg-surface-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-invalid={Boolean(state.fieldErrors?.resumeVersionId)}
          aria-describedby={state.fieldErrors?.resumeVersionId ? "resumeVersionId-error" : undefined}
          required
        >
          <option value="">Chọn CV</option>
          {resumeVersions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.resume.title} - v{version.version}
            </option>
          ))}
        </select>
        {state.fieldErrors?.resumeVersionId && (
          <p id="resumeVersionId-error" className="text-xs font-medium text-error">
            {state.fieldErrors.resumeVersionId[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="jobId" className="text-sm font-semibold text-foreground">
          Job/JD
        </label>
        <select
          id="jobId"
          name="jobId"
          defaultValue={selectedJobId ?? ""}
          disabled={disabled || pending}
          className="h-10 w-full rounded-md border border-border-light bg-surface-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-invalid={Boolean(state.fieldErrors?.jobId)}
          aria-describedby={state.fieldErrors?.jobId ? "jobId-error" : undefined}
          required
        >
          <option value="">Chọn JD</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>
        {state.fieldErrors?.jobId && (
          <p id="jobId-error" className="text-xs font-medium text-error">
            {state.fieldErrors.jobId[0]}
          </p>
        )}
      </div>

      <div className="flex items-end">
        <Button type="submit" isLoading={pending} disabled={disabled} className="w-full md:w-auto">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Tạo bài tập
        </Button>
      </div>

      {state.status === "error" && (
        <p className="md:col-span-3 rounded-md bg-red-50 p-3 text-sm text-red-700" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}
