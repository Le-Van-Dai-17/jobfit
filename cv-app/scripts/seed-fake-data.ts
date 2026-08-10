import { PrismaClient, JobStatus, ApplicationStatus, AssessmentStatus, AssessmentSeniority, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const JOB_TITLES = [
  "Frontend Engineer (React/Next.js)",
  "Backend Engineer (Node.js/NestJS)",
  "Fullstack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Scientist",
  "QA Automation Engineer",
];

const LOCATIONS = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote"];

async function main() {
  console.log("Starting to generate fake data for recruiters...");

  const recruiters = await prisma.user.findMany({
    where: { role: "RECRUITER", email: { startsWith: "recruiter" } },
    include: { companyMemberships: { include: { company: true } } }
  });

  const candidates = await prisma.user.findMany({
    where: { role: "CANDIDATE", email: { startsWith: "candidate" } }
  });

  if (recruiters.length === 0 || candidates.length === 0) {
    console.error("Please run seed-fake-accounts.ts first!");
    return;
  }

  // Ensure each candidate has a resume
  console.log("Setting up candidate resumes...");
  for (const candidate of candidates) {
    let resume = await prisma.resume.findFirst({ where: { userId: candidate.id } });
    if (!resume) {
      resume = await prisma.resume.create({
        data: {
          userId: candidate.id,
          title: "My Standard CV",
          isPrimary: true,
          versions: {
            create: {
              version: 1,
              content: {
                personalInfo: { fullName: candidate.name, email: candidate.email },
                experiences: [],
                educations: [],
                skills: [{ name: "JavaScript", level: 4 }]
              }
            }
          }
        }
      });
    }
  }

  const allResumeVersions = await prisma.resumeVersion.findMany({
    where: { resume: { userId: { in: candidates.map(c => c.id) } } }
  });

  console.log("Generating Jobs, Applications, and Assessments...");
  for (const recruiter of recruiters) {
    const company = recruiter.companyMemberships[0]?.company;
    if (!company) continue;

    console.log(`Processing company: ${company.name}`);

    // Create 3 Jobs per company
    for (let i = 0; i < 3; i++) {
      const title = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      
      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          title: title,
          company: company.name,
          location: location,
          type: "Full-time",
          salaryRange: "15,000,000 - 30,000,000 VND",
          description: `Mô tả công việc cho vị trí ${title}...`,
          requirements: `Yêu cầu kinh nghiệm 2+ năm...`,
          status: JobStatus.PUBLISHED,
          isArchived: false,
        }
      });

      // Select 4 random candidates
      const shuffledCandidates = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 4);

      for (const [idx, candidate] of shuffledCandidates.entries()) {
        // Status distribution
        const statuses: ApplicationStatus[] = ["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];
        const status = statuses[idx % statuses.length];
        
        // Removed unused resumeVersion line
        const candidateResumeVersion = await prisma.resumeVersion.findFirst({ where: { resume: { userId: candidate.id } }});
        
        if (!candidateResumeVersion) continue;

        const application = await prisma.application.create({
          data: {
            userId: candidate.id,
            jobId: job.id,
            resumeVersionId: candidateResumeVersion.id,
            status: status,
            appliedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random time in last 10 days
            events: {
              create: [
                {
                  type: "STATUS_CHANGE",
                  fromStatus: "DRAFT",
                  toStatus: "APPLIED",
                  notes: "Ứng viên nộp hồ sơ",
                }
              ]
            }
          }
        });

        // Add an assessment result for 50% of applications
        if (Math.random() > 0.5) {
          await prisma.assessmentSession.create({
            data: {
              userId: candidate.id,
              resumeVersionId: candidateResumeVersion.id,
              jobId: job.id,
              applicationId: application.id,
              status: AssessmentStatus.EVALUATED,
              roleTitle: job.title,
              seniority: AssessmentSeniority.MID,
              result: {
                create: {
                  userId: candidate.id,
                  advisoryScore: Math.floor(Math.random() * 40) + 60, // 60-100
                  rubricBreakdown: {
                    problemSolving: Math.floor(Math.random() * 5),
                    codeQuality: Math.floor(Math.random() * 5),
                    systemDesign: Math.floor(Math.random() * 5),
                  },
                  strengths: ["Kinh nghiệm làm việc tốt", "Kỹ năng lập trình khá"],
                  gaps: ["Chưa có nhiều kinh nghiệm System Design"],
                  evidence: { test: "demo" },
                  limitations: ["Cần kiểm tra thêm về communication"],
                  reportSummary: "Ứng viên có tiềm năng, phù hợp với vị trí.",
                  evaluatorModel: "gpt-4o-mini",
                  promptVersion: "v1.0"
                }
              }
            }
          });
        }
      }
    }
  }

  console.log("Fake data generated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
