import { describe, expect, it, vi } from "vitest";

import { CompanyAccessError, CompanyService, CompanyValidationError } from "./company.service";

function createRepository() {
  return {
    findMembership: vi.fn(),
    findCompanyBySlug: vi.fn(),
    createCompanyWithOwner: vi.fn(),
    updateCompany: vi.fn(),
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

  it("updates only the authenticated recruiter's company settings", async () => {
    const repository = createRepository();
    repository.findMembership.mockResolvedValue({ companyId: "company-1", role: "OWNER" });
    repository.updateCompany.mockResolvedValue({ id: "company-1", name: "Kada Updated" });
    const service = new CompanyService(repository);

    await expect(
      service.updateRecruiterCompany("user-1", {
        name: "Kada Updated",
        website: "https://kada.example",
        description: "Evidence based hiring",
        location: "Ha Noi",
      })
    ).resolves.toMatchObject({ id: "company-1" });

    expect(repository.updateCompany).toHaveBeenCalledWith("company-1", {
      name: "Kada Updated",
      website: "https://kada.example",
      description: "Evidence based hiring",
      location: "Ha Noi",
    });
  });

  it("persists validated industry and size without trusting a client company id", async () => {
    const repository = createRepository();
    repository.findMembership.mockResolvedValue({ companyId: "company-from-membership", role: "OWNER" });
    repository.updateCompany.mockResolvedValue({ id: "company-from-membership" });
    const service = new CompanyService(repository);

    await service.updateRecruiterCompany("user-1", {
      name: "Kada Updated",
      website: "",
      description: "Tuyển dụng dựa trên bằng chứng.",
      location: "Hà Nội",
      industry: "INFORMATION_TECHNOLOGY",
      size: "SIZE_10_49",
    });

    expect(repository.updateCompany).toHaveBeenCalledWith("company-from-membership", expect.objectContaining({
      industry: "INFORMATION_TECHNOLOGY",
      size: "SIZE_10_49",
    }));
  });
});
