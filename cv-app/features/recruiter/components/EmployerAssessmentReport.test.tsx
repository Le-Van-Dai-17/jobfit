import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmployerAssessmentReport } from "./EmployerAssessmentReport";

describe("EmployerAssessmentReport", () => {
  it("renders rubric, evidence, and limitations from the employer-safe report", () => {
    render(<EmployerAssessmentReport result={{
      advisoryScore: 72,
      reportSummary: "Đạt mức phù hợp cơ bản.",
      strengths: ["Phân tích rõ"],
      gaps: ["Thiếu kiểm thử tải"],
      limitations: ["Chỉ đánh giá một bài"],
      rubricBreakdown: [{ taskId: "task-1", taskTitle: "API review", scores: [{ criterionId: "c1", label: "Correctness", score: 4, maxScore: 5, evidence: ["quote"], gap: "Cần edge cases" }] }],
      evidence: [{ taskId: "task-1", quote: "Use a transaction", rationale: "Cho thấy hiểu atomicity" }],
    }} />);

    expect(screen.getByText("Rubric")).toBeInTheDocument();
    expect(screen.getByText("Correctness")).toBeInTheDocument();
    expect(screen.getByText(/Use a transaction/)).toBeInTheDocument();
    expect(screen.getByText("Chỉ đánh giá một bài")).toBeInTheDocument();
  });
});
