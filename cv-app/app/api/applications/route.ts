import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ApplicationDuplicateError,
  ApplicationOwnershipError,
  ApplicationValidationError,
  applicationService,
} from "@/features/applications/services/application.service";
import { requireActiveRole } from "@/features/auth/services/session-authorization";

export async function GET() {
  try {
    const session = await auth();
    const principal = await requireActiveRole(session?.user, "CANDIDATE");
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!principal) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const applications = await applicationService.listForCandidate(principal.id);

    return NextResponse.json(applications);
  } catch (error: unknown) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const principal = await requireActiveRole(session?.user, "CANDIDATE");
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!principal) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const application = await applicationService.applyToJob(principal.id, {
      jobId: body.jobId,
      resumeVersionId: body.resumeVersionId,
      notes: body.notes,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof ApplicationDuplicateError ||
      error instanceof ApplicationOwnershipError ||
      error instanceof ApplicationValidationError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  void req;
  return NextResponse.json({ error: "Candidate status updates are not supported." }, { status: 405 });
}
