"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
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
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Cập nhật hồ sơ</h2>
        <p className="text-sm text-slate-500">Thông tin này giúp nhà tuyển dụng hiểu bối cảnh nghề nghiệp của bạn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold"><span>Chức danh</span><Input name="headline" maxLength={160} defaultValue={initialValues.headline ?? ""} /></label>
        <label className="space-y-1 text-sm font-semibold"><span>Địa điểm</span><Input name="location" maxLength={160} defaultValue={initialValues.location ?? ""} /></label>
        <label className="space-y-1 text-sm font-semibold"><span>Điện thoại</span><Input name="phone" maxLength={40} defaultValue={initialValues.phone ?? ""} /></label>
        <label className="space-y-1 text-sm font-semibold"><span>Website</span><Input name="website" type="url" maxLength={500} defaultValue={initialValues.website ?? ""} /></label>
        <label className="space-y-1 text-sm font-semibold"><span>LinkedIn</span><Input name="linkedinUrl" type="url" maxLength={500} defaultValue={initialValues.linkedinUrl ?? ""} /></label>
        <label className="space-y-1 text-sm font-semibold"><span>GitHub</span><Input name="githubUrl" type="url" maxLength={500} defaultValue={initialValues.githubUrl ?? ""} /></label>
      </div>
      <label className="block space-y-1 text-sm font-semibold"><span>Giới thiệu</span><textarea name="summary" maxLength={3000} defaultValue={initialValues.summary ?? ""} className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label>
      {state.error ? <p role="alert" className="text-sm font-medium text-red-700">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-sm font-medium text-emerald-700">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Đang lưu..." : "Lưu hồ sơ"}</button>
    </form>
  );
}
