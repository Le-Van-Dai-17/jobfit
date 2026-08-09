"use client";

import { 
  Briefcase, 
  FileText, 
  MapPin, 
  Banknote, 
  Tag, 
  Send,
  X,
  Plus
} from "lucide-react";
import { useActionState, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createRecruiterJobAction, type RecruiterActionState } from "../actions/recruiter.actions";
import { cn } from "@/lib/utils";

const initialState: RecruiterActionState = {};
const selectClass = "h-11 w-full rounded-lg border border-border-light bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]";

export function RecruiterJobForm() {
  const [state, formAction, pending] = useActionState(createRecruiterJobAction, initialState);
  
  // Local state for UI mockups
  const [workMode, setWorkMode] = useState("ONSITE");
  const [isNegotiable, setIsNegotiable] = useState(true);

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full pb-12">
      
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border-light pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground">Tạo Tin Tuyển Dụng Mới</h1>
          <p className="mt-2 text-sm text-text-muted">
            Cung cấp thông tin chi tiết về vị trí cần tuyển để thu hút những ứng viên phù hợp nhất. Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            name="intent" 
            value="draft" 
            type="submit" 
            disabled={pending} 
            className="h-11 px-6 text-sm font-semibold text-foreground hover:bg-surface-low rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            Lưu Nháp
          </button>
          <button 
            name="intent" 
            value="publish" 
            type="submit" 
            disabled={pending} 
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0047AB] px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Đăng Tin Tuyển Dụng
          </button>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        
        {/* Left Column (Main Form) */}
        <div className="flex flex-col gap-8">
          
          {/* Thông Tin Chung */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border-light pb-3">
              <Briefcase className="h-5 w-5 text-[#2563EB]" />
              <h2 className="text-lg font-bold text-foreground">Thông Tin Chung</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Field 
                label="Chức danh công việc" 
                name="title" 
                required 
                disabled={pending} 
                placeholder="VD: Senior Frontend Developer"
                className="md:col-span-2" 
              />
              <Select 
                label="Phòng ban" 
                name="department" 
                disabled={pending} 
                options={departmentOptions} 
                defaultValue="" 
              />
              <Select 
                label="Kinh nghiệm yêu cầu" 
                name="experienceLevel" 
                required
                disabled={pending} 
                options={experienceOptions} 
                defaultValue="" 
              />
            </div>
            {/* Hidden fields that the form action still expects but aren't in the mockup */}
            <input type="hidden" name="employmentType" value="FULL_TIME" />
            <input type="hidden" name="deadline" value="" />
          </section>

          {/* Chi Tiết Công Việc */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border-light pb-3">
              <FileText className="h-5 w-5 text-[#2563EB]" />
              <h2 className="text-lg font-bold text-foreground">Chi Tiết Công Việc</h2>
            </div>
            
            <div className="space-y-6">
              <Area 
                label="Mô tả công việc" 
                name="description" 
                required 
                disabled={pending} 
                placeholder="Mô tả các nhiệm vụ chính, dự án sẽ tham gia..."
              />
              <Area 
                label="Yêu cầu ứng viên" 
                name="requirements" 
                required 
                disabled={pending} 
                placeholder="Kỹ năng, bằng cấp, thái độ làm việc cần thiết..."
              />
              <Area 
                label="Quyền lợi" 
                name="benefits" 
                disabled={pending} 
                placeholder="Chế độ đãi ngộ, bảo hiểm, văn hóa công ty..."
              />
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar Settings) */}
        <aside className="space-y-6 sticky top-6">
          
          {/* Địa Điểm & Thời Gian */}
          <section className="rounded-2xl bg-[#F0F7FF] p-6">
            <div className="flex items-center gap-2 font-bold text-foreground mb-5">
              <MapPin className="h-5 w-5 text-green-600" />
              Địa Điểm & Thời Gian
            </div>
            
            <div className="space-y-5">
              <div>
                <span className="block text-sm font-semibold text-foreground mb-2">Hình thức làm việc</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button" 
                    onClick={() => setWorkMode("ONSITE")}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      workMode === "ONSITE" ? "bg-[#2563EB] text-white" : "bg-white text-foreground border border-border-light hover:bg-gray-50"
                    )}
                  >
                    Tại văn phòng
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setWorkMode("HYBRID")}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      workMode === "HYBRID" ? "bg-[#2563EB] text-white" : "bg-white text-foreground border border-border-light hover:bg-gray-50"
                    )}
                  >
                    Hybrid
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setWorkMode("REMOTE")}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      workMode === "REMOTE" ? "bg-[#2563EB] text-white" : "bg-white text-foreground border border-border-light hover:bg-gray-50"
                    )}
                  >
                    Remote
                  </button>
                </div>
                {/* Hidden input to pass the actual form value */}
                <input type="hidden" name="workMode" value={workMode} />
              </div>

              <div>
                <Select 
                  label="Thành phố" 
                  name="location" 
                  required
                  disabled={pending} 
                  options={[["Hà Nội", "Hà Nội"], ["Hồ Chí Minh", "Hồ Chí Minh"], ["Đà Nẵng", "Đà Nẵng"]]} 
                  defaultValue="Hà Nội"
                />
              </div>
            </div>
          </section>

          {/* Mức Lương */}
          <section className="rounded-2xl bg-[#F0F7FF] p-6">
            <div className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Banknote className="h-5 w-5 text-red-700" />
              Mức Lương
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="salaryNegotiable" 
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  disabled={pending} 
                  className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-sm font-semibold text-foreground">Thỏa thuận</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5 text-sm font-semibold text-foreground">
                  <span className="text-xs text-text-muted font-normal">Tối thiểu (VND)</span>
                  <input 
                    name="salaryMin" 
                    type="number" 
                    disabled={pending || isNegotiable} 
                    placeholder="e.g. 15000000"
                    className="h-11 w-full rounded-lg border-none bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-semibold text-foreground">
                  <span className="text-xs text-text-muted font-normal">Tối đa (VND)</span>
                  <input 
                    name="salaryMax" 
                    type="number" 
                    disabled={pending || isNegotiable} 
                    placeholder="e.g. 30000000"
                    className="h-11 w-full rounded-lg border-none bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </label>
              </div>
              <input type="hidden" name="salaryCurrency" value="VND" />
            </div>
          </section>

          {/* Kỹ Năng (Tags) */}
          <section className="rounded-2xl bg-[#F0F7FF] p-6">
            <div className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Tag className="h-5 w-5 text-blue-400" />
              Kỹ Năng (Tags)
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập kỹ năng và nhấn Enter..." 
                  disabled={pending} 
                  className="h-11 w-full rounded-lg border-none bg-white pl-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E2E8F0] px-3 py-1 text-xs font-semibold text-foreground">
                  React
                  <button type="button" className="rounded-full p-0.5 hover:bg-gray-300"><X className="h-3 w-3" /></button>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E2E8F0] px-3 py-1 text-xs font-semibold text-foreground">
                  TypeScript
                  <button type="button" className="rounded-full p-0.5 hover:bg-gray-300"><X className="h-3 w-3" /></button>
                </span>
              </div>
              
              {/* Hidden input to pass actual form value */}
              <input type="hidden" name="skills" value="React,TypeScript" />
            </div>
          </section>

        </aside>
      </div>
    </form>
  );
}

