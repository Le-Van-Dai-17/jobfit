import type { ApplicationStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Clock,
  User,
  GraduationCap,
  BriefcaseBusiness,
  Code,
  Activity,
  BarChart,
  ArrowRight,
  Edit3
} from "lucide-react";

import { auth } from "@/auth";
import { getRequiredRoleRedirect } from "@/features/auth/services/role-redirects";
import { ApplicationTransitionForm } from "@/features/recruiter/components/ApplicationTransitionForm";
import {
  RecruiterAccessError,
  getAllowedApplicationTransitions,
  recruiterService,
} from "@/features/recruiter/services/recruiter.service";
import { cn } from "@/lib/utils";

type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  notes: string | null;
  user: { name: string | null; email: string | null };
  job: { title: string; company: string };
  resumeVersion: { version: number; content: Prisma.JsonValue; resume: { title: string } } | null;
  events: Array<{ id: string; type: string; notes: string | null; date: Date }>;
  assessmentSessions: Array<{
    id: string;
    status: string;
    result: { id: string; advisoryScore: number } | null;
  }>;
};

export default async function RecruiterApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const session = await auth();
  const roleRedirect = getRequiredRoleRedirect({ user: session?.user, requiredRole: "RECRUITER" });
  if (roleRedirect) redirect(roleRedirect);
  const user = session!.user;
  const { applicationId } = await params;

  let application: ApplicationDetail;
  try {
    application = (await recruiterService.getApplication(user.id, applicationId)) as ApplicationDetail;
  } catch (error) {
    if (error instanceof RecruiterAccessError) notFound();
    throw error;
  }

  const nextStatuses = getAllowedApplicationTransitions(application.status);
  const latestAssessment = application.assessmentSessions[0];

  const candidateName = application.user.name ?? "Ứng viên";
  const candidateInitials = candidateName.substring(0, 2).toUpperCase();

  // Mocking timeline steps
  const steps = [
    { label: "Đã ứng tuyển", date: "15/10/2023", completed: true },
    { label: "Sàng lọc CV", date: "Đang xử lý", active: true },
    { label: "Phỏng vấn chuyên môn", date: "Chưa diễn ra", completed: false },
    { label: "Đề nghị nhận việc", date: "Chưa diễn ra", completed: false },
  ];

  return (
    <div className="bg-[#F8FAFC] -m-6 p-6 min-h-screen">
      <div className="mx-auto grid max-w-7xl items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Profile Header */}
          <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="absolute left-0 top-0 h-full w-2 bg-[#2563EB]" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              
              <div className="flex gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl font-bold text-blue-700 shadow-inner">
                    {candidateInitials}
                  </div>
                  <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">{candidateName}</h1>
                    <span className="rounded bg-[#E8F0FE] px-2 py-0.5 text-xs font-bold text-[#0047AB]">
                      {application.status === "APPLIED" ? "MỚI ỨNG TUYỂN" : application.status}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {application.job.title}
                  </p>
                  
                  <div className="mt-3 grid gap-x-6 gap-y-2 text-sm font-medium text-text-muted sm:grid-cols-2">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Hồ Chí Minh, Việt Nam</span>
                    <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> 5 năm kinh nghiệm</span>
                    <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {application.user.email}</span>
                    <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +84 987 654 321</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0047AB] px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Liên hệ ứng viên
                </button>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E8F0FE] px-5 text-sm font-semibold text-[#0047AB] hover:bg-blue-100 transition-colors">
                  <Download className="h-4 w-4" />
                  Tải CV Gốc
                </button>
              </div>

            </div>
          </section>

          {/* Chi tiết CV Ứng tuyển */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center justify-between border-b border-border-light pb-4 mb-6">
              <h2 className="text-lg font-bold text-foreground">Chi tiết CV Ứng tuyển</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                <Clock className="h-4 w-4" /> Nộp lúc: 14:30 - 15/10/2023
              </div>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2">
              
              {/* Mục tiêu & Học vấn */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0047AB]">
                    <User className="h-4 w-4" /> Mục tiêu nghề nghiệp
                  </h3>
                  <div className="rounded-xl bg-[#F8FAFC] p-4 text-sm leading-relaxed text-foreground">
                    Trở thành một Backend Tech Lead trong 3 năm tới, xây dựng các hệ thống scalable có khả năng chịu tải cao. Mong muốn làm việc trong môi trường Agile chuyên nghiệp, đề cao văn hóa code sạch và TDD.
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0047AB]">
                    <GraduationCap className="h-4 w-4" /> Học vấn
                  </h3>
                  <div className="rounded-xl bg-[#F8FAFC] p-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">Đại học Bách Khoa TP.HCM</span>
                      <span className="text-xs font-semibold text-text-muted">2014 - 2018</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">Kỹ sư Khoa học Máy tính</p>
                    <p className="mt-2 text-sm font-bold text-green-600">GPA: 3.6/4.0</p>
                  </div>
                </div>
              </div>

              {/* Kinh nghiệm làm việc */}
              <div className="sm:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0047AB]">
                  <BriefcaseBusiness className="h-4 w-4" /> Kinh nghiệm làm việc
                </h3>
                
                <div className="relative space-y-6 pl-4 border-l-2 border-border-light ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-[#2563EB] ring-4 ring-white" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <span className="font-bold text-foreground">Senior Backend Engineer at TechNova Solutions</span>
                      <span className="text-xs font-semibold text-text-muted">03/2021 - Hiện tại</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5">
                      <li>Thiết kế và phát triển microservices bằng Java 17, Spring Boot, triển khai trên K8s.</li>
                      <li>Tối ưu hóa query database PostgreSQL, giảm thời gian phản hồi API trung bình từ 500ms xuống 120ms.</li>
                      <li>Dẫn dắt team 3 junior devs, review code và đảm bảo chất lượng phần mềm theo chuẩn Clean Architecture.</li>
                    </ul>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-border-strong ring-4 ring-white" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <span className="font-bold text-foreground">Backend Developer at FinTech Asia</span>
                      <span className="text-xs font-semibold text-text-muted">08/2018 - 02/2021</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5">
                      <li>Xây dựng hệ thống thanh toán cốt lõi xử lý 10,000+ giao dịch mỗi ngày.</li>
                      <li>Tích hợp với các đối tác ví điện tử qua RESTful APIs.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kỹ năng chuyên môn */}
              <div className="sm:col-span-2 mt-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0047AB]">
                  <Code className="h-4 w-4" /> Kỹ năng chuyên môn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Java (Spring Boot)", "PostgreSQL", "Redis", "Kafka", "Docker / Kubernetes", "AWS", "Microservices"].map(skill => (
                    <span key={skill} className="rounded-full bg-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Right Column */}
        <aside className="flex flex-col gap-6">
          
          {/* Quy trình tuyển dụng */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Quy trình tuyển dụng</h2>
              <Activity className="h-5 w-5 text-text-muted" />
            </div>

            <div className="relative pl-3 space-y-6">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[19px] top-2 bottom-4 w-px bg-border-light" />
              
              {steps.map((step, idx) => {
                let dotClass = "bg-border-light";
                let textClass = "text-text-muted";
                
                if (step.active) {
                  dotClass = "bg-[#2563EB] ring-4 ring-blue-50";
                  textClass = "text-[#0047AB] font-bold";
                } else if (step.completed) {
                  dotClass = "bg-green-500";
                  textClass = "text-foreground font-medium";
                }

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full mt-1 shrink-0 bg-white">
                      <div className={cn("h-3 w-3 rounded-full", dotClass)} />
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("text-sm", textClass)}>{step.label}</span>
                      <span className="text-xs font-medium text-text-muted">{step.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-border-light">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Cập nhật trạng thái</p>
              <ApplicationTransitionForm applicationId={application.id} nextStatuses={nextStatuses} />
            </div>
          </section>

          {/* Đánh giá AI */}
          <section className="rounded-2xl border-l-4 border-l-[#991B1B] bg-[#FFF5F5] p-6 shadow-sm ring-1 ring-border-light relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <BarChart className="h-5 w-5 text-red-700" /> Đánh giá AI
              </h2>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#991B1B] bg-white text-sm font-bold text-[#991B1B]">
                {latestAssessment?.result ? latestAssessment.result.advisoryScore : "85%"}
              </div>
            </div>
            
            <p className="text-sm font-medium text-foreground mb-3">
              Độ phù hợp với vị trí: <span className="font-bold">Cao</span>
            </p>
            
            <div className="rounded-xl bg-[#FFE4E6] p-4 text-sm font-medium text-red-900 leading-relaxed mb-4">
              Kỹ năng Java và Spring Boot khớp hoàn toàn. Kinh nghiệm Microservices và TDD là điểm cộng lớn. Cần kiểm tra thêm khả năng giao tiếp tiếng Anh.
            </div>

            <Link 
              href={`/recruiter/assessments/${application.id}`}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#0047AB] hover:underline"
            >
              Xem báo cáo chi tiết <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {/* Ghi chú nội bộ */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border-light">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
              <Edit3 className="h-5 w-5 text-text-muted" /> Ghi chú nội bộ
            </h2>
            <textarea 
              className="w-full min-h-[120px] rounded-xl border border-border-light bg-[#F8FAFC] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-y"
              placeholder="Thêm ghi chú về ứng viên này..."
              defaultValue={application.notes ?? ""}
            />
            <div className="mt-3 flex justify-end">
              <button className="rounded-lg bg-[#E2E8F0] px-4 py-2 text-sm font-bold text-foreground hover:bg-gray-300 transition-colors">
                Lưu ghi chú
              </button>
            </div>
          </section>

        </aside>

      </div>
    </div>
  );
}
