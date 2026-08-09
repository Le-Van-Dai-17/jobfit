"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateCandidateProfileAction } from "../actions/update-profile";

type InitialValues = {
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
};

export function CandidateProfileForm({ initialValues }: { initialValues: InitialValues }) {
  const [state, formAction, pending] = useActionState(updateCandidateProfileAction, {});

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm md:p-6">
      <div>
        <p className="text-sm font-semibold text-primary">Hồ sơ ứng viên</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">Cập nhật thông tin hiển thị</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Các trường này bổ sung ngữ cảnh cho CV và ứng tuyển, không thay thế bằng dữ kiện do AI tự tạo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Chức danh" name="headline" maxLength={160} defaultValue={initialValues.headline ?? ""} disabled={pending} />
        <Field label="Địa điểm" name="location" maxLength={160} defaultValue={initialValues.location ?? ""} disabled={pending} />
        <Field label="Điện thoại" name="phone" maxLength={40} defaultValue={initialValues.phone ?? ""} disabled={pending} />
        <Field label="Website" name="website" type="url" maxLength={500} defaultValue={initialValues.website ?? ""} disabled={pending} />
        <Field label="LinkedIn" name="linkedinUrl" type="url" maxLength={500} defaultValue={initialValues.linkedinUrl ?? ""} disabled={pending} />
        <Field label="GitHub" name="githubUrl" type="url" maxLength={500} defaultValue={initialValues.githubUrl ?? ""} disabled={pending} />
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Giới thiệu</span>
        <Textarea
          name="summary"
          maxLength={3000}
          defaultValue={initialValues.summary ?? ""}
          disabled={pending}
          className="min-h-32"
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="rounded-md bg-surface-low p-3 text-sm font-medium text-tertiary">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Lưu hồ sơ"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  maxLength,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  maxLength: number;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input name={name} type={type} maxLength={maxLength} defaultValue={defaultValue} disabled={disabled} />
    </label>
  );
}
