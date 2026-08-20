import { describe, expect, it } from "vitest";

import { formatJobPostedLabel } from "./job-posted-label";

describe("formatJobPostedLabel", () => {
  const now = new Date("2026-08-20T09:00:00.000Z");

  it("uses a fresh label for jobs posted in the last few minutes", () => {
    expect(formatJobPostedLabel(new Date("2026-08-20T08:57:00.000Z"), now)).toBe("Vừa đăng");
  });

  it("uses minute and hour relative labels for recent jobs", () => {
    expect(formatJobPostedLabel(new Date("2026-08-20T08:35:00.000Z"), now)).toBe("25 phút trước");
    expect(formatJobPostedLabel(new Date("2026-08-20T06:00:00.000Z"), now)).toBe("3 giờ trước");
  });

  it("uses day relative labels for jobs posted within a week", () => {
    expect(formatJobPostedLabel(new Date("2026-08-18T09:00:00.000Z"), now)).toBe("2 ngày trước");
  });

  it("falls back to a concrete posting date for older jobs", () => {
    expect(formatJobPostedLabel(new Date("2026-08-01T09:00:00.000Z"), now)).toBe("Đăng 01/08/2026");
  });
});
