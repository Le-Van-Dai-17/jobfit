import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { DuplicateEmailError } from "../services/auth.service";
import { PrismaAuthUserRepository } from "./auth.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("PrismaAuthUserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps a concurrent email unique conflict to the safe duplicate domain error", async () => {
    vi.mocked(prisma.user.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "5.22.0",
        meta: { target: ["email"] },
      })
    );

    const repository = new PrismaAuthUserRepository();

    await expect(
      repository.createCredentialUser({
        name: "Linh",
        email: "linh@example.com",
        role: "CANDIDATE",
        passwordHash: "scrypt:test:test",
      })
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});
