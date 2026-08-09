import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { CompanyRepository } from "../services/company.service";
import { CompanyAccessError } from "../services/company.service";

export class PrismaCompanyRepository implements CompanyRepository {
  findMembership(userId: string) {
    return prisma.companyMembership.findFirst({
      where: { userId, user: { deletedAt: null } },
      include: { company: true },
    });
  }

  findCompanyBySlug(slug: string) { return prisma.company.findUnique({ where: { slug } }); }

  async createCompanyWithOwner(input: Parameters<CompanyRepository["createCompanyWithOwner"]>[0]) {
    try {
      return await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: input.name, slug: input.slug, website: input.website,
            description: input.description, location: input.location,
            industry: input.industry, size: input.size,
          },
        });
        const membership = await tx.companyMembership.create({
          data: { userId: input.ownerUserId, companyId: company.id, role: "OWNER" },
        });
        return { company, membership };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new CompanyAccessError("Company or recruiter membership already exists");
      }
      throw error;
    }
  }

  updateCompany(companyId: string, input: Parameters<CompanyRepository["updateCompany"]>[1]) {
    return prisma.company.update({ where: { id: companyId }, data: input });
  }
}
