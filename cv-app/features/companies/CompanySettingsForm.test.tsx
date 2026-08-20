import { render, screen } from "@testing-library/react";
import { useActionState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CompanySettingsForm } from "./CompanySettingsForm";

vi.mock("./actions/onboard-company", () => ({ updateCompanySettingsAction: vi.fn() }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, useActionState: vi.fn() };
});

describe("CompanySettingsForm", () => {
  it("renders persisted industry and company-size settings with full Vietnamese diacritics", () => {
    vi.mocked(useActionState).mockReturnValue([{}, vi.fn(), false]);
    render(<CompanySettingsForm company={{
      name: "Kada",
      slug: "kada",
      website: null,
      description: null,
      location: null,
      industry: "INFORMATION_TECHNOLOGY",
      size: "SIZE_10_49",
    }} />);

    expect(screen.getByRole("heading", { name: "Thông tin cơ bản" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ngành nghề")).toHaveValue("INFORMATION_TECHNOLOGY");
    expect(screen.getByLabelText("Quy mô công ty")).toHaveValue("SIZE_10_49");
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeInTheDocument();
  });
});
