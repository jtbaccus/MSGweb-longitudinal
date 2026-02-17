# Agent Prompt: Schema Change + Comprehensive Seed Script

**Status:** Ready to dispatch
**Target:** Claude Code agent in `projects/msgweb-longitudinal/`
**Estimated scope:** ~1 file modified (schema), ~8-10 files updated (references), 1 file rewritten (seed.ts)

---

## Task: Schema change (evaluationFrequency → evaluationIntervalDays) + comprehensive seed script

You are working in `/home/jtbaccus/turing/projects/msgweb-longitudinal/`.

This is a two-part task:
1. Replace the `EvaluationFrequency` enum with a flexible numeric `evaluationIntervalDays` field
2. Rewrite `prisma/seed.ts` with comprehensive test data for smoke testing

---

### PART 1: Schema Change

**Goal:** Replace the rigid `EvaluationFrequency` enum (WEEKLY/BIWEEKLY/MONTHLY) with `evaluationIntervalDays: Int?` so any evaluation cadence can be expressed (e.g., every 21 days for ~3 week intervals).

**Read these files first to understand all references:**
- `prisma/schema.prisma`
- `lib/types/longitudinal.ts`
- `lib/validations/schemas.ts`
- `lib/utils/progress.ts`
- `lib/stores/longitudinalStore.ts`
- `components/longitudinal/SetupClerkshipModal.tsx`
- `components/admin/ClerkshipManagementView.tsx` (if it exists)

**Changes needed:**

1. **`prisma/schema.prisma`:**
   - Remove the `EvaluationFrequency` enum entirely
   - On the `Clerkship` model, replace `evaluationFrequency EvaluationFrequency?` with `evaluationIntervalDays Int?`
   - Add a comment: `// Days between evaluations (e.g., 7=weekly, 14=biweekly, 21=every 3 weeks)`

2. **`lib/types/longitudinal.ts`:**
   - Remove the `EvaluationFrequency` type alias
   - Update the `Clerkship` interface: replace `evaluationFrequency?` with `evaluationIntervalDays?: number`
   - Update `lib/types/index.ts` if it re-exports `EvaluationFrequency`

3. **`lib/validations/schemas.ts`:**
   - In `createClerkshipSchema`: replace the `evaluationFrequency` enum field with `evaluationIntervalDays: z.number().int().positive().optional()`
   - Update the refinement: LONGITUDINAL type should require `evaluationIntervalDays` (instead of `evaluationFrequency`)

4. **`lib/utils/progress.ts`:**
   - Find any functions that use `evaluationFrequency` to calculate periods (like `calculateTotalPeriods`, `calculateCurrentPeriod`)
   - Replace with logic based on `evaluationIntervalDays`:
     - `totalPeriods = Math.ceil((durationWeeks * 7) / evaluationIntervalDays)`
     - `currentPeriod = Math.ceil(daysSinceStart / evaluationIntervalDays)`
   - If there's a `getPeriodDays()` helper that maps enum → days, replace it with direct use of the interval

5. **`lib/stores/longitudinalStore.ts`:**
   - Update any references to `evaluationFrequency` → `evaluationIntervalDays`

6. **UI components** (SetupClerkshipModal, any admin views):
   - Replace the frequency dropdown/select with a numeric input for interval days
   - Label: "Evaluation Interval (days)" with helper text like "e.g., 7 = weekly, 14 = biweekly, 21 = every 3 weeks"
   - Only show when type is LONGITUDINAL (same conditional as before)

7. **Search the entire codebase** for any remaining references to `EvaluationFrequency`, `evaluationFrequency`, `WEEKLY`, `BIWEEKLY`, `MONTHLY` (in the context of this enum) and update them all.

---

### PART 2: Comprehensive Seed Script

**Rewrite `prisma/seed.ts`** to populate the database for smoke testing. The seed should be idempotent (safe to re-run).

**Clerkship data (real curriculum):**

| Clerkship | templateId | Type | Duration | Midpoint | intervalDays |
|-----------|-----------|------|----------|----------|--------------|
| Internal Medicine | `internal-medicine` | MULTI_WEEK | 8 wks | 4 | 7 |
| Surgery | `surgery` | MULTI_WEEK | 8 wks | 4 | 7 |
| Neurology | `neurology` | LONGITUDINAL | 24 wks | 12 | 21 |
| Family Medicine | `family-medicine` | LONGITUDINAL | 24 wks | 12 | 21 |
| Psychiatry | `psychiatry` | LONGITUDINAL | 24 wks | 12 | 21 |
| Pediatrics | `pediatrics` | LONGITUDINAL | 24 wks | 12 | 21 |
| OB/GYN | `ob-gyn` | LONGITUDINAL | 24 wks | 12 | 21 |

**Users (4):**
- `admin@example.com` — "Admin", ADMIN, mustChangePassword: true, password: "changeme"
- `jon@example.com` — "Dr. Jon Baccus", ADMIN, mustChangePassword: false, password: "password123"
- `sarah@example.com` — "Dr. Sarah Chen", USER, mustChangePassword: false, password: "password123"
- `michael@example.com` — "Dr. Michael Torres", USER, mustChangePassword: false, password: "password123"

