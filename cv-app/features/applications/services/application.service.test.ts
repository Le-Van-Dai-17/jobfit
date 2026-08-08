import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApplicationDuplicateError,
  ApplicationOwnershipError,
  ApplicationService,
  ApplicationValidationError,
} from "./application.service";
import type { ApplicationRepository } from "../repositories/application.repository";

function createRepositoryMock() {
  return {
    findActiveJob: vi.fn(),
    findResumeVersionForUser: vi.fn(),
    findApplicationForUserAndJob: vi.fn(),
    createApplication: vi.fn(),
    listApplicationsForUser: vi.fn(),
    findApplicationForUser: vi.fn(),
  } satisfies Record<keyof ApplicationRepository, ReturnType<typeof vi.fn>>;
}

describe("ApplicationService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: ApplicationService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new ApplicationService(repository as unknown as ApplicationRepository);
  });

  it("creates an application only with an active job and owned resume version", async () => {
    repository.findActiveJob.mockResolvedValue({ id: "job-1" });
    repository.findResumeVersionForUser.mockResolvedValue({ id: "version-1" });
    repository.findApplicationForUserAndJob.mockResolvedValue(null);
    repository.createApplication.mockResolvedValue({ id: "application-1" });

    await expect(
      service.applyToJob("user-1", { jobId: "job-1", resumeVersionId: "version-1" })
    ).resolves.toEqual({ id: "application-1" });

    expect(repository.findResumeVersionForUser).toHaveBeenCalledWith("user-1", "version-1");
    expect(repository.createApplication).toHaveBeenCalledWith("user-1", {
      jobId: "job-1",
      resumeVersionId: "version-1",
    });
  });

  it("rejects duplicate applications for the same candidate and job", async () => {
    repository.findActiveJob.mockResolvedValue({ id: "job-1" });
    repository.findResumeVersionForUser.mockResolvedValue({ id: "version-1" });
    repository.findApplicationForUserAndJob.mockResolvedValue({ id: "existing" });

    await expect(
      service.applyToJob("user-1", { jobId: "job-1", resumeVersionId: "version-1" })
    ).rejects.toBeInstanceOf(ApplicationDuplicateError);
    expect(repository.createApplication).not.toHaveBeenCalled();
  });

  it("denies cross-user resume version access", async () => {
    repository.findActiveJob.mockResolvedValue({ id: "job-1" });
    repository.findResumeVersionForUser.mockResolvedValue(null);
    repository.findApplicationForUserAndJob.mockResolvedValue(null);

    await expect(
      service.applyToJob("user-1", { jobId: "job-1", resumeVersionId: "other-version" })
    ).rejects.toBeInstanceOf(ApplicationOwnershipError);
  });

  it("rejects inactive or missing jobs", async () => {
    repository.findActiveJob.mockResolvedValue(null);
    repository.findResumeVersionForUser.mockResolvedValue({ id: "version-1" });
    repository.findApplicationForUserAndJob.mockResolvedValue(null);

    await expect(
      service.applyToJob("user-1", { jobId: "archived-job", resumeVersionId: "version-1" })
    ).rejects.toBeInstanceOf(ApplicationValidationError);
  });

  it("validates required application identifiers before repository writes", async () => {
    await expect(
      service.applyToJob("user-1", { jobId: "", resumeVersionId: "version-1" })
    ).rejects.toBeInstanceOf(ApplicationValidationError);

    expect(repository.createApplication).not.toHaveBeenCalled();
  });

  it("loads candidate application detail only through the server-scoped user id", async () => {
    repository.findApplicationForUser.mockResolvedValue({ id: "app-1", userId: "user-1" });

    await expect(service.getForCandidate("user-1", "app-1")).resolves.toEqual({ id: "app-1", userId: "user-1" });
    expect(repository.findApplicationForUser).toHaveBeenCalledWith("user-1", "app-1");
  });
});
