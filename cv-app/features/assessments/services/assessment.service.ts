import type { AssessmentSeniority, AssessmentTaskType, Prisma } from "@prisma/client";

import { DeterministicAssessmentProvider, type AssessmentEvaluationProvider } from "../providers/assessment.provider";
import {
  assessmentRepository,
  AssessmentSessionStateError,
  type AssessmentRepository,
} from "../repositories/assessment.repository";
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
      type: "CODE_REVIEW" as const,
      title: `Tối ưu hóa mã nguồn (Legacy Code) cho ${job.title}`,
      prompt: `Hệ thống cũ của ${job.company} đang gặp vấn đề nghiêm trọng về hiệu năng (Bottleneck). API xử lý đôi khi mất tới 2.8s và CPU Database tăng vọt lên 92%.\n\nBên dưới là mã nguồn (Legacy Code) đang chạy trên Production. Hãy đọc hiểu code, nhận diện vấn đề (ví dụ: N+1 query, thuật toán kém tối ưu, vòng lặp vô tận, thiếu caching...) và sửa trực tiếp mã nguồn để hệ thống chạy nhanh và an toàn hơn.`,
      skills: [...new Set([...skills, "Performance Optimization", "Code Review"])],
      rubric,
      expectedEvidence: ["Xác định đúng nguyên nhân gây chậm (Bottleneck)", "Mã nguồn sau khi sửa chạy hiệu quả hơn (Time/Space complexity)", "Đảm bảo tính đúng đắn của dữ liệu", "Bảo mật hoặc xử lý concurrency (nếu có)"],
    },
    {
      orderIndex: 2,
      type: "SYSTEM_DESIGN" as const,
      title: "Cải tiến Kiến trúc Cơ sở dữ liệu",
      prompt: `Tiếp tục với bài toán tối ưu trên, giải pháp sửa code là chưa đủ nếu lượng dữ liệu tăng gấp 10 lần trong tương lai. Hãy xem cấu trúc Database hiện tại (bảng schema ở tab Database) và đề xuất các thay đổi về kiến trúc. Bạn có thể đề xuất thêm Index, Caching layer (Redis), Message Queue, hoặc thay đổi kiểu dữ liệu.`,
      skills: [...new Set([...skills, "System Design", "Database Optimization", "Caching"])],
      rubric,
      expectedEvidence: ["Đề xuất Indexing/Partitioning hợp lý", "Thiết kế Caching hoặc Queue", "Đánh giá Trade-off của thiết kế mới", "Kế hoạch migrate dữ liệu cũ"],
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

  async createSession(userId: string, input: { resumeVersionId: string; jobId: string; applicationId?: string | null }) {
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
    if (input.applicationId) {
      const application = await this.repository.findApplicationContext(userId, input.applicationId);
      if (!application || application.jobId !== input.jobId || application.resumeVersionId !== input.resumeVersionId) {
        throw new AssessmentOwnershipError("Application không khớp với ứng viên, JD và CV đã chọn.");
      }
    }

    const seniority = inferSeniority(job.title, `${job.description ?? ""}\n${job.requirements ?? ""}`);
    const tasks = buildTasks(job).map((task) => ({
      ...task,
      rubric: task.rubric as Prisma.InputJsonValue,
    }));

    try {
      return await this.repository.createSession({
      userId,
      resumeVersionId: input.resumeVersionId,
      jobId: input.jobId,
      applicationId: input.applicationId,
      roleTitle: job.title,
      seniority,
      summary: `Bộ bài tập được sinh từ JD ${job.title} tại ${job.company}, dùng CV "${resumeVersion.resume.title}" làm ngữ cảnh ứng viên.`,
      tasks,
      });
    } catch (error) {
      if (error instanceof AssessmentSessionStateError) {
        throw new AssessmentOwnershipError("Application không khớp với ứng viên, JD và CV đã chọn.");
      }
      throw error;
    }
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
    if (session.status !== "TASKS_GENERATED") {
      throw new AssessmentValidationError("Phiên đánh giá này đã được nộp hoặc không còn nhận bài.");
    }
    const taskIds = new Set(session.tasks.map((task) => task.id));
    const submittedTaskIds = new Set(parsed.answers.map((answer) => answer.taskId));
    const hasUnknownTask = parsed.answers.some((answer) => !taskIds.has(answer.taskId));
    if (hasUnknownTask || parsed.answers.length !== session.tasks.length || submittedTaskIds.size !== taskIds.size) {
      throw new AssessmentValidationError("Cần trả lời đầy đủ đúng các bài tập trong phiên hiện tại.");
    }

    try {
      return await this.repository.completeSubmission(
        {
          userId,
          sessionId: parsed.sessionId,
          submissions: parsed.answers,
        },
        async () => {
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

          return {
            advisoryScore: evaluation.advisoryScore,
            rubricBreakdown: evaluation.rubricBreakdown as Prisma.InputJsonValue,
            strengths: evaluation.strengths,
            gaps: evaluation.gaps,
            evidence: evaluation.evidence as Prisma.InputJsonValue,
            limitations: evaluation.limitations,
            reportSummary: evaluation.reportSummary,
            evaluatorModel: evaluation.evaluatorModel,
            promptVersion: evaluation.promptVersion,
          };
        }
      );
    } catch (error) {
      if (error instanceof AssessmentSessionStateError) {
        throw new AssessmentValidationError("Phiên đánh giá này đã được nộp hoặc không còn nhận bài.");
      }
      throw error;
    }
  }
}

export const assessmentService = new AssessmentService();
