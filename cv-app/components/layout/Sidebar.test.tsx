import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/recruiter" }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("./SidebarContext", () => ({ useSidebar: () => ({ isOpen: false, setIsOpen: vi.fn() }) }));

import Sidebar from "./Sidebar";

describe("Sidebar recruiter context", () => {
  it("shows the authenticated recruiter's persisted company name", () => {
    render(<Sidebar user={{ name: "Mai", role: "RECRUITER" }} companyName="Công ty KADA" />);

    expect(screen.getByText("Công ty KADA")).toBeInTheDocument();
  });
});
