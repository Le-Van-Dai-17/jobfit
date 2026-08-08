-- Recruiter vertical slice ownership and reporting links.
-- Run every data preflight before the first schema-changing statement. Prisma
-- executes a migration transactionally on PostgreSQL, but keeping preflights
-- first also makes manual execution fail before any partial DDL.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Application"
    GROUP BY "userId", "jobId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot create Application_userId_jobId_key: duplicate Application(userId, jobId) rows exist. Resolve duplicates manually before rerunning; this migration does not delete data.';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "ResumeVersion"
    GROUP BY "resumeId", "version"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot create ResumeVersion_resumeId_version_key: duplicate ResumeVersion(resumeId, version) rows exist. Resolve duplicates manually before rerunning; this migration does not delete data.';
  END IF;
END
$$;

ALTER TABLE "Job" ADD COLUMN "companyId" TEXT;
ALTER TABLE "AssessmentSession" ADD COLUMN "applicationId" TEXT;
ALTER TABLE "ApplicationEvent" ADD COLUMN "actorUserId" TEXT;
ALTER TABLE "ApplicationEvent" ADD COLUMN "fromStatus" "ApplicationStatus";
ALTER TABLE "ApplicationEvent" ADD COLUMN "toStatus" "ApplicationStatus";

CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE INDEX "AssessmentSession_applicationId_idx" ON "AssessmentSession"("applicationId");
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "Application"("userId", "jobId");
CREATE UNIQUE INDEX "ResumeVersion_resumeId_version_key" ON "ResumeVersion"("resumeId", "version");
CREATE INDEX "ApplicationEvent_actorUserId_idx" ON "ApplicationEvent"("actorUserId");
CREATE INDEX "ApplicationEvent_fromStatus_toStatus_idx" ON "ApplicationEvent"("fromStatus", "toStatus");

ALTER TABLE "Job"
  ADD CONSTRAINT "Job_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssessmentSession"
  ADD CONSTRAINT "AssessmentSession_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssessmentSubmission"
  ADD CONSTRAINT "AssessmentSubmission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssessmentResult"
  ADD CONSTRAINT "AssessmentResult_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Lock and re-check the referenced job and resume immediately before every
-- Application write. This closes check-then-insert races for every writer.
CREATE OR REPLACE FUNCTION "enforce_application_eligibility"()
RETURNS TRIGGER AS $function$
BEGIN
  PERFORM 1
  FROM "Job" AS job
  WHERE job."id" = NEW."jobId"
    AND job."isArchived" = false
  FOR SHARE OF job;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application job must exist and remain open'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1
  FROM "ResumeVersion" AS version
  INNER JOIN "Resume" AS resume ON resume."id" = version."resumeId"
  WHERE version."id" = NEW."resumeVersionId"
    AND resume."userId" = NEW."userId"
    AND resume."deletedAt" IS NULL
  FOR SHARE OF version, resume;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application resumeVersionId must belong to an active Resume owned by userId'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER "Application_eligibility_trigger"
BEFORE INSERT OR UPDATE OF "userId", "jobId", "resumeVersionId" ON "Application"
FOR EACH ROW
EXECUTE FUNCTION "enforce_application_eligibility"();

-- A linked assessment must reference the same active application, candidate,
-- job, and selected resume version carried by the assessment session.
CREATE OR REPLACE FUNCTION "enforce_assessment_session_application_consistency"()
RETURNS TRIGGER AS $function$
BEGIN
  IF NEW."applicationId" IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM "Application" AS application
    WHERE application."id" = NEW."applicationId"
      AND application."userId" = NEW."userId"
      AND application."jobId" = NEW."jobId"
      AND application."resumeVersionId" = NEW."resumeVersionId"
      AND application."deletedAt" IS NULL
  ) THEN
    RAISE EXCEPTION 'AssessmentSession applicationId must reference an active Application with the same userId, jobId, and resumeVersionId'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER "AssessmentSession_application_consistency_trigger"
BEFORE INSERT OR UPDATE ON "AssessmentSession"
FOR EACH ROW
EXECUTE FUNCTION "enforce_assessment_session_application_consistency"();

-- A submission must belong to its session owner and its task must be from that
-- same session. This closes cross-session/cross-user writes below the app layer.
CREATE OR REPLACE FUNCTION "enforce_assessment_submission_consistency"()
RETURNS TRIGGER AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "AssessmentSession" AS session
    INNER JOIN "AssessmentTask" AS task
      ON task."id" = NEW."taskId"
    WHERE session."id" = NEW."sessionId"
      AND session."userId" = NEW."userId"
      AND task."sessionId" = NEW."sessionId"
  ) THEN
    RAISE EXCEPTION 'AssessmentSubmission must use the session owner and a task from the same session'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER "AssessmentSubmission_consistency_trigger"
BEFORE INSERT OR UPDATE ON "AssessmentSubmission"
FOR EACH ROW
EXECUTE FUNCTION "enforce_assessment_submission_consistency"();

-- A result must carry the same user as the assessment session it summarizes.
CREATE OR REPLACE FUNCTION "enforce_assessment_result_consistency"()
RETURNS TRIGGER AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "AssessmentSession" AS session
    WHERE session."id" = NEW."sessionId"
      AND session."userId" = NEW."userId"
  ) THEN
    RAISE EXCEPTION 'AssessmentResult userId must match its AssessmentSession userId'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER "AssessmentResult_consistency_trigger"
BEFORE INSERT OR UPDATE ON "AssessmentResult"
FOR EACH ROW
EXECUTE FUNCTION "enforce_assessment_result_consistency"();
