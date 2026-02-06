# MSGweb-longitudinal — Project Context

*Created: 2026-02-06*

## What This Is

Upgrade fork of [MSGweb](https://github.com/jtbaccus/MSGweb) for developing longitudinal student progress tracking. The production MSGweb repo remains untouched — all upgrade work happens here.

## Production Repo

- **Live app:** Deployed on Vercel from `jtbaccus/MSGweb`
- **GitHub:** https://github.com/jtbaccus/MSGweb
- **Submodule in turing:** `projects/msgweb/`

## Current Status

- **Phase:** Phase 3 complete — TypeScript Types implemented, ready for Phase 4 (API Routes)
- **Upgrade plan:** See `UPGRADE-PATH.md` for the full 8-phase plan

## Upgrade Phases (from UPGRADE-PATH.md)

1. ~~Authentication (NextAuth.js + Supabase)~~ — Done
2. ~~Database Schema (Prisma + PostgreSQL)~~ — Done
3. ~~TypeScript Types~~ — Done
4. API Routes
5. State Management
6. UI Components
7. AI Summary Generation
8. Verification & Testing

## Merge-Back Strategy

When the longitudinal features are stable and tested:
- Open a PR from `jtbaccus/MSGweb-longitudinal` to `jtbaccus/MSGweb`, or
- Cherry-pick / manual merge of completed phases
- The upgrade preserves the existing single-evaluation workflow (mode toggle)

## Key Decisions

- Fork approach chosen to protect live production deployment
- Full commit history preserved from original repo
- Each phase is independently deployable (can pause after any phase)
- PerformanceLevel: Prisma enum uses uppercase (FAIL/PASS/HONORS); existing TS types use lowercase — mapping in Phase 3

## Phase 1 Summary (Authentication)

Implemented 2026-02-06:
- NextAuth.js v4 with credentials provider, JWT sessions
- Prisma + PostgreSQL via `@prisma/adapter-pg`
- User model: email/password, `UserRole` enum (ADMIN/USER), `mustChangePassword` flag
- `proxy.ts` middleware: protects all routes, forces password change when flagged
- Change-password flow: API endpoint + UI page
- Seeded admin account (`admin@example.com` / `changeme`, forced to change on first login)
- `lib/api-auth.ts`: `requireAuth()` helper for API routes
- All 164 existing tests pass

## Phase 2 Summary (Database Schema)

Implemented 2026-02-06:
- 5 new enums: `ClerkshipType`, `EvaluationFrequency`, `EnrollmentStatus`, `PerformanceLevel`, `SummaryType`
- 6 new models: `Clerkship`, `Rotation`, `Student`, `StudentEnrollment`, `Evaluation`, `ProgressSummary`
- `User` model: added `evaluations` and `summaries` relation fields (Phase 1 fields preserved)
- Indexes on `Evaluation` (enrollmentId, periodNumber) and `ProgressSummary` (enrollmentId, type)
- Unique constraint on `StudentEnrollment` (studentId, rotationId)
- Cascade deletes from `StudentEnrollment` to `Evaluation` and `ProgressSummary`
- `npx prisma generate` succeeds, build clean, all 164 tests pass
- Tables created via `npx prisma db push` when connected to database

## Phase 3 Summary (TypeScript Types)

Implemented 2026-02-06:
- Created `lib/types/longitudinal.ts` with:
  - 4 enum type aliases as string unions (`ClerkshipType`, `EvaluationFrequency`, `SummaryType`, `EnrollmentStatus`) — decoupled from Prisma imports for client-component compatibility
  - 6 model interfaces (`Clerkship`, `Student`, `Rotation`, `StudentEnrollment`, `SavedEvaluation`, `ProgressSummary`) matching Prisma schema
  - 3 view types (`StudentProgressView`, `PeriodStatus`, `PerformanceTrend`)
  - `LongitudinalNavigationTab` extending existing `NavigationTab`
- Created `lib/utils/performanceLevelMapping.ts` — bidirectional mapping between UI lowercase (`'fail'|'pass'|'honors'`) and Prisma uppercase (`'FAIL'|'PASS'|'HONORS'`)
- Updated `lib/types/index.ts` — re-exports all 14 new types (additive only)
- Build clean, all 164 tests pass unchanged
