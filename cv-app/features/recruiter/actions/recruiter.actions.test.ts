import { describe, expect, it, vi } from "vitest";

import { archiveRecruiterJobAction, transitionRecruiterApplicationAction } from "./recruiter.actions";

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "recruiter-a", role: "RECRUITER" } })),
}));

vi.mock("@/features/auth/services/session-authorization", () => ({
  requireActiveRole: vi.fn(async () => ({ id: "recruiter-a", role: "RECRUITER" })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("../services/recruiter.service", async () => {
  const actual = await vi.importActual<typeof import("../services/recruiter.service")>(
    "../services/recruiter.service"
  );
  return {
    ...actual,
    recruiterService: {
      archiveJob: vi.fn(async () => {
        throw new actual.RecruiterAccessError("Nope");
      }),
      transitionApplication: vi.fn(async () => {
        throw new actual.RecruiterStateTransitionError("Nope");
      }),
    },
  };
});

describe("recruiter application actions", () => {
  it("returns user-visible state when archive fails", async () => {
    const formData = new FormData();
    formData.set("jobId", "job-a");

    await expect(archiveRecruiterJobAction({}, formData)).resolves.toEqual({
      error: "Khong tim thay du lieu phu hop voi cong ty cua ban.",
    });
  });

  it("returns user-visible state when a transition fails", async () => {
    const formData = new FormData();
    formData.set("applicationId", "app-a");
    formData.set("status", "OFFER");

    await expect(transitionRecruiterApplicationAction({}, formData)).resolves.toEqual({
      error: "Trang thai ung tuyen khong the chuyen theo cach nay.",
    });
  });
});
