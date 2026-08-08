import { z } from "zod";

export const AssessmentStartSchema = z.object({
  resumeVersionId: z.string().min(1, "Vui lòng chọn phiên bản CV"),
  jobId: z.string().min(1, "Vui lòng chọn JD"),
});

export const AssessmentSubmissionSchema = z.object({
  sessionId: z.string().min(1),
  answers: z
    .array(
      z.object({
        taskId: z.string().min(1),
        answerText: z
          .string()
          .trim()
          .min(120, "Mỗi câu trả lời cần ít nhất 120 ký tự để có đủ bằng chứng đánh giá")
          .max(12000, "Câu trả lời không được vượt quá 12.000 ký tự"),
      })
    )
    .min(1, "Cần có ít nhất một câu trả lời"),
});

export const AssessmentRubricItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  maxScore: z.number().int().min(1).max(5),
  evidenceHints: z.array(z.string()),
});

export const AssessmentRubricSchema = z.array(AssessmentRubricItemSchema).min(1);

export const AssessmentRubricScoreSchema = z.object({
  criterionId: z.string(),
  label: z.string(),
  score: z.number().int().min(0).max(5),
  maxScore: z.number().int().min(1).max(5),
  evidence: z.array(z.string()),
  gap: z.string().optional(),
});

export const AssessmentEvaluationSchema = z.object({
  advisoryScore: z.number().int().min(0).max(100),
  rubricBreakdown: z.array(
    z.object({
      taskId: z.string(),
      taskTitle: z.string(),
      scores: z.array(AssessmentRubricScoreSchema),
    })
  ),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  evidence: z.array(
    z.object({
      taskId: z.string(),
      quote: z.string(),
      rationale: z.string(),
    })
  ),
  limitations: z.array(z.string()).min(1),
  reportSummary: z.string().min(20),
  evaluatorModel: z.string(),
  promptVersion: z.string(),
});

export type AssessmentStartInput = z.infer<typeof AssessmentStartSchema>;
export type AssessmentSubmissionInput = z.infer<typeof AssessmentSubmissionSchema>;
export type AssessmentRubricItem = z.infer<typeof AssessmentRubricItemSchema>;
export type AssessmentEvaluation = z.infer<typeof AssessmentEvaluationSchema>;
