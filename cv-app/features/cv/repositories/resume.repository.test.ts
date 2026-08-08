import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ResumeRepository, ResumeVersionConflictError } from "./resume.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

const content = {
  personalInfo: {
    fullName: "Nguyễn Văn A",
    email: "candidate@example.com",
    phone: "0123456789",
    title: "Frontend Engineer",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
} as Prisma.InputJsonValue;

describe("ResumeRepository.saveVersionWithRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-runs the owned transaction and reads the new latest version after a composite version conflict", async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce({ versions: [{ version: 6 }] })
      .mockResolvedValueOnce({ versions: [{ version: 7 }] });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const create = vi
      .fn()
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "5.22.0",
          meta: { target: ["resumeId", "version"] },
        })
      )
      .mockResolvedValueOnce({ id: "version-8" });
    const transaction = vi.mocked(prisma.$transaction);
    transaction.mockImplementation(async (operation) =>
      operation({
        resume: { findFirst, updateMany },
        resumeVersion: { create },
      } as never)
    );

    await expect(
      new ResumeRepository().saveVersionWithRetry("resume-1", "user-1", content)
    ).resolves.toBe(true);

    expect(transaction).toHaveBeenCalledTimes(2);
    expect(findFirst).toHaveBeenCalledTimes(2);
    expect(findFirst).toHaveBeenNthCalledWith(1, {
      where: { id: "resume-1", userId: "user-1", deletedAt: null },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    expect(findFirst).toHaveBeenNthCalledWith(2, {
      where: { id: "resume-1", userId: "user-1", deletedAt: null },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: "resume-1", userId: "user-1", deletedAt: null },
      data: { updatedAt: expect.any(Date) },
    });
    expect(create).toHaveBeenNthCalledWith(1, {
      data: { resumeId: "resume-1", version: 7, content },
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      data: { resumeId: "resume-1", version: 8, content },
    });
  });

  it("stops after three composite conflicts and returns a safe domain error", async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError("database details", {
      code: "P2002",
      clientVersion: "5.22.0",
      meta: { target: ["resumeId", "version"] },
    });
    const create = vi.fn().mockRejectedValue(conflict);
    const transaction = vi.mocked(prisma.$transaction);
    transaction.mockImplementation(async (operation) =>
      operation({
        resume: {
          findFirst: vi.fn().mockResolvedValue({ versions: [{ version: 7 }] }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        resumeVersion: { create },
      } as never)
    );

    const saving = new ResumeRepository().saveVersionWithRetry("resume-1", "user-1", content);

    await expect(saving).rejects.toEqual(
      expect.objectContaining({
        name: "ResumeVersionConflictError",
        message: "Không thể lưu CV do có thay đổi đồng thời. Vui lòng thử lại.",
      })
    );
    await expect(saving).rejects.toBeInstanceOf(ResumeVersionConflictError);
    expect(transaction).toHaveBeenCalledTimes(3);
    expect(create).toHaveBeenCalledTimes(3);
  });

  it.each([
    {
      name: "a P2002 for another unique key",
      error: new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "5.22.0",
        meta: { target: ["email"] },
      }),
    },
    { name: "a non-P2002 error", error: new Error("connection lost") },
  ])("does not retry $name", async ({ error }) => {
    const transaction = vi.mocked(prisma.$transaction);
    transaction.mockRejectedValue(error);

    await expect(
      new ResumeRepository().saveVersionWithRetry("resume-1", "user-1", content)
    ).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
