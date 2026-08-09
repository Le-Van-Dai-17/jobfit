import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/recruiter" }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("./SidebarContext", () => ({ useSidebar: () => ({ isOpen: false, setIsOpen: vi.fn() }) }));

import Sidebar from "./Sidebar";

describe("Sidebar recruiter context", () => {
  it("shows persisted context and the downloaded active navigation treatment", () => {
    render(<Sidebar user={{ name: "Mai", role: "RECRUITER" }} companyName="Công ty KADA" />);
    expect(screen.getByText("Công ty KADA")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tổng quan/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Tổng quan/ })).toHaveClass("bg-primary-fixed", "text-primary");
    expect(screen.getByText("CV_KADA")).toBeInTheDocument();
  });
});
