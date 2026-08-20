import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginClient from "./LoginClient";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const signInMock = vi.mocked(signIn);

describe("LoginClient", () => {
  beforeEach(() => {
    signInMock.mockReset();
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });
  });

  it("renders the downloaded public-auth hierarchy with a semantic form", () => {
    render(<LoginClient />);
    expect(screen.getByRole("banner")).toHaveTextContent("Jobfit");
    expect(screen.getByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByText("Chào mừng bạn quay lại với Jobfit")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Nền tảng tuyển dụng chuyên nghiệp");
    expect(screen.getByRole("button", { name: "Đăng nhập" }).closest("form")).toBeInTheDocument();
    expect(screen.queryByText(/Demo lỗi đăng nhập/i)).not.toBeInTheDocument();
  });

  it("toggles password visibility with an accessible button", () => {
    render(<LoginClient />);
    const password = screen.getByLabelText("Mật khẩu");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("disables login while pending and shows a generic failure", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin", ok: false, status: 401, url: null, code: "credentials" });
    render(<LoginClient />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Không thể đăng nhập"));
  });
});
