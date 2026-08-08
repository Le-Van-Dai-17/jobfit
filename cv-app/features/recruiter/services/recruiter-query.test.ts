import { describe, expect, it } from "vitest";

import { parseApplicationStatusFilter } from "./recruiter-query";

describe("parseApplicationStatusFilter", () => {
  it("returns a valid application status filter", () => {
    expect(parseApplicationStatusFilter("INTERVIEWING")).toBe("INTERVIEWING");
  });

  it("safely drops invalid or repeated status values", () => {
    expect(parseApplicationStatusFilter("NOT_A_STATUS")).toBeUndefined();
    expect(parseApplicationStatusFilter(["APPLIED", "OFFER"])).toBeUndefined();
    expect(parseApplicationStatusFilter(undefined)).toBeUndefined();
  });
});
