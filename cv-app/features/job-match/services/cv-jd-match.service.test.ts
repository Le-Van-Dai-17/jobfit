import { describe, expect, it } from "vitest";

import { CvJdMatchService } from "./cv-jd-match.service";

describe("CvJdMatchService", () => {
  it("scores a CV higher when its evidence overlaps the JD skills and keywords", async () => {
    const service = new CvJdMatchService();
    const job = {
      title: "Frontend Engineer",
      description: "Build accessible React applications with tests.",
      requirements: "React, TypeScript, accessibility, automated testing.",
      skills: ["React", "TypeScript", "Testing"],
      experienceLevel: "MID",
    };

    const strong = await service.analyze(
      { summary: "Frontend engineer using React, TypeScript and automated testing for 3 nam." },
      job
    );
    const weak = await service.analyze({ summary: "Sales operations and account management." }, job);

    expect(strong.overallScore).toBeGreaterThan(weak.overallScore);
    expect(strong.skillsMatch).toBeGreaterThanOrEqual(weak.skillsMatch);
    expect(strong.details).toMatchObject({
      algorithm: "deterministic-cv-jd-v1",
      matchedSkills: expect.arrayContaining(["react", "typescript"]),
    });
  });
});
