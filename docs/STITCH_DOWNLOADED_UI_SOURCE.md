# Downloaded Stitch UX/UI source of truth

## Verified artifact

- Project: `Jobfit Job Feed`
- Stitch URL: https://stitch.withgoogle.com/projects/5567340400182043103
- ZIP: `D:\Downloads\stitch_cv_kada_job_feed.zip`
- Extracted read-only audit copy: `D:\WebCV-stitch-export-audit-20260809\stitch_cv_kada_job_feed`
- ZIP size: `8,247,971` bytes
- SHA-256: `33270a4d0e5c29548958b27cfc901208acd4e18eae97d4333dc23cbfd488c870`
- Inventory: 33 `code.html`, 34 `screen.png`, one `professional_career_hub/DESIGN.md`

## Precedence

1. The downloaded desktop/mobile `screen.png`, matching `code.html`, and downloaded `DESIGN.md` are authoritative for UX, layout, hierarchy, content density, typography, color, spacing, shape and responsive behavior.
2. The live repository, schema, Auth.js callbacks, server actions, services and repositories are authoritative for data, authentication, authorization, ownership, tenant scoping and state transitions.
3. `docs/STITCH_UI_IMPLEMENTATION_BRIEF.md` maps the artifact to product routes and security constraints.
4. Earlier canvas-only visual interpretations are historical and must be replaced when they differ from the downloaded export.

## Integration rule

Port each exported screen into repo-native Next.js/React/Tailwind. Do not paste the static document wholesale. Strip Tailwind CDN, Google Material runtime scripts, demo objects, fake counts, placeholder identities and no-op controls. Every visible control must be wired to a real query, server action or navigation effect. Preserve semantic labels, Vietnamese diacritics, keyboard operation, focus states and mobile behavior.

## Downloaded design system highlights

- Font: **Be Vietnam Pro**.
- Primary action/brand: Deep Blue `#1A56DB`; downloaded token primary `#003FB1`.
- Positive states: Success Green `#059669`.
- Background: `#F8F9FF`; cards: `#FFFFFF`.
- Main text: `#121C28`; secondary text: `#434654`.
- Border/outline variant: `#C3C5D7`.
- Standard radius: 8px; large section radius: 16px; pill radius: full.
- Desktop container: 1280px; desktop margin: 40px; mobile margin: 16px; 4px baseline rhythm.
- Cards use light borders and ambient shadows; hover elevation may increase.

## Verification gate

For every mapped route:

1. Compare desktop output with the corresponding downloaded desktop `screen.png`/`code.html`.
2. Compare mobile output with the corresponding mobile pair.
3. Verify all displayed values are persisted or explicitly `unknown`/empty—not copied demo data.
4. Verify all controls have a real effect.
5. Check browser computed styles for exported tokens and Be Vietnam Pro.
6. Run Auth/RBAC/tenant/IDOR regression tests, full test suite, lint, typecheck, build, Prisma validation/migration rehearsal, browser console and server-log checks.
