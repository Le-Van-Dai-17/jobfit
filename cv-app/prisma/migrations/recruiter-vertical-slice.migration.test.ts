import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "prisma/migrations/20260809020000_recruiter_vertical_slice/migration.sql"
);
const migrationSql = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");

describe("20260809020000 recruiter vertical slice migration", () => {
  it.each([
    {
      table: "Application",
      columns: '"userId", "jobId"',
      index: "Application_userId_jobId_key",
      message: "duplicate Application(userId, jobId)",
    },
    {
      table: "ResumeVersion",
      columns: '"resumeId", "version"',
      index: "ResumeVersion_resumeId_version_key",
      message: "duplicate ResumeVersion(resumeId, version)",
    },
  ])("fails fast on $table duplicates before creating its unique index", ({ table, columns, index, message }) => {
    const duplicateCheck = `FROM \"${table}\"\n    GROUP BY ${columns}\n    HAVING COUNT(*) > 1`;
    const checkPosition = migrationSql.indexOf(duplicateCheck);
    const blockStart = migrationSql.lastIndexOf("DO $$", checkPosition);
    const blockEnd = migrationSql.indexOf("$$;", checkPosition);
    const indexPosition = migrationSql.indexOf(`CREATE UNIQUE INDEX \"${index}\"`);
    const preflightBlock = migrationSql.slice(blockStart, blockEnd);

    expect(checkPosition).toBeGreaterThanOrEqual(0);
    expect(blockStart).toBeGreaterThanOrEqual(0);
    expect(blockEnd).toBeGreaterThan(checkPosition);
    expect(indexPosition).toBeGreaterThan(blockEnd);
    expect(preflightBlock).toContain("IF EXISTS");
    expect(preflightBlock).toContain(`RAISE EXCEPTION 'Cannot create ${index}: ${message}`);
  });

  it("finishes both duplicate preflights before the first schema-changing DDL", () => {
    const firstDdl = migrationSql.search(/(?:ALTER TABLE|CREATE(?: UNIQUE)? INDEX|CREATE OR REPLACE FUNCTION|CREATE TRIGGER)/);
    const applicationCheck = migrationSql.indexOf('FROM "Application"');
    const resumeCheck = migrationSql.indexOf('FROM "ResumeVersion"');
    const applicationBlockEnd = migrationSql.indexOf("$$;", applicationCheck);
    const resumeBlockEnd = migrationSql.indexOf("$$;", resumeCheck);

    expect(firstDdl).toBeGreaterThanOrEqual(0);
    expect(applicationCheck).toBeGreaterThanOrEqual(0);
    expect(resumeCheck).toBeGreaterThanOrEqual(0);
    expect(applicationBlockEnd).toBeLessThan(firstDdl);
    expect(resumeBlockEnd).toBeLessThan(firstDdl);
  });

  it("does not silently delete or deduplicate rows before adding unique indexes", () => {
    expect(migrationSql).not.toMatch(/DELETE\s+FROM\s+\"(?:Application|ResumeVersion)\"/i);
  });

  it("enforces active job and candidate-owned active CV when an application row is written", () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION "enforce_application_eligibility"()');
    expect(migrationSql).toContain('job."isArchived" = false');
    expect(migrationSql).toContain('resume."userId" = NEW."userId"');
    expect(migrationSql).toContain('resume."deletedAt" IS NULL');
    expect(migrationSql).toContain('FOR SHARE OF job');
    expect(migrationSql).toContain('FOR SHARE OF version, resume');
    expect(migrationSql).toContain('CREATE TRIGGER "Application_eligibility_trigger"');
    expect(migrationSql).toContain('BEFORE INSERT OR UPDATE OF "userId", "jobId", "resumeVersionId" ON "Application"');
  });

  it("enforces application ownership, selected job/CV version, and active state for assessment sessions", () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION "enforce_assessment_session_application_consistency"()');
    expect(migrationSql).toContain('application."id" = NEW."applicationId"');
    expect(migrationSql).toContain('application."userId" = NEW."userId"');
    expect(migrationSql).toContain('application."jobId" = NEW."jobId"');
    expect(migrationSql).toContain('application."resumeVersionId" = NEW."resumeVersionId"');
    expect(migrationSql).toContain('application."deletedAt" IS NULL');
    expect(migrationSql).toContain('CREATE TRIGGER "AssessmentSession_application_consistency_trigger"');
    expect(migrationSql).toContain('BEFORE INSERT OR UPDATE ON "AssessmentSession"');
  });

  it("enforces submission user/session ownership and task/session consistency", () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION "enforce_assessment_submission_consistency"()');
    expect(migrationSql).toContain('session."userId" = NEW."userId"');
    expect(migrationSql).toContain('task."sessionId" = NEW."sessionId"');
    expect(migrationSql).toContain('CREATE TRIGGER "AssessmentSubmission_consistency_trigger"');
    expect(migrationSql).toContain('BEFORE INSERT OR UPDATE ON "AssessmentSubmission"');
  });

  it("enforces result user/session ownership", () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION "enforce_assessment_result_consistency"()');
    expect(migrationSql).toContain('CREATE TRIGGER "AssessmentResult_consistency_trigger"');
    expect(migrationSql).toContain('BEFORE INSERT OR UPDATE ON "AssessmentResult"');
  });
});
