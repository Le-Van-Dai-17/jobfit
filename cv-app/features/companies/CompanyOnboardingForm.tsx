"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { onboardCompanyAction } from "./actions/onboard-company";

export function CompanyOnboardingForm() {
  const [state, formAction, pending] = useActionState(onboardCompanyAction, {});

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border-light bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Thiết lập công ty</h1>
          <p className="text-sm text-text-muted">Tạo hồ sơ công ty để đăng tuyển và quản lý ứng viên.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Tên công ty</span>
          <Input name="name" required />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Slug</span>
          <Input name="slug" required placeholder="kada-tech" />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Website</span>
        <Input name="website" type="url" placeholder="https://example.com" />
      </label>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Địa điểm</span>
        <Input name="location" placeholder="TP. Hồ Chí Minh" />
      </label>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Mô tả</span>
        <Textarea name="description" rows={4} />
      </label>

      {state.error && <p className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
      >
        {pending ? "Đang lưu..." : "Tạo công ty"}
      </button>
    </form>
  );
}
