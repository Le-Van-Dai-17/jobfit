# CV_KADA Stitch UI Implementation Brief

## Source and audited scope

- Private Stitch project: `CV_KADA Job Feed`
- URL: https://stitch.withgoogle.com/projects/5567340400182043103
- Stitch audit: `TOTAL=33; AUTH=4; CANDIDATE=14; RECRUITER=14; DESKTOP_MOBILE_PAIRS=complete; DUPLICATES=0; CRITICAL_MISSING=none`.
- 32 product screens (16 desktop/mobile pairs) plus one design-system reference.
- Native project-download did not create a local artifact. Do not paste generated code blindly; use the inspected canvas and this brief as visual/product reference.

## Visual direction

- Compact Vietnamese IT recruiting experience; social/news-feed information hierarchy without copied branding.
- White cards on `#f8f9ff`, subtle borders/shadows, 12–16px radii, Inter, 4px rhythm.
- Existing design tokens remain authoritative: indigo `#4648d4`, violet `#6b38d4`, sky `#00628d`.
- No giant hero, fake metrics, glassmorphism, ornamental gradients, or standalone-tool navigation.
- Desktop: sticky top bar, role-aware left navigation, workspace, optional contextual right rail.
- Mobile: compact top bar, single column and role-aware drawer/bottom navigation.
- Semantic landmarks, visible focus, labels and WCAG AA contrast.

## Shared Auth — desktop/mobile

Routes: `/login`, `/register`.

- Login email/password, show/hide, loading and safe generic failure; no demo credentials in normal UI.
- Registration includes name/email/password/confirmation and Candidate/Recruiter selection with validation and safe duplicate-email feedback.
- Public auth routes render no authenticated shell.

## Candidate — 7 desktop/mobile pairs

Navigation remains exactly: Tổng quan, Hồ sơ & CV, Việc làm, Ứng tuyển.

1. Candidate Home / Job Feed: vertical persisted job cards, filters, company, posted date, title, location/work mode, public salary, skills, deadline, Save/View/Apply, readiness/application/assessment context.
2. Hồ sơ & CV: persisted profile, completion, explicit CV create/save/version flow.
3. Job detail: persisted JD, requirements, skills, salary, owned CV selection and apply.
4. Apply confirmation/success/error: exact CV snapshot and duplicate-safe feedback.
5. Applications: persisted statuses/timeline and contextual assessment CTA.
6. Contextual assessment workspace: job context, rubric/task, solution and deployment-plan input, submission state.
7. Candidate report: advisory score, rubric, evidence, limitations and next action.

Verify and map live routes including `/`, `/profile`, `/my-cv`, `/jobs`, `/jobs/[jobId]`, `/applications`, `/assessments`, `/assessments/[sessionId]`.

## Recruiter — 7 desktop/mobile pairs

Navigation remains exactly: Tổng quan, Vị trí tuyển dụng, Ứng viên, Đánh giá, Công ty.

1. Persisted operational overview.
2. Company onboarding/settings.
3. Company-scoped JD list with draft/published/archived states.
4. Create/detail/edit JD using safe server actions.
5. Company-scoped candidate pipeline and audited transitions.
6. Application detail with exact selected CV snapshot, job/audit/assessment context.
7. Employer-safe report with rubric, evidence, limitations and human-decision disclaimer.

Map live routes under `/recruiter`, `/recruiter/company`, `/recruiter/jobs`, `/recruiter/candidates`, and `/recruiter/assessments` including detail/new/onboarding routes.

## Backend/security invariants

- Reuse Auth.js, server actions, services, repositories, Prisma schema/migrations, RBAC and tenant scoping already implemented.
- Never trust client user/company/recruiter IDs or roles. Missing/deleted user, stale token, invalid role or missing membership fails closed.
- Recruiter authorization remains Auth user → active DB role → CompanyMembership → Company → Job → Application → Assessment/report.
- Preserve application CV snapshot, duplicate application behavior, DB eligibility/integrity triggers, pipeline CAS/audit transaction, and explicit CV persistence.
- Do not add mock persistence or weaken authorization to fit visuals.
- Avoid schema/migration changes unless strictly unavoidable; document and test any unavoidable change.
- Preserve the customized role-aware `components/layout/Header.tsx` behavior while applying the Stitch visual shell.

## Gates

From `cv-app/` after all mutations:

```bash
npx prisma generate
npx prisma validate
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
git diff --check
```

Then run Candidate/Recruiter browser smoke against the authorized configured schema, inspect browser console/server logs, preserve primary-worktree user changes and do not push.
