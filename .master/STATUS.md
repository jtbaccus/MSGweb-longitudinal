# MSGweb-Longitudinal — Master Control Status

Last updated: 2026-02-13

## Current Objective

Smoke testing passed — ready for deeper testing or next phase of work

## Completed

- [x] Full codebase research (schema, templates, stores, API routes, validation)
- [x] Mapped real curriculum to data model (7 clerkships, 3 types)
- [x] Decided: `EvaluationFrequency` enum → `evaluationIntervalDays Int?` for flexible eval cadence
- [x] Decided: Longitudinal clerkships are 24 weeks (not 26) — holiday/special topic weeks excluded
- [x] Agent prompt drafted for schema change + seed script
- [x] D-1 dispatched and completed (2026-02-13): schema change + seed script
- [x] Verified: build clean, 330/330 tests pass
- [x] Committed and pushed (`9beff15`), parent turing updated (`d100cb7`)
- [x] Schema pushed to database (`prisma db push`)
- [x] Seed run successfully (4 users, 7 clerkships, 6 rotations, 8 students, 15 enrollments, 66 evaluations, 6 summaries)
- [x] Manual smoke testing — all features passing

## Next Up

- [ ] Deeper feature testing / edge cases if needed
- [ ] Update CONTEXT.md with smoke test results
- [ ] Update PR #7 on production MSGweb for merge-back (post-schema change)
- [ ] Flesh out placeholder templates (5 clerkships with only 3 criteria each)

## Key Context

- Branch: `main` (9beff15)
- 330 unit tests, build clean, lint clean
- All 9 phases + pre-launch improvements + schema flexibility complete
- PR #7 open on production MSGweb for merge-back (will need updating after schema change)
- Only 2 templates fully detailed: `internal-medicine` (69 criteria) and `neurology` (69 criteria)
- Other 5 templates are placeholders with 3 criteria each
- Seed script: 4 users, 7 clerkships, 6 rotations, 8 students, 15 enrollments, 66 evaluations, 6 summaries
- Decisions log: `.master/DECISIONS.md` (D1-D3)
- Dispatch log: `.master/DISPATCH-LOG.md` (D-1 complete)
