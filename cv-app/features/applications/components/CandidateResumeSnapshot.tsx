import type { Prisma } from "@prisma/client";

import { CvSchema } from "@/features/cv/schemas/cv.schema";

export function CandidateResumeSnapshot({ content }: { content: Prisma.JsonValue }) {
  const parsed = CvSchema.safeParse(content);
  if (!parsed.success) {
    return <p className="mt-4 rounded-lg bg-surface-low p-4 text-sm text-text-muted">CV này chưa có nội dung để hiển thị.</p>;
  }

  const { personalInfo, experiences, educations, skills } = parsed.data;
  return (
    <div className="mt-5 space-y-6 text-sm">
      <section className="border-b border-outline-variant pb-5">
        <h3 className="text-xl font-bold text-foreground">{personalInfo.fullName}</h3>
        <p className="mt-1 font-semibold text-primary">{personalInfo.title}</p>
        <p className="mt-2 break-words text-text-muted">
          {personalInfo.email}{personalInfo.phone ? ` · ${personalInfo.phone}` : ""}{personalInfo.location ? ` · ${personalInfo.location}` : ""}
        </p>
        {personalInfo.summary ? <p className="mt-4 whitespace-pre-wrap leading-6 text-foreground">{personalInfo.summary}</p> : null}
      </section>
      {experiences.length > 0 ? (
        <section><h3 className="text-base font-bold text-foreground">Kinh nghiệm</h3><div className="mt-3 space-y-4">{experiences.map((item) => <article key={item.id}><p className="font-semibold text-foreground">{item.role}</p><p className="text-text-muted">{item.company}</p>{item.description ? <p className="mt-1 whitespace-pre-wrap leading-6 text-text-muted">{item.description}</p> : null}</article>)}</div></section>
      ) : null}
      {educations.length > 0 ? (
        <section><h3 className="text-base font-bold text-foreground">Học vấn</h3><ul className="mt-3 space-y-2">{educations.map((item) => <li key={item.id}><span className="font-semibold">{item.degree}</span> · {item.institution}</li>)}</ul></section>
      ) : null}
      {skills.length > 0 ? (
        <section><h3 className="text-base font-bold text-foreground">Kỹ năng</h3><ul className="mt-3 flex flex-wrap gap-2">{skills.map((item) => <li key={item.id} className="rounded-full bg-surface-container px-3 py-1 font-medium text-foreground">{item.name}</li>)}</ul></section>
      ) : null}
    </div>
  );
}
