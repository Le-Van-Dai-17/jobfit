import AtsGauge from "@/components/dashboard/AtsGauge";
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Bot,
  KanbanSquare,
  ArrowRight,
  Building2,
  MapPin,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

const stats = [
  { title: "Công việc phù hợp AI", value: "24", change: "+5 tuần này", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "Đơn đã ứng tuyển", value: "12", change: "4 đang phỏng vấn", icon: FileCheck2, color: "text-purple-600", bg: "bg-purple-50" },
  { title: "Điểm phỏng vấn AI", value: "9.2/10", change: "Xuất sắc", icon: Bot, color: "text-sky-600", bg: "bg-sky-50" },
  { title: "Tỷ lệ phản hồi CV", value: "68%", change: "+12% so với tháng trước", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Engineer (React/Next.js)",
    company: "TechVision AI Global",
    location: "TP. Hồ Chí Minh (Hybrid)",
    salary: "$2,500 - $3,500",
    match: 95,
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    id: 2,
    title: "Fullstack Developer (Node.js & AI Integration)",
    company: "Lumina Career Systems",
    location: "Hà Nội (Remote)",
    salary: "$2,000 - $3,000",
    match: 91,
    tags: ["React", "Node.js", "OpenAI API"],
  },
  {
    id: 3,
    title: "Lead UI/UX Engineer",
    company: "Innovate Labs Platform",
    location: "Đà Nẵng (On-site)",
    salary: "$2,200 - $2,800",
    match: 87,
    tags: ["Design Systems", "Figma", "React"],
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <FadeIn
        className="relative rounded-3xl gradient-primary p-8 text-white overflow-hidden shadow-lg shadow-indigo-200/50"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium text-indigo-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Career Agent Standard Edition</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Chào Vũ Nguyễn! CV của bạn sẵn sàng để bứt phá sự nghiệp 🚀
          </h1>
          <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
            Hệ thống AI đã phân tích hồ sơ và tìm thấy <strong className="text-white font-bold">24 công việc phù hợp</strong> với điểm chuẩn ATS của bạn trên 88%.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/job-optimization"
              className="px-4 py-2.5 bg-white text-indigo-900 font-bold rounded-xl text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Tối ưu CV ngay
            </Link>
            <Link
              href="/job-match"
              className="px-4 py-2.5 bg-indigo-700/50 hover:bg-indigo-700/70 border border-indigo-400/40 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              Phân tích Job Match
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Grid Overview Stats & ATS Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score Radial Card */}
        <AtsGauge score={88} />

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <FadeIn
                key={stat.title}
                delay={index * 0.1}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{stat.title}</span>
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Quick Access Modules Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/my-cv"
          className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900">Quản lý CV</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Chỉnh sửa & Mẫu đẹp</p>
        </Link>

        <Link
          href="/job-match"
          className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/80 hover:border-purple-200 transition-all text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900">Match CV với JD</p>
          <p className="text-[11px] text-slate-500 mt-0.5">So sánh điểm từ khóa</p>
        </Link>

        <Link
          href="/interview"
          className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900">Phỏng vấn AI</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Luyện phản xạ trực tiếp</p>
        </Link>

        <Link
          href="/tracker"
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-200 transition-all text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900">Bảng Ứng tuyển</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Theo dõi Kanban</p>
        </Link>
      </div>

      {/* Recommended Jobs & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Công việc phù hợp nhất</h3>
              <p className="text-xs text-slate-500">Thuật toán AI đề xuất dựa trên kỹ năng CV của bạn</p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Xem tất cả (24)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">
                      {job.match}% Match
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-200/60 text-slate-600 rounded-md text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:text-right space-y-2 shrink-0">
                  <div className="font-extrabold text-slate-900 text-sm">{job.salary}</div>
                  <Link
                    href="/tracker"
                    className="inline-flex items-center justify-center px-3.5 py-1.5 gradient-primary text-white font-semibold text-xs rounded-lg shadow-xs hover:opacity-95 transition-all"
                  >
                    Ứng tuyển ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Hoạt động gần đây</h3>
          <div className="space-y-4">
            <div className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Đã cập nhật CV Senior Frontend</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Đã tối ưu 6 từ khóa kỹ thuật mới</p>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> 2 giờ trước
                </span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Hoàn thành phỏng vấn AI React</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Đạt điểm 9.2/10 chủ đề State Management</p>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> Hôm qua
                </span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Đã nộp CV cho TechVision AI</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Vị trí Senior Frontend Developer</p>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> 2 ngày trước
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
