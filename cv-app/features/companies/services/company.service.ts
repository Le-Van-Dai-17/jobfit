import { z } from "zod";

const companyOnboardingSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên công ty").max(160),
  slug: z.string().trim().min(1, "Vui lòng nhập slug").max(80),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.string().url("Website không hợp lệ").nullable()),
  description: z.string().trim().max(2000).optional().transform(emptyToNull),
  location: z.string().trim().max(160).optional().transform(emptyToNull),
});

function emptyToNull(value?: string) {
  return value || null;
}

export type CompanyOnboardingInput = z.input<typeof companyOnboardingSchema>;

export type CompanyRepository = {
  findMembership(userId: string): Promise<{ companyId: string; role: string } | null>;
  findCompanyBySlug(slug: string): Promise<unknown | null>;
  createCompanyWithOwner(input: {
    ownerUserId: string;
    name: string;
    slug: string;
    website: string | null;
    description: string | null;
    location: string | null;
  }): Promise<unknown>;
  updateCompany(companyId: string, input: {
    name: string;
    website: string | null;
    description: string | null;
    location: string | null;
  }): Promise<unknown>;
};

export class CompanyValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Company onboarding payload is invalid");
  }
}

export class CompanyAccessError extends Error {
  constructor(message = "Recruiter already belongs to a company") {
    super(message);
  }
}

export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  normalizeSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async onboardRecruiterCompany(userId: string, input: CompanyOnboardingInput) {
    const parsed = companyOnboardingSchema.safeParse(input);
    if (!parsed.success) {
      throw new CompanyValidationError(parsed.error.issues);
    }

    const existingMembership = await this.repository.findMembership(userId);
    if (existingMembership) {
      throw new CompanyAccessError();
    }

    const slug = this.normalizeSlug(parsed.data.slug);
    if (!slug) {
      throw new CompanyValidationError([
        {
          code: z.ZodIssueCode.custom,
          path: ["slug"],
          message: "Slug không hợp lệ",
        },
      ]);
    }

    const existingCompany = await this.repository.findCompanyBySlug(slug);
    if (existingCompany) {
      throw new CompanyAccessError("Company slug is already taken");
    }

    return this.repository.createCompanyWithOwner({
      ownerUserId: userId,
      name: parsed.data.name,
      slug,
      website: parsed.data.website,
      description: parsed.data.description,
      location: parsed.data.location,
    });
  }

  async requireMembership(userId: string, companyId: string) {
    const membership = await this.repository.findMembership(userId);
    if (!membership || membership.companyId !== companyId) {
      throw new CompanyAccessError("Recruiter cannot access this company");
    }
    return membership;
  }

  async updateRecruiterCompany(userId: string, input: Omit<CompanyOnboardingInput, "slug">) {
    const parsed = companyOnboardingSchema.omit({ slug: true }).safeParse(input);
    if (!parsed.success) {
      throw new CompanyValidationError(parsed.error.issues);
    }
    const membership = await this.repository.findMembership(userId);
    if (!membership) {
      throw new CompanyAccessError("Recruiter cannot access this company");
    }
    return this.repository.updateCompany(membership.companyId, {
      name: parsed.data.name,
      website: parsed.data.website,
      description: parsed.data.description,
      location: parsed.data.location,
    });
  }
}
