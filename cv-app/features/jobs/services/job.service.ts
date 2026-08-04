import { jobRepository } from "../repositories/job.repository";

export class JobService {
  /**
   * Get job listings for the dashboard
   */
  async getRecommendedJobs() {
    // In the future, this will connect to the AI matching engine.
    // For now, return all active jobs.
    return jobRepository.findActiveJobs();
  }

  /**
   * Toggle saving a job for a user
   */
  async toggleSaveJob(userId: string, jobId: string) {
    // Assuming we want to just save it for now
    return jobRepository.saveJob(userId, jobId);
  }
}

export const jobService = new JobService();
