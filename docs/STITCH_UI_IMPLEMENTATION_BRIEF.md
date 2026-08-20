# Jobfit Stitch UI Implementation Brief

## Source and audited scope

- Private Stitch project: `Jobfit Job Feed`.
- URL: https://stitch.withgoogle.com/projects/5567340400182043103
- **Authoritative downloaded UX/UI artifact:** `D:\Downloads\stitch_cv_kada_job_feed.zip`.
- **Safe extracted source:** `D:\WebCV-stitch-export-audit-20260809\stitch_cv_kada_job_feed`.
- SHA-256: `33270a4d0e5c29548958b27cfc901208acd4e18eae97d4333dc23cbfd488c870`.
- Verified inventory: 33 `code.html`, 34 `screen.png`, and one `professional_career_hub/DESIGN.md`.
- Stitch audit: `TOTAL=33; AUTH=4; CANDIDATE=14; RECRUITER=14; DESKTOP_MOBILE_PAIRS=complete; DUPLICATES=0; CRITICAL_MISSING=none`.
- 32 product screens (16 desktop/mobile pairs) plus logo/design-system references.
- The downloaded `DESIGN.md`, corresponding desktop/mobile `code.html`, and `screen.png` are the mandatory visual/UX source of truth. The earlier canvas-only interpretation is superseded where it differs from the downloaded artifact.
- Translate static HTML/Tailwind-CDN markup into repo-native Next.js/React/Tailwind components. Do not copy demo data, inline scripts, CDN runtime, or client-trusted identity from the export.

## Visual direction from downloaded Stitch export

- Corporate / Modern professional career hub: clear, trustworthy, efficient and content-first.
- Use **Be Vietnam Pro** and preserve Vietnamese diacritics.
- Primary Deep Blue `#1A56DB` for primary actions/active navigation; token-level primary includes `#003FB1` with container `#1A56DB` as specified by downloaded `DESIGN.md`.
- Success Green `#059669` for positive states; light background `#F8F9FF`; white cards; primary text `#121C28`; secondary text `#434654`; outline variant `#C3C5D7`.
- Follow downloaded shape/spacing system: 8px standard radius, 16px large sections, 4px rhythm, desktop container 1280px, desktop margin 40px, mobile margin 16px.
- Use subtle ambient shadows and tonal layers from `DESIGN.md`; no unrelated purple/indigo gradients or glassmorphism unless explicitly present in the matching exported screen.
- Desktop and mobile behavior must match each exported screen pair while remaining role-aware and responsive.
- Semantic landmarks, visible focus, labels, keyboard behavior and WCAG AA contrast remain mandatory.

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
