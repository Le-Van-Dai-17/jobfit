import { prisma } from "@/lib/db/prisma";

export class ProfileRepository {
  findByUserId(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        name: true,
        email: true,
        profile: {
          select: {
            headline: true,
            summary: true,
            phone: true,
            location: true,
            website: true,
            linkedinUrl: true,
            githubUrl: true,
            skills: { orderBy: { name: "asc" } },
            certificates: { orderBy: { issueDate: "desc" } },
          },
        },
      },
    });
  }

  upsertByUserId(userId: string, data: {
    headline: string | null;
    summary: string | null;
    phone: string | null;
    location: string | null;
    website: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
  }) {
    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}

export const profileRepository = new ProfileRepository();
