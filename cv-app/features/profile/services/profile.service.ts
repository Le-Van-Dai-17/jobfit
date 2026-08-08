import { z } from "zod";

import { profileRepository } from "../repositories/profile.repository";

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((value) => value || null);
const optionalUrl = z.string().trim().max(500).optional().transform((value) => value || null).pipe(z.string().url("URL không hợp lệ").nullable());

const candidateProfileSchema = z.object({
  headline: optionalText(160),
  summary: optionalText(3000),
  phone: optionalText(40),
  location: optionalText(160),
  website: optionalUrl,
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
});

export type CandidateProfileInput = z.input<typeof candidateProfileSchema>;

export class ProfileValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Candidate profile is invalid");
  }
}

export class ProfileService {
  async getCandidateProfile(userId: string) {
    const record = await profileRepository.findByUserId(userId);
    if (!record) return null;
    return {
      user: { name: record.name, email: record.email },
      ...(record.profile ?? {}),
    };
  }

  async updateCandidateProfile(userId: string, input: CandidateProfileInput) {
    const parsed = candidateProfileSchema.safeParse(input);
    if (!parsed.success) throw new ProfileValidationError(parsed.error.issues);
    return profileRepository.upsertByUserId(userId, parsed.data);
  }
}

export const profileService = new ProfileService();
