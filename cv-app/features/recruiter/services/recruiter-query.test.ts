import { describe, expect, it } from "vitest";

import { parseRecruiterApplicationFilters, parseApplicationStatusFilter, parseRecruiterJobFilters } from "./recruiter-query";

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

describe("parseRecruiterJobFilters", () => {
  it("trims search text and accepts only valid JD lifecycle statuses", () => {
    expect(parseRecruiterJobFilters({ q: " Frontend ", status: "PUBLISHED" })).toEqual({
      search: "Frontend",
      status: "PUBLISHED",
    });
    expect(parseRecruiterJobFilters({ q: ["Frontend"], status: "UNKNOWN" })).toEqual({
      search: undefined,
      status: undefined,
    });
  });
});

describe("parseRecruiterApplicationFilters", () => {
  it("returns persisted candidate pipeline filters from query params", () => {
    expect(parseRecruiterApplicationFilters({
      q: " Nguyen ",
      status: "APPLIED",
      jobId: "job-a",
      sort: "oldest",
    })).toEqual({
      search: "Nguyen",
      status: "APPLIED",
      jobId: "job-a",
      sort: "oldest",
    });
  });

  it("drops unsupported candidate filters", () => {
    expect(parseRecruiterApplicationFilters({
      q: ["Nguyen"],
      status: "UNKNOWN",
      jobId: "",
      sort: "score",
    })).toEqual({
      search: undefined,
      status: undefined,
      jobId: undefined,
      sort: "recent",
    });
  });
});
