import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import RegisterClient from "./RegisterClient";

vi.mock("./actions/register", () => ({ registerAction: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("RegisterClient", () => {
  it("renders the downloaded registration hierarchy and guidance", () => {
    render(<RegisterClient />);
    expect(screen.getByRole("banner")).toHaveTextContent("Jobfit");
    expect(screen.getByRole("heading", { name: "Tạo tài khoản mới" })).toBeInTheDocument();
    expect(screen.getByText("Bắt đầu hành trình nghề nghiệp của bạn cùng Jobfit.")).toBeInTheDocument();
    expect(screen.getByText(/Mật khẩu phải có ít nhất 12 ký tự/)).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng ký tài khoản" }).closest("form")?.parentElement).toHaveClass("max-sm:bg-transparent", "max-sm:shadow-none");
  });

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
