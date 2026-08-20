import {
  Building2,
  MapPin,
  Banknote,
  Hourglass,
  CheckCircle2,
  ChevronRight,
  Globe,
  Users
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ApplyToJobForm } from "@/features/applications/components/ApplyToJobForm";

import { resumeRepository } from "@/features/cv/repositories/resume.repository";
import { saveJobAction } from "@/features/jobs/actions/save-job";
import { jobRepository } from "@/features/jobs/repositories/job.repository";
import { applicationRepository } from "@/features/applications/repositories/application.repository";
import { translateJobInfo } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" });

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();

  const { jobId } = await params;
  const [job, resumes, saved, existingApplication] = await Promise.all([
    jobRepository.findPublishedById(jobId),
    session?.user?.id ? resumeRepository.findByUserId(session.user.id) : Promise.resolve([]),
    session?.user?.id ? jobRepository.findSavedJob(session.user.id, jobId) : Promise.resolve(null),
    session?.user?.id ? applicationRepository.findApplicationForUserAndJob(session.user.id, jobId) : Promise.resolve(null),
  ]);

  if (!job) notFound();

  const resumeVersions = resumes.flatMap((resume) =>
    resume.versions.map((version) => ({
      id: version.id,
      resumeTitle: resume.title,
      version: version.version
    }))
  );

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-screen">

      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-sm font-medium text-text-muted">
        <Link href="/jobs" className="hover:text-primary transition-colors">Việc làm</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-primary transition-colors cursor-pointer">Thiết kế & Nghệ thuật</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground truncate">{job.title}</span>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Hero Card */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-[#0047AB]">
                {job.company.charAt(0).toLocaleUpperCase("vi-VN")}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl leading-tight">
                    {job.title}
                  </h1>
                  <CheckCircle2 className="h-6 w-6 text-[#0047AB] shrink-0" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-text-muted">
                  <span className="font-bold text-foreground">{job.company}</span>
                  <span>•</span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />{translateJobInfo(job.location)}
                    </span>
                  )}
                  <span>•</span>
                  {job.type && (
                    <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {translateJobInfo(job.type)}
                    </span>
                  )}
                </div>

                {job.workMode && (
                  <div className="mt-3">
                    <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-text-muted">
                      {translateJobInfo(job.workMode)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl bg-[#F8FAFC] p-4 sm:grid-cols-2 border border-border-light">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0047AB]">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Mức lương</p>
                  <p className="text-base font-bold text-[#0047AB]">{job.salaryRange || "Thỏa thuận"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
                  <Hourglass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Hạn nộp hồ sơ</p>
                  <p className="text-base font-bold text-foreground">
                    {job.deadline ? dateFormatter.format(job.deadline) : "Không giới hạn"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0047AB]">Figma</span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0047AB]">UX Research</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">Webflow</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">Prototyping</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">Design System</span>
            </div>
          </section>

          {/* Job Details Block */}
          <article className="space-y-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light md:p-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Chi tiết công việc</h2>
              {job.description ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted space-y-4">
                  {job.description}
                </div>
              ) : (
                <p className="text-sm text-text-muted">Nhà tuyển dụng chưa công bố mô tả chi tiết.</p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Yêu cầu ứng viên</h2>
              {job.requirements ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted space-y-4">
                  {job.requirements}
                </div>
              ) : (
                <p className="text-sm text-text-muted">Nhà tuyển dụng chưa công bố yêu cầu chi tiết.</p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Quyền lợi</h2>
              <div className="text-sm leading-relaxed text-text-muted">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Thưởng tháng 13 và thưởng hiệu suất cuối năm.</li>
                  <li>Bảo hiểm sức khỏe cao cấp cho nhân viên và người thân.</li>
                  <li>Ngân sách học tập $500/năm để mua khóa học, tham gia hội thảo.</li>
                  <li>Cấp Macbook Pro M3 và màn hình ngoài khi nhận việc.</li>
                  <li>Môi trường làm việc linh hoạt, tôn trọng cá nhân.</li>
                </ul>
              </div>
            </section>
          </article>

          {/* Work Environment Block */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light md:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Môi trường làm việc</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-[4/3] w-full rounded-2xl bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=400&h=300" alt="Office 1" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-[4/3] w-full rounded-2xl bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400&h=300" alt="Office 2" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-[4/3] w-full rounded-2xl bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400&h=300" alt="Office 3" className="h-full w-full object-cover" />
              </div>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <aside className="space-y-6">

          {/* Apply Form Card */}
          <div id="apply" className="scroll-mt-24">
            {session?.user ? (
              existingApplication ? (
                <div className="rounded-3xl bg-blue-50/50 p-6 shadow-sm ring-1 ring-blue-100 text-center mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Đã ứng tuyển</h3>
                  <p className="text-sm text-text-muted mb-6">CV của bạn đã được gửi tới nhà tuyển dụng cho vị trí này.</p>
                  <Link href={`/applications/${existingApplication.id}`} className="flex w-full items-center justify-center rounded-xl bg-[#0047AB] px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 transition-colors">
                    Xem đơn ứng tuyển
                  </Link>
                </div>
              ) : (
                <>
                  <form id="saveJobForm" action={saveJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                  </form>
                  <ApplyToJobForm jobId={job.id} resumeVersions={resumeVersions} isSaved={saved != null} />
                </>
              )
            ) : (
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light text-center">
                <h3 className="font-bold text-foreground mb-4">Bạn chưa đăng nhập</h3>
                <p className="text-sm text-text-muted mb-6">Vui lòng đăng nhập hoặc tạo tài khoản để ứng tuyển và lưu công việc này.</p>
                <Link href="/login" className="flex w-full items-center justify-center rounded-xl bg-[#0047AB] px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 transition-colors">
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>

          {/* Company Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-[#0047AB]">
                {job.company.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-tight">{job.company}</h3>
                <Link href="#" className="text-xs font-bold text-[#0047AB] hover:underline">Xem trang công ty</Link>
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium text-text-muted mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-400" />
                <span>Quy mô: 50 - 150 nhân viên</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>Lĩnh vực: IT / Phần mềm (SaaS)</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>Quốc gia: Đa quốc gia</span>
              </div>
            </div>

            <div className="h-32 w-full rounded-2xl bg-gray-100 overflow-hidden border border-border-light">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400&h=200" alt="Map Location" className="h-full w-full object-cover grayscale opacity-80" />
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
