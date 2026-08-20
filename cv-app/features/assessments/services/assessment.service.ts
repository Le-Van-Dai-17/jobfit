import type { AssessmentSeniority, Prisma } from "@prisma/client";

import { DeterministicAssessmentProvider, type AssessmentEvaluationProvider } from "../providers/assessment.provider";
import { GeminiAssessmentProvider } from "../providers/gemini.provider";
import {
  assessmentRepository,
  AssessmentSessionStateError,
  type AssessmentRepository,
} from "../repositories/assessment.repository";
import { AssessmentSubmissionSchema, AssessmentRubricSchema } from "../schemas/assessment.schema";

export class AssessmentOwnershipError extends Error {}
export class AssessmentValidationError extends Error {}
export { AssessmentSessionStateError };

function inferSeniority(title: string, description: string): AssessmentSeniority {
  const text = `${title} ${description}`.toLowerCase();
  if (/\blead\b|principal|staff|trưởng nhóm/.test(text)) return "LEAD";
  if (/senior|sr\.|5\+|trên 5/.test(text)) return "SENIOR";
  if (/intern|thực tập/.test(text)) return "INTERN";
  if (/junior|fresher|mới tốt nghiệp/.test(text)) return "JUNIOR";
  return "MID";
}

import { matchScenario } from "./scenario-bank";

export class AssessmentService {
  constructor(
    private readonly repository: AssessmentRepository = assessmentRepository,
    private readonly provider: AssessmentEvaluationProvider = process.env.GEMINI_API_KEY
      ? new GeminiAssessmentProvider(process.env.GEMINI_API_KEY)
      : new DeterministicAssessmentProvider()
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

    const scenario = matchScenario(job.title, `${job.description ?? ""}\n${job.requirements ?? ""}`);

    const inferredSeniority = inferSeniority(job.title, `${job.description ?? ""}\n${job.requirements ?? ""}`);
    const seniority = scenario.seniority.includes(inferredSeniority) ? inferredSeniority : scenario.seniority[0];

    const tasks = scenario.tasks.map((task) => ({
      orderIndex: task.orderIndex,
      type: task.type,
      title: task.title,
      prompt: task.prompt,
      skills: task.skills,
      rubric: task.rubric as Prisma.InputJsonValue,
      expectedEvidence: task.expectedEvidence,
    }));

    try {
      return await this.repository.createSession({
      userId,
      resumeVersionId: input.resumeVersionId,
      jobId: input.jobId,
      applicationId: input.applicationId,
      roleTitle: job.title,
      seniority,
      summary: `Bộ tình huống "${scenario.title}" được chọn tự động cho công việc ${job.title} tại ${job.company}, dùng CV "${resumeVersion.resume.title}" làm ngữ cảnh ứng viên.`,
      tasks,
      // We will need to store scenario files in the session.
      // But currently, repository.createSession does not take files or schema.
      // We can pass scenarioId in summary for reference, or ideally in a new field.
      // For now, since schema only takes tasks, we will handle scenario data injection at the IDE level.
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
