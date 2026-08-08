import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const seedSource = readFileSync(resolve(process.cwd(), "prisma/seed.ts"), "utf8");
const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");

describe("database seed safety", () => {
  it("requires an explicit development-only flag before any demo write", () => {
    const gate = seedSource.indexOf('process.env.SEED_DEMO_DATA !== "true"');
    const productionGuard = seedSource.indexOf('process.env.NODE_ENV === "production"');
    const firstWrite = seedSource.indexOf("prisma.user.upsert");

    expect(gate).toBeGreaterThanOrEqual(0);
    expect(productionGuard).toBeGreaterThanOrEqual(0);
    expect(firstWrite).toBeGreaterThan(gate);
    expect(firstWrite).toBeGreaterThan(productionGuard);
  });

  it("does not run demo seeding in the default setup commands", () => {
    const setupStart = readme.indexOf("## Setup");
    const codeStart = readme.indexOf("```bash", setupStart);
    const codeEnd = readme.indexOf("```", codeStart + 7);
    const defaultSetupCommands = readme.slice(codeStart, codeEnd);
    expect(defaultSetupCommands).not.toContain("npm run db:seed");
  });
});
