# MSGweb-Longitudinal — Master Control Status

Last updated: 2026-02-12

## Current Objective

Smoke test readiness — schema flexibility change + comprehensive seed script for manual feature testing

## Completed

- [x] Full codebase research (schema, templates, stores, API routes, validation)
- [x] Mapped real curriculum to data model (7 clerkships, 3 types)
- [x] Decided: `EvaluationFrequency` enum → `evaluationIntervalDays Int?` for flexible eval cadence
- [x] Decided: Longitudinal clerkships are 24 weeks (not 26) — holiday/special topic weeks excluded
- [x] Agent prompt drafted for schema change + seed script

## In Progress

- [ ] Schema change: `evaluationFrequency` enum → `evaluationIntervalDays` (agent prompt ready, not yet dispatched)
- [ ] Seed script: comprehensive test data for all features (bundled with schema change)

## Next Up

- [ ] Dispatch agent for schema change + seed script
- [ ] Verify build + tests after schema change
- [ ] Run seed against database
- [ ] Manual smoke testing of all features
- [ ] Activity log + documentation updates

## Key Context

- Branch: `main` (2cc2fb8)
- 332 unit tests, build clean, lint clean
- All 9 phases + pre-launch improvements complete
- PR #7 open on production MSGweb for merge-back
- Only 2 templates are fully detailed: `internal-medicine` (69 criteria) and `neurology` (69 criteria)
- Other 5 templates are placeholders with 3 criteria each
