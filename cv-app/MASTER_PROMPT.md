# MASTER_PROMPT.md

Mẫu prompt chuẩn để giao công việc cho coding agent trong dự án **Lumina Tech Talent System**.

---

## Master Prompt

```text
Read the following files before making any changes:

- AGENTS.md
- MASTER.md
- MASTER_PROMPT.md
- DESIGN.md
- docs/PRD.md
- docs/ROUTES.md

Treat these documents as the sources of truth for architecture, product behavior, design, routes, development workflow, and verification requirements.

## Task

[Describe the specific task here.]

## Expected outcome

[Describe the expected result after the task is completed.]

## Acceptance criteria

- [Acceptance criterion 1]
- [Acceptance criterion 2]
- [Acceptance criterion 3]

## Commit message

[Example: feat: implement responsive application shell]

## Scope rules

- Work only on the requested scope.
- Preserve existing features and visual design unless a change is explicitly requested.
- Do not implement unrelated features.
- Do not refactor unrelated code.
- Do not rename or move unrelated files.
- Do not install unnecessary dependencies.
- Keep npm as the project package manager.
- Reuse existing components, utilities, types, and patterns where appropriate.
- Keep route files small.
- Move feature-specific logic into the appropriate feature modules.
- Do not hardcode secrets, credentials, or environment-specific URLs.
- Add new environment variables to `.env.example`.
- Do not modify or commit `.env`.
- Do not commit generated files, logs, build output, `.next`, or `node_modules`.

## Architecture rules

- Follow all architecture rules in `AGENTS.md`.
- Use TypeScript strict typing.
- Avoid `any` unless there is a documented technical reason.
- Do not disable TypeScript or ESLint rules to hide errors.
- Use Server Components by default where appropriate.
- Add `"use client"` only when browser-side interaction is required.
- Validate external input with Zod or the existing project validation approach.
- Keep database, API, AI, storage, business logic, and UI concerns separated.
- Do not access the database directly from presentation components.
- Do not expose server secrets to client components.
- Use semantic design tokens instead of hardcoded colors.

## Product rules

- Follow the behavior documented in `docs/PRD.md`.
- Follow the route relationships documented in `docs/ROUTES.md`.
- Do not invent user skills, certifications, projects, work experience, or achievements.
- AI resume optimization may improve wording but must preserve factual meaning.
- Match Score is an advisory indicator, not a hiring probability.
- Interview questions must be tied to the selected CV and job.
- User-owned data must not be accessible by other users.

## UI rules

- Follow `DESIGN.md`.
- Preserve the existing visual language.
- Support desktop, tablet, and mobile layouts.
- Avoid horizontal overflow at a viewport width of 320px.
- Include visible keyboard focus states.
- Do not rely only on color to communicate meaning.
- All interactive icons must have accessible labels.
- Data-driven UI must include loading, loaded, empty, and error states.
- Handle long CV names, job titles, company names, and user-generated content safely.

## Git state before implementation

Before making changes:

1. Run:

   git status --short

2. Record all pre-existing uncommitted changes.
3. Do not modify, stage, discard, or commit unrelated pre-existing changes.
4. If existing changes cannot be safely separated from this task, stop and report the conflict before proceeding.

## Implementation workflow

1. Inspect the relevant existing code before editing.
2. Create a short implementation plan.
3. Implement only the requested scope.
4. Reuse existing project patterns where appropriate.
5. Add or update relevant automated tests.
6. Review the implementation against all acceptance criteria.

## Verification workflow

After implementation, run:

npm run check
git status
git diff --check
git diff --stat
git diff

Also run all automated tests relevant to the changed feature.

Review the complete diff and confirm that:

- All acceptance criteria are satisfied.
- No unrelated files were modified.
- No unnecessary dependencies were added.
- No secrets or `.env` files are included.
- No generated files, logs, `.next`, `node_modules`, or build output are included.
- Existing functionality has not been unintentionally changed.
- Existing visual design has not been unintentionally changed.
- Lint, type checking, build, and relevant tests all pass.
- The diff contains no whitespace errors.
- The implementation follows `AGENTS.md`, `DESIGN.md`, `docs/PRD.md`, and `docs/ROUTES.md`.

## Manual verification

Manually verify the affected user flow where applicable.

Check:

- Normal state
- Loading state
- Empty state
- Error state
- Invalid input
- Direct URL access
- Page refresh
- Desktop layout
- Tablet layout
- Mobile layout
- Keyboard navigation
- Browser console errors
- Existing features affected by the change

## Automated commit workflow

If all checks pass and the implementation satisfies the acceptance criteria:

1. Stage only files belonging to the current task.

2. Review the staged changes:

   git diff --cached --check
   git diff --cached --stat
   git diff --cached

3. Commit using the message from the `Commit message` section:

   git commit -m "<commit message>"

4. Verify the commit:

   git status
   git log -1 --oneline

If no commit message was provided, create a concise Conventional Commit message that accurately describes the task.

## Commit message rules

Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fix
- `refactor:` restructuring without changing behavior
- `docs:` documentation changes
- `test:` automated test changes
- `chore:` tooling, configuration, or maintenance
- `style:` visual or formatting changes without business-logic changes

## Do not commit when

Do not create a commit if:

- `npm run check` fails.
- Relevant automated tests fail.
- Acceptance criteria are not fully satisfied.
- There are known blocking issues.
- The diff contains unrelated changes.
- Secrets or sensitive files are present.
- Git author information is not configured.
- There are no actual changes to commit.

Leave the changes uncommitted and clearly report the reason.

## Git safety rules

- Never run `git reset --hard`.
- Never run `git clean`.
- Never discard user changes.
- Never use `git push --force`.
- Never amend an existing commit unless explicitly requested.
- Never push to a remote repository unless explicitly requested.
- Do not create an empty commit.
- Do not stage unrelated pre-existing changes.

## Stop conditions

Stop and explain before proceeding if:

- The task conflicts with `AGENTS.md`, `DESIGN.md`, `docs/PRD.md`, or `docs/ROUTES.md`.
- A required credential, environment variable, external service, or product decision is missing.
- The task requires a destructive migration or deletion of user data.
- The task requires modifying unrelated parts of the system.
- Multiple materially different implementation options require a product decision.
- Existing repository errors prevent reliable verification.
- Pre-existing Git changes cannot be separated safely from this task.

Do not silently guess important product or architecture decisions.

## Completion report

At the end, report using this structure:

### Summary

Briefly describe what was completed.

### Files changed

List every file created, modified, moved, or deleted.

### Implementation notes

Explain important technical decisions and any deviations from the requested scope.

### Commands executed

List all commands executed.

### Verification results

- Lint:
- Type checking:
- Build:
- Automated tests:
- Manual verification:

### Environment variables

List all environment variables added or changed.

Write `None` if there were no changes.

### Database changes

List migrations, schema changes, and seed changes.

Write `None` if there were no changes.

### Remaining issues

List warnings, limitations, follow-up work, or unresolved problems.

Write `None` if the task is fully complete.

### Git commit

- Commit created: Yes/No
- Commit hash:
- Commit message:
- Working tree status after commit: Clean/Dirty
- Uncommitted files remaining: