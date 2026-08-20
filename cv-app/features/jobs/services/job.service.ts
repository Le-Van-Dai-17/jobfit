import { jobRepository, type JobRepository } from "../repositories/job.repository";
import type { JobFeedFilters } from "./job-feed-filter";

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

  async getCandidateFeed(userId: string | undefined, filters: JobFeedFilters, options?: { includeProgress?: boolean }) {
    const { data, total } = await this.repository.findActiveJobsForCandidate(userId, filters, options);
    const totalPages = Math.ceil(total / filters.limit);
    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
        hasNextPage: filters.page < totalPages,
      }
    };
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
