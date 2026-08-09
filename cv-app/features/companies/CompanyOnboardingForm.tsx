"use client";

import { Building2 } from "lucide-react";
import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { onboardCompanyAction } from "./actions/onboard-company";

export function CompanyOnboardingForm() {
  const [state, formAction, pending] = useActionState(onboardCompanyAction, {});

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-border-light bg-surface-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Công ty tuyển dụng</p>
          <h1 className="text-xl font-bold text-foreground">Thiết lập công ty</h1>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Tài khoản nhà tuyển dụng cần thuộc một công ty trước khi đăng vị trí và xem ứng viên.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Tên công ty</span>
          <Input name="name" required disabled={pending} />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Slug</span>
          <Input name="slug" required disabled={pending} placeholder="kada-tech" />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Website</span>
        <Input name="website" type="url" disabled={pending} placeholder="https://example.com" />
      </label>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Địa điểm</span>
        <Input name="location" disabled={pending} placeholder="TP. Hồ Chí Minh" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Ngành nghề</span>
          <select name="industry" disabled={pending} className="h-12 w-full rounded-lg border border-outline-variant bg-white px-3 focus-visible:ring-2 focus-visible:ring-primary">
            <option value="">Chưa cập nhật</option><option value="INFORMATION_TECHNOLOGY">Công nghệ thông tin</option><option value="SOFTWARE">Phần mềm</option><option value="OTHER">Khác</option>
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Quy mô công ty</span>
          <select name="size" disabled={pending} className="h-12 w-full rounded-lg border border-outline-variant bg-white px-3 focus-visible:ring-2 focus-visible:ring-primary">
            <option value="">Chưa cập nhật</option><option value="SIZE_1_9">1 - 9 nhân viên</option><option value="SIZE_10_49">10 - 49 nhân viên</option><option value="SIZE_50_99">50 - 99 nhân viên</option><option value="SIZE_100_499">100 - 499 nhân viên</option><option value="SIZE_500_999">500 - 999 nhân viên</option><option value="SIZE_1000_PLUS">Từ 1.000 nhân viên</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Mô tả</span>
        <Textarea name="description" rows={4} disabled={pending} />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-md bg-error-container p-3 text-sm font-medium text-error">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Đang lưu..." : "Tạo công ty"}
      </button>
    </form>
  );
}
