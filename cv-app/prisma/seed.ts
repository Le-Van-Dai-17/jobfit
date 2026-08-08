import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO_DATA !== "true") {
    console.log("Demo seed skipped. Set SEED_DEMO_DATA=true in a non-production environment to opt in.");
    return;
  }

  console.log("Seeding explicit local demo data...");

  // 1. Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@lumina.ai" },
    update: {},
    create: {
      email: "demo@lumina.ai",
      name: "Vũ Nguyễn",
      role: "CANDIDATE",
    },
  });

  // 2. Create Profile
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      headline: "Senior Frontend Developer",
      summary: "Passionate about building scalable web applications with React and Next.js.",
      phone: "+84 123 456 789",
      location: "Ho Chi Minh City, Vietnam",
    },
  });

  // 3. Create initial Resume and Version
  await prisma.resume.create({
    data: {
      userId: user.id,
      title: "Frontend Developer CV - 2024",
      isPrimary: true,
      versions: {
        create: {
          version: 1,
          content: {
            personalInfo: {
              fullName: "Vũ Nguyễn",
              title: "Senior Frontend Developer",
              email: "demo@lumina.ai",
            },
            experiences: [
              {
                id: "exp-1",
                company: "TechVision",
                role: "Frontend Engineer",
                startDate: "2021",
                endDate: "Present",
                isCurrent: true,
                description: "Built scalable applications using Next.js and Tailwind.",
              },
            ],
            educations: [],
            skills: [
              { id: "s-1", name: "React", level: 5 },
              { id: "s-2", name: "Next.js", level: 5 },
              { id: "s-3", name: "TypeScript", level: 4 }
            ],
          },
        },
      },
    },
  });

  // 4. Create sample Jobs
  await prisma.job.create({
    data: {
      title: "Senior React Developer",
      company: "InnovateTech",
      location: "Remote",
      type: "Full-time",
      salaryRange: "$2000 - $3000",
      description: "Looking for an experienced React developer.",
    },
  });

  await prisma.job.create({
    data: {
      title: "Next.js Engineer",
      company: "FutureWeb",
      location: "Ho Chi Minh City",
      type: "Hybrid",
      salaryRange: "$1500 - $2500",
      description: "Join our team to build next-generation web apps.",
    },
  });

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
