import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Header from "./Header";

vi.mock("./SidebarContext", () => ({
  useSidebar: () => ({ toggle: vi.fn() }),
}));

describe("Header role actions", () => {
  it("preserves the candidate CV action with the approved neutral styling", () => {
    render(<Header role="CANDIDATE" />);

    const action = screen.getByRole("link", { name: /Tạo CV mới/i });
    expect(action).toHaveAttribute("href", "/my-cv");
    expect(action).toHaveClass("bg-slate-100", "text-slate-900", "font-bold");
  });

  it("does not expose the candidate CV action to recruiters or admins", () => {
    const { rerender } = render(<Header role="RECRUITER" />);
    expect(screen.queryByRole("link", { name: /Tạo CV mới/i })).not.toBeInTheDocument();

    rerender(<Header role="ADMIN" />);
    expect(screen.queryByRole("link", { name: /Tạo CV mới/i })).not.toBeInTheDocument();
  });
});
