import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class ResumeRepository {
  /**
   * Fetch all non-deleted resumes for a user
   */
  async findByUserId(userId: string) {
    return prisma.resume.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1, // Only get the latest version
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Find a specific resume by ID, including its latest version
   */
  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: "desc" },
        },
      },
    });
  }

  /**
   * Create a new resume with an initial version
   */
  async create(userId: string, title: string, initialContent: Prisma.InputJsonValue) {
    return prisma.resume.create({
      data: {
        userId,
        title,
        versions: {
          create: {
            version: 1,
            content: initialContent,
          },
        },
      },
      include: {
        versions: true,
      },
    });
  }

  /**
   * Soft delete a resume
   */
  async softDelete(id: string) {
    return prisma.resume.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export const resumeRepository = new ResumeRepository();
