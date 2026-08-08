import type { ApplicationStatus } from "@prisma/client";

const applicationStatuses = new Set<ApplicationStatus>([
  "DRAFT",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export function parseApplicationStatusFilter(
  value: string | string[] | undefined
): ApplicationStatus | undefined {
  if (typeof value !== "string") return undefined;
  return applicationStatuses.has(value as ApplicationStatus) ? (value as ApplicationStatus) : undefined;
}
