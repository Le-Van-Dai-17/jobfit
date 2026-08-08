import { resumeRepository } from "../repositories/resume.repository";
import { Prisma } from "@prisma/client";

export class ResumeService {
  /**
   * Get a user's dashboard resumes
   */
  async getUserResumes(userId: string) {
    return resumeRepository.findByUserId(userId);
  }

  /**
   * Create a new CV with a blank template structure
   */
  async createNewResume(userId: string, title: string) {
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

    return resumeRepository.create(
      userId,
      title,
      blankTemplateContent as Prisma.InputJsonValue
    );
  }

  /**
   * Delete a CV safely (soft delete)
   */
  async deleteResume(resumeId: string) {
    return resumeRepository.softDelete(resumeId);
  }
}

export const resumeService = new ResumeService();
