import type { AssessmentSeniority, AssessmentTaskType, Prisma } from "@prisma/client";

import { DeterministicAssessmentProvider, type AssessmentEvaluationProvider } from "../providers/assessment.provider";
import { assessmentRepository, type AssessmentRepository } from "../repositories/assessment.repository";
import { AssessmentSubmissionSchema, AssessmentRubricSchema } from "../schemas/assessment.schema";

type TaskDraft = {
  orderIndex: number;
  type: AssessmentTaskType;
  title: string;
  prompt: string;
  skills: string[];
  rubric: Prisma.InputJsonValue;
  expectedEvidence: string[];
};

export class AssessmentOwnershipError extends Error {}
export class AssessmentValidationError extends Error {}

const commonRubric = [
  {
    id: "problem_framing",
    label: "Định nghĩa vấn đề và ràng buộc",
    maxScore: 5,
    evidenceHints: ["mục tiêu", "phạm vi", "ràng buộc", "trade-off"],
  },
  {
    id: "architecture",
    label: "Thiết kế kỹ thuật phù hợp",
    maxScore: 5,
    evidenceHints: ["api", "database", "cache", "service", "schema"],
  },
  {
    id: "implementation",
    label: "Kế hoạch triển khai và kiểm thử",
    maxScore: 5,
    evidenceHints: ["test", "migration", "validation", "rollback", "monitoring"],
  },
  {
    id: "risk",
    label: "Nhận diện rủi ro vận hành",
    maxScore: 5,
    evidenceHints: ["rủi ro", "security", "privacy", "failure", "timeout"],
  },
];

function inferSeniority(title: string, description: string): AssessmentSeniority {
  const text = `${title} ${description}`.toLowerCase();
  if (/\blead\b|principal|staff|trưởng nhóm/.test(text)) return "LEAD";
  if (/senior|sr\.|5\+|trên 5/.test(text)) return "SENIOR";
  if (/intern|thực tập/.test(text)) return "INTERN";
  if (/junior|fresher|mới tốt nghiệp/.test(text)) return "JUNIOR";
  return "MID";
}

function extractSkills(jobText: string) {
  const catalog = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "REST API", "Testing", "CI/CD"];
  const found = catalog.filter((skill) => jobText.toLowerCase().includes(skill.toLowerCase()));
  return found.length > 0 ? found.slice(0, 5) : ["TypeScript", "REST API", "Testing"];
}

function buildTasks(job: { title: string; company: string; description: string | null; requirements: string | null }) {
  const jobText = `${job.title}\n${job.description ?? ""}\n${job.requirements ?? ""}`;
  const skills = extractSkills(jobText);
  const rubric = AssessmentRubricSchema.parse(commonRubric);
  return [
    {
      orderIndex: 1,
      type: "SYSTEM_DESIGN" as const,
      title: `Thiết kế luồng ứng viên cho ${job.title}`,
      prompt: `Dựa trên JD của ${job.company}, hãy mô tả thiết kế kỹ thuật cho một tính năng quan trọng của vai trò ${job.title}. Trình bày API, dữ liệu, kiểm soát quyền truy cập, trade-off, và cách đo chất lượng.`,
      skills,
      rubric,
      expectedEvidence: ["Mô tả API hoặc contract", "Ràng buộc dữ liệu và quyền truy cập", "Trade-off rõ ràng", "Cách kiểm thử hoặc đo lường"],
    },
    {
      orderIndex: 2,
      type: "IMPLEMENTATION_PLAN" as const,
      title: "Kế hoạch triển khai an toàn",
      prompt: `Hãy viết kế hoạch triển khai cho bài toán trên trong môi trường production. Bao gồm migration/schema nếu cần, kiểm thử, rollback, logging/monitoring, và rủi ro bảo mật hoặc dữ liệu cá nhân.`,
      skills: [...new Set([...skills, "Testing", "CI/CD"])],
      rubric,
      expectedEvidence: ["Các bước triển khai", "Kiểm thử cụ thể", "Rollback hoặc giảm rủi ro", "Giám sát sau phát hành"],
    },
  ] satisfies TaskDraft[];
}

