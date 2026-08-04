import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error: unknown) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { company, title, status } = body;

    // Create a manual Job first, then link to Application
    const job = await prisma.job.create({
      data: {
        title,
        company,
        source: "MANUAL",
      },
    });

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: job.id,
        status: status || "APPLIED",
        appliedAt: new Date(),
      },
      include: {
        job: true,
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    const application = await prisma.application.update({
      where: { id, userId: session.user.id },
      data: { status },
      include: { job: true },
    });

    return NextResponse.json(application);
  } catch (error: unknown) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
