"use client";

import { useState } from "react";
import {
  Download,
  Share2,
  Plus,
  Trash2,
  User,
  Briefcase,
  Wrench
} from "lucide-react";

export default function MyCvPage() {
  const [activeTab, setActiveTab] = useState<"info" | "experience" | "skills">("info");

  const [resumeData, setResumeData] = useState({
    fullName: "Vũ Nguyễn",
    title: "Senior Frontend Engineer & UI Specialist",
    email: "vu.nguyen@example.com",
    phone: "+84 901 234 567",
    location: "TP. Hồ Chí Minh, Việt Nam",
    summary:
      "Kỹ sư Frontend với hơn 5 năm kinh nghiệm chuyên sâu về React, Next.js, TypeScript và Tailwind CSS. Có thế mạnh tối ưu hiệu năng web, xây dựng Design System quy mô lớn và tích hợp các ứng dụng Trí tuệ Nhân tạo AI.",
    experiences: [
      {
        id: "1",
        company: "TechVision Global AI",
        role: "Senior Frontend Engineer",
        period: "2023 - Hiện tại",
        description: "Lãnh đạo đội ngũ 6 kỹ sư xây dựng hệ thống AI SaaS Dashboard với Next.js App Router, giúp cải thiện tốc độ phản hồi 40%.",
      },
      {
        id: "2",
        company: "Innovate Software Hub",
        role: "Frontend Developer",
        period: "2021 - 2023",
        description: "Phát triển các component thư viện UI chuẩn hóa bằng Tailwind CSS và Framer Motion cho 10+ dự án doanh nghiệp.",
      },
    ],
    skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "State Management (Zustand)", "RESTful API / GraphQL", "Git & CI/CD"],
  });

  const handleAddExperience = () => {
    setResumeData({
      ...resumeData,
      experiences: [
        ...resumeData.experiences,
        {
          id: Date.now().toString(),
          company: "Công ty mới",
          role: "Vị trí mới",
          period: "2024 - Hiện tại",
          description: "Mô tả đóng góp công việc và thành tựu nổi bật...",
        },
      ],
    });
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experiences: resumeData.experiences.filter((exp) => exp.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md">
              Phiên bản CV #1
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">Quản lý & Chỉnh sửa CV</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chỉnh sửa chi tiết thông tin của bạn và xem kết quả chuẩn định dạng ATS trong thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ Link</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 gradient-primary text-white font-semibold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>Tải file PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Editor Side */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 pb-3 gap-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "info"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "experience"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Kinh nghiệm
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "skills"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Kỹ năng
            </button>
          </div>

          {/* Form Content */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh nghề nghiệp</label>
                <input
                  type="text"
                  value={resumeData.title}
                  onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt bản thân (Summary)</label>
                <textarea
                  rows={4}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Danh sách vị trí công việc</span>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm kinh nghiệm
                </button>
              </div>

              {resumeData.experiences.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2 pr-6">
                    <input
                      type="text"
                      placeholder="Công ty"
                      value={exp.company}
                      onChange={(e) => {
                        const newExps = [...resumeData.experiences];
                        newExps[idx].company = e.target.value;
                        setResumeData({ ...resumeData, experiences: newExps });
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Thời gian (ví dụ: 2022 - 2024)"
                      value={exp.period}
                      onChange={(e) => {
                        const newExps = [...resumeData.experiences];
                        newExps[idx].period = e.target.value;
                        setResumeData({ ...resumeData, experiences: newExps });
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Vị trí"
                    value={exp.role}
                    onChange={(e) => {
                      const newExps = [...resumeData.experiences];
                      newExps[idx].role = e.target.value;
                      setResumeData({ ...resumeData, experiences: newExps });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Mô tả công việc & đóng góp"
                    value={exp.description}
                    onChange={(e) => {
                      const newExps = [...resumeData.experiences];
                      newExps[idx].description = e.target.value;
                      setResumeData({ ...resumeData, experiences: newExps });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Kỹ năng nổi bật (Dạng Tags)</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {resumeData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Resume Sheet Preview Side */}
        <div className="lg:col-span-6 bg-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-start border border-slate-300/60 overflow-y-auto max-h-[750px]">
          {/* Paper Sheet Preview */}
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6 text-slate-900 text-xs">
            {/* Header */}
            <div className="border-b border-indigo-100 pb-5">
              <h2 className="text-2xl font-extrabold text-indigo-900 tracking-tight">{resumeData.fullName}</h2>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">{resumeData.title}</p>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 mt-3 font-medium">
                <span>📧 {resumeData.email}</span>
                <span>📞 {resumeData.phone}</span>
                <span>📍 {resumeData.location}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
                Tóm tắt sự nghiệp
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">{resumeData.summary}</p>
            </div>

            {/* Experience Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
                Kinh nghiệm làm việc
              </h3>
              {resumeData.experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{exp.role} — <span className="text-indigo-600">{exp.company}</span></span>
                    <span className="text-[10px] text-slate-400 font-medium">{exp.period}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-100 pb-1">
                Kỹ năng chuyên môn
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
