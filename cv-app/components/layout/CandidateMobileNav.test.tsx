import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/jobs/job-1" }));

import { CandidateMobileNav } from "./CandidateMobileNav";

describe("CandidateMobileNav", () => {
  it("renders the same four-item candidate information architecture", () => {
    render(<CandidateMobileNav />);

    const nav = screen.getByRole("navigation", { name: "Điều hướng ứng viên trên di động" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Tổng quan", "/dashboard"],
      ["Hồ sơ & CV", "/my-cv"],
      ["Việc làm", "/jobs"],
      ["Ứng tuyển", "/applications"],
    ]);
    expect(screen.getByRole("link", { name: /Việc làm/ })).toHaveAttribute("aria-current", "page");
  });
});
