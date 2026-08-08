import { describe, expect, it } from "vitest";

import authConfig from "./auth.config";

function requestFor(pathname: string) {
  return { nextUrl: new URL(`https://example.com${pathname}`) } as Parameters<
    NonNullable<typeof authConfig.callbacks>["authorized"]
  >[0]["request"];
}

async function authorized(pathname: string, user: unknown) {
  const callback = authConfig.callbacks?.authorized;
  if (!callback) throw new Error("authorized callback missing");
  return callback({ auth: user ? ({ user } as never) : null, request: requestFor(pathname) });
}

describe("auth route authorization callback", () => {
  it("fails closed for missing id or missing/invalid role", async () => {
    await expect(authorized("/dashboard", { role: "CANDIDATE" })).resolves.toBe(false);
    await expect(authorized("/dashboard", { id: "user-1" })).resolves.toBe(false);
    await expect(authorized("/dashboard", { id: "user-1", role: "USER" })).resolves.toBe(false);
  });

  it("allows recruiter and admin dashboards without redirect loops", async () => {
    await expect(authorized("/recruiter", { id: "recruiter-1", role: "RECRUITER" })).resolves.toBe(true);
    await expect(authorized("/admin", { id: "admin-1", role: "ADMIN" })).resolves.toBe(true);
  });
});
