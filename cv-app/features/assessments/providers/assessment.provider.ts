import type {
  AssessmentEvaluation,
  AssessmentRubricItem,
} from "../schemas/assessment.schema";
import { AssessmentEvaluationSchema } from "../schemas/assessment.schema";

export type AssessmentProviderTask = {
  id: string;
  title: string;
  prompt: string;
  expectedEvidence: string[];
  rubric: AssessmentRubricItem[];
};

export type AssessmentProviderSubmission = {
  taskId: string;
  answerText: string;
};

export type AssessmentEvaluationProvider = {
  evaluate(input: {
    roleTitle: string;
    seniority: string;
    tasks: AssessmentProviderTask[];
    submissions: AssessmentProviderSubmission[];
  }): Promise<AssessmentEvaluation>;
};

const criterionKeywords: Record<string, string[]> = {
  problem_framing: ["mục tiêu", "trade-off", "ràng buộc", "phạm vi", "yêu cầu"],
  architecture: ["api", "database", "cache", "queue", "service", "schema", "auth"],
  implementation: ["test", "migration", "validation", "rollback", "monitoring", "logging"],
  evidence: ["ví dụ", "metric", "log", "trace", "benchmark", "bằng chứng"],
  risk: ["rủi ro", "security", "privacy", "failure", "timeout", "rate limit"],
};

function scoreCriterion(answer: string, criterion: AssessmentRubricItem) {
  const normalized = answer.toLowerCase();
  const keywords = criterionKeywords[criterion.id] ?? criterion.evidenceHints;
  const matched = keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  const lengthBonus = answer.length >= 500 ? 1 : 0;
  return Math.min(criterion.maxScore, Math.max(0, matched.length + lengthBonus));
}

function extractEvidence(answer: string) {
  const sentences = answer
    .split(/[.!?\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 30);
  return sentences.slice(0, 2);
}

export class DeterministicAssessmentProvider implements AssessmentEvaluationProvider {
  async evaluate(input: {
    roleTitle: string;
    seniority: string;
    tasks: AssessmentProviderTask[];
    submissions: AssessmentProviderSubmission[];
  }): Promise<AssessmentEvaluation> {
    const submissionsByTask = new Map(
      input.submissions.map((submission) => [submission.taskId, submission.answerText])
    );

    const rubricBreakdown = input.tasks.map((task) => {
      const answer = submissionsByTask.get(task.id) ?? "";
      return {
        taskId: task.id,
        taskTitle: task.title,
        scores: task.rubric.map((criterion) => {
          const score = scoreCriterion(answer, criterion);
          return {
            criterionId: criterion.id,
            label: criterion.label,
            score,
            maxScore: criterion.maxScore,
            evidence: score > 0 ? extractEvidence(answer) : [],
            gap:
              score >= criterion.maxScore - 1
                ? undefined
                : `Cần nêu rõ hơn về ${criterion.label.toLowerCase()}.`,
          };
        }),
      };
    });

    const earned = rubricBreakdown.flatMap((task) => task.scores).reduce((sum, item) => sum + item.score, 0);
    const possible = rubricBreakdown.flatMap((task) => task.scores).reduce((sum, item) => sum + item.maxScore, 0);
    const advisoryScore = possible === 0 ? 0 : Math.round((earned / possible) * 100);

    const strongCriteria = rubricBreakdown
      .flatMap((task) => task.scores)
      .filter((score) => score.score >= score.maxScore - 1)
      .map((score) => score.label);
    const weakCriteria = rubricBreakdown
      .flatMap((task) => task.scores)
      .filter((score) => score.score <= Math.floor(score.maxScore / 2))
      .map((score) => score.label);

    const evaluation = {
      advisoryScore,
      rubricBreakdown,
      strengths:
        strongCriteria.length > 0
          ? [...new Set(strongCriteria)].slice(0, 4).map((label) => `Thể hiện tốt: ${label}.`)
          : ["Câu trả lời có đủ độ dài tối thiểu để bắt đầu đánh giá bằng chứng."],
      gaps:
        weakCriteria.length > 0
          ? [...new Set(weakCriteria)].slice(0, 4).map((label) => `Cần bổ sung bằng chứng cho: ${label}.`)
          : ["Chưa phát hiện khoảng trống lớn trong rubric định lượng."],
      evidence: input.tasks.flatMap((task) =>
        extractEvidence(submissionsByTask.get(task.id) ?? "").slice(0, 1).map((quote) => ({
          taskId: task.id,
          quote,
          rationale: "Đoạn này được dùng làm bằng chứng trực tiếp từ câu trả lời của ứng viên.",
        }))
      ),
      limitations: [
        "Điểm số là tư vấn, dựa trên câu trả lời văn bản và rubric lưu trong hệ thống.",
        "Đánh giá này không xác minh được mã nguồn, lịch sử commit, hoặc môi trường chạy thực tế.",
        "Không dùng kết quả như chứng chỉ năng lực độc lập; nhà tuyển dụng nên phỏng vấn bổ sung.",
      ],
      reportSummary: `Ứng viên được đánh giá cho vai trò ${input.roleTitle} (${input.seniority}) với điểm tư vấn ${advisoryScore}/100 dựa trên bằng chứng trong bài nộp.`,
      evaluatorModel: "deterministic-local-v1",
      promptVersion: "assessment-rubric-v1",
    };

    return AssessmentEvaluationSchema.parse(evaluation);
  }
}
