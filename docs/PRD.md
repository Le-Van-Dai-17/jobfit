# Product Requirements Document - CV_KADA

## Product North Star

CV_KADA is a recruiting MVP for Vietnamese IT candidates and employers. The focused loop is:

```text
CV -> realistic engineering tasks -> evidence-based assessment results for employers
```

CV management, jobs, matching, optimization, tracker, and interview practice are supporting flows. The product must not become a certification marketplace, social network, generic LMS, or broad engineering identity platform.

## Current Repository Baseline

The live code is no longer a UI-only prototype. It currently contains:

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- Auth.js configuration with Google, GitHub, and local demo credentials providers.
- Prisma/PostgreSQL schema covering users, profiles, resumes, resume versions, jobs, saved jobs, applications, interview sessions, AI runs, and file assets.
- Repository and service layers for resumes and jobs.
- Server actions/routes for CV saving, applications, auth, AI match, AI optimization, and AI interview generation/evaluation.
- Gemini-backed AI helper functions with structured response schemas from the provider SDK.
- UI routes for dashboard, CV editor, jobs, job match, optimization, tracker, interview, profile, and login.
- Vitest configuration and baseline schema/service unit tests.

## Implemented

- Auth route and protected app routing via Auth.js.
- Local demo credentials login path for development.
- Prisma schema and generated client integration.
- Resume repository/service and CV save action.
- Job repository/service and saved job support.
- Application API route.
- Gemini route handlers for match, optimization, and interview workflows.
- Vietnamese-first UI screens for the existing support flows.
- Baseline scripts: lint, typecheck, unit tests, build, and combined check.

## Partial

- AI provider boundary exists as a helper module, but responses are not yet consistently validated with Zod after provider return.
- AI run auditing is modeled in Prisma but not consistently written by routes.
- Ownership checks exist in several route queries, but shared ownership helper coverage is incomplete.
- Resume versioning exists in the schema; UI/editor persistence is still limited.
- Jobs and tracker have backend models and some repository/API support, but several screens still rely on mock or client-side state.
- Interview practice has AI routes and UI, but persistence, consent, retention, and employer-safe reporting are incomplete.

## Mock Or Demo Paths

- Credentials auth accepts any email with password `123456` for local/demo use.
- Some dashboard, profile, tracker, jobs, and interview UI state remains mock/demo data.
- Gemini uses a dummy fallback key only to keep builds from failing; live AI calls still require `GEMINI_API_KEY`.

## Blockers And External Credentials

- `DATABASE_URL` and `DIRECT_URL` are required for real PostgreSQL/Supabase persistence and Prisma migration workflows.
- `AUTH_SECRET` is required for local and deployed Auth.js sessions.
- Google/GitHub OAuth require provider IDs and secrets when those sign-in paths are used.
- `GEMINI_API_KEY` is required for live AI match, optimization, and interview calls.
- Supabase Storage is documented in ADR-003 but no storage adapter is implemented yet.

## Milestone 1 Target

The next product slice should add assessment sessions tied to a selected CV version and job/JD, deterministic engineering tasks, candidate submissions, rubric-based evaluation, structured evidence, advisory scores, candidate feedback, and employer-safe reports.
