# Jobfit

Jobfit is a Next.js recruiting MVP for Vietnamese IT candidates and employers. The product loop is:

```text
CV -> realistic engineering tasks -> evidence-based assessment results for employers
```

The current app includes supporting CV, jobs, matching, optimization, tracker, and interview flows. Some flows are implemented against Prisma/Auth.js/AI routes; others still contain demo state. The assessment vertical slice now connects saved CV versions and active jobs to deterministic engineering tasks, submissions, and advisory evidence-based reports.

## Stack

| Technology | Version / Role |
| --- | --- |
| Next.js | 16.2.12 App Router |
| React | 19.2.4 |
| TypeScript | Strict app code |
| Tailwind CSS | v4 styling |
| Prisma | PostgreSQL data model and repositories |
| Auth.js | Authentication |
| Gemini | Live AI provider for existing AI routes |
| Vitest | Unit tests |

## Setup

```bash
cd cv-app
npm ci
cp .env.example .env
npm run db:generate
npx prisma migrate deploy
npm run dev
```

Use npm only. Do not add another lockfile.

Registered database users are the only credentials-provider identities. Real persistence requires PostgreSQL connection strings in `.env`. Live AI features require `GEMINI_API_KEY`; leave it empty for local/CI paths that should not call external AI.

### Optional local demo data

The default setup never inserts sample candidates, CVs, or jobs. To opt in on a disposable **non-production** database only:

```bash
SEED_DEMO_DATA=true npm run db:seed
```

The seed refuses to run when `NODE_ENV=production`. Never enable it against recruitment data used for real applications or assessments.

### Database migrations

Migration history currently has four ordered steps:

1. `20260808000000_baseline` creates the pre-assessment core schema.
2. `20260809000000_add_assessments` adds the assessment domain.
3. `20260809010000_registration_rbac_company_foundation` adds credential hashes, migrates the historical `USER` role to `CANDIDATE`, and adds companies/memberships.
4. `20260809020000_recruiter_vertical_slice` adds recruiter ownership links, uniqueness constraints, and PostgreSQL assessment-consistency triggers.

The last two migrations (`20260809010000` and `20260809020000`) are **unreleased and pending**: they have not been deployed to the user database. Review and deploy them together in order; do not mark either as applied manually and do not use `prisma db push`.

Before deployment, take a restorable PostgreSQL backup and run these read-only duplicate preflight queries against the target database:

```sql
SELECT "userId", "jobId", COUNT(*) AS duplicate_count
FROM "Application"
GROUP BY "userId", "jobId"
HAVING COUNT(*) > 1;

SELECT "resumeId", "version", COUNT(*) AS duplicate_count
FROM "ResumeVersion"
GROUP BY "resumeId", "version"
HAVING COUNT(*) > 1;
```

Both queries must return zero rows. If either returns rows, stop and resolve each duplicate explicitly according to product/data-owner intent, take a fresh backup, and rerun the queries. Migration `20260809020000` repeats these checks in PostgreSQL `DO` blocks and raises a clear exception before each unique index; it never deduplicates, renumbers, or deletes data automatically.

Recommended production procedure:

1. Enter a maintenance window or otherwise stop concurrent application/application-version writes.
2. Record `npx prisma migrate status` and create/test a restorable backup (for example, a provider snapshot plus `pg_dump`).
3. Run the two preflight queries above on the exact target database; stop on any row.
4. Restore the backup into a staging database and run `npx prisma migrate deploy` there first, followed by the application smoke tests.
5. On the production database, run `npx prisma migrate deploy` once. Do not run migrations individually, edit `_prisma_migrations`, or use `migrate resolve --applied` for these pending migrations.
6. Verify with `npx prisma migrate status`, application health checks, and a focused registration/recruiter/assessment smoke. Retain the backup until verification is complete.

A new empty database can run the complete history with `npx prisma migrate deploy`.

For an existing database previously created with `prisma db push`, **do not deploy the core baseline blindly**. Back up the database, then compare its schema with the pre-assessment schema represented by commit `4830063`. Only after confirming that the existing core tables, columns, indexes, constraints, and enums are equivalent, record the core baseline as already applied; then run the duplicate preflight and staged deployment procedure above:

```bash
npx prisma migrate resolve --applied 20260808000000_baseline
npx prisma migrate deploy
npx prisma migrate status
```

`migrate resolve --applied` only updates Prisma migration history; it does not validate or repair the existing schema. If the core schema differs, create and review a reconciliation migration before marking the baseline as applied. Never resolve the two unreleased pending migrations as applied without actually executing their SQL.

## Verification

Run these from `cv-app/` before committing milestone work:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
git diff --check
```

`npm run check` runs lint, typecheck, unit tests, and build.

## Current Status

Implemented:

- Next.js App Router shell and Vietnamese UI routes.
- Auth.js route and protected routes.
- Prisma schema for users, resumes, jobs, applications, interviews, AI runs, and file assets.
- Resume/job repositories and services.
- CV save action and application/AI route handlers.
- Assessment sessions tied to user-owned CV versions and active jobs, with rubric tasks, submission evaluation, and employer-safe advisory reports.
- Baseline lint, typecheck, unit test, and build scripts.

Partial or mock:

- Dashboard, jobs, tracker, interview, and profile screens still include demo/client state.
- Dedicated manual JD creation/import and employer company report sharing are not implemented yet.
- Gemini-backed routes require credentials for live calls and do not yet provide a CI-safe provider adapter for every path.
- AI result validation/audit persistence, shared ownership helpers, storage, and employer assessment reporting remain incomplete.

See `../docs/PRD.md` and `../docs/ROUTES.md` for the Milestone 0 truth inventory.
