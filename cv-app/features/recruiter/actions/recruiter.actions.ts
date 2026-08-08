"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { requireActiveRole } from "@/features/auth/services/session-authorization";
import {
  RecruiterAccessError,
  RecruiterStateTransitionError,
  RecruiterValidationError,
  recruiterService,
} from "../services/recruiter.service";

export type RecruiterActionState = { error?: string };

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function mapError(error: unknown) {
  if (error instanceof RecruiterValidationError) return error.issues[0]?.message ?? "Du lieu khong hop le.";
  if (error instanceof RecruiterAccessError) return "Khong tim thay du lieu phu hop voi cong ty cua ban.";
  if (error instanceof RecruiterStateTransitionError) return "Trang thai ung tuyen khong the chuyen theo cach nay.";
  return "Khong the xu ly yeu cau luc nay.";
}

async function requireRecruiterId() {
  const session = await auth();
  const principal = await requireActiveRole(session?.user, "RECRUITER");
  if (!principal) redirect("/login");
  return principal.id;
}

export async function createRecruiterJobAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  let jobId: string | null = null;
  try {
    const job = (await recruiterService.createJob(userId, {
      title: value(formData, "title"),
      location: value(formData, "location"),
      type: value(formData, "type"),
      salaryRange: value(formData, "salaryRange"),
      description: value(formData, "description"),
      requirements: value(formData, "requirements"),
      url: value(formData, "url"),
    })) as { id: string };
    jobId = job.id;
    revalidatePath("/recruiter/jobs");
  } catch (error) {
    return { error: mapError(error) };
  }
  redirect(`/recruiter/jobs/${jobId}`);
}

export async function publishRecruiterJobAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  try {
    await recruiterService.publishJob(userId, value(formData, "jobId"));
  } catch (error) {
    return { error: mapError(error) };
  }
  revalidatePath("/recruiter/jobs");
  return {};
}

export async function archiveRecruiterJobAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  try {
    await recruiterService.archiveJob(userId, value(formData, "jobId"));
  } catch (error) {
    return { error: mapError(error) };
  }
  revalidatePath("/recruiter/jobs");
  return {};
}

export async function transitionRecruiterApplicationAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  const applicationId = value(formData, "applicationId");
  try {
    await recruiterService.transitionApplication(
      userId,
      applicationId,
      value(formData, "status") as ApplicationStatus,
      value(formData, "notes")
    );
  } catch (error) {
    return { error: mapError(error) };
  }
  revalidatePath("/recruiter/candidates");
  revalidatePath(`/recruiter/candidates/${applicationId}`);
  return {};
}
