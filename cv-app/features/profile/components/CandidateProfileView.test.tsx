import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CandidateProfileView } from "./CandidateProfileView";

describe("CandidateProfileView", () => {
  it("renders only persisted current-user profile data", () => {
    render(
      <CandidateProfileView
        profile={{
          user: { name: "Lan Pham", email: "lan@example.com" },
          headline: "Backend Engineer",
          summary: "Xây dựng hệ thống đáng tin cậy.",
          phone: "0900000000",
          location: "Đà Nẵng",
          website: null,
          linkedinUrl: null,
          githubUrl: null,
          skills: [{ id: "skill-1", name: "Go", category: "Backend", level: 4 }],
          certificates: [{ id: "cert-1", name: "CKA", issuer: "CNCF" }],
        }}
      />
    );

    expect(screen.getByText("Lan Pham")).toBeInTheDocument();
    expect(screen.getByText("lan@example.com")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("CKA")).toBeInTheDocument();
    expect(screen.queryByText("Vũ Nguyễn")).not.toBeInTheDocument();
    expect(screen.queryByText("AWS Certified Developer - Associate")).not.toBeInTheDocument();
  });

  it("renders honest empty states when no Profile row exists", () => {
    render(<CandidateProfileView profile={{ user: { name: null, email: "new@example.com" } }} />);

    expect(screen.getByText("new@example.com")).toBeInTheDocument();
    expect(screen.getByText("Chưa có thông tin hồ sơ.")).toBeInTheDocument();
    expect(screen.getByText("Chưa có kỹ năng nào.")).toBeInTheDocument();
    expect(screen.getByText("Chưa có chứng chỉ nào.")).toBeInTheDocument();
  });
});
