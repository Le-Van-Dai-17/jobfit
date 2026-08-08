import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { DuplicateEmailError, type AuthUserRepository } from "../services/auth.service";

export class PrismaAuthUserRepository implements AuthUserRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true, deletedAt: true },
    });
  }

  async createCredentialUser(input: {
    name: string;
    email: string;
    role: "CANDIDATE" | "RECRUITER";
    passwordHash: string;
  }) {
    try {
      return await prisma.user.create({
        data: input,
        select: { id: true, email: true, name: true, role: true, passwordHash: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateEmailError();
      }
      throw error;
    }
  }
}
