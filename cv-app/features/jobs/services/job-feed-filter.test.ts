import { describe, expect, it } from "vitest";

import { filterJobFeed, parseJobFeedFilters } from "./job-feed-filter";

const jobs = [
  { title: "Frontend Intern", company: "KaDa Tech", type: "Hybrid" },
  { title: "Backend Fresher", company: "Northwind", type: "Remote" },
  { title: "DevOps Engineer", company: "KaDa Tech", type: "Onsite" },
];

describe("job feed filters", () => {
  it("normalizes scalar query parameters and rejects unsupported modes", () => {
    expect(parseJobFeedFilters({ q: "  kada ", mode: "REMOTE" })).toEqual({ q: "kada", mode: "remote" });
    expect(parseJobFeedFilters({ q: ["first", "second"], mode: "other" })).toEqual({ q: "first", mode: "all" });
  });

  it("filters persisted jobs by title/company and work mode", () => {
    expect(filterJobFeed(jobs, { q: "kada", mode: "hybrid" })).toEqual([jobs[0]]);
    expect(filterJobFeed(jobs, { q: "backend", mode: "all" })).toEqual([jobs[1]]);
    expect(filterJobFeed(jobs, { q: "", mode: "remote" })).toEqual([jobs[1]]);
  });
});
