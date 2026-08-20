import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecruiterMobileNav } from "./RecruiterMobileNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/recruiter/candidates" }));

describe("RecruiterMobileNav", () => {
  it("keeps the active recruiter destinations accessible on mobile", () => {
    render(<RecruiterMobileNav />);
    expect(screen.getByRole("navigation", { name: "Điều hướng nhà tuyển dụng" })).toBeInTheDocument();
    for (const name of ["Tổng quan", "Vị trí", "Ứng viên", "Công ty"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Đánh giá" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ứng viên" })).toHaveAttribute("aria-current", "page");
  });
});
