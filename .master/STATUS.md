# MSGweb-Longitudinal — Master Control Status

Last updated: 2026-02-13

## Current Objective

Manual smoke testing — seed the database, verify all features end-to-end

## Completed

- [x] Full codebase research (schema, templates, stores, API routes, validation)
- [x] Mapped real curriculum to data model (7 clerkships, 3 types)
- [x] Decided: `EvaluationFrequency` enum → `evaluationIntervalDays Int?` for flexible eval cadence
- [x] Decided: Longitudinal clerkships are 24 weeks (not 26) — holiday/special topic weeks excluded
- [x] Agent prompt drafted for schema change + seed script
- [x] D-1 dispatched and completed (2026-02-13): schema change + seed script
- [x] Verified: build clean, 330/330 tests pass
- [x] Committed and pushed (`9beff15`), parent turing updated (`d100cb7`)

## Next Up

- [ ] Push schema to database: `npx prisma db push`
- [ ] Run seed: `npx tsx prisma/seed.ts`
- [ ] Manual smoke testing checklist:
  - [ ] Login flow (admin + regular user)
  - [ ] Single evaluation workflow (template → criteria → attributes → narrative → generate → export)
  - [ ] Longitudinal dashboard (stats, active rotations)
  - [ ] Student list (search, expand enrollments, CSV import)
  - [ ] Student progress view (timeline, chart, evaluations list, export panel)
  - [ ] New evaluation from longitudinal (eval flow → save & return)
  - [ ] Save to record from single mode (bridge modal)
  - [ ] Mid-course + end-course summary generation
  - [ ] Admin views (clerkships, rotations, enrollments, users CRUD)
  - [ ] Settings (mode toggle, narrative length, theme)
- [ ] Fix any issues found during smoke testing
- [ ] Update CONTEXT.md with smoke test results

## Key Context

- Branch: `main` (9beff15)
- 330 unit tests, build clean, lint clean
- All 9 phases + pre-launch improvements + schema flexibility complete
- PR #7 open on production MSGweb for merge-back (will need updating after schema change)
- Only 2 templates fully detailed: `internal-medicine` (69 criteria) and `neurology` (69 criteria)
- Other 5 templates are placeholders with 3 criteria each
- Seed script: 4 users, 7 clerkships, 6 rotations, 8 students, 15 enrollments, ~38 evaluations, 6 summaries
- Decisions log: `.master/DECISIONS.md` (D1-D3)
- Dispatch log: `.master/DISPATCH-LOG.md` (D-1 complete)
