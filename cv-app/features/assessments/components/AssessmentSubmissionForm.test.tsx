import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions/assessment.actions", () => ({ submitAssessmentAction: vi.fn() }));

import { AssessmentSubmissionForm } from "./AssessmentSubmissionForm";

describe("AssessmentSubmissionForm candidate workspace", () => {
  it("collects a solution and deployment plan without recruiter-only controls", () => {
    render(
      <AssessmentSubmissionForm
        sessionId="session-1"
        tasks={[{
          id: "task-1",
          title: "Thiết kế hệ thống",
          prompt: "Mô tả giải pháp.",
          skills: ["TypeScript"],
          expectedEvidence: ["Quyết định kỹ thuật"],
        }]}
      />
    );

    expect(screen.getByLabelText("Giải pháp và bằng chứng")).toHaveAttribute("name", "answer-task-1");
    expect(screen.getByLabelText("Giải pháp và bằng chứng")).toHaveAttribute("maxLength", "9500");
    expect(screen.getByLabelText("Kế hoạch triển khai")).toHaveAttribute("name", "deployment-task-1");
    expect(screen.getByLabelText("Kế hoạch triển khai")).toHaveAttribute("maxLength", "2000");
    expect(screen.queryByText(/duyệt ứng viên|ghi chú nhà tuyển dụng|đề xuất tuyển/i)).not.toBeInTheDocument();
  });
});
