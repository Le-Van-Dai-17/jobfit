"use server";

import { auth } from "@/auth";
import { CvData, CvSchema } from "../schemas/cv.schema";
import { prisma } from "@/lib/db/prisma";

export async function saveCvAction(resumeId: string, data: CvData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate incoming data
    const parsedData = CvSchema.parse(data);

    // Verify ownership and find latest version
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!resume || resume.userId !== session.user.id) {
      return { success: false, error: "CV not found or access denied" };
    }

    const latestVersion = resume.versions[0]?.version || 0;

    // Create a new version snapshot
    await prisma.resumeVersion.create({
      data: {
        resumeId,
        version: latestVersion + 1,
        content: parsedData, // JSON snapshot
      },
    });

    // Update parent resume timestamp
    await prisma.resume.update({
      where: { id: resumeId },
      data: { updatedAt: new Date() },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to save CV:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
