import { z } from "zod";

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  title: z.string().min(2, "Vị trí phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  location: z.string().optional(),
  summary: z.string().max(1000, "Tóm tắt không được vượt quá 1000 ký tự").optional(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Vui lòng nhập tên công ty"),
  role: z.string().min(1, "Vui lòng nhập vị trí công việc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Vui lòng nhập tên trường"),
  degree: z.string().min(1, "Vui lòng nhập bằng cấp"),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Vui lòng nhập kỹ năng"),
  level: z.number().min(1).max(5).optional(),
});

const CvPayloadSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experiences: z.array(ExperienceSchema),
  educations: z.array(EducationSchema),
  skills: z.array(SkillSchema),
});

export const CvSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const payload = value as Record<string, unknown>;
  return {
    ...payload,
    experiences: payload.experiences ?? [],
    educations: payload.educations ?? payload.education ?? [],
    skills: payload.skills ?? [],
  };
}, CvPayloadSchema);

export type CvData = z.infer<typeof CvSchema>;
export type ExperienceData = z.infer<typeof ExperienceSchema>;
export type EducationData = z.infer<typeof EducationSchema>;
export type SkillData = z.infer<typeof SkillSchema>;
