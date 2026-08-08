import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AssessmentStartForm } from "./AssessmentStartForm";

vi.mock("../actions/assessment.actions", () => ({
  createAssessmentSessionAction: vi.fn(),
  initialAssessmentActionState: { status: "idle" },
}));

describe("AssessmentStartForm", () => {
  it("preselects CV and JD from the validated route query", () => {
    render(
      <AssessmentStartForm
        resumeVersions={[
          {
            id: "version-1",
            version: 2,
            createdAt: new Date("2026-08-09T00:00:00.000Z"),
            resume: { title: "CV chính" },
          },
        ]}
        jobs={[{ id: "job-1", title: "Frontend Engineer", company: "Kada" }]}
        selectedResumeVersionId="version-1"
        selectedJobId="job-1"
      />
    );

    expect(screen.getByLabelText("Phiên bản CV")).toHaveValue("version-1");
    expect(screen.getByLabelText("Job/JD")).toHaveValue("job-1");
  });

  it("disables submission when a saved CV or JD is missing", () => {
    render(<AssessmentStartForm resumeVersions={[]} jobs={[{ id: "job-1", title: "Frontend", company: "Kada" }]} />);

    expect(screen.getByRole("button", { name: /Tạo bài tập/i })).toBeDisabled();
    expect(screen.getByLabelText("Phiên bản CV")).toBeDisabled();
  });
});
