import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssessmentReport } from "./AssessmentReport";

describe("AssessmentReport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders repeated evidence quotes without duplicate React keys", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = {
      advisoryScore: 50,
      rubricBreakdown: [
        {
          taskId: "task-1",
          taskTitle: "Task",
          scores: [
            {
              criterionId: "architecture",
              label: "Architecture",
              score: 3,
              maxScore: 5,
              evidence: ["API dùng auth"],
            },
          ],
        },
      ],
      strengths: ["Có API"],
      gaps: ["Cần thêm test"],
      evidence: [
        { taskId: "task-1", quote: "API dùng auth", rationale: "Khớp architecture" },
        { taskId: "task-1", quote: "API dùng auth", rationale: "Khớp security" },
      ],
      limitations: ["Advisory only"],
      reportSummary: "Summary",
      evaluatorModel: "deterministic-local-v1",
      promptVersion: "assessment-rubric-v1",
    };

    render(<AssessmentReport result={result} />);

    expect(screen.getAllByText('"API dùng auth"')).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
