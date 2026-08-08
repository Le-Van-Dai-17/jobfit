import { beforeEach, describe, expect, it } from "vitest";

import { useCvStore } from "./useCvStore";

describe("useCvStore legacy hydration", () => {
  beforeEach(() => {
    useCvStore.setState({
      cvData: {
        personalInfo: {
          fullName: "",
          title: "",
          email: "",
          phone: "",
          location: "",
          summary: "",
        },
        experiences: [],
        educations: [],
        skills: [],
      },
      isDirty: false,
    });
  });

  it("normalizes legacy education and missing array fields when hydrating", () => {
    useCvStore.getState().setCvData({
      personalInfo: {
        fullName: "Legacy User",
        title: "Frontend Developer",
        email: "legacy@example.com",
      },
      experiences: [],
      education: [
        {
          id: "edu-1",
          institution: "HCMUT",
          degree: "Bachelor",
        },
      ],
    } as never);

    expect(useCvStore.getState().cvData.educations).toHaveLength(1);
    expect(useCvStore.getState().cvData.skills).toEqual([]);
    expect(useCvStore.getState().isDirty).toBe(false);
  });
});