**Rotations (5-6):**
- IM Block 1: Jan 12 – Mar 8 2026, academicYear "2025-2026"
- Surgery Block 1: Mar 9 – May 3 2026, academicYear "2025-2026"
- Neurology Longitudinal: Aug 4 2025 – Jan 18 2026, academicYear "2025-2026"
- Family Medicine Longitudinal: Aug 4 2025 – Jan 18 2026, academicYear "2025-2026"
- Pediatrics Longitudinal: Aug 4 2025 – Jan 18 2026, academicYear "2025-2026"
- Psychiatry Longitudinal: Aug 4 2025 – Jan 18 2026, academicYear "2025-2026"

**Students (8):**
Realistic medical student names with emails (firstname.lastname@school.edu) and medicalSchoolIds (MS-2026-001 through -008).

**Enrollments (12-15):**
- 3-4 students in IM Block 1 (mix ACTIVE/COMPLETED)
- 2-3 students in Surgery Block 1 (mix ACTIVE/COMPLETED)
- 3-4 students in Neurology longitudinal (mostly COMPLETED, 1 ACTIVE)
- 2-3 students spread across FM/Peds/Psych (mix)
- 1 WITHDRAWN enrollment somewhere
- Respect unique constraint: (studentId, rotationId)

**Evaluations (30-40):**
For each enrollment, create evaluations appropriate to the clerkship type:

*Longitudinal enrollments (24 wks, eval every 21 days = ~8 eval periods):*
- COMPLETED students: 6-8 evaluations spanning periods 1-8
- ACTIVE students: 3-4 evaluations
- Create a progression story: one student trending PASS → HONORS, one steady PASS, one with an early FAIL then recovery

*Block enrollments (8 wks, weekly = 8 eval periods):*
- COMPLETED: 4-6 evaluations
- ACTIVE: 2-3 evaluations

For each evaluation:
- `evaluatorId` + `evaluatorName`: rotate among the 3 faculty users
- `performanceLevel`: FAIL, PASS, or HONORS (UPPERCASE)
- `selectedCriteriaIds`: pick realistic IDs from the correct template:
  - HONORS: pick 4-8 from `{prefix}-h-*` IDs (e.g., `im-h-prof-1`, `im-h-cdt-2`)
  - PASS: pick 6-10 from `{prefix}-p-*` IDs
  - FAIL: pick 3-5 from `{prefix}-f-*` IDs
  - For placeholder templates (surgery, pediatrics, etc.) with only 3 criteria: use all 3 (e.g., `surgery-1`, `surgery-2`, `surgery-3`)
- `selectedAttributeIds`: pick 3-6 from `attr-1` through `attr-26`
- `templateId`: match the clerkship (`internal-medicine`, `neurology`, etc.)
- `narrativeContext`: 1-2 sentence evaluator notes for ~60% of evals, null for rest
- `generatedNarrative`: realistic 120-190 word narrative paragraph for ~50% of evals
- `editedNarrative`: slightly modified narrative for ~25%, null for rest
- `isComplete`/`isDraft`/`submittedAt`: ~80% submitted (isComplete:true, isDraft:false, submittedAt=evaluationDate), ~20% drafts
- `evaluationDate`: spread across the rotation period realistically

**ProgressSummaries (4-6):**
For completed enrollments with sufficient evaluations:
- 2 MID_COURSE (for students past midpoint)
- 2-3 END_OF_COURSE (for fully completed enrollments)
- 1 PROGRESS (mid-rotation check-in)

Each with:
- `evaluationsIncluded`: array of relevant evaluation IDs
- `overallPerformance`: mode of included evals
- `strengthsSummary`: 100-200 word paragraph
- `growthAreasSummary`: 50-150 word paragraph
- `progressNarrative`: 150-250 word paragraph
- `recommendations`: 100-150 words (END_OF_COURSE only), null for others
- `authorId`/`authorName`: match to a User

**Seed script structure:**
```typescript
// 1. Delete existing data (reverse dependency order):
//    AuditLog → ProgressSummary → Evaluation → StudentEnrollment → Student → Rotation → Clerkship
//    (Keep Users — use upsert for those)
// 2. Upsert Users
// 3. Create Clerkships
// 4. Create Rotations (need clerkship IDs)
// 5. Create Students
// 6. Create Enrollments (need student + rotation IDs)
// 7. Create Evaluations (need enrollment + user IDs)
// 8. Create ProgressSummaries (need enrollment + evaluation + user IDs)
// Console.log counts at each step
```

Use `prisma.$transaction()` if helpful, but individual creates are fine since we need IDs back for relations.

### Verification:
- `npx prisma generate` must succeed
- `npm run build` must pass with no TypeScript errors
- All existing tests must still pass (`npm test`)
- Run the seed if database is accessible: `npx tsx prisma/seed.ts`
