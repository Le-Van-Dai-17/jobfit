import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import RegisterClient from "./RegisterClient";

vi.mock("./actions/register", () => ({
  registerAction: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("RegisterClient", () => {
  it("renders role choice cards and lets recruiters be selected", () => {
    render(<RegisterClient />);

    const candidate = screen.getByDisplayValue("CANDIDATE");
    const recruiter = screen.getByDisplayValue("RECRUITER");

    expect(candidate).toBeChecked();
    fireEvent.click(recruiter);
    expect(recruiter).toBeChecked();
  });

  it("toggles both password fields accessibly", () => {
    render(<RegisterClient />);

    const password = screen.getByLabelText("Mật khẩu");
    const confirmation = screen.getByLabelText("Xác nhận mật khẩu");

    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    fireEvent.click(screen.getByRole("button", { name: "Hiện xác nhận mật khẩu" }));

    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "text");
  });
});
