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
  type RecruiterJobInput,
} from "../services/recruiter.service";

export type RecruiterActionState = { error?: string };

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function mapError(error: unknown) {
  if (error instanceof RecruiterValidationError) return error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
  if (error instanceof RecruiterAccessError) return "Không tìm thấy dữ liệu phù hợp với công ty của bạn.";
  if (error instanceof RecruiterStateTransitionError) return "Không thể chuyển sang trạng thái này.";
  return "Không thể xử lý yêu cầu lúc này.";
}

function jobInput(formData: FormData) {
  return {
    title: value(formData, "title"), location: value(formData, "location"),
    type: value(formData, "type"), salaryRange: value(formData, "salaryRange"),
    description: value(formData, "description"), requirements: value(formData, "requirements"),
    benefits: value(formData, "benefits"), url: value(formData, "url"), deadline: value(formData, "deadline"),
    department: value(formData, "department") as RecruiterJobInput["department"],
    employmentType: value(formData, "employmentType") as RecruiterJobInput["employmentType"],
    workMode: value(formData, "workMode") as RecruiterJobInput["workMode"],
    experienceLevel: value(formData, "experienceLevel") as RecruiterJobInput["experienceLevel"],
    salaryMin: value(formData, "salaryMin"), salaryMax: value(formData, "salaryMax"),
    salaryCurrency: value(formData, "salaryCurrency"), salaryNegotiable: formData.get("salaryNegotiable") === "on",
    skills: value(formData, "skills"),
  } as const;
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
    const job = (await recruiterService.createJob(userId, jobInput(formData))) as { id: string };
    jobId = job.id;
    if (value(formData, "intent") === "publish") await recruiterService.publishJob(userId, job.id);
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

export async function restoreRecruiterJobAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  try {
    await recruiterService.restoreJob(userId, value(formData, "jobId"));
  } catch (error) {
    return { error: mapError(error) };
  }
  revalidatePath("/recruiter/jobs");
  revalidatePath(`/recruiter/jobs/${value(formData, "jobId")}`);
  return {};
}

export async function updateRecruiterJobAction(
  _state: RecruiterActionState,
  formData: FormData
): Promise<RecruiterActionState> {
  const userId = await requireRecruiterId();
  const jobId = value(formData, "jobId");
  try {
    await recruiterService.updateJob(userId, jobId, jobInput(formData));
  } catch (error) {
    return { error: mapError(error) };
  }
  revalidatePath("/recruiter/jobs");
  revalidatePath(`/recruiter/jobs/${jobId}`);
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