const departmentOptions = [["ENGINEERING","Kỹ thuật"],["PRODUCT","Sản phẩm"],["DESIGN","Thiết kế"],["DATA","Dữ liệu"],["MARKETING","Marketing"],["SALES","Kinh doanh"],["OPERATIONS","Vận hành"],["HUMAN_RESOURCES","Nhân sự"],["FINANCE","Tài chính"],["OTHER","Khác"]];
const experienceOptions = [["INTERN","Thực tập"],["JUNIOR","Junior"],["MID","Middle"],["SENIOR","Senior"],["LEAD","Lead"],["MANAGER","Quản lý"]];

function Field({ label, name, disabled, required=false, type="text", className="", placeholder }: { label:string; name:string; disabled:boolean; required?:boolean; type?:string; className?:string; placeholder?:string }) {
  return (
    <label className={`block space-y-1.5 text-sm font-semibold text-foreground ${className}`}>
      <span>{label}{required ? <span className="text-red-500"> *</span> : ""}</span>
      <input 
        name={name} 
        type={type} 
        required={required} 
        disabled={disabled} 
        placeholder={placeholder} 
        className={cn("h-11 w-full rounded-lg border border-border-light bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]")}
      />
    </label>
  );
}

function Area({ label, name, disabled, required=false, placeholder }: { label:string; name:string; disabled:boolean; required?:boolean; placeholder?:string }) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}{required ? <span className="text-red-500"> *</span> : ""}</span>
      <Textarea 
        name={name} 
        required={required} 
        disabled={disabled} 
        placeholder={placeholder}
        className="min-h-36 resize-y border border-border-light bg-white p-4 focus-visible:ring-[#2563EB]" 
      />
    </label>
  );
}

function Select({ label, name, disabled, options, defaultValue="", required=false }: { label:string; name:string; disabled:boolean; options:string[][]; defaultValue?:string; required?:boolean }) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}{required ? <span className="text-red-500"> *</span> : ""}</span>
      <select 
        name={name} 
        disabled={disabled} 
        defaultValue={defaultValue}
        required={required}
        className={selectClass}
      >
        <option value="" disabled>Chọn {label.toLowerCase()}</option>
        {options.map(([value,text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );
}
