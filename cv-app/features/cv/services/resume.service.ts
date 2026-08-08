import { resumeRepository, type ResumeRepository } from "../repositories/resume.repository";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const ResumeTitleSchema = z.string().trim().min(2, "Tên CV phải có ít nhất 2 ký tự.").max(120, "Tên CV không được vượt quá 120 ký tự.");

export class ResumeValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Resume input is invalid.");
  }
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

  /**
   * Delete a CV safely (soft delete)
   */
  async deleteResume(resumeId: string) {
    return this.repository.softDelete(resumeId);
  }
}

export const resumeService = new ResumeService();
