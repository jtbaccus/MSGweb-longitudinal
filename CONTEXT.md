# MSGweb-longitudinal — Project Context

*Created: 2026-02-06*

## What This Is

Upgrade fork of [MSGweb](https://github.com/jtbaccus/MSGweb) for developing longitudinal student progress tracking. The production MSGweb repo remains untouched — all upgrade work happens here.

## Production Repo

- **Live app:** Deployed on Vercel from `jtbaccus/MSGweb`
- **GitHub:** https://github.com/jtbaccus/MSGweb
- **Submodule in turing:** `projects/msgweb/`

## Current Status

- **Phase:** All 9 phases + pre-launch improvements complete
- **Upgrade plan:** See `UPGRADE-PATH.md` for the full 9-phase plan
- **Pre-launch:** Security (RBAC, rate limiting, audit logging), admin UI, export/reporting, UX polish, E2E tests all implemented

## Upgrade Phases (from UPGRADE-PATH.md)

1. ~~Authentication (NextAuth.js + Supabase)~~ — Done
2. ~~Database Schema (Prisma + PostgreSQL)~~ — Done
3. ~~TypeScript Types~~ — Done
4. ~~API Routes~~ — Done
5. ~~State Management~~ — Done
6. ~~UI Components~~ — Done
7. ~~AI Summary Generation~~ — Done
8. ~~Verification & Testing~~ — Done
9. ~~Single ↔ Longitudinal Integration~~ — Done

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

## Phase 4 Summary (API Routes)

Implemented 2026-02-06:
- Added `zod` (v4) for input validation (already present in dependencies)
- Created `lib/api-helpers.ts` — shared response helpers: `apiError()`, `validationError()`, `handlePrismaError()` (P2002→409, P2025→404, P2003→400)
- Created `lib/validations/schemas.ts` — 11 Zod schemas with refinements (LONGITUDINAL requires frequency, midpointWeek < durationWeeks, endDate > startDate)
- Created `lib/utils/csv.ts` — `parseCSV()` for student roster imports (splits on commas, validates required columns)
- Created `lib/utils/progress.ts` — pure calculation functions: `calculateTotalPeriods()`, `calculateCurrentPeriod()`, `calculateTrend()`, `calculatePeriodStatuses()` (reusable by Phase 5 store)
- Created 14 API route files:
  - `/api/students` (GET w/ search, POST), `/api/students/[id]` (GET/PUT/DELETE), `/api/students/import` (POST CSV)
  - `/api/clerkships` (GET w/ type filter, POST), `/api/clerkships/[id]` (GET/PUT/DELETE)
  - `/api/rotations` (GET w/ filters, POST), `/api/rotations/[id]` (GET/PUT/DELETE)
  - `/api/enrollments` (GET w/ filters, POST), `/api/enrollments/[id]` (GET/PUT/DELETE)
  - `/api/enrollments/[id]/evaluations` (GET, POST — sets evaluatorId from session)
  - `/api/evaluations/[id]` (GET/PUT/DELETE — guards against editing submitted evaluations)
  - `/api/evaluations/[id]/submit` (POST — sets isComplete=true, isDraft=false, submittedAt=now())
  - `/api/progress/[enrollmentId]` (GET — returns full `StudentProgressView` with trend calculation)
  - `/api/generate-summary` (POST — stub returning 501, Phase 7 implements)
- All routes use `requireAuth()`, Zod validation on POST/PUT, `handlePrismaError()` in catch blocks
- Consistent error format: `{ error: string, details?: Record<string, string[]> }`
- Build clean, all 164 tests pass unchanged

## Phase 5 Summary (State Management)

Implemented 2026-02-06:
- Created `lib/stores/longitudinalStore.ts` — main Zustand store for longitudinal data:
  - Mode toggle (`single` | `longitudinal`), persisted to localStorage
  - Current context: `currentStudent`, `currentEnrollment`, `currentRotation`, `currentClerkship`
  - Entity lists: `students[]`, `clerkships[]`, `rotations[]`
  - Enrollment data: `evaluations[]`, `summaries[]`
  - Async actions: `loadStudents()`, `loadClerkships()`, `loadRotations()`, `loadStudentProgress()`, `saveEvaluation()`, `submitEvaluation()`, `generateSummary()`
  - Computed getters: `getProgressView()`, `getPeriodStatuses()`, `getPerformanceTrend()`
  - All async actions check `response.ok` and throw with API error message on failure
  - Reuses `calculateTotalPeriods`, `calculateCurrentPeriod`, `calculateTrend`, `calculatePeriodStatuses` from `lib/utils/progress.ts`
- Modified `lib/stores/evaluationStore.ts` — added longitudinal context:
  - Optional fields: `enrollmentId`, `periodNumber`
  - Actions: `setLongitudinalContext()`, `clearLongitudinalContext()`, `saveToDatabase()`, `loadFromDatabase()`
  - `saveToDatabase()` converts UI lowercase performance levels to API uppercase via `toDbPerformanceLevel()`
  - `loadFromDatabase()` hydrates store from API evaluation data (criteria selection, attributes, narratives)
  - Both `resetForm()` and `resetAll()` clear longitudinal context
- Build clean, all 164 tests pass unchanged

## Phase 6 Summary (UI Components)

Implemented 2026-02-06:
- Extended `lib/stores/navigationStore.ts` — `currentTab` type widened from `NavigationTab` to `LongitudinalNavigationTab` (backward-compatible union)
- Updated `components/layout/Sidebar.tsx` — mode-conditional navigation:
  - Single mode: existing 8-tab workflow (unchanged)
  - Longitudinal mode: Dashboard, Students, Progress, Mid-Course, End-Course, Settings
  - Context footer shows current student name (longitudinal) or template name (single)
  - Enrollment-required tabs (Progress, Mid-Course, End-Course) disabled until enrollment loaded
- Updated `components/layout/MainContent.tsx` — routes to 5 new longitudinal views
- Updated `components/settings/SettingsView.tsx` — Workflow Mode toggle card between Appearance and Narrative Length
- Updated `components/layout/NavigationButtons.tsx` — cast fix for widened tab type (existing `indexOf === -1 → null` behavior preserved)
- Created `components/longitudinal/DashboardView.tsx` — quick stats (students, rotations, enrollments, completion rate) + active rotations list with progress bars
- Created `components/longitudinal/StudentListView.tsx` — searchable student list with debounced search, expandable enrollment sections, enrollment → progress navigation
- Created `components/longitudinal/CSVImportModal.tsx` — modal for CSV paste/upload, preview, import via `/api/students/import`, results display
- Created `components/longitudinal/StudentProgressView.tsx` — full progress detail: info cards, completion bar, period timeline, performance chart, evaluations list with performance badges, summaries section with Phase 7 placeholder buttons
- Created `components/longitudinal/PeriodTimeline.tsx` — horizontal timeline of connected circles, color-coded by performance level (green/purple/red/orange/gray), current period pulse animation, hover tooltips
- Created `components/longitudinal/PerformanceChart.tsx` — pure SVG line chart (no new dependencies), Y-axis: Fail/Pass/Honors levels, colored data points, optional midpoint reference line
- Created `components/longitudinal/MidCourseSummaryView.tsx` — stub placeholder for Phase 7
- Created `components/longitudinal/EndCourseSummaryView.tsx` — stub placeholder for Phase 7
- No new npm dependencies added
- Build clean, all 164 tests pass unchanged

## Phase 7 Summary (AI Summary Generation)

Implemented 2026-02-07:
- Replaced 501 stub in `app/api/generate-summary/route.ts` with full implementation:
  - Fetches enrollment + student + rotation + clerkship + completed evaluations from DB
  - Resolves `selectedCriteriaIds` to human-readable names via `defaultTemplates`
  - Builds system/user prompts calibrated for mid-course vs end-of-course summary types
  - Calls OpenRouter (`openai/gpt-oss-120b:nitro`) non-streaming, requesting structured JSON output
  - Parses response into `strengthsSummary`, `growthAreasSummary`, `progressNarrative`, `recommendations`
  - Calculates `overallPerformance` as mode (most common) of evaluation performance levels
  - Saves `ProgressSummary` record to DB with `authorId` from session
  - Mid-course filters evaluations up to midpoint period; end-of-course uses all evaluations
- Created `app/api/summaries/[id]/route.ts` — GET (fetch single summary) and PUT (update edited fields), both protected with `requireAuth()`
- Added `updateSummarySchema` to `lib/validations/schemas.ts` — validates optional nullable fields for strengths, growth areas, narrative, edited narrative, recommendations
- Relaxed `authorName` in `generateSummarySchema` to optional (falls back to session user name)
- Added `updateSummary` action to `lib/stores/longitudinalStore.ts` — PUTs edited summary content back to `/api/summaries/[id]`, updates local summaries array
- Replaced placeholder in `components/longitudinal/MidCourseSummaryView.tsx` with full UI:
  - Shows completed evaluations list with performance badges
  - "Generate Mid-Course Summary" button with loading state
  - Editable sections: Strengths Summary, Growth Areas, Progress Narrative
  - "Save Edits" button persists changes, "Regenerate" button creates new summary
  - Guards: requires at least 1 completed evaluation
- Replaced placeholder in `components/longitudinal/EndCourseSummaryView.tsx` with full UI:
  - Same as Mid-Course plus additional "Recommendations" section
  - Uses all completed evaluations (not filtered to midpoint)
- Updated `components/longitudinal/StudentProgressView.tsx`:
  - Removed "Coming in Phase 7" disabled buttons with tooltips
  - Enabled "Generate Mid-Course" and "Generate End-Course" buttons
  - Buttons navigate to `mid-course` / `end-course` tabs respectively
  - Conditionally disabled when no completed evaluations exist
- No new npm dependencies added
- Build clean, all 164 tests pass unchanged

## Phase 8 Summary (Verification & Testing)

Implemented 2026-02-07:
- Created 5 new test files with 142 tests covering all Phase 4-7 business logic:
  - `__tests__/progress.test.ts` (34 tests) — `getPeriodDays`, `calculateTotalPeriods`, `calculateCurrentPeriod`, `calculateTrend`, `calculatePeriodStatuses`
  - `__tests__/csv.test.ts` (16 tests) — `parseCSV` happy path, errors, whitespace, partial rows, case-insensitive headers
  - `__tests__/schemas.test.ts` (41 tests) — All Zod schemas including refinement rules (LONGITUDINAL requires frequency, midpointWeek < durationWeeks, endDate > startDate)
  - `__tests__/apiHelpers.test.ts` (13 tests) — `apiError`, `validationError`, `handlePrismaError` (P2002→409, P2025→404, P2003→400, unknown→500)
  - `__tests__/longitudinalStore.test.ts` (38 tests) — Zustand store: initial state, setters, all async fetch actions (mocked), computed getters
- Total: 306 tests across 11 test files (142 new + 164 existing), all passing
- Build clean, no TypeScript errors in tests
- No source files modified — test-only additions

## Phase 9 Summary (Single ↔ Longitudinal Integration)

Implemented 2026-02-09:

The single evaluation workflow and longitudinal tracking system were completely siloed. This phase bridges them so evaluations flow naturally into longitudinal records, and the longitudinal system is fully usable without raw API calls.

### Bug Fix
- Fixed `app/api/students/route.ts` GET handler — was not including enrollments. Added `include: { enrollments: { include: { rotation: { include: { clerkship: true } } } } }` so `StudentListView` enrollment display works.

### P1: Manual Student Creation
- **New:** `components/longitudinal/AddStudentModal.tsx` — modal form (name, email, medicalSchoolId), POSTs to existing `/api/students`
- **Modified:** `components/longitudinal/StudentListView.tsx` — added "Add Student" button (UserPlus icon) next to "Import CSV", updated empty state text

### P2: Clerkship / Rotation / Enrollment Setup UI
- **New:** `components/longitudinal/SetupClerkshipModal.tsx` — template dropdown auto-fills name/templateId, type select, duration, midpoint week, eval frequency (required for LONGITUDINAL type)
- **New:** `components/longitudinal/SetupRotationModal.tsx` — clerkship dropdown, start/end dates, academic year
- **New:** `components/longitudinal/EnrollStudentModal.tsx` — student search/select, rotation select (shows "Clerkship - AY - dates"), start date defaults to rotation start
- **Modified:** `components/longitudinal/DashboardView.tsx` — "Quick Setup" card with 3 action buttons (New Clerkship, New Rotation, Enroll Student), buttons disable when prerequisites missing, updated empty state text
- **Modified:** `components/longitudinal/StudentListView.tsx` — "Enroll in Rotation" button in each student's expanded section
- **Modified:** `lib/stores/longitudinalStore.ts` — added `createStudent()`, `createClerkship()`, `createRotation()`, `createEnrollment()` store actions (thin wrappers that POST to existing API endpoints and update local arrays), added `isInEvaluationFlow` state + setter

### P3: Bridge Single → Longitudinal (Export Tab)
- **New:** `components/longitudinal/SaveToRecordModal.tsx` — 3-step wizard: (1) search/create student, (2) select enrollment with template-match highlighting, (3) confirm with period number and Save as Draft / Save & Submit
- **Modified:** `lib/stores/evaluationStore.ts` — `saveToDatabase()` now accepts optional `{ evaluatorName, submit }` options and returns created evaluation ID; added `lastSavedEvaluationId` state field
- **Modified:** `components/export/ExportReportView.tsx` — added "Save to Student Record" button below Export PDF button, opens `SaveToRecordModal`

### P4: Longitudinal Evaluation Using Single Eval Form
- **Modified:** `components/longitudinal/StudentProgressView.tsx` — "New Evaluation" button in Evaluations card header; finds matching template, loads into evaluationStore, sets longitudinal context, enters evaluation flow
- **Modified:** `lib/stores/longitudinalStore.ts` — added `isInEvaluationFlow: boolean` state + `setIsInEvaluationFlow` setter
- **Modified:** `components/layout/Sidebar.tsx` — when `mode === 'longitudinal' && isInEvaluationFlow`: shows hybrid nav with "Back to Progress" button + evaluation/attributes/narrative/summary/generate tabs (skips templates/export/settings)
- **Modified:** `components/generate/AIGenerationView.tsx` — when `enrollmentId` is set and in evaluation flow: shows "Save & Return to Progress" button after narrative generation; saves to DB, reloads progress data, navigates back

### P5: Evaluation Detail Modal
- **New:** `components/longitudinal/EvaluationDetailModal.tsx` — fetches `GET /api/evaluations/{id}` on open; displays read-only view of header info, selected criteria (resolved from `defaultTemplates`), selected attributes (resolved from `defaultPersonalAttributes`), narrative context, generated narrative, edited narrative; "Edit" button for drafts enters P4 evaluation flow
- **Modified:** `components/longitudinal/StudentProgressView.tsx` — wired the existing "View" button (previously a no-op) to open `EvaluationDetailModal`

### Files Changed
- **New files (6):** AddStudentModal, SetupClerkshipModal, SetupRotationModal, EnrollStudentModal, SaveToRecordModal, EvaluationDetailModal
- **Modified files (8):** `app/api/students/route.ts`, `StudentListView`, `DashboardView`, `longitudinalStore`, `evaluationStore`, `ExportReportView`, `Sidebar`, `AIGenerationView`, `StudentProgressView`
- Build clean, all 306 tests pass

## Pre-Launch Improvements (2026-02-11)

Implemented 5 parallel work streams to prepare for department-wide deployment:

### Stream A — Security & RBAC
- `requireAdmin()` middleware in `lib/api-auth.ts`, enforced on POST/PUT/DELETE across 8 API route files
- User Management API: `app/api/users/route.ts` (GET list, POST create), `app/api/users/[id]/route.ts` (GET/PUT/DELETE)
- Token bucket rate limiting (`lib/rate-limit.ts`) on auth, generate-narrative, generate-summary
- Audit logging: `AuditLog` Prisma model + `lib/audit.ts` fire-and-forget helper

### Stream B — Admin Management UI
- 4 admin views: `ClerkshipManagementView`, `RotationManagementView`, `EnrollmentManagementView`, `UserManagementView`
- 4 shared components: `DataTable` (sortable, paginated), `ConfirmDialog`, `FormModal`, `SearchFilter`
- `lib/stores/adminStore.ts` — Zustand store with full CRUD for all admin entities
- Role-gated "Administration" section in Sidebar, routing in MainContent

### Stream C — UX Polish & Accessibility
- Error boundaries: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`
- Skeleton components: `Skeleton`, `CardSkeleton`, `TableSkeleton`
- `Pagination` component + `parsePagination()` API helper (applied to students GET)
- `Select` component, `Breadcrumbs`, `useFocusTrap` hook
- ARIA: `aria-label` on nav, `aria-current="page"`, `aria-busy` on buttons, `aria-invalid`/`aria-describedby` on inputs

### Stream D — Export & Reporting
- `app/api/export-longitudinal-pdf/route.ts` — per-student progress PDF
- `app/api/export-cohort-pdf/route.ts` — cohort-level report PDF
- `app/api/export-data/route.ts` — CSV export (students/evaluations/enrollments/summaries), admin-only
- `components/longitudinal/ExportPanel.tsx` — download buttons in StudentProgressView

### Stream E — E2E Testing (Playwright)
- `playwright.config.ts` — Chromium, webServer auto-start
- 16 tests across 4 spec files: `auth.spec.ts`, `single-evaluation.spec.ts`, `longitudinal-tracking.spec.ts`, `admin-management.spec.ts`
- Fixtures: `e2e/fixtures/test-data.ts`, `e2e/fixtures/setup.ts`

### Additional
- Migrated from `next lint` (removed in Next.js 16) to ESLint 9 flat config (`eslint.config.mjs`)
- Fixed React 19 hydration lint with `useSyncExternalStore` in SettingsView
- 332 unit tests passing (26 new), build clean, lint clean
- Remaining: install `@playwright/test` devDep, manual smoke testing
