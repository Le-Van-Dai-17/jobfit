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

  async getCandidateFeed(userId: string, filters: { q: string; mode: "all" | "remote" | "hybrid" | "onsite" }) {
    return this.repository.findActiveJobsForCandidate(userId, filters);
  }

  /**
   * Toggle saving a job for a user
   */
  async toggleSaveJob(userId: string, jobId: string) {
    const publishedJob = await this.repository.findPublishedById(jobId);
    if (!publishedJob) throw new Error("Việc làm không còn được công khai.");

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
