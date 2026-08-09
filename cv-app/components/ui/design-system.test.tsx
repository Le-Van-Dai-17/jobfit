import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";

describe("downloaded shared UI primitives", () => {
  it("uses the standard shape, token surfaces, and visible focus treatment", () => {
    render(
      <Card aria-label="Thẻ mẫu">
        <Input aria-label="Trường mẫu" />
        <Button>Tiếp tục</Button>
      </Card>
    );
    expect(screen.getByLabelText("Thẻ mẫu")).toHaveClass("rounded-lg", "bg-surface-white", "border-outline-variant");
    expect(screen.getByLabelText("Trường mẫu")).toHaveClass("h-12", "rounded-lg", "bg-surface-low");
    expect(screen.getByRole("button", { name: "Tiếp tục" })).toHaveClass("rounded-lg", "bg-primary");
  });
});
