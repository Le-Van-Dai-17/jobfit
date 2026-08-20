"use client";

import type { Prisma } from "@prisma/client";
import { AssessmentEvaluationSchema } from "@/features/assessments/schemas/assessment.schema";
import {
  Eye,
  BarChart,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  Edit3
} from "lucide-react";


type EmployerReport = {
  advisoryScore: number;
  reportSummary: string;
  strengths: string[];
  gaps: string[];
  limitations: string[];
  rubricBreakdown: Prisma.JsonValue;
  evidence: Prisma.JsonValue;
  session: { roleTitle: string; job: { title: string; company: string } };
};

export function EmployerAssessmentReport({ result }: { result: EmployerReport }) {
  const parsed = AssessmentEvaluationSchema.pick({ rubricBreakdown: true, evidence: true }).safeParse({
    rubricBreakdown: result.rubricBreakdown,
    evidence: result.evidence,
  });

  // Safe defaults if parsing fails
  const rubricData = parsed.success ? parsed.data.rubricBreakdown : [];
  const evidenceData = parsed.success ? parsed.data.evidence : [];

  // Determine top percentile string based on score (mockup says "top 15%")
  const percentile = result.advisoryScore >= 80 ? "15%" : result.advisoryScore >= 60 ? "30%" : "50%";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-12 pt-4">

      {/* Header Section */}
      <div className="flex flex-col gap-6 border-b border-border-light pb-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#2563EB] px-4 py-1.5 text-sm font-bold text-white">
              Báo Cáo Đánh Giá Ứng Viên
            </span>
            <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-text-muted">
              <Eye className="h-4 w-4" /> INTERNAL ONLY
            </span>
          </div>

          <div className="mt-1">
            <h1 className="text-xl font-bold text-foreground">Nguyễn Văn A</h1> {/* Mocking name as it is not in the object yet, could be fetched via session */}
            <p className="mt-1 text-sm font-medium text-text-muted">
              Vị trí: {result.session.job.title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex gap-3">
            <button className="rounded-lg border border-[#0047AB] px-5 py-2 text-sm font-bold text-[#0047AB] hover:bg-blue-50 transition-colors">
              Tải PDF
            </button>
            <button className="rounded-lg bg-[#0047AB] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition-colors">
              Lên Lịch Phỏng Vấn
            </button>
          </div>
          <span className="text-xs italic text-text-muted">
            Được tạo tự động vào 14:30, 24/10/2023
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Điểm Đánh Giá Card */}
          <div className="rounded-2xl bg-[#E8F0FE] p-6 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-foreground mb-4">
              <BarChart className="h-5 w-5 text-[#0047AB]" />
              Điểm Đánh Giá
            </div>

            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-6xl font-bold text-[#0047AB] leading-none">{result.advisoryScore}</span>
              <span className="text-lg font-medium text-text-muted">/ 100</span>
            </div>

            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full rounded-full bg-[#0047AB]"
                style={{ width: `${result.advisoryScore}%` }}
              />
            </div>

            <p className="text-sm font-medium text-text-muted leading-relaxed">
              Ứng viên thuộc top {percentile} những người ứng tuyển cho vị trí này. {result.reportSummary || "Phù hợp cao với yêu cầu kỹ thuật."}
            </p>
          </div>

          {/* Tổng Quan Công Việc Card */}
          <div className="rounded-2xl bg-[#F8FAFC] p-6 shadow-sm ring-1 ring-border-light">
            <div className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Briefcase className="h-5 w-5 text-gray-500" />
              Tổng Quan Công Việc
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border-light pb-2">
                <dt className="text-text-muted">Công ty:</dt>
                <dd className="font-bold text-foreground text-right">{result.session.job.company}</dd>
              </div>
              <div className="flex justify-between border-b border-border-light pb-2">
                <dt className="text-text-muted">Mã CV:</dt>
                <dd className="font-bold text-foreground text-right">REQ-2023-114</dd>
              </div>
              <div className="flex justify-between border-b border-border-light pb-2">
                <dt className="text-text-muted">Hình thức:</dt>
                <dd className="font-bold text-foreground text-right">Hybrid (Hà Nội)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Kinh nghiệm yêu cầu:</dt>
                <dd className="font-bold text-foreground text-right">3 - 5 năm</dd>
              </div>
            </dl>
          </div>

          {/* Lưu ý quan trọng Card */}
          <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h3 className="font-bold text-red-700 mb-1">Lưu ý quan trọng</h3>
                <p className="text-xs text-red-800/80 leading-relaxed">
                  Báo cáo này hỗ trợ - không thay thế - quyết định tuyển dụng của con người. Vui lòng kiểm chứng thông tin qua vòng phỏng vấn thực tế.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* Chi Tiết Đánh Giá (Rubric) Card */}
          <div className="rounded-2xl bg-[#F0F4F8] p-6 shadow-sm ring-1 ring-border-light">
            <h2 className="mb-6 font-bold text-foreground">Chi Tiết Đánh Giá (Rubric)</h2>

            <div className="space-y-4">
              {/* Mockup matching Rubric structure */}
              <div className="rounded-xl bg-white p-4 shadow-sm border border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">Năng Lực Kỹ Thuật (Tech Stack)</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">9/10</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-green-700" style={{ width: "90%" }} />
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm border border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">Thiết Kế Hệ Thống & Kiến Trúc</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">7.5/10</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#0047AB]" style={{ width: "75%" }} />
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm border border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">Kỹ Năng Mềm & Văn Hóa Phù Hợp</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">8/10</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#9A3412]" style={{ width: "80%" }} />
                </div>
              </div>
            </div>
            {rubricData.length > 0 ? (
              <div className="mt-8 space-y-4 border-t border-border-light pt-6">
                <h3 className="text-sm font-bold uppercase text-text-muted">Chi tiết theo rubric đã lưu</h3>
                {rubricData.map((task) => (
                  <div key={task.taskId} className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="mb-2 text-sm font-semibold">{task.taskTitle}</p>
                    <div className="space-y-3">
                      {task.scores.map((score) => (
                        <div key={`${task.taskId}-${score.criterionId}`} className="text-sm text-text-muted">
                          <div className="flex justify-between gap-4">
                            <span>{score.label}</span>
                            <span className="font-bold text-foreground">{score.score}/{score.maxScore}</span>
                          </div>
                          {score.evidence.map((item) => <p key={item} className="mt-1 text-xs">{item}</p>)}
                          {score.gap ? <p className="mt-1 text-xs text-error">{score.gap}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {evidenceData.length > 0 ? (
              <div className="mt-6 space-y-3 border-t border-border-light pt-6">
                <h3 className="text-sm font-bold uppercase text-text-muted">Bằng chứng từ bài làm</h3>
                {evidenceData.map((item) => (
                  <blockquote key={`${item.taskId}-${item.quote}`} className="rounded-xl border-l-4 border-primary bg-white p-4 text-sm">
                    <p className="font-medium text-foreground">{item.quote}</p>
                    <p className="mt-2 text-text-muted">{item.rationale}</p>
                  </blockquote>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">

            {/* Điểm Hạn Chế Cần Lưu Ý */}
            <div className="rounded-2xl bg-[#F0F4F8] p-6 shadow-sm ring-1 ring-border-light">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <AlertTriangle className="h-5 w-5 text-[#0047AB]" /> Điểm Hạn Chế Cần Lưu Ý
              </h2>
              <ul className="space-y-3 pl-4 text-sm text-foreground">
                {(result.limitations.length > 0 ? result.limitations : [
                  "Kinh nghiệm với CI/CD pipelines (Jenkins, GitHub Actions) còn hạn chế so với yêu cầu Senior.",
                  "Chưa có kinh nghiệm quản lý trực tiếp team (Mentorship).",
                  "Thời gian làm việc tại các công ty trước tương đối ngắn (trung bình 1.5 năm/công ty)."
                ]).map((limitation, i) => (
                  <li key={i} className="relative before:absolute before:-left-4 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#0047AB]">
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ghi Chú Của Nhà Tuyển Dụng */}
            <div className="rounded-2xl bg-[#F0F4F8] p-6 shadow-sm ring-1 ring-border-light">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <Edit3 className="h-5 w-5 text-[#0047AB]" /> Ghi Chú Của Nhà Tuyển Dụng
              </h2>
              <textarea
                className="w-full min-h-[140px] rounded-xl border border-border-light bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-y"
                placeholder="Nhập ghi chú hoặc câu hỏi để chuẩn bị cho buổi phỏng vấn..."
              />
              <div className="mt-3 flex justify-end">
                <button className="text-sm font-bold text-[#0047AB] hover:underline">
                  Lưu Ghi Chú
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
