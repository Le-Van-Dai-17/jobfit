import { GoogleGenAI } from "@google/genai";
import type {
  AssessmentEvaluation,
  AssessmentRubricItem,
} from "../schemas/assessment.schema";
import { AssessmentEvaluationSchema } from "../schemas/assessment.schema";
import { type AssessmentProviderTask, type AssessmentProviderSubmission, type AssessmentEvaluationProvider } from "./assessment.provider";

export class GeminiAssessmentProvider implements AssessmentEvaluationProvider {
  private ai: GoogleGenAI;
  private modelName = "gemini-2.5-flash"; // Or gemini-2.0-flash depending on SDK version and requirements. Using gemini-2.5-flash as default modern model.

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async evaluate(input: {
    roleTitle: string;
    seniority: string;
    tasks: AssessmentProviderTask[];
    submissions: AssessmentProviderSubmission[];
  }): Promise<AssessmentEvaluation> {
    const prompt = this.buildPrompt(input);

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Enforce JSON schema to match our exact required output
        responseSchema: {
          type: "OBJECT",
          properties: {
            advisoryScore: { type: "INTEGER" },
            rubricBreakdown: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  taskId: { type: "STRING" },
                  taskTitle: { type: "STRING" },
                  scores: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        criterionId: { type: "STRING" },
                        label: { type: "STRING" },
                        score: { type: "INTEGER" },
                        maxScore: { type: "INTEGER" },
                        evidence: { type: "ARRAY", items: { type: "STRING" } },
                        gap: { type: "STRING", nullable: true },
                      },
                      required: ["criterionId", "label", "score", "maxScore", "evidence"],
                    },
                  },
                },
                required: ["taskId", "taskTitle", "scores"],
              },
            },
            strengths: { type: "ARRAY", items: { type: "STRING" } },
            gaps: { type: "ARRAY", items: { type: "STRING" } },
            evidence: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  taskId: { type: "STRING" },
                  quote: { type: "STRING" },
                  rationale: { type: "STRING" },
                },
                required: ["taskId", "quote", "rationale"],
              },
            },
            limitations: { type: "ARRAY", items: { type: "STRING" } },
            reportSummary: { type: "STRING" },
          },
          required: [
            "advisoryScore",
            "rubricBreakdown",
            "strengths",
            "gaps",
            "evidence",
            "limitations",
            "reportSummary",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(text);

    // Add missing model details automatically
    const result = {
      ...parsed,
      evaluatorModel: this.modelName,
      promptVersion: "gemini-eval-v1",
    };

    return AssessmentEvaluationSchema.parse(result);
  }

  private buildPrompt(input: {
    roleTitle: string;
    seniority: string;
    tasks: AssessmentProviderTask[];
    submissions: AssessmentProviderSubmission[];
  }): string {
    const submissionsByTask = new Map(
      input.submissions.map((submission) => [submission.taskId, submission.answerText])
    );

    let prompt = `Bạn là một Senior Engineering Manager đang đánh giá bài kiểm tra năng lực của một ứng viên cho vị trí ${input.roleTitle} (Cấp độ: ${input.seniority}).\n\n`;
    prompt += `Dưới đây là các bài tập và phần trả lời/mã nguồn của ứng viên. Nhiệm vụ của bạn là đọc kỹ mã nguồn và các giải trình, sau đó chấm điểm dựa trên Rubric.\n\n`;

    input.tasks.forEach((task, index) => {
      prompt += `### Task ${index + 1}: ${task.title}\n`;
      prompt += `- Yêu cầu: ${task.prompt}\n`;
      prompt += `- Rubric chấm điểm:\n`;
      task.rubric.forEach(r => {
        prompt += `  * [${r.id}] ${r.label} (Max: ${r.maxScore} điểm). Tiêu chí: ${r.evidenceHints.join(", ")}\n`;
      });
      prompt += `- Bài làm của ứng viên:\n\`\`\`\n${submissionsByTask.get(task.id) ?? "(Không có câu trả lời)"}\n\`\`\`\n\n`;
    });

    prompt += `Vui lòng trả về kết quả JSON chứa các thông tin sau:
- advisoryScore: Điểm số tư vấn tổng thể (từ 0 đến 100). Tính bằng: (Tổng điểm đạt được / Tổng điểm tối đa) * 100.
- rubricBreakdown: Chi tiết điểm số cho từng task và từng criterion. Cung cấp "evidence" (trích dẫn mã nguồn/lời giải) để chứng minh điểm, và "gap" (nhận xét) nếu điểm nhỏ hơn maxScore.
- strengths: Danh sách 3-5 điểm mạnh nổi bật của ứng viên dựa trên rubric.
- gaps: Danh sách 2-4 lỗ hổng hoặc điểm cần cải thiện.
- evidence: Các trích dẫn cụ thể (quote) và lý do (rationale) từ bài làm chứng minh cho đánh giá.
- limitations: Một mảng các lưu ý về giới hạn của đánh giá tự động (ví dụ: "Chưa kiểm chứng được qua phỏng vấn trực tiếp").
- reportSummary: Tóm tắt ngắn gọn báo cáo đánh giá (2-3 câu).
`;

    return prompt;
  }
}
