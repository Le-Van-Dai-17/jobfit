import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("global Tailwind theme tokens", () => {
  it.each([
    ["primary", "--color-primary: var(--primary)"],
    ["surface white", "--color-surface-white: var(--surface-white)"],
    ["surface high", "--color-surface-container-high: var(--surface-container-high)"],
    ["foreground", "--color-foreground: var(--foreground)"],
    ["muted text", "--color-text-muted: var(--text-muted)"],
    ["light border", "--color-border-light: var(--border-light)"],
    ["error", "--color-error: var(--error)"],
  ])("exposes the %s token to Tailwind utilities", (_name, declaration) => {
    expect(globalsCss).toContain(declaration);
  });
});
