import {
  ApplicationUniqueConstraintError,
  applicationRepository,
  type ApplicationRepository,
} from "../repositories/application.repository";
import { z } from "zod";

export class ApplicationDuplicateError extends Error {}
export class ApplicationOwnershipError extends Error {}
export class ApplicationValidationError extends Error {}

const ApplyToJobInputSchema = z.object({
  jobId: z.string().min(1),
  resumeVersionId: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
});

export class ApplicationService {
  constructor(private readonly repository: ApplicationRepository = applicationRepository) {}

  listForCandidate(userId: string) {
    return this.repository.listApplicationsForUser(userId);
  }

  async getForCandidate(userId: string, applicationId: string) {
    const application = await this.repository.findApplicationForUser(userId, applicationId);
    if (!application) {
      throw new ApplicationOwnershipError("Khong tim thay don ung tuyen.");
    }
    return application;
  }

  async applyToJob(userId: string, input: { jobId: string; resumeVersionId: string; notes?: string }) {
    const parsed = ApplyToJobInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new ApplicationValidationError("Dữ liệu ứng tuyển không hợp lệ.");
    }

    const [job, resumeVersion, existingApplication] = await Promise.all([
      this.repository.findActiveJob(parsed.data.jobId),
      this.repository.findResumeVersionForUser(userId, parsed.data.resumeVersionId),
      this.repository.findApplicationForUserAndJob(userId, parsed.data.jobId),
    ]);

    if (!job) {
      throw new ApplicationValidationError("Việc làm không tồn tại hoặc đã đóng.");
    }
    if (!resumeVersion) {
      throw new ApplicationOwnershipError("Phiên bản CV không thuộc tài khoản hiện tại.");
    }
    if (existingApplication) {
      throw new ApplicationDuplicateError("Bạn đã ứng tuyển vị trí này.");
    }

    try {
      return await this.repository.createApplication(userId, parsed.data);
    } catch (error) {
      if (error instanceof ApplicationUniqueConstraintError) {
        throw new ApplicationDuplicateError(error.message);
      }
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();
