import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CandidateResumeSnapshot } from "./CandidateResumeSnapshot";

describe("CandidateResumeSnapshot", () => {
  it("renders an immutable CV snapshot as structured candidate sections", () => {
    render(
      <CandidateResumeSnapshot
        content={{
          personalInfo: {
            fullName: "Ứng viên kiểm thử",
            title: "Kỹ sư phần mềm",
            email: "candidate@example.test",
            summary: "Xây dựng sản phẩm có kiểm thử.",
          },
          experiences: [{ id: "exp-1", company: "Công ty thật", role: "Kỹ sư", description: "Phát triển hệ thống." }],
          educations: [{ id: "edu-1", institution: "Đại học", degree: "Cử nhân" }],
          skills: [{ id: "skill-1", name: "TypeScript" }],
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Ứng viên kiểm thử" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kinh nghiệm" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Học vấn" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kỹ năng" })).toBeInTheDocument();
    expect(screen.queryByText(/personalInfo/)).not.toBeInTheDocument();
  });

  it("shows a safe empty state for an invalid legacy snapshot", () => {
    render(<CandidateResumeSnapshot content={{ unexpected: "value" }} />);
    expect(screen.getByText("Snapshot CV không có nội dung hợp lệ để hiển thị.")).toBeInTheDocument();
  });
});
