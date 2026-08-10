import {
  ApplicationUniqueConstraintError,
  applicationRepository,
  type ApplicationRepository,
} from "../repositories/application.repository";
import { z } from "zod";
import { cvJdMatchService, type CvJdMatchService } from "@/features/job-match/services/cv-jd-match.service";

export class ApplicationDuplicateError extends Error {}
export class ApplicationOwnershipError extends Error {}
export class ApplicationValidationError extends Error {}

const ApplyToJobInputSchema = z.object({
  jobId: z.string().min(1),
  resumeVersionId: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
});

export class ApplicationService {
  constructor(
    private readonly repository: ApplicationRepository = applicationRepository,
    private readonly matchService: CvJdMatchService = cvJdMatchService
  ) {}

  listForCandidate(userId: string) {
    return this.repository.listApplicationsForUser(userId);
  }

  async getForCandidate(userId: string, applicationId: string) {
    const application = await this.repository.findApplicationForUser(userId, applicationId);
    if (!application) {
      throw new ApplicationOwnershipError("Không tìm thấy đơn ứng tuyển.");
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
      const application = await this.repository.createApplication(userId, parsed.data);
      // Run AI match async in the background to avoid blocking the user request
      this.matchService.analyze(resumeVersion.content, job).then((match) => {
        this.repository.createMatchAnalysis(parsed.data.resumeVersionId, parsed.data.jobId, match).catch((err) => {
          console.error("CV-JD match analysis creation failed:", err);
        });
      }).catch((err) => {
        console.error("CV-JD match AI trigger failed:", err);
      });
      
      return application;
    } catch (error) {
      if (error instanceof ApplicationUniqueConstraintError) {
        throw new ApplicationDuplicateError(error.message);
      }
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();
