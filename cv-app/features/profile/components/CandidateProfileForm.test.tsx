import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions/update-profile", () => ({ updateCandidateProfileAction: vi.fn() }));

import { CandidateProfileForm } from "./CandidateProfileForm";

describe("CandidateProfileForm", () => {
  it("provides a persisted profile completion path with current values", () => {
    render(<CandidateProfileForm initialValues={{ headline: "Backend Engineer", location: "Đà Nẵng" }} />);

    expect(screen.getByLabelText("Chức danh")).toHaveValue("Backend Engineer");
    expect(screen.getByLabelText("Địa điểm")).toHaveValue("Đà Nẵng");
    expect(screen.getByRole("button", { name: "Lưu hồ sơ" })).toBeInTheDocument();
  });
});
