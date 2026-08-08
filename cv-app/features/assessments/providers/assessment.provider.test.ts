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
  });
});
