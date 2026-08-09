"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createRecruiterJobAction, type RecruiterActionState } from "../actions/recruiter.actions";

const initialState: RecruiterActionState = {};

export function RecruiterJobForm() {
  const [state, formAction, pending] = useActionState(createRecruiterJobAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Vị trí tuyển dụng</p>
          <h1 className="text-xl font-bold text-foreground">Tạo JD bản nháp</h1>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            JD được lưu theo công ty hiện tại; mô tả và yêu cầu sẽ là dữ liệu đầu vào cho ứng tuyển và đánh giá.
          </p>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Tên vị trí" name="title" required disabled={pending} />
        <Field label="Địa điểm" name="location" disabled={pending} placeholder="TP. Hồ Chí Minh / Remote" />
        <Field label="Hình thức" name="type" disabled={pending} placeholder="Full-time, Hybrid" />
        <Field label="Lương công khai" name="salaryRange" disabled={pending} placeholder="25-40 triệu" />
        <label className="block space-y-1.5 text-sm font-semibold text-foreground md:col-span-2">
          <span>Link JD</span>
          <Input name="url" type="url" disabled={pending} placeholder="https://..." />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Mô tả công việc</span>
        <Textarea name="description" required disabled={pending} className="min-h-36" />
      </label>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Yêu cầu và tiêu chí kỹ thuật</span>
        <Textarea name="requirements" required disabled={pending} className="min-h-36" />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Lưu bản nháp"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required = false,
  disabled,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input name={name} required={required} disabled={disabled} placeholder={placeholder} />
    </label>
  );
}
