import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const MAX_SAVE_VERSION_ATTEMPTS = 3;

export class ResumeVersionConflictError extends Error {
  constructor() {
    super("Không thể lưu CV do có thay đổi đồng thời. Vui lòng thử lại.");
    this.name = "ResumeVersionConflictError";
  }
}

function isResumeVersionConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  return (
    Array.isArray(target) &&
    target.length === 2 &&
    target.includes("resumeId") &&
    target.includes("version")
  );
}

export class ResumeRepository {
  async saveVersionWithRetry(
    resumeId: string,
    userId: string,
    content: Prisma.InputJsonValue
  ) {
    for (let attempt = 1; attempt <= MAX_SAVE_VERSION_ATTEMPTS; attempt += 1) {
      try {
        return await prisma.$transaction(async (tx) => {
          const resume = await tx.resume.findFirst({
            where: { id: resumeId, userId, deletedAt: null },
            include: { versions: { orderBy: { version: "desc" }, take: 1 } },
          });
          if (!resume) return false;

          const updated = await tx.resume.updateMany({
            where: { id: resumeId, userId, deletedAt: null },
            data: { updatedAt: new Date() },
          });
          if (updated.count !== 1) return false;

          await tx.resumeVersion.create({
            data: {
              resumeId,
              version: (resume.versions[0]?.version || 0) + 1,
              content,
            },
          });
          return true;
        });
      } catch (error) {
        if (!isResumeVersionConflict(error)) throw error;
        if (attempt === MAX_SAVE_VERSION_ATTEMPTS) throw new ResumeVersionConflictError();
      }
    }

    throw new ResumeVersionConflictError();
  }

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
