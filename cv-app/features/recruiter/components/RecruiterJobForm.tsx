"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createRecruiterJobAction, type RecruiterActionState } from "../actions/recruiter.actions";

const initialState: RecruiterActionState = {};
const selectClass = "h-12 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function RecruiterJobForm() {
  const [state, formAction, pending] = useActionState(createRecruiterJobAction, initialState);
  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-outline-variant/60 bg-white p-5 shadow-card md:p-6">
          <div className="flex items-start gap-3 border-b border-outline-variant/50 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary"><BriefcaseBusiness className="h-5 w-5" /></span>
            <div><p className="text-sm font-semibold text-primary">Thông tin chung</p><h2 className="text-xl font-bold">Tạo tin tuyển dụng mới</h2></div>
          </div>
          {state.error ? <p role="alert" className="mt-4 rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Chức danh công việc" name="title" required disabled={pending} className="md:col-span-2" />
            <Select label="Phòng ban" name="department" disabled={pending} options={departmentOptions} />
            <Select label="Mức kinh nghiệm" name="experienceLevel" disabled={pending} options={experienceOptions} />
            <Select label="Loại hình tuyển dụng" name="employmentType" disabled={pending} options={employmentOptions} />
            <Field label="Địa điểm" name="location" disabled={pending} />
            <Field label="Hạn ứng tuyển" name="deadline" type="date" disabled={pending} />
            <Field label="Liên kết JD" name="url" type="url" disabled={pending} className="md:col-span-2" />
          </div>
        </section>
        <section className="space-y-4 rounded-2xl border border-outline-variant/60 bg-white p-5 shadow-card md:p-6">
          <h2 className="text-xl font-bold">Chi tiết công việc</h2>
          <Area label="Mô tả công việc" name="description" required disabled={pending} />
          <Area label="Yêu cầu ứng viên" name="requirements" required disabled={pending} />
          <Area label="Quyền lợi" name="benefits" disabled={pending} />
        </section>
      </div>
      <aside className="space-y-5">
        <section className="rounded-2xl bg-surface-container p-5">
          <Select label="Hình thức làm việc" name="workMode" disabled={pending} options={workModeOptions} />
        </section>
        <section className="space-y-4 rounded-2xl bg-surface-container p-5">
          <h2 className="font-bold">Mức lương</h2>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="salaryNegotiable" disabled={pending} /> Thỏa thuận</label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Field label="Lương tối thiểu" name="salaryMin" type="number" disabled={pending} />
            <Field label="Lương tối đa" name="salaryMax" type="number" disabled={pending} />
          </div>
          <Select label="Đơn vị tiền tệ" name="salaryCurrency" disabled={pending} options={[["VND","VND"],["USD","USD"]]} defaultValue="VND" />
        </section>
        <section className="rounded-2xl bg-surface-container p-5">
          <Field label="Kỹ năng" name="skills" disabled={pending} placeholder="React, TypeScript, PostgreSQL" />
          <p className="mt-2 text-xs text-text-muted">Phân tách các kỹ năng bằng dấu phẩy.</p>
        </section>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <button name="intent" value="draft" type="submit" disabled={pending} className="h-11 rounded-lg border border-primary px-5 text-sm font-semibold text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60">{pending ? "Đang lưu..." : "Lưu bản nháp"}</button>
          <button name="intent" value="publish" type="submit" disabled={pending} className="h-11 rounded-lg bg-primary-container px-5 text-sm font-semibold text-white shadow-card hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60">Đăng tin tuyển dụng</button>
        </div>
      </aside>
    </form>
  );
}

const departmentOptions = [["ENGINEERING","Kỹ thuật"],["PRODUCT","Sản phẩm"],["DESIGN","Thiết kế"],["DATA","Dữ liệu"],["MARKETING","Marketing"],["SALES","Kinh doanh"],["OPERATIONS","Vận hành"],["HUMAN_RESOURCES","Nhân sự"],["FINANCE","Tài chính"],["OTHER","Khác"]];
const experienceOptions = [["INTERN","Thực tập"],["JUNIOR","Junior"],["MID","Middle"],["SENIOR","Senior"],["LEAD","Lead"],["MANAGER","Quản lý"]];
const employmentOptions = [["FULL_TIME","Toàn thời gian"],["PART_TIME","Bán thời gian"],["CONTRACT","Hợp đồng"],["INTERNSHIP","Thực tập"],["TEMPORARY","Thời vụ"]];
const workModeOptions = [["ONSITE","Tại văn phòng"],["HYBRID","Hybrid"],["REMOTE","Từ xa"]];
function Field({ label, name, disabled, required=false, type="text", className="", placeholder }: { label:string; name:string; disabled:boolean; required?:boolean; type?:string; className?:string; placeholder?:string }) {
  return <label className={`block space-y-1.5 text-sm font-semibold ${className}`}><span>{label}{required ? " *" : ""}</span><Input aria-label={label} name={name} type={type} required={required} disabled={disabled} placeholder={placeholder} /></label>;
}
function Area({ label, name, disabled, required=false }: { label:string; name:string; disabled:boolean; required?:boolean }) {
  return <label className="block space-y-1.5 text-sm font-semibold"><span>{label}{required ? " *" : ""}</span><Textarea aria-label={label} name={name} required={required} disabled={disabled} className="min-h-36" /></label>;
}
function Select({ label, name, disabled, options, defaultValue="" }: { label:string; name:string; disabled:boolean; options:string[][]; defaultValue?:string }) {
  return <label className="block space-y-1.5 text-sm font-semibold"><span>{label}</span><select aria-label={label} className={selectClass} name={name} disabled={disabled} defaultValue={defaultValue}><option value="">Chọn</option>{options.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}
