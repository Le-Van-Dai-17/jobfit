import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions/create-resume", () => ({
  createResumeAction: vi.fn(),
}));

import { CreateResumeForm } from "./CreateResumeForm";

describe("CreateResumeForm", () => {
  it("shows an explicit candidate-provided title field and no demo CV title", () => {
    render(<CreateResumeForm />);

    expect(screen.getByRole("heading", { name: "Tạo CV đầu tiên" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên CV")).toBeRequired();
    expect(screen.getByRole("button", { name: "Tạo CV" })).toBeInTheDocument();
    expect(screen.queryByText("Frontend Developer CV - 2024")).not.toBeInTheDocument();
  });
});
