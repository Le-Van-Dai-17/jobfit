import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecruiterMobileNav } from "./RecruiterMobileNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/recruiter/assessments" }));

describe("RecruiterMobileNav", () => {
  it("keeps all five recruiter destinations accessible on mobile", () => {
    render(<RecruiterMobileNav />);
    expect(screen.getByRole("navigation", { name: "Điều hướng nhà tuyển dụng" })).toBeInTheDocument();
    for (const name of ["Tổng quan", "Vị trí", "Ứng viên", "Đánh giá", "Công ty"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Đánh giá" })).toHaveAttribute("aria-current", "page");
  });
});
