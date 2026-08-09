"use client";

import type { CompanyIndustry, CompanySize } from "@prisma/client";
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Link as LinkIcon 
} from "lucide-react";
import { useActionState, useState } from "react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateCompanySettingsAction, type CompanyOnboardingState } from "./actions/onboard-company";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type CompanySettingsFormProps = { 
  company: { 
    name: string; 
    slug: string;
    website: string | null; 
    description?: string | null; 
    location: string | null; 
    industry: CompanyIndustry | null; 
    size: CompanySize | null 
  } 
};

const selectClass = "h-11 w-full rounded-lg border border-border-light bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]";

export const industryLabels: Record<CompanyIndustry, string> = {
  INFORMATION_TECHNOLOGY: "Công nghệ thông tin", 
  SOFTWARE: "Phần mềm", 
  FINANCE_BANKING: "Tài chính - Ngân hàng",
  ECOMMERCE: "Thương mại điện tử", 
  EDUCATION: "Giáo dục", 
  HEALTHCARE: "Y tế", 
  MANUFACTURING: "Sản xuất",
  PROFESSIONAL_SERVICES: "Dịch vụ chuyên nghiệp", 
  OTHER: "Khác",
};

export const sizeLabels: Record<CompanySize, string> = {
  SIZE_1_9: "1 - 9 nhân viên", 
  SIZE_10_49: "10 - 49 nhân viên", 
  SIZE_50_99: "50 - 99 nhân viên",
  SIZE_100_499: "100 - 499 nhân viên", 
  SIZE_500_999: "500 - 999 nhân viên", 
  SIZE_1000_PLUS: "Từ 1.000 nhân viên",
};

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const [state, formAction, pending] = useActionState<CompanyOnboardingState, FormData>(updateCompanySettingsAction, {});
  const [showToast, setShowToast] = useState(false);

  // Auto hide toast for demo purposes
  if (state.success && !showToast) {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <form action={formAction} className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      
      {/* Left Column - Forms */}
      <div className="flex flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-border-light">
        
        {state.error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
            {state.error}
          </p>
        ) : null}

        {/* Thông tin cơ bản */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground">Thông tin cơ bản</h2>
          
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Logo Upload Mockup */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-border-light bg-[#F8FAFC]">
                {/* Fallback mock logo */}
                <svg viewBox="0 0 100 100" className="h-20 w-20 text-[#2563EB]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 20L80 70H20L50 20Z" fill="currentColor" opacity="0.8"/>
                  <path d="M50 80L30 50H70L50 80Z" fill="#1D4ED8"/>
                </svg>
              </div>
              <button type="button" className="rounded-lg bg-[#E8F0FE] px-4 py-2 text-sm font-semibold text-[#0047AB] hover:bg-blue-100">
                Tải lên Logo
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-5">
              <label className="block space-y-1.5 text-sm font-semibold text-foreground">
                <span>Tên công ty <span className="text-red-500">*</span></span>
                <input 
                  name="name" 
                  required 
                  disabled={pending} 
                  defaultValue={company.name} 
                  className={cn("h-11 w-full rounded-lg border border-border-light bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]")}
                />
              </label>

              <label className="block space-y-1.5 text-sm font-semibold text-foreground">
                <span>Đường dẫn (Slug) <span className="text-red-500">*</span></span>
                <div className="flex items-center overflow-hidden rounded-lg border border-border-light bg-white focus-within:ring-2 focus-within:ring-[#2563EB]">
                  <span className="flex h-11 items-center bg-[#F1F5F9] px-3 text-text-muted">cvkada.com/company/</span>
                  <input 
                    name="slug" 
                    required 
                    disabled={pending} 
                    defaultValue={company.slug} 
                    className="h-11 flex-1 border-none bg-transparent px-3 focus-visible:outline-none"
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đường dẫn hợp lệ
                </div>
              </label>
            </div>
          </div>
        </section>

        <div className="h-px bg-border-light" />

        {/* Chi tiết & Liên hệ */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground">Chi tiết & Liên hệ</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Ngành nghề</span>
              <select aria-label="Ngành nghề" name="industry" className={selectClass} disabled={pending} defaultValue={company.industry ?? ""}>
                <option value="">Chọn ngành nghề</option>
                {Object.entries(industryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Quy mô công ty</span>
              <select aria-label="Quy mô công ty" name="size" className={selectClass} disabled={pending} defaultValue={company.size ?? ""}>
                <option value="">Chọn quy mô</option>
                {Object.entries(sizeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            
            <label className="block space-y-1.5 text-sm font-semibold text-foreground">
              <span>Website</span>
              <input 
                name="website" 
                type="url" 
                disabled={pending} 
                defaultValue={company.website ?? ""} 
                className={cn("h-11 w-full rounded-lg border border-border-light bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]")}
              />
            </label>

            <label className="block space-y-1.5 text-sm font-semibold text-foreground">
              <span>Địa chỉ trụ sở chính</span>
              <input 
                name="location" 
                disabled={pending} 
                defaultValue={company.location ?? ""} 
                className={cn("h-11 w-full rounded-lg border border-border-light bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]")}
              />
            </label>
          </div>
        </section>

        <div className="h-px bg-border-light" />

        {/* Mô tả công ty */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-foreground">Mô tả công ty</h2>
          
          <div className="overflow-hidden rounded-lg border border-border-light focus-within:ring-2 focus-within:ring-[#2563EB]">
            {/* Mock Rich Text Toolbar */}
            <div className="flex items-center gap-1 border-b border-border-light bg-[#F1F5F9] px-3 py-2 text-text-muted">
              <button type="button" className="rounded p-1.5 hover:bg-white hover:text-foreground"><Bold className="h-4 w-4" /></button>
              <button type="button" className="rounded p-1.5 hover:bg-white hover:text-foreground"><Italic className="h-4 w-4" /></button>
              <button type="button" className="rounded p-1.5 hover:bg-white hover:text-foreground"><Underline className="h-4 w-4" /></button>
              <div className="mx-1 h-4 w-px bg-border-strong" />
              <button type="button" className="rounded p-1.5 hover:bg-white hover:text-foreground"><List className="h-4 w-4" /></button>
              <button type="button" className="rounded p-1.5 hover:bg-white hover:text-foreground"><LinkIcon className="h-4 w-4" /></button>
            </div>
            
            <textarea 
              aria-label="Mô tả công ty" 
              name="description" 
              disabled={pending} 
              defaultValue={company.description ?? ""} 
              className="min-h-[200px] w-full resize-y border-none p-4 text-sm focus:outline-none" 
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <Link href="/recruiter" className="inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold text-[#0047AB] transition-colors hover:bg-blue-50">
            Hủy
          </Link>
          <button 
            type="submit" 
            disabled={pending} 
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0047AB] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <aside className="sticky top-6 space-y-6">
        
        {/* Quyền sở hữu */}
        <section className="rounded-2xl bg-[#F8FAFC] p-6 shadow-sm ring-1 ring-border-light">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-green-600" /> Quyền sở hữu
          </div>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Trang công ty này hiện đang được quản lý bởi tài khoản của bạn. Các thay đổi sẽ có hiệu lực ngay lập tức sau khi lưu.
          </p>
          
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-border-light">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Recruiter Admin</span>
              <span className="text-xs font-medium text-text-muted">Quản trị viên cấp cao</span>
            </div>
          </div>
          
          <div className="mt-5">
            <button type="button" className="text-sm font-bold text-[#0047AB] hover:underline">
              Quản lý phân quyền & thành viên
            </button>
          </div>
        </section>

        {/* Gợi ý hoàn thiện */}
        <section className="rounded-2xl bg-[#F8FAFC] p-6 shadow-sm ring-1 ring-border-light">
          <h3 className="font-bold text-foreground">Gợi ý hoàn thiện</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Cập nhật Logo công ty
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Xác minh tên miền (Website)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-text-muted">
              <div className="h-4 w-4 rounded-full border-2 border-border-strong" />
              Thêm ảnh bìa (Cover Image)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-text-muted">
              <div className="h-4 w-4 rounded-full border-2 border-border-strong" />
              Liên kết mạng xã hội (LinkedIn)
            </li>
          </ul>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Độ hoàn thiện hồ sơ</span>
              <span className="text-green-700">50%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-light">
              <div className="h-full w-1/2 bg-green-600" />
            </div>
          </div>
        </section>
      </aside>

      {/* Floating Success Toast Mockup */}
      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-border-light animate-in slide-in-from-bottom-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Lưu thành công</h4>
            <p className="text-xs text-text-muted">Thông tin công ty đã được cập nhật.</p>
          </div>
        </div>
      )}
    </form>
  );
}
