import { describe, expect, it, vi } from "vitest";

import type { JobRepository } from "../repositories/job.repository";
import { JobService } from "./job.service";

function makeRepository(saved: boolean, published = true) {
  return {
    findSavedJob: vi.fn().mockResolvedValue(saved ? { id: "saved-1" } : null),
    findPublishedById: vi.fn().mockResolvedValue(published ? { id: "job-1" } : null),
    deleteSavedJob: vi.fn().mockResolvedValue({ id: "saved-1" }),
    saveJob: vi.fn().mockResolvedValue({ id: "saved-1" }),
  };
}

describe("JobService.toggleSaveJob", () => {
  it("removes an existing candidate bookmark", async () => {
    const repository = makeRepository(true);
    const service = new JobService(repository as unknown as JobRepository);

    await expect(service.toggleSaveJob("candidate-1", "job-1")).resolves.toEqual({ saved: false });
    expect(repository.deleteSavedJob).toHaveBeenCalledWith("candidate-1", "job-1");
    expect(repository.saveJob).not.toHaveBeenCalled();
  });

  it("rejects bookmark writes for an unavailable job", async () => {
    const repository = makeRepository(false, false);
    const service = new JobService(repository as unknown as JobRepository);

    await expect(service.toggleSaveJob("candidate-1", "draft-job")).rejects.toThrow("không còn được công khai");
    expect(repository.saveJob).not.toHaveBeenCalled();
  });

  it("creates a bookmark when the candidate has not saved the job", async () => {
    const repository = makeRepository(false);
    const service = new JobService(repository as unknown as JobRepository);

    await expect(service.toggleSaveJob("candidate-1", "job-1")).resolves.toEqual({ saved: true });
    expect(repository.saveJob).toHaveBeenCalledWith("candidate-1", "job-1");
    expect(repository.deleteSavedJob).not.toHaveBeenCalled();
  });
});
