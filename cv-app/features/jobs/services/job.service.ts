import { jobRepository, type JobRepository } from "../repositories/job.repository";

export class JobService {
  constructor(private readonly repository: JobRepository = jobRepository) {}

  /**
   * Get job listings for the dashboard
   */
  async getRecommendedJobs() {
    // In the future, this will connect to the AI matching engine.
    // For now, return all active jobs.
    return this.repository.findActiveJobs();
  }

  async getCandidateFeed(userId: string) {
    return this.repository.findActiveJobsForCandidate(userId);
  }

  /**
   * Toggle saving a job for a user
   */
  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await this.repository.findSavedJob(userId, jobId);
    if (existing) {
      await this.repository.deleteSavedJob(userId, jobId);
      return { saved: false };
    }

    await this.repository.saveJob(userId, jobId);
    return { saved: true };
  }
}

export const jobService = new JobService();
