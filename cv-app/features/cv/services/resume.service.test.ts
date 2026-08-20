import { beforeEach, describe, expect, it, vi } from "vitest";

import { resumeRepository } from "../repositories/resume.repository";
import { ResumeService, ResumeValidationError } from "./resume.service";

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
        educations: [],
        skills: [],
      }
    );
  });

  it("trims a candidate-provided title before persistence", async () => {
    mockedResumeRepository.create.mockResolvedValue({ id: "resume-1" } as never);

    await new ResumeService().createNewResume("user-1", "  CV Backend  ");

    expect(mockedResumeRepository.create).toHaveBeenCalledWith(
      "user-1",
      "CV Backend",
      expect.any(Object)
    );
  });

  it("rejects an invalid candidate-provided title before persistence", async () => {
    await expect(new ResumeService().createNewResume("user-1", " ")).rejects.toBeInstanceOf(
      ResumeValidationError
    );
    expect(mockedResumeRepository.create).not.toHaveBeenCalled();
  });

  it("creates an imported resume from candidate-provided text without inventing missing identity facts", async () => {
    mockedResumeRepository.create.mockResolvedValue({ id: "resume-imported" } as never);

    await new ResumeService().createImportedResume(
      "user-1",
      "Imported CV",
      `Nguyen Van A
Frontend Engineer
candidate@example.com
Built React and TypeScript applications with PostgreSQL.`
    );

    expect(mockedResumeRepository.create).toHaveBeenCalledWith(
      "user-1",
      "Imported CV",
      expect.objectContaining({
        personalInfo: expect.objectContaining({
          fullName: "Nguyen Van A",
          title: "Frontend Engineer",
          email: "candidate@example.com",
        }),
        skills: expect.arrayContaining([
          expect.objectContaining({ name: "React" }),
          expect.objectContaining({ name: "TypeScript" }),
          expect.objectContaining({ name: "PostgreSQL" }),
        ]),
      })
    );
  });

  it("keeps missing imported email empty instead of fabricating one", async () => {
    mockedResumeRepository.create.mockResolvedValue({ id: "resume-imported" } as never);

    await new ResumeService().createImportedResume(
      "user-1",
      "Imported CV",
      "Backend Developer\nBuilt Node.js services, REST APIs, and Docker deployment pipelines for internal products."
    );

    expect(mockedResumeRepository.create).toHaveBeenCalledWith(
      "user-1",
      "Imported CV",
      expect.objectContaining({
        personalInfo: expect.objectContaining({ email: "" }),
      })
    );
  });

  it("uses the soft-delete repository path for deletion", async () => {
    mockedResumeRepository.softDelete.mockResolvedValue({ id: "resume-1" } as never);

    await new ResumeService().deleteResume("resume-1");

    expect(mockedResumeRepository.softDelete).toHaveBeenCalledWith("resume-1");
  });
});
