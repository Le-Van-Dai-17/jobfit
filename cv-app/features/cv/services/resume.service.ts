import { resumeRepository, type ResumeRepository } from "../repositories/resume.repository";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { CvData } from "../schemas/cv.schema";

const ResumeTitleSchema = z.string().trim().min(2, "Tên CV phải có ít nhất 2 ký tự.").max(120, "Tên CV không được vượt quá 120 ký tự.");
const ImportedResumeTextSchema = z.string().trim().min(40, "Nội dung CV quá ngắn để import.").max(20000, "Nội dung CV không được vượt quá 20.000 ký tự.");

const knownSkillNames = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "NestJS",
  "Vue",
  "Angular",
  "HTML",
  "CSS",
  "Tailwind",
  "Python",
  "Java",
  "C#",
  "C++",
  "PHP",
  "Go",
  "Rust",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "REST",
  "GraphQL",
  "Prisma",
  "Supabase",
  "Firebase",
  "Figma",
];

export class ResumeValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Resume input is invalid.");
  }
}

function normalizeImportedText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

function firstUsefulLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 2)
    .slice(0, 12);
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

function extractPhone(text: string) {
  return text.match(/(?:\+?84|0)(?:[\s.-]?\d){8,10}/)?.[0]?.trim() ?? "";
}

function looksLikeRole(line: string) {
  return /(engineer|developer|designer|tester|analyst|manager|intern|frontend|backend|fullstack|devops|data|product|qa|software|kỹ sư|lập trình|thiết kế|kiểm thử)/i.test(line);
}

function extractImportedResumeContent(text: string): CvData {
  const normalizedText = normalizeImportedText(text);
  const lines = firstUsefulLines(normalizedText);
  const email = extractEmail(normalizedText);
  const phone = extractPhone(normalizedText);
  const roleLine = lines.find(looksLikeRole) ?? "";
  const nameLine = lines.find((line) => line !== roleLine && !line.includes("@") && !/\d{4,}/.test(line)) ?? "";
  const lowerText = normalizedText.toLowerCase();
  const skills = knownSkillNames
    .filter((skill) => lowerText.includes(skill.toLowerCase()))
    .map((skill) => ({ id: `imported-skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: skill }));

  return {
    personalInfo: {
      fullName: nameLine,
      title: roleLine,
      email,
      phone,
      location: "",
      summary: normalizedText.slice(0, 1000),
    },
    experiences: [
      {
        id: "imported-resume-text",
        company: "CV gốc",
        role: "Nội dung đã import",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: normalizedText,
      },
    ],
    educations: [],
    skills,
  };
}

export class ResumeService {
  constructor(private readonly repository: ResumeRepository = resumeRepository) {}

  /**
   * Get a user's dashboard resumes
   */
  async getUserResumes(userId: string) {
    return this.repository.findByUserId(userId);
  }

  /**
   * Create a new CV with a blank template structure
   */
  async createNewResume(userId: string, title: string) {
    const parsedTitle = ResumeTitleSchema.safeParse(title);
    if (!parsedTitle.success) throw new ResumeValidationError(parsedTitle.error.issues);

    const blankTemplateContent = {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        title: "",
        summary: "",
      },
      experiences: [],
      educations: [],
      skills: [],
    };

    return this.repository.create(
      userId,
      parsedTitle.data,
      blankTemplateContent as Prisma.InputJsonValue
    );
  }

  async createImportedResume(userId: string, title: string, text: string) {
    const parsedTitle = ResumeTitleSchema.safeParse(title);
    if (!parsedTitle.success) throw new ResumeValidationError(parsedTitle.error.issues);

    const parsedText = ImportedResumeTextSchema.safeParse(text);
    if (!parsedText.success) throw new ResumeValidationError(parsedText.error.issues);

    const content = extractImportedResumeContent(parsedText.data);
    return this.repository.create(userId, parsedTitle.data, content as Prisma.InputJsonValue);
  }

  /**
   * Delete a CV safely (soft delete)
   */
  async deleteResume(resumeId: string) {
    return this.repository.softDelete(resumeId);
  }
}

export const resumeService = new ResumeService();
