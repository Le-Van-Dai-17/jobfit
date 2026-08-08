import { describe, expect, it } from "vitest";

import { CvSchema, PersonalInfoSchema } from "./cv.schema";

const validCv = {
  personalInfo: {
    fullName: "Nguyen Van A",
    title: "Frontend Engineer",
    email: "a@example.com",
    phone: "",
    location: "Ho Chi Minh City",
    summary: "Builds accessible React applications.",
  },
  experiences: [
    {
      id: "exp-1",
      company: "Kada Labs",
      role: "Frontend Engineer",
      startDate: "2024-01",
      endDate: "",
      isCurrent: true,
      description: "Delivered production UI.",
    },
  ],
  educations: [
    {
      id: "edu-1",
      institution: "HCMUT",
      degree: "Bachelor",
      field: "Computer Science",
      startDate: "2019",
      endDate: "2023",
      description: "",
    },
  ],
  skills: [
    {
      id: "skill-1",
      name: "TypeScript",
      level: 5,
    },
  ],
};

describe("CV schemas", () => {
  it("accepts a complete deterministic CV payload", () => {
    expect(CvSchema.safeParse(validCv).success).toBe(true);
  });

  it("allows an empty optional phone value from the editor form", () => {
    const result = PersonalInfoSchema.safeParse({
      fullName: "Nguyen Van A",
      title: "Frontend Engineer",
      email: "a@example.com",
      phone: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid advisory input before persistence or AI use", () => {
    const result = CvSchema.safeParse({
      ...validCv,
      personalInfo: {
        ...validCv.personalInfo,
        email: "not-an-email",
      },
      skills: [{ id: "skill-2", name: "", level: 6 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("personalInfo.email");
      expect(paths).toContain("skills.0.name");
      expect(paths).toContain("skills.0.level");
    }
  });
});
