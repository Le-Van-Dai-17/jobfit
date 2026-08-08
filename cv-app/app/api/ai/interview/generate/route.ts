import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateInterviewQuestions } from "@/lib/ai/gemini";
import { prisma } from "@/lib/db/prisma";
import { requireActiveRole } from "@/features/auth/services/session-authorization";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const principal = await requireActiveRole(session?.user, "CANDIDATE");
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!principal) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { jobDescription, resumeId } = body;

    if (!jobDescription) {
      return NextResponse.json({ error: "Job Description is required" }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: resumeId 
        ? { id: resumeId, userId: principal.id, deletedAt: null }
        : { userId: principal.id, isPrimary: true, deletedAt: null },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!resume || !resume.versions.length) {
      return NextResponse.json({ error: "No CV found" }, { status: 404 });
    }

    const cvData = resume.versions[0].content;
    const result = await generateInterviewQuestions(cvData, jobDescription);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Generate Questions API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status: 500 }
    );
  }
}
