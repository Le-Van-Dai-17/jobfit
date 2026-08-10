"use client";

import { useCvStore } from "../store/useCvStore";

export function CvPreview() {
  const { cvData } = useCvStore();
  const { personalInfo, experiences = [], educations = [], skills = [] } = cvData;

  return (
    <div className="h-full overflow-y-auto bg-slate-200 p-4 md:p-8 flex justify-center">
      <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-10 font-sans text-slate-800 scale-100 origin-top">
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            {personalInfo?.fullName || "Tên của bạn"}
          </h1>
          <h2 className="text-xl text-primary font-semibold mt-1">
            {personalInfo?.title || "Vị trí ứng tuyển"}
          </h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
            {personalInfo?.email && <span>{personalInfo.email}</span>}
            {personalInfo?.phone && <span>{personalInfo.phone}</span>}
            {personalInfo?.location && <span>{personalInfo.location}</span>}
          </div>
        </header>

        {/* Summary */}
        {personalInfo?.summary && (
          <section className="mb-6">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="col-span-2 space-y-6">
            {/* Experience */}
            {experiences.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider">
                  Kinh nghiệm làm việc
                </h3>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id || index}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 text-base">{exp.role || "Vị trí"}</h4>
                        <span className="text-sm font-medium text-slate-500 shrink-0 ml-4">
                          {exp.startDate || "Từ"} - {exp.endDate || "Đến"}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-primary mb-2">
                        {exp.company || "Tên công ty"}
                      </div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Education */}
            {educations.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider">
                  Học vấn
                </h3>
                {educations.map((edu, index) => (
                  <div key={edu.id || index} className="mb-2">
                    <p className="font-bold text-slate-800 text-sm">{edu.institution}</p>
                    <p className="text-xs text-slate-600">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider">
                  Kỹ năng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={skill.id || index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
