import { describe, expect, it } from "vitest";

import { filterJobFeed, parseJobFeedFilters } from "./job-feed-filter";

const jobs = [
  { title: "Frontend Intern", company: "KaDa Tech", type: "Hybrid" },
  { title: "Backend Fresher", company: "Northwind", type: "Remote" },
  { title: "DevOps Engineer", company: "KaDa Tech", type: "Onsite" },
];

describe("job feed filters", () => {
  it("normalizes scalar query parameters and rejects unsupported modes", () => {
    expect(parseJobFeedFilters({ q: "  kada ", mode: "REMOTE" })).toEqual({ q: "kada", mode: "remote", page: 1, limit: 10 });
    expect(parseJobFeedFilters({ q: ["first", "second"], mode: "other" })).toEqual({ q: "first", mode: "all", page: 1, limit: 10 });
  });

  it("filters persisted jobs by title/company and work mode", () => {
    const jobs = [
      { title: "Frontend", company: "Kada", type: "hybrid" },
      { title: "Backend", company: "Google", location: "remote" },
      { title: "Fullstack", company: "Kada", location: "onsite" },
    ];
    expect(filterJobFeed(jobs, { q: "kada", mode: "hybrid", page: 1, limit: 10 })).toEqual([jobs[0]]);
    expect(filterJobFeed(jobs, { q: "", mode: "all", page: 1, limit: 10 })).toHaveLength(3);
    expect(filterJobFeed(jobs, { q: "", mode: "remote", page: 1, limit: 10 })).toEqual([jobs[1]]);
  });
});
