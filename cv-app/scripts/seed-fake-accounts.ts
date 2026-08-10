import { PrismaClient, CompanyIndustry, CompanySize } from "@prisma/client";
import { AuthService } from "../features/auth/services/auth.service";
import { PrismaAuthUserRepository } from "../features/auth/repositories/auth.repository";
import { PrismaCompanyRepository } from "../features/companies/repositories/company.repository";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();
const authService = new AuthService(new PrismaAuthUserRepository());
const companyRepo = new PrismaCompanyRepository();

const INDUSTRIES = [
  "INFORMATION_TECHNOLOGY",
  "SOFTWARE",
  "FINANCE_BANKING",
  "ECOMMERCE",
  "EDUCATION",
];

const SIZES = [
  "SIZE_1_9",
  "SIZE_10_49",
  "SIZE_50_99",
  "SIZE_100_499",
];

async function main() {
  console.log("Starting to generate fake accounts...");
  const accounts: string[] = [
    "Role,Name,Email,Password",
  ];

  // Generate 10 Recruiters
  for (let i = 1; i <= 10; i++) {
    const name = `Recruiter ${i}`;
    const email = `recruiter${i}@example.com`;
    const password = `Password123!`;
    const role = "RECRUITER";

    console.log(`Creating ${role}: ${email}`);
    
    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const user = await authService.register({
        name,
        email,
        password,
        passwordConfirmation: password,
        role,
      });

      // Create a company for the recruiter
      await companyRepo.createCompanyWithOwner({
        name: `Công ty TNHH Demo ${i}`,
        slug: `demo-company-${i}`,
        website: `https://demo${i}.example.com`,
        description: `Đây là công ty demo số ${i} để test.`,
        location: "TP. Hồ Chí Minh",
        industry: INDUSTRIES[i % INDUSTRIES.length] as CompanyIndustry,
        size: SIZES[i % SIZES.length] as CompanySize,
        ownerUserId: user.id,
      });
    }
    
    accounts.push(`${role},${name},${email},${password}`);
  }

  // Generate 15 Candidates
  for (let i = 1; i <= 15; i++) {
    const name = `Candidate ${i}`;
    const email = `candidate${i}@example.com`;
    const password = `Password123!`;
    const role = "CANDIDATE";

    console.log(`Creating ${role}: ${email}`);
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await authService.register({
        name,
        email,
        password,
        passwordConfirmation: password,
        role,
      });
    }

    accounts.push(`${role},${name},${email},${password}`);
  }

  writeFileSync("fake-accounts.csv", "\uFEFF" + accounts.join("\n")); // BOM for excel UTF-8
  console.log("Finished generating accounts. Saved to fake-accounts.csv");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
