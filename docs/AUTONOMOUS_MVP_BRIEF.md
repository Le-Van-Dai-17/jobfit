# Jobfit Autonomous MVP Brief

## Mission
Continue Jobfit into a coherent, demonstrable recruiting MVP for Vietnamese IT candidates and employers.

The non-negotiable product formula is:

```text
CV
+ realistic engineering tasks
+ clear, evidence-based assessment results for employers
```

Whenever scope is uncertain, return to this formula. Existing modules are valuable only insofar as they strengthen this end-to-end loop.

## Product boundaries
### In scope
- Candidate authentication and ownership-safe data.
- CV creation/versioning and factual preservation.
- Public or manually entered IT jobs/JDs.
- CV/JD matching and transparent evidence.
- Realistic role-specific engineering tasks tied to a selected CV and job.
- Candidate submissions with rubric-based assessment.
- A clear employer-facing assessment report with evidence, limitations, and advisory scores.
- Application tracking and interview practice as supporting flows.

### Out of scope
- Certification marketplace/platform.
- Social network, feeds, followers, messaging community.
- Generic course/LMS features.
- A sprawling “engineering identity” profile.
- Unexplained or fabricated AI scores.
- Scraping protected job sources or bypassing access controls.

## Actual repository baseline
The repository is no longer UI-only even though several documents still say so. At the start of this autonomous branch it already includes:
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS.
- Prisma/PostgreSQL schema and repositories/services for CV and jobs.
- Auth.js integration.
- Gemini-backed AI routes for matching, optimization, and interview features.
- API/application route and feature clients.
- Vitest configuration but no meaningful test suite yet.
- Multiple screens that still contain mock/demo state or incomplete persistence.

Treat live code as authoritative for what exists. Update stale documentation rather than reverting implemented architecture to the old prototype description.

## Autonomous implementation order
Work in small, reviewable commits. Do not attempt unrelated visual redesign.

### Milestone 0 — Baseline truth and verification
1. Inspect the live code and reconcile stale product/architecture documentation.
2. Record what is implemented, partial, mock, and blocked by external credentials.
3. Ensure `.env.example` documents required variables without secrets.
4. Make baseline lint, typecheck, unit test, and build commands reliable.

### Milestone 1 — Assessment vertical slice
Implement the smallest end-to-end domain slice supporting the north star:
1. Candidate selects a CV version and job/JD.
2. System provides a small set of realistic engineering tasks suitable for the job/seniority.
3. Candidate can submit a text answer or solution explanation.
4. System evaluates against an explicit rubric and stores structured evidence.
5. Candidate sees feedback; an employer-safe report shows strengths, gaps, evidence, and limitations.

Prefer deterministic/rule-based fixtures or a mock provider for CI. Live AI must remain behind the existing provider boundary and must not be required for tests/build.

### Milestone 2 — Integrate and harden
1. Connect the vertical slice into existing navigation and jobs/CV flow.
2. Add loading, empty, validation, unauthorized, and error states.
3. Add ownership checks and tests.
4. Add domain/service tests, route tests where practical, and one happy-path component/integration test.
5. Update route map and README with run/test instructions.

## Assessment domain expectations
Use names consistent with the existing code, but the domain should represent:
- assessment session (candidate, selected resume version, selected job)
- engineering task (prompt, type, seniority, skills, rubric, expected evidence)
- submission (candidate answer/solution, timestamps/status)
- result (rubric breakdown, evidence references, strengths, gaps, limitations, advisory score)

Do not make AI output the only source of truth. Store rubric/evidence in structured data and validate all generated output server-side.

## UX acceptance criteria
- The primary path is discoverable from existing jobs/CV UI.
- No horizontal overflow at 320px.
- Keyboard focus is visible and controls have accessible names.
- Every data-driven screen handles loading, empty, success, validation failure, unauthorized, and server-error states as applicable.
- Scores are labeled advisory; conclusions include evidence and limitations.
- Vietnamese is the default UI language.

## Security and data acceptance criteria
- Every user-owned read/write is scoped from the authenticated server session.
- No client-provided user ID is trusted.
- CV, JD, task prompt, candidate submission, and AI output are untrusted input.
- No secret, raw credential, or full sensitive prompt/transcript is logged or committed.
- Live external providers are not called in CI/unit tests.

## Verification and completion
For each milestone:
1. Run relevant tests during development.
2. Run from `cv-app/`: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`.
3. Run `git diff --check` and review the full diff.
4. Commit only the milestone scope with a Conventional Commit message.
5. Continue to the next milestone only if the previous milestone passes.

If blocked by missing credentials or a material product decision, implement a documented local/mock path, keep production integration behind an adapter, and record the blocker instead of inventing credentials or behavior.
