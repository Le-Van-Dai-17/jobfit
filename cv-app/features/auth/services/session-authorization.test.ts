import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

import { applySessionPrincipal, clearJwtPrincipal, normalizePrincipal } from "./session-authorization";

describe("session principal normalization", () => {
  it("fails closed when id or role is missing or invalid", () => {
    expect(normalizePrincipal(null)).toBeNull();
    expect(normalizePrincipal({ role: "CANDIDATE" })).toBeNull();
    expect(normalizePrincipal({ id: "user-1" })).toBeNull();
    expect(normalizePrincipal({ id: "user-1", role: "USER" })).toBeNull();
  });

  it("accepts only supported current roles", () => {
    expect(normalizePrincipal({ id: "candidate-1", role: "CANDIDATE" })).toEqual({
      id: "candidate-1",
      role: "CANDIDATE",
    });
    expect(normalizePrincipal({ id: "recruiter-1", role: "RECRUITER" })).toEqual({
      id: "recruiter-1",
      role: "RECRUITER",
    });
  });

  it("clears stale token identity fields before session projection", () => {
    const token = clearJwtPrincipal({
      sub: "deleted-1",
      id: "deleted-1",
      role: "CANDIDATE",
      name: "Deleted User",
      email: "deleted@example.com",
    } as JWT);

    expect(token).not.toHaveProperty("sub");
    expect(token).not.toHaveProperty("role");
    expect(token).not.toHaveProperty("name");
    expect(token).not.toHaveProperty("email");
  });

  it("does not expose name or email as logged in when token principal is invalid", () => {
    const session = {
      user: { id: "stale-1", role: "CANDIDATE", name: "Stale", email: "stale@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as Session;

    expect(applySessionPrincipal(session, {} as JWT).user).toBeUndefined();
  });
});
