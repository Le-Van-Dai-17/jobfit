import { describe, expect, it, vi } from "vitest";

import { CompanyAccessError, CompanyService, CompanyValidationError } from "./company.service";

function createRepository() {
  return {
    findMembership: vi.fn(),
    findCompanyBySlug: vi.fn(),
    createCompanyWithOwner: vi.fn(),
  };
}

describe("CompanyService", () => {
  it("validates recruiter onboarding input before persistence", async () => {
    const repository = createRepository();
    const service = new CompanyService(repository);

    await expect(
      service.onboardRecruiterCompany("user-1", {
        name: "",
        slug: "bad slug",
        website: "not-a-url",
        description: "",
        location: "",
      })
    ).rejects.toBeInstanceOf(CompanyValidationError);

    expect(repository.createCompanyWithOwner).not.toHaveBeenCalled();
  });

  it("creates company and owner membership atomically for a recruiter without membership", async () => {
    const repository = createRepository();
    repository.findMembership.mockResolvedValue(null);
    repository.findCompanyBySlug.mockResolvedValue(null);
    repository.createCompanyWithOwner.mockResolvedValue({
      company: { id: "company-1", slug: "kada-tech" },
      membership: { userId: "user-1", role: "OWNER" },
    });
    const service = new CompanyService(repository);

    await expect(
      service.onboardRecruiterCompany("user-1", {
        name: "Kada Tech",
        slug: "Kada Tech",
        website: "https://kada.example",
        description: "Engineering hiring",
        location: "Ho Chi Minh City",
      })
    ).resolves.toMatchObject({ company: { slug: "kada-tech" } });

    expect(repository.createCompanyWithOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "user-1",
        name: "Kada Tech",
        slug: "kada-tech",
      })
    );
  });

  it("denies onboarding when the recruiter already belongs to another company", async () => {
    const repository = createRepository();
    repository.findMembership.mockResolvedValue({ companyId: "company-1", role: "OWNER" });
    const service = new CompanyService(repository);

    await expect(
      service.onboardRecruiterCompany("user-1", {
        name: "Other",
        slug: "other",
        website: "",
        description: "",
        location: "",
      })
    ).rejects.toBeInstanceOf(CompanyAccessError);
  });

  it("denies recruiter access to a company without matching membership", async () => {
    const repository = createRepository();
    repository.findMembership.mockResolvedValue({ companyId: "company-1", role: "RECRUITER" });
    const service = new CompanyService(repository);

    await expect(service.requireMembership("user-1", "company-2")).rejects.toBeInstanceOf(CompanyAccessError);
  });
});
