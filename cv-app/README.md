# CV_KADA

CV_KADA is a Next.js recruiting MVP for Vietnamese IT candidates and employers. The product loop is:

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
npm run db:push
npm run db:seed
npm run dev
```

Use npm only. Do not add another lockfile.

For local demo auth, the credentials provider accepts any email with password `123456`. Real persistence requires PostgreSQL connection strings in `.env`. Live AI features require `GEMINI_API_KEY`; leave it empty for local/CI paths that should not call external AI.

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