export class AssessmentService {
  constructor(
    private readonly repository: AssessmentRepository = assessmentRepository,
    private readonly provider: AssessmentEvaluationProvider = new DeterministicAssessmentProvider()
  ) {}

  async getStartOptions(userId: string) {
    const [resumeVersions, jobs, sessions] = await Promise.all([
      this.repository.listResumeVersionsForUser(userId),
      this.repository.listJobs(),
      this.repository.listSessionsForUser(userId),
    ]);
    return { resumeVersions, jobs, sessions };
  }

  async createSession(userId: string, input: { resumeVersionId: string; jobId: string }) {
    const [resumeVersion, job] = await Promise.all([
      this.repository.findResumeVersionForUser(userId, input.resumeVersionId),
      this.repository.findJob(input.jobId),
    ]);

    if (!resumeVersion) {
      throw new AssessmentOwnershipError("CV version không thuộc tài khoản hiện tại.");
    }
    if (!job) {
      throw new AssessmentValidationError("JD không tồn tại hoặc đã bị lưu trữ.");
    }

    const seniority = inferSeniority(job.title, `${job.description ?? ""}\n${job.requirements ?? ""}`);
    const tasks = buildTasks(job).map((task) => ({
      ...task,
      rubric: task.rubric as Prisma.InputJsonValue,
    }));

    return this.repository.createSession({
      userId,
      resumeVersionId: input.resumeVersionId,
      jobId: input.jobId,
      roleTitle: job.title,
      seniority,
      summary: `Bộ bài tập được sinh từ JD ${job.title} tại ${job.company}, dùng CV "${resumeVersion.resume.title}" làm ngữ cảnh ứng viên.`,
      tasks,
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.repository.findSessionForUser(userId, sessionId);
    if (!session) {
      throw new AssessmentOwnershipError("Không tìm thấy phiên đánh giá thuộc tài khoản hiện tại.");
    }
    return session;
  }

  async submitAndEvaluate(userId: string, input: { sessionId: string; answers: Array<{ taskId: string; answerText: string }> }) {
    const parsed = AssessmentSubmissionSchema.parse(input);
    const session = await this.getSession(userId, parsed.sessionId);
    const taskIds = new Set(session.tasks.map((task) => task.id));
    const submittedTaskIds = new Set(parsed.answers.map((answer) => answer.taskId));
    const hasUnknownTask = parsed.answers.some((answer) => !taskIds.has(answer.taskId));
    if (hasUnknownTask || parsed.answers.length !== session.tasks.length || submittedTaskIds.size !== taskIds.size) {
      throw new AssessmentValidationError("Cần trả lời đầy đủ đúng các bài tập trong phiên hiện tại.");
    }

    const evaluation = await this.provider.evaluate({
      roleTitle: session.roleTitle,
      seniority: session.seniority,
      tasks: session.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        prompt: task.prompt,
        expectedEvidence: task.expectedEvidence,
        rubric: AssessmentRubricSchema.parse(task.rubric),
      })),
      submissions: parsed.answers,
    });

    return this.repository.saveSubmissionsAndResult({
      userId,
      sessionId: parsed.sessionId,
      submissions: parsed.answers,
      result: {
        advisoryScore: evaluation.advisoryScore,
        rubricBreakdown: evaluation.rubricBreakdown as Prisma.InputJsonValue,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        evidence: evaluation.evidence as Prisma.InputJsonValue,
        limitations: evaluation.limitations,
        reportSummary: evaluation.reportSummary,
        evaluatorModel: evaluation.evaluatorModel,
        promptVersion: evaluation.promptVersion,
      },
    });
  }
}

export const assessmentService = new AssessmentService();
