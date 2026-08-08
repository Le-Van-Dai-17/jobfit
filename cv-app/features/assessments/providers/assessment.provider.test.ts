import { describe, expect, it } from "vitest";

import { DeterministicAssessmentProvider } from "./assessment.provider";

describe("DeterministicAssessmentProvider", () => {
  it("returns a structured advisory evaluation from submitted evidence only", async () => {
    const provider = new DeterministicAssessmentProvider();

    const result = await provider.evaluate({
      roleTitle: "Senior Frontend Engineer",
      seniority: "SENIOR",
      tasks: [
        {
          id: "task-1",
          title: "Design feature",
          prompt: "Prompt",
          expectedEvidence: ["API"],
          rubric: [
            {
              id: "architecture",
              label: "Thiết kế kỹ thuật phù hợp",
              maxScore: 5,
              evidenceHints: ["api", "database"],
            },
          ],
        },
      ],
      submissions: [
        {
          taskId: "task-1",
          answerText:
            "Tôi sẽ thiết kế API rõ ràng, database schema có migration, service boundary và test rollback. Cách này có bằng chứng từ log và monitoring sau triển khai.",
        },
      ],
    });

    expect(result.evaluatorModel).toBe("deterministic-local-v1");
    expect(result.advisoryScore).toBeGreaterThan(0);
    expect(result.rubricBreakdown[0]?.scores[0]?.evidence[0]).toContain("API");
    expect(result.limitations.length).toBeGreaterThan(0);
    expect(result.evidence[0]?.rationale).toContain("Thiết kế kỹ thuật phù hợp");
    expect(result.limitations.join(" ")).toContain("heuristic");
  });

  it("gives zero score and no evidence for a long but irrelevant answer", async () => {
    const provider = new DeterministicAssessmentProvider();
    const irrelevantSentence = "Ứng viên kể lại một câu chuyện cá nhân hoàn toàn không liên quan đến tiêu chí chấm điểm";

    const result = await provider.evaluate({
      roleTitle: "Backend Engineer",
      seniority: "MID",
      tasks: [{
        id: "task-1",
        title: "Architecture",
        prompt: "Prompt",
        expectedEvidence: ["API contract"],
        rubric: [{
          id: "architecture",
          label: "Thiết kế kỹ thuật phù hợp",
          maxScore: 5,
          evidenceHints: ["api", "database"],
        }],
      }],
      submissions: [{ taskId: "task-1", answerText: `${irrelevantSentence}. `.repeat(10) }],
    });

    expect(result.advisoryScore).toBe(0);
    expect(result.rubricBreakdown[0]?.scores[0]).toMatchObject({ score: 0, evidence: [] });
    expect(result.evidence).toEqual([]);
  });

  it("attaches only matching sentences to their scored criterion", async () => {
    const provider = new DeterministicAssessmentProvider();
    const architectureEvidence = "API sẽ yêu cầu auth và ghi dữ liệu vào database theo schema đã version hóa";
    const unrelatedSentence = "Phần giới thiệu này chỉ mô tả sở thích cá nhân của ứng viên";

    const result = await provider.evaluate({
      roleTitle: "Backend Engineer",
      seniority: "MID",
      tasks: [{
        id: "task-1",
        title: "Architecture",
        prompt: "Prompt",
        expectedEvidence: ["API contract"],
        rubric: [{
          id: "architecture",
          label: "Thiết kế kỹ thuật phù hợp",
          maxScore: 5,
          evidenceHints: ["api", "database"],
        }],
      }],
      submissions: [{
        taskId: "task-1",
        answerText: `${unrelatedSentence}. ${architectureEvidence}.`,
      }],
    });

    expect(result.rubricBreakdown[0]?.scores[0]?.evidence).toEqual([architectureEvidence]);
    expect(result.evidence).toEqual([
      expect.objectContaining({
        taskId: "task-1",
        quote: architectureEvidence,
        rationale: expect.stringContaining("Thiết kế kỹ thuật phù hợp"),
      }),
    ]);
  });
});
