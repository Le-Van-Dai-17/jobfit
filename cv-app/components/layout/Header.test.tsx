import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Header from "./Header";

vi.mock("./SidebarContext", () => ({
  useSidebar: () => ({ isOpen: false, toggle: vi.fn() }),
}));

describe("Header role actions", () => {
  it("creates a candidate CV through a form action with the approved neutral styling", () => {
    render(<Header role="CANDIDATE" createResume={vi.fn()} />);

    const action = screen.getByRole("button", { name: /Tao CV moi/i });
    expect(action.closest("form")).toBeInTheDocument();
    expect(action).toHaveClass("bg-slate-100", "text-slate-900", "font-bold");
  });

  it("does not expose the candidate CV action to recruiters or admins", () => {
    const { rerender } = render(<Header role="RECRUITER" createResume={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Tao CV moi/i })).not.toBeInTheDocument();

    rerender(<Header role="ADMIN" createResume={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Tao CV moi/i })).not.toBeInTheDocument();
  });
});
