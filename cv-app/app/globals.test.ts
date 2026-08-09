import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const rootLayout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");

describe("downloaded global Tailwind theme tokens", () => {
  it.each([
    ["primary", "--primary: #003fb1"],
    ["primary container", "--primary-container: #1a56db"],
    ["success", "--success: #059669"],
    ["surface", "--background: #f8f9ff"],
    ["foreground", "--foreground: #121c28"],
    ["muted text", "--text-muted: #434654"],
    ["outline", "--outline: #737686"],
    ["outline variant", "--outline-variant: #c3c5d7"],
    ["surface white", "--color-surface-white: var(--surface-white)"],
    ["surface high", "--color-surface-container-high: var(--surface-container-high)"],
    ["error", "--color-error: var(--error)"],
  ])("exposes the %s token to Tailwind utilities", (_name, declaration) => {
    expect(globalsCss).toContain(declaration);
  });

  it("uses Be Vietnam Pro without overriding next/font or retaining legacy purple tokens", () => {
    expect(globalsCss).toContain("--font-sans: var(--font-be-vietnam-pro)");
    expect(globalsCss).not.toContain('--font-be-vietnam-pro: "Be Vietnam Pro"');
    expect(globalsCss).not.toMatch(/#4648d4|#6b38d4|--font-inter/);
  });

  it("does not wrap the public auth shell in a second main landmark", () => {
    expect(rootLayout).not.toContain('<main className="min-h-screen w-full">{children}</main>');
  });
});
