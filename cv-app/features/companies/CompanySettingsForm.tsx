"use client";

import type { CompanyIndustry, CompanySize } from "@prisma/client";
import { Building2, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateCompanySettingsAction, type CompanyOnboardingState } from "./actions/onboard-company";

type CompanySettingsFormProps = { company: { name:string; website:string|null; description?:string|null; location:string|null; industry:CompanyIndustry|null; size:CompanySize|null } };
const selectClass = "h-12 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
export const industryLabels: Record<CompanyIndustry, string> = {
  INFORMATION_TECHNOLOGY:"Công nghệ thông tin", SOFTWARE:"Phần mềm", FINANCE_BANKING:"Tài chính - Ngân hàng",
  ECOMMERCE:"Thương mại điện tử", EDUCATION:"Giáo dục", HEALTHCARE:"Y tế", MANUFACTURING:"Sản xuất",
  PROFESSIONAL_SERVICES:"Dịch vụ chuyên nghiệp", OTHER:"Khác",
};
export const sizeLabels: Record<CompanySize, string> = {
  SIZE_1_9:"1 - 9 nhân viên", SIZE_10_49:"10 - 49 nhân viên", SIZE_50_99:"50 - 99 nhân viên",
  SIZE_100_499:"100 - 499 nhân viên", SIZE_500_999:"500 - 999 nhân viên", SIZE_1000_PLUS:"Từ 1.000 nhân viên",
};

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const [state, formAction, pending] = useActionState<CompanyOnboardingState, FormData>(updateCompanySettingsAction, {});
  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <section className="space-y-6 rounded-2xl border border-outline-variant/60 bg-white p-5 shadow-card md:p-7">
        <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4"><Building2 className="h-6 w-6 text-primary" /><h2 className="text-xl font-bold">Cài đặt công ty</h2></div>
        {state.error ? <p role="alert" className="rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tên công ty" name="name" required disabled={pending} defaultValue={company.name} className="md:col-span-2" />
          <label className="space-y-1.5 text-sm font-semibold"><span>Ngành nghề</span><select aria-label="Ngành nghề" name="industry" className={selectClass} disabled={pending} defaultValue={company.industry ?? ""}><option value="">Chưa cập nhật</option>{Object.entries(industryLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-semibold"><span>Quy mô công ty</span><select aria-label="Quy mô công ty" name="size" className={selectClass} disabled={pending} defaultValue={company.size ?? ""}><option value="">Chưa cập nhật</option>{Object.entries(sizeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <Field label="Website" name="website" type="url" disabled={pending} defaultValue={company.website ?? ""} />
          <Field label="Địa chỉ trụ sở chính" name="location" disabled={pending} defaultValue={company.location ?? ""} />
        </div>
        <label className="block space-y-1.5 text-sm font-semibold"><span>Mô tả công ty</span><Textarea aria-label="Mô tả công ty" name="description" disabled={pending} defaultValue={company.description ?? ""} className="min-h-48" /></label>
        <div className="flex justify-end"><button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary-container px-6 text-sm font-semibold text-white shadow-card hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60">{pending ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
      </section>
      <aside className="space-y-4">
        <section className="rounded-2xl bg-surface-container p-5"><div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5 text-secondary" /> Quyền sở hữu</div><p className="mt-3 text-sm leading-6 text-text-muted">Thông tin được cập nhật cho công ty gắn với tư cách thành viên hiện tại của bạn. Hệ thống không nhận mã công ty từ biểu mẫu.</p></section>
        <section className="rounded-2xl bg-surface-low p-5"><h3 className="font-bold">Gợi ý hoàn thiện</h3><ul className="mt-3 space-y-2 text-sm text-text-muted"><li>• Cập nhật website chính thức</li><li>• Mô tả rõ lĩnh vực và quy mô</li><li>• Thêm địa chỉ trụ sở chính</li></ul></section>
      </aside>
    </form>
  );
}
function Field({label,name,disabled,defaultValue,required=false,type="text",className=""}:{label:string;name:string;disabled:boolean;defaultValue:string;required?:boolean;type?:string;className?:string}) { return <label className={`block space-y-1.5 text-sm font-semibold ${className}`}><span>{label}</span><Input aria-label={label} name={name} required={required} type={type} disabled={disabled} defaultValue={defaultValue} /></label>; }
