import { describe, expect, it } from "vitest";

import { getNavItemsForRole } from "./navigation";

describe("role-aware navigation", () => {
  it("shows only the simplified candidate information architecture", () => {
    expect(getNavItemsForRole("CANDIDATE").map((item) => [item.name, item.href])).toEqual([
      ["Tổng quan", "/dashboard"],
      ["Hồ sơ & CV", "/my-cv"],
      ["Việc làm", "/jobs"],
      ["Ứng tuyển", "/applications"],
    ]);
  });

  it("shows only the approved recruiter information architecture", () => {
    expect(getNavItemsForRole("RECRUITER").map((item) => [item.name, item.href])).toEqual([
      ["Tổng quan", "/recruiter"],
      ["Vị trí tuyển dụng", "/recruiter/jobs"],
      ["Ứng viên", "/recruiter/candidates"],
      ["Bảng xếp hạng", "/recruiter/leaderboard"],
      ["Đánh giá", "/recruiter/assessments"],
      ["Công ty", "/recruiter/company"],
    ]);
  });

  it("does not expose standalone AI tools or legacy tracker as candidate sidebar items", () => {
    const hrefs = getNavItemsForRole("CANDIDATE").map((item) => item.href);

    expect(hrefs).not.toContain("/job-match");
    expect(hrefs).not.toContain("/job-optimization");
    expect(hrefs).not.toContain("/interview");
    expect(hrefs).not.toContain("/assessments");
    expect(hrefs).not.toContain("/tracker");
  });

  it("fails closed instead of showing candidate navigation when role is missing", () => {
    expect(getNavItemsForRole(undefined)).toEqual([]);
  });
});
