"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateRecruiterJobAction, type RecruiterActionState } from "../actions/recruiter.actions";

type RecruiterJobEditFormProps = {
  job: {
    id: string;
    title: string;
    location: string | null;
    type: string | null;
    salaryRange?: string | null;
    description: string | null;
    requirements: string | null;
    url?: string | null;
    deadline?: Date | null;
  };
};

export function RecruiterJobEditForm({ job }: RecruiterJobEditFormProps) {
  const [state, formAction, pending] = useActionState<RecruiterActionState, FormData>(
    updateRecruiterJobAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm">
      <input type="hidden" name="jobId" value={job.id} />
      <h2 className="text-lg font-bold text-foreground">Chinh sua JD</h2>
      {state.error ? <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ten vi tri" name="title" defaultValue={job.title} required disabled={pending} />
        <Field label="Dia diem" name="location" defaultValue={job.location ?? ""} disabled={pending} />
        <Field label="Hinh thuc" name="type" defaultValue={job.type ?? ""} disabled={pending} />
        <Field label="Lương công khai" name="salaryRange" defaultValue={job.salaryRange ?? ""} disabled={pending} />
        <Field
          label="Hạn ứng tuyển"
          name="deadline"
          defaultValue={job.deadline?.toISOString().slice(0, 10) ?? ""}
          disabled={pending}
          type="date"
        />
        <Field label="Link JD" name="url" defaultValue={job.url ?? ""} disabled={pending} type="url" />
      </div>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Mo ta cong viec</span>
        <Textarea name="description" required disabled={pending} className="min-h-32" defaultValue={job.description ?? ""} />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Yeu cau va tieu chi ky thuat</span>
        <Textarea name="requirements" required disabled={pending} className="min-h-32" defaultValue={job.requirements ?? ""} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Dang luu..." : "Luu thay doi"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  disabled,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  disabled: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input name={name} type={type} required={required} disabled={disabled} defaultValue={defaultValue} />
    </label>
  );
}
