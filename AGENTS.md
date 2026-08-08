# CV_KADA — Codex Operating Rules

## Read first
Before changing code, read in this order:
1. `docs/AUTONOMOUS_MVP_BRIEF.md`
2. `cv-app/AGENTS.md`
3. `cv-app/DESIGN.md`
4. `docs/PRD.md`
5. `docs/ROUTES.md`
6. relevant files under `docs/adr/`
7. `cv-app/package.json` and the relevant Next.js 16 docs under `cv-app/node_modules/next/dist/docs/`

If documents conflict, this file and `docs/AUTONOMOUS_MVP_BRIEF.md` win for product scope; live code and package manifests win for implementation status and versions.

## Product north star
CV_KADA must keep this focused loop:

`CV → realistic engineering tasks → evidence-based assessment results for employers`

Existing CV, jobs, matching, optimization, tracker, and interview modules support that loop. Do not turn the product into a certification platform, social network, generic LMS, or complex engineering identity system.

## Engineering rules
- Preserve the modular monolith flow: `UI → action/controller → service → repository/provider`.
- Next.js App Router; Server Components by default. Add `"use client"` only for browser interaction/state.
- TypeScript strict; no undocumented `any`; validate external/untrusted input and AI output with Zod.
- Presentation components must not access Prisma directly.
- Keep user-owned data scoped by authenticated server session; never trust a client-supplied user id.
- AI suggestions and scores must be evidence-based, advisory, structured, server-validated, and must never invent candidate facts.
- Use npm only. Do not add another lockfile.
- Do not modify `.env`; add placeholders to `.env.example` when needed and never commit secrets.
- Add automated tests for changed domain/service behavior.
- Do not reset, clean, or discard existing work. Never force-push.

## Definition of done
A task is complete only when its acceptance criteria are met and these pass from `cv-app/`:
- `npm run lint`
- `npm run typecheck`
- relevant unit tests (`npm run test:unit`)
- `npm run build`
- `git diff --check`

Review the complete diff before committing. Use Conventional Commits. Do not push unless explicitly requested.
