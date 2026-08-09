import { render, screen } from "@testing-library/react";
import { useActionState } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecruiterJobEditForm } from "./RecruiterJobEditForm";

vi.mock("../actions/recruiter.actions", () => ({
  updateRecruiterJobAction: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

const job = {
  id: "job-a",
  title: "Senior Frontend Engineer",
  location: "Hà Nội",
  type: "FULL_TIME · HYBRID",
  salaryRange: null,
  description: "Build recruiter workflows with React and TypeScript.",
  requirements: "React, TypeScript, accessibility, testing.",
  benefits: "Health insurance and learning budget.",
  url: "https://example.test/jobs/frontend",
  deadline: new Date("2026-09-30T00:00:00.000Z"),
  department: "ENGINEERING" as const,
  employmentType: "FULL_TIME" as const,
  workMode: "HYBRID" as const,
  experienceLevel: "SENIOR" as const,
  salaryMin: 25000000,
  salaryMax: 40000000,
  salaryCurrency: "VND",
  salaryNegotiable: false,
  skills: ["React", "TypeScript"],
};

describe("RecruiterJobEditForm", () => {
  it("edits every structured JD field persisted by the recruiter job model", () => {
    vi.mocked(useActionState).mockReturnValue([{}, vi.fn(), false]);

    render(<RecruiterJobEditForm job={job} />);

    expect(screen.getByLabelText("Chức danh công việc")).toHaveValue(job.title);
    expect(screen.getByLabelText("Phòng ban")).toHaveValue("ENGINEERING");
    expect(screen.getByLabelText("Mức kinh nghiệm")).toHaveValue("SENIOR");
    expect(screen.getByLabelText("Loại hình tuyển dụng")).toHaveValue("FULL_TIME");
    expect(screen.getByLabelText("Hình thức làm việc")).toHaveValue("HYBRID");
    expect(screen.getByLabelText("Lương tối thiểu")).toHaveValue(25000000);
    expect(screen.getByLabelText("Lương tối đa")).toHaveValue(40000000);
    expect(screen.getByLabelText("Đơn vị tiền tệ")).toHaveValue("VND");
    expect(screen.getByLabelText("Kỹ năng")).toHaveValue("React, TypeScript");
    expect(screen.getByLabelText("Quyền lợi")).toHaveValue(job.benefits);
    expect(screen.queryByText("Chinh sua JD")).not.toBeInTheDocument();
    expect(screen.queryByText("Ten vi tri")).not.toBeInTheDocument();
  });

  it("preserves legacy type and salary values when structured fields are not populated yet", () => {
    vi.mocked(useActionState).mockReturnValue([{}, vi.fn(), false]);

    const legacyJob = {
      ...job,
      type: "Full-time · Tại văn phòng",
      salaryRange: "25–40 triệu VND",
      department: null,
      employmentType: null,
      workMode: null,
      experienceLevel: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      salaryNegotiable: false,
      skills: [],
    };

    const { container } = render(<RecruiterJobEditForm job={legacyJob} />);

    expect(container.querySelector('input[name="type"]')).toHaveValue(legacyJob.type);
    expect(container.querySelector('input[name="salaryRange"]')).toHaveValue(legacyJob.salaryRange);
  });
});
