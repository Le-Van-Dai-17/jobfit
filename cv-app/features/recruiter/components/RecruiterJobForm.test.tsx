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

    expect(screen.getByRole("button", { name: /Đang lưu/i })).toBeDisabled();
  });
});
