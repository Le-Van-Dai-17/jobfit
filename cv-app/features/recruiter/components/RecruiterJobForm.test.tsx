import { render, screen } from "@testing-library/react";
import { useActionState } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecruiterJobForm } from "./RecruiterJobForm";

vi.mock("../actions/recruiter.actions", () => ({
  createRecruiterJobAction: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

describe("RecruiterJobForm", () => {
  it("renders server validation errors from action state", () => {
    vi.mocked(useActionState).mockReturnValue([{ error: "Tiêu đề quá ngắn." }, vi.fn(), false]);

    render(<RecruiterJobForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Tiêu đề quá ngắn.");
  });

  it("disables submission while the action is pending", () => {
    vi.mocked(useActionState).mockReturnValue([{}, vi.fn(), true]);

    render(<RecruiterJobForm />);

    expect(screen.getByRole("button", { name: /Lưu Nháp/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Đăng Tin Tuyển Dụng/i })).toBeDisabled();
  });

  it("renders the persisted Stitch JD fields with Vietnamese labels", () => {
    vi.mocked(useActionState).mockReturnValue([{}, vi.fn(), false]);
    render(<RecruiterJobForm />);

    expect(screen.getByLabelText("Phòng ban")).toBeInTheDocument();
    expect(screen.getByLabelText(/Kinh nghiệm yêu cầu/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tại văn phòng" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hybrid" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remote" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tối thiểu (VND)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tối đa (VND)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập kỹ năng/)).toBeInTheDocument();
    expect(screen.getByLabelText("Quyền lợi")).toBeInTheDocument();
  });
});
