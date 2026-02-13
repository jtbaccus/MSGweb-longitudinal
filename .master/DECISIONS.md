# MSGweb-Longitudinal — Decisions Log

## D1: Evaluation Frequency → Interval Days (2026-02-12)

**Context:** Real curriculum has evaluations every ~3 weeks for longitudinal clerkships. The `EvaluationFrequency` enum (WEEKLY/BIWEEKLY/MONTHLY) doesn't accommodate this.

**Decision:** Replace `evaluationFrequency: EvaluationFrequency?` with `evaluationIntervalDays: Int?` on the Clerkship model. Remove the `EvaluationFrequency` enum entirely.

**Rationale:** Numeric interval is maximally flexible — handles any cadence without schema changes. Examples: 7=weekly, 14=biweekly, 21=every 3 weeks, 30=monthly.

**Impact:** Schema migration, validation schemas, types, progress calculation utils, UI components (SetupClerkshipModal, admin views).

---

## D2: Clerkship Curriculum Mapping (2026-02-12)

**Context:** Mapped Jon's actual medical school curriculum to the data model.

**Decision:**

| Clerkship | Type | Duration | Midpoint | Interval |
|-----------|------|----------|----------|----------|
| Internal Medicine | MULTI_WEEK | 8 wks | 4 | 7 days |
| Surgery | MULTI_WEEK | 8 wks | 4 | 7 days |
| Neurology | LONGITUDINAL | 24 wks | 12 | 21 days |
| Family Medicine | LONGITUDINAL | 24 wks | 12 | 21 days |
| Psychiatry | LONGITUDINAL | 24 wks | 12 | 21 days |
| Pediatrics | LONGITUDINAL | 24 wks | 12 | 21 days |
| OB/GYN | LONGITUDINAL | 24 wks | 12 | 21 days |

**Key facts:**
- Longitudinal clerkships are 24 weeks (not 26) — holiday/special topic weeks excluded
- IM and Surgery are traditional 8-week blocks with weekly evals
- Neurology, FM, Psychiatry are fully integrated 6-month (24-week) rotations
- Pediatrics and OB/GYN are hybrids (4 weeks immersion + integrated time) but combine into a single grade → modeled as LONGITUDINAL

---

## D3: Seed Data Scope (2026-02-12)

**Context:** Need comprehensive test data for smoke testing all features without manual form entry.

**Decision:** Seed all 7 clerkships, 4 faculty users, 8 students, 5-6 rotations, 12-15 enrollments, 30-40 evaluations, 4-6 progress summaries. Include progression stories (PASS→HONORS, FAIL→recovery), mix of draft/submitted, mix of ACTIVE/COMPLETED/WITHDRAWN statuses.
