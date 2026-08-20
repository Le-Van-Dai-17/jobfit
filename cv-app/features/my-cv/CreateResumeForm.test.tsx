import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions/create-resume", () => ({
  createResumeAction: vi.fn(),
}));

vi.mock("./actions/import-resume", () => ({
  importResumeAction: vi.fn(),
}));

import { CreateResumeForm } from "./CreateResumeForm";
import { ImportResumeForm } from "./ImportResumeForm";

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:cv-preview");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CreateResumeForm", () => {
  it("shows an explicit candidate-provided title field and no demo CV title", () => {
    render(<CreateResumeForm />);

    expect(screen.getByRole("heading", { name: "Tạo CV đầu tiên" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên CV")).toBeRequired();
    expect(screen.getByRole("button", { name: "Tạo CV" })).toBeInTheDocument();
    expect(screen.queryByText("Frontend Developer CV - 2024")).not.toBeInTheDocument();
  });
});

describe("ImportResumeForm", () => {
  it("offers a file input and pasted CV fallback for existing resumes", () => {
    render(<ImportResumeForm />);

    expect(screen.getByRole("heading", { name: "Import CV có sẵn" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên CV")).toBeRequired();
    expect(screen.getByLabelText("File CV")).toHaveAttribute("type", "file");
    expect(screen.getByLabelText("File CV")).toHaveAttribute("accept", expect.stringContaining(".jpg"));
    expect(screen.getByLabelText("File CV")).toHaveAttribute("accept", expect.stringContaining(".png"));
    expect(screen.getByLabelText("Nội dung CV")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import CV" })).toBeInTheDocument();
  });

  it("shows a preview when the candidate selects an image CV", () => {
    render(<ImportResumeForm />);

    const file = new File(["fake image"], "cv-frontend.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("File CV"), { target: { files: [file] } });

    expect(screen.getByLabelText("Ảnh CV đã chọn")).toBeInTheDocument();
    expect(screen.getByText("cv-frontend.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bỏ chọn ảnh" })).toBeInTheDocument();
  });
});
