import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const actionModulePath = resolve(process.cwd(), "features/assessments/actions/assessment.actions.ts");

describe("assessment server action module boundary", () => {
  it("exports no runtime values other than async server actions", () => {
    const source = readFileSync(actionModulePath, "utf8");
    const invalidRuntimeExports = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^export\s+(?:const|let|var|class|function)\b/.test(line));

    expect(invalidRuntimeExports).toEqual([]);
  });
});
