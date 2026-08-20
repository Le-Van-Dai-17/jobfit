# Jobfit Two-Sided Recruiting MVP Brief

## Product decision

Jobfit must become a focused two-sided recruiting product for Vietnamese IT candidates and recruiters.

```text
Candidate profile/CV -> job application -> practical assessment -> evidence-based recruiter decision
```

The current collection of standalone AI tools must become contextual support inside this journey, not equal-weight top-level products.

## Source-of-truth precedence

1. Root `AGENTS.md` and this brief define approved scope and quality requirements.
2. Live code, schema, manifests, migrations, and tests define current implementation reality.
3. `docs/PRD.md`, `docs/ROUTES.md`, and ADRs provide supporting architecture context.
4. Historical README claims and mock UI are background only.

## Required roles

- `CANDIDATE`: owns profile, resumes, applications, assessment submissions and candidate-visible reports.
- `RECRUITER`: belongs to a company, manages company jobs and candidate pipelines, and reads employer-safe assessment reports for applications to that company.
- `ADMIN`: platform administration boundary; a minimal protected dashboard is sufficient.

Existing `USER` records must migrate safely to `CANDIDATE`. Do not break existing Supabase data.

## Registration and authentication

Implement real local credential registration and authentication:

- Public `/register` with name, normalized email, password, password confirmation, and role choice limited to Candidate or Recruiter.
- Store only a strong password hash; never store or log plaintext passwords.
- Reject duplicate emails and invalid/weak payloads with user-safe messages.
- Credentials login verifies the stored hash. A clearly isolated development demo fallback may remain only when explicitly enabled by environment configuration; it must not accept arbitrary emails in normal mode.
- Auth session/JWT exposes stable user ID and role.
- OAuth-created users default to Candidate and can complete onboarding.
- `/login` and `/register` are public. Authenticated users are redirected to their role dashboard.

## Company boundary

Add the minimum company domain:

- Company profile: name, slug, website, description, location, timestamps.
- Company membership: user, company, role (`OWNER`, `RECRUITER`), unique membership.
- Recruiter onboarding creates a company and owner membership atomically, or joins an existing company only through a future invite flow (invite flow is out of scope now).
- Every recruiter query/action must scope by authenticated membership and company ID. Prevent IDOR across companies.

## Candidate journey and information architecture

Candidate navigation must contain only:

1. `Tổng quan` (`/dashboard`)
2. `Hồ sơ & CV` (`/my-cv`)
3. `Việc làm` (`/jobs`)
4. `Ứng tuyển` (`/applications`)

Candidate dashboard must use persisted data and answer:

- Is the profile/CV ready?
- What is the next action?
- What applications and assessments need attention?

Remove fake ATS scores, fake job counts, fake activity, excessive CTA cards, and the standalone-tool feel. AI match/optimization/interview/assessment remain accessible contextually from a job/application/CV journey, not as primary sidebar entries.

Candidate workflow:

```text
register -> candidate onboarding -> create/save CV -> browse persisted jobs -> view job -> apply with owned CV version -> complete requested assessment -> track status/results
```

## Recruiter journey and information architecture

Recruiter navigation:

1. `Tổng quan` (`/recruiter`)
2. `Vị trí tuyển dụng` (`/recruiter/jobs`)
3. `Ứng viên` (`/recruiter/candidates`)
4. `Đánh giá` (`/recruiter/assessments`)
5. `Công ty` (`/recruiter/company`)

Required recruiter flows:

- Company onboarding when no membership exists.
- Persisted dashboard counts: active jobs, total applicants, applicants awaiting review/assessment, recent applications.
- Create, list, view and archive/publish company-owned jobs/JDs.
- View pipeline grouped or filterable by application status.
- View candidate application details, selected CV version, assessment status and employer-safe assessment result.
- Update application status with an auditable `ApplicationEvent` and allowed state transitions.
- Recruiter must never read or mutate another company’s jobs/applications/reports.

## Assessment integration

Keep existing one-shot atomic assessment submission guarantees. Extend the domain so an assessment may be tied to an application. Candidate and recruiter visibility must be ownership-safe:

- Candidate: only own assessment/application.
- Recruiter: only applications to jobs owned by recruiter’s company.
- Employer report shows rubric/evidence/limitations, not private unrelated candidate data.

## Layout and visual simplification

- Public auth pages must not render the authenticated app sidebar/header.
- App shell is role-aware and displays the real session user/company, not `Vũ Nguyễn` or fake titles.
- Remove the ATS optimizer sidebar widget and ornamental dashboard clutter.
- Use one clear primary action per dashboard section.
- Preserve responsive/mobile navigation and accessibility labels.
- Keep the existing visual tokens where useful; do not redesign every atom.

## Schema and migration safety

- Add an additive migration after the two existing migrations.
- Validate upgrade from the current live schema and generation from empty migration history.
- No destructive reset, `db push`, or blind `migrate resolve`.
- Existing `USER` enum values/data must be transformed safely to `CANDIDATE`.
- Add indexes/unique constraints supporting company ownership and pipeline queries.

## TDD and verification requirements

Use vertical RED -> GREEN -> REFACTOR slices. Tests must first fail for missing behavior, then pass after implementation.

Required automated coverage:

- Registration validation, duplicate email, password hashing and login verification.
- JWT/session role propagation.
- Role redirect/guard behavior.
- Recruiter membership/ownership checks and cross-company denial.
- Recruiter job create/list/archive and pipeline status transitions.
- Candidate apply ownership and duplicate application prevention.
- Candidate/recruiter assessment visibility boundaries.
- Role-aware navigation without obsolete standalone menu items.

Final gates:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx prisma validate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
npx prisma migrate status
git diff --check
```

Perform browser smoke with real configured PostgreSQL/Supabase:

1. Register a Candidate and Recruiter.
2. Recruiter completes company onboarding and creates a job.
3. Candidate creates/uses a CV and applies.
4. Recruiter sees only the company application and updates its status.
5. Candidate sees updated status and contextual assessment path.
6. Inspect browser console and server logs for runtime errors.

## Non-goals for this milestone

- Email verification and password reset delivery infrastructure.
- Recruiter invitation email workflow.
- Billing/subscriptions.
- Public employer branding site.
- Social network, LMS or certification marketplace.
- Replacing the deterministic advisory assessment with a semantic AI judge.
- Full admin CRUD beyond a protected role boundary/dashboard.
