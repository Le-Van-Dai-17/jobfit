import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeSnapshot } from "./ResumeSnapshot";

const persistedSnapshot = {
  personalInfo: {
    fullName: "Lan Pham",
    title: "Backend Engineer",
    email: "lan@example.com",
    phone: "0900000000",
    location: "Đà Nẵng",
    summary: "Xây dựng API ổn định.",
  },
  experiences: [{
    id: "exp-1",
    company: "Acme",
    role: "Backend Engineer",
    isCurrent: true,
    description: "Vận hành dịch vụ Go.",
  }],
  educations: [],
  skills: [{ id: "skill-1", name: "Go", level: 4 }],
};

describe("ResumeSnapshot", () => {
  it("formats safe fields from the selected persisted resume version", () => {
    render(<ResumeSnapshot content={persistedSnapshot} />);

    expect(screen.getByText("Lan Pham")).toBeInTheDocument();
    expect(screen.getAllByText("Backend Engineer")).toHaveLength(2);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.queryByText(JSON.stringify(persistedSnapshot))).not.toBeInTheDocument();
  });

  it("fails closed with an empty state for invalid legacy JSON", () => {
    render(<ResumeSnapshot content={{ personalInfo: { fullName: "x" } }} />);

    expect(screen.getByText("Snapshot CV không có nội dung hợp lệ để hiển thị.")).toBeInTheDocument();
  });
});
