import { describe, expect, it } from "vitest";

import { getDashboardPathForRole, getRequiredRoleRedirect, getRouteDecision } from "./role-redirects";

describe("role redirects and guards", () => {
  it("maps each role to a deterministic dashboard", () => {
    expect(getDashboardPathForRole("CANDIDATE")).toBe("/dashboard");
    expect(getDashboardPathForRole("RECRUITER")).toBe("/recruiter");
    expect(getDashboardPathForRole("ADMIN")).toBe("/admin");
  });

  it("keeps login and register public but redirects authenticated users to their role dashboard", () => {
    expect(getRouteDecision({ pathname: "/register", user: null })).toEqual({ allow: true });
    expect(getRouteDecision({ pathname: "/login", user: { id: "recruiter-1", role: "RECRUITER" } })).toEqual({
      redirectTo: "/recruiter",
    });
  });

  it("denies role-specific dashboards to the wrong role", () => {
    expect(getRouteDecision({ pathname: "/recruiter/jobs", user: { id: "candidate-1", role: "CANDIDATE" } })).toEqual({
      redirectTo: "/dashboard",
    });
    expect(getRouteDecision({ pathname: "/jobs", user: { id: "recruiter-1", role: "RECRUITER" } })).toEqual({ allow: true });
    expect(getRouteDecision({ pathname: "/profile", user: { id: "recruiter-1", role: "RECRUITER" } })).toEqual({
      redirectTo: "/recruiter",
    });
    expect(getRouteDecision({ pathname: "/admin", user: { id: "recruiter-1", role: "RECRUITER" } })).toEqual({
      redirectTo: "/recruiter",
    });
  });

  it("allows recruiter and admin dashboards without redirect loops", () => {
    expect(getRouteDecision({ pathname: "/recruiter", user: { id: "recruiter-1", role: "RECRUITER" } })).toEqual({
      allow: true,
    });
    expect(getRouteDecision({ pathname: "/admin", user: { id: "admin-1", role: "ADMIN" } })).toEqual({
      allow: true,
    });
  });

  it("gives page-level guards the same unauthenticated and wrong-role destinations", () => {
    expect(getRequiredRoleRedirect({ user: null, requiredRole: "RECRUITER" })).toBe("/login");
    expect(
      getRequiredRoleRedirect({
        user: { id: "candidate-1", role: "CANDIDATE" },
        requiredRole: "RECRUITER",
      })
    ).toBe("/dashboard");
    expect(
      getRequiredRoleRedirect({
        user: { id: "recruiter-1", role: "RECRUITER" },
        requiredRole: "RECRUITER",
      })
    ).toBeNull();
  });
});
