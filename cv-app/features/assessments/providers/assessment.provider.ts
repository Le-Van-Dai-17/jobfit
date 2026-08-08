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

function normalizedWords(value: string) {
  return ` ${value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
}

function matchesKeyword(value: string, keyword: string) {
  return normalizedWords(value).includes(normalizedWords(keyword));
}

function scoreCriterion(answer: string, criterion: AssessmentRubricItem) {
  const keywords = [...new Set([...(criterionKeywords[criterion.id] ?? []), ...criterion.evidenceHints])];
  const sentences = answer
    .split(/[.!?\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const evidence = sentences.filter((sentence) =>
    keywords.some((keyword) => matchesKeyword(sentence, keyword))
  );
  const matchedKeywords = keywords.filter((keyword) =>
    evidence.some((sentence) => matchesKeyword(sentence, keyword))
  );

  return {
    score: Math.min(criterion.maxScore, matchedKeywords.length),
    evidence,
  };
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
          const scored = scoreCriterion(answer, criterion);
          return {
            criterionId: criterion.id,
            label: criterion.label,
            score: scored.score,
            maxScore: criterion.maxScore,
            evidence: scored.evidence,
            gap:
              scored.score >= criterion.maxScore - 1
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
          : ["Chưa có tiêu chí nào đạt ngưỡng thể hiện tốt theo heuristic từ khóa."],
      gaps:
        weakCriteria.length > 0
          ? [...new Set(weakCriteria)].slice(0, 4).map((label) => `Cần bổ sung bằng chứng cho: ${label}.`)
          : ["Chưa phát hiện khoảng trống lớn trong rubric định lượng."],
      evidence: rubricBreakdown.flatMap((task) =>
        task.scores.flatMap((criterion) =>
          criterion.evidence.map((quote) => ({
            taskId: task.taskId,
            quote,
            rationale: `Câu này khớp tiêu chí "${criterion.label}" (${criterion.criterionId}) theo heuristic từ khóa và được dùng trực tiếp để chấm tiêu chí đó.`,
          }))
        )
      ),
      limitations: [
        "Điểm số là tư vấn (advisory), dùng heuristic keyword-based để đối chiếu câu trả lời văn bản với rubric; không đánh giá được chất lượng ngữ nghĩa sâu.",
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
