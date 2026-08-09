import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Header from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("./SidebarContext", () => ({ useSidebar: () => ({ isOpen: false, toggle: vi.fn() }) }));

describe("Header role actions", () => {
  it("creates a candidate CV through a real form action with downloaded shell styling", () => {
    render(<Header role="CANDIDATE" createResume={vi.fn()} />);
    const action = screen.getByRole("button", { name: /Tạo CV mới/i });
    expect(action.closest("form")).toBeInTheDocument();
    expect(action).toHaveClass("bg-primary", "text-white", "rounded-lg");
    expect(screen.getByRole("banner")).toHaveClass("bg-surface-white/95");
  });

  it("does not expose the candidate CV action to recruiters or admins", () => {
    const { rerender } = render(<Header role="RECRUITER" createResume={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Tạo CV mới/i })).not.toBeInTheDocument();
    rerender(<Header role="ADMIN" createResume={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Tạo CV mới/i })).not.toBeInTheDocument();
  });
});
