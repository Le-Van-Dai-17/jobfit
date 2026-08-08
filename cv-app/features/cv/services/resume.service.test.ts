import { beforeEach, describe, expect, it, vi } from "vitest";

import { resumeRepository } from "../repositories/resume.repository";
import { ResumeService } from "./resume.service";

vi.mock("../repositories/resume.repository", () => ({
  resumeRepository: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    softDelete: vi.fn(),
  },
}));

const mockedResumeRepository = vi.mocked(resumeRepository);

describe("ResumeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates resume reads through the repository with the server-scoped user id", async () => {
    const resumes = [{ id: "resume-1", userId: "user-1", versions: [] }];
    mockedResumeRepository.findByUserId.mockResolvedValue(resumes as never);

    await expect(new ResumeService().getUserResumes("user-1")).resolves.toBe(resumes);
    expect(mockedResumeRepository.findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("creates a new resume with the deterministic blank CV shape", async () => {
    mockedResumeRepository.create.mockResolvedValue({ id: "resume-1" } as never);

    await new ResumeService().createNewResume("user-1", "Frontend CV");

    expect(mockedResumeRepository.create).toHaveBeenCalledWith(
      "user-1",
      "Frontend CV",
      {
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          title: "",
          summary: "",
        },
        experiences: [],
        education: [],
        skills: [],
      }
    );
  });

  it("uses the soft-delete repository path for deletion", async () => {
    mockedResumeRepository.softDelete.mockResolvedValue({ id: "resume-1" } as never);

    await new ResumeService().deleteResume("resume-1");

    expect(mockedResumeRepository.softDelete).toHaveBeenCalledWith("resume-1");
  });
});
