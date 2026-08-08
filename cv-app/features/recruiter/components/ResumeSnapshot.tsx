import type { Prisma } from "@prisma/client";
import { CvSchema } from "@/features/cv/schemas/cv.schema";

export function ResumeSnapshot({ content }: { content: Prisma.JsonValue }) {
  const parsed = CvSchema.safeParse(content);
  if (!parsed.success) {
    return <p className="mt-4 rounded-lg bg-surface-low p-4 text-sm text-text-muted">Snapshot CV không có nội dung hợp lệ để hiển thị.</p>;
  }

  const { personalInfo, experiences, educations, skills } = parsed.data;
  return (
    <div className="mt-4 space-y-5 text-sm">
      <section>
        <h3 className="text-lg font-bold text-foreground">{personalInfo.fullName}</h3>
        <p className="font-semibold text-primary">{personalInfo.title}</p>
        <p className="mt-1 text-text-muted">{personalInfo.email}{personalInfo.phone ? ` · ${personalInfo.phone}` : ""}{personalInfo.location ? ` · ${personalInfo.location}` : ""}</p>
        {personalInfo.summary ? <p className="mt-3 whitespace-pre-wrap leading-6 text-foreground">{personalInfo.summary}</p> : null}
      </section>
      {experiences.length > 0 ? <section><h3 className="font-bold">Kinh nghiệm</h3><div className="mt-2 space-y-3">{experiences.map((experience) => <div key={experience.id}><p className="font-semibold">{experience.role}</p><p className="text-text-muted">{experience.company}</p>{experience.description ? <p className="whitespace-pre-wrap text-text-muted">{experience.description}</p> : null}</div>)}</div></section> : null}
      {educations.length > 0 ? <section><h3 className="font-bold">Học vấn</h3><ul className="mt-2 space-y-1">{educations.map((education) => <li key={education.id}>{education.degree} · {education.institution}</li>)}</ul></section> : null}
      {skills.length > 0 ? <section><h3 className="font-bold">Kỹ năng</h3><ul className="mt-2 flex flex-wrap gap-2">{skills.map((skill) => <li key={skill.id} className="rounded-md bg-surface-low px-2 py-1">{skill.name}</li>)}</ul></section> : null}
    </div>
  );
}
