import { describe, expect, it } from "vitest";

import { filterJobFeed, parseJobFeedFilters } from "./job-feed-filter";

const jobs = [
  { title: "Frontend Intern", company: "KaDa Tech", type: "Hybrid" },
  { title: "Backend Fresher", company: "Northwind", type: "Remote" },
  { title: "DevOps Engineer", company: "KaDa Tech", type: "Onsite" },
];

describe("job feed filters", () => {
  it("normalizes scalar query parameters and rejects unsupported modes", () => {
    expect(parseJobFeedFilters({ q: "  kada ", location: " TP. Hồ Chí Minh ", mode: "REMOTE" })).toEqual({ q: "kada", location: "tp. hồ chí minh", mode: "remote", page: 1, limit: 10 });
    expect(parseJobFeedFilters({ q: ["first", "second"], mode: "other" })).toEqual({ q: "first", location: "", mode: "all", page: 1, limit: 10 });
  });

  it("filters persisted jobs by title/company and work mode", () => {
    const jobs = [
      { title: "Frontend", company: "Kada", type: "hybrid" },
      { title: "Backend", company: "Google", location: "remote" },
      { title: "Fullstack", company: "Kada", location: "onsite" },
    ];
    expect(filterJobFeed(jobs, { q: "kada", location: "", mode: "hybrid", page: 1, limit: 10 })).toEqual([jobs[0]]);
    expect(filterJobFeed(jobs, { q: "", location: "", mode: "all", page: 1, limit: 10 })).toHaveLength(3);
    expect(filterJobFeed(jobs, { q: "", location: "", mode: "remote", page: 1, limit: 10 })).toEqual([jobs[1]]);
    expect(filterJobFeed(jobs, { q: "", location: "onsite", mode: "all", page: 1, limit: 10 })).toEqual([jobs[2]]);
  });
});
