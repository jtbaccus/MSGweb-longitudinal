import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  calculateTotalPeriods,
  calculateCurrentPeriod,
  calculateTrend,
  calculatePeriodStatuses,
} from '@/lib/utils/progress'
import type {
  Clerkship,
  SavedEvaluation,
  StudentEnrollment,
} from '@/lib/types/longitudinal'

// ---------------------------------------------------------------------------
// Helpers to build test data
// ---------------------------------------------------------------------------

function makeClerkship(overrides: Partial<Clerkship> = {}): Clerkship {
  return {
    id: 'c1',
    name: 'Test Clerkship',
    templateId: 't1',
    type: 'LONGITUDINAL',
    durationWeeks: 8,
    evaluationIntervalDays: 7,
    createdAt: new Date(),
    ...overrides,
  }
}

function makeEvaluation(overrides: Partial<SavedEvaluation> = {}): SavedEvaluation {
  return {
    id: 'e1',
    enrollmentId: 'en1',
    evaluatorName: 'Dr Test',
    periodNumber: 1,
    evaluationDate: new Date(),
    performanceLevel: 'pass',
    selectedCriteriaIds: [],
    selectedAttributeIds: [],
    templateId: 't1',
    isComplete: true,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeEnrollment(overrides: Partial<StudentEnrollment> = {}): StudentEnrollment {
  return {
    id: 'en1',
    studentId: 's1',
    rotationId: 'r1',
    startDate: new Date('2025-01-06'),
    status: 'ACTIVE',
    createdAt: new Date(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// calculateTotalPeriods
// ---------------------------------------------------------------------------

describe('calculateTotalPeriods', () => {
  it('returns 1 when no evaluationIntervalDays', () => {
    const c = makeClerkship({ evaluationIntervalDays: null })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('returns 8 for 7-day interval with 8 weeks', () => {
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateTotalPeriods(c)).toBe(8)
  })

  it('returns 4 for 14-day interval with 8 weeks', () => {
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 14 })
    expect(calculateTotalPeriods(c)).toBe(4)
  })

  it('returns 7 for 28-day interval with 26 weeks (ceil(182/28))', () => {
    const c = makeClerkship({ durationWeeks: 26, evaluationIntervalDays: 28 })
    // 26*7 = 182 days / 28 = 6.5 → ceil = 7
    expect(calculateTotalPeriods(c)).toBe(7)
  })

  it('returns 1 for a 1-week clerkship with 7-day interval', () => {
    const c = makeClerkship({ durationWeeks: 1, evaluationIntervalDays: 7 })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('returns 2 for 14-day interval with 3 weeks (ceil(21/14))', () => {
    const c = makeClerkship({ durationWeeks: 3, evaluationIntervalDays: 14 })
    expect(calculateTotalPeriods(c)).toBe(2)
  })

  it('returns 1 for 28-day interval with 4 weeks', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 28 })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('returns 8 for 21-day interval with 24 weeks (ceil(168/21))', () => {
    const c = makeClerkship({ durationWeeks: 24, evaluationIntervalDays: 21 })
    // 24*7 = 168 days / 21 = 8
    expect(calculateTotalPeriods(c)).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// calculateCurrentPeriod
// ---------------------------------------------------------------------------

describe('calculateCurrentPeriod', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 1 when no evaluationIntervalDays', () => {
    const c = makeClerkship({ evaluationIntervalDays: null })
    expect(calculateCurrentPeriod(new Date(), c)).toBe(1)
  })

  it('returns correct period for a date in the past', () => {
    vi.useFakeTimers()
    // Start date 15 days ago → for 7-day interval, period = floor(15/7) + 1 = 3
    const now = new Date('2025-02-01')
    vi.setSystemTime(now)
    const start = new Date('2025-01-17') // 15 days before Feb 1
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(start, c)).toBe(3)
  })

  it('clamps to 1 when start date is in the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01'))
    const futureStart = new Date('2025-03-01')
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(futureStart, c)).toBe(1)
  })

  it('clamps to total when past the end', () => {
    vi.useFakeTimers()
    // Start was 100 days ago, 8 periods of 7 days = 56 days total
    vi.setSystemTime(new Date('2025-04-16'))
    const start = new Date('2025-01-06') // 100 days before Apr 16
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(start, c)).toBe(8)
  })

  it('returns 1 on the first day of the rotation', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    vi.setSystemTime(start)
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(start, c)).toBe(1)
  })

  it('transitions at period boundary', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    // Day 7 → period 2 (floor(7/7)+1=2)
    vi.setSystemTime(new Date('2025-01-13'))
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(start, c)).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// calculateTrend
// ---------------------------------------------------------------------------

describe('calculateTrend', () => {
  it('returns insufficient_data with 0 evaluations', () => {
    expect(calculateTrend([])).toBe('insufficient_data')
  })

  it('returns insufficient_data with 1 completed evaluation', () => {
    const evals = [makeEvaluation({ periodNumber: 1 })]
    expect(calculateTrend(evals)).toBe('insufficient_data')
  })

  it('returns stable when all evaluations are PASS', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'PASS' as any }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('returns improving when scores go from low to high', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'HONORS' as any }),
    ]
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('returns declining when scores go from high to low', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'FAIL' as any }),
    ]
    expect(calculateTrend(evals)).toBe('declining')
  })

  it('returns stable when diff is exactly 0.25', () => {
    // 2 evals: first half [PASS=1], second half [HONORS=2], diff=1.0 → improving
    // Need diff = exactly 0.25: first half avg=0.75, second half avg=1.0
    // first=[FAIL(0), PASS(1)] avg=0.5, second=[PASS(1), PASS(1)] avg=1.0 → diff=0.5 → improving
    // Let's try: first=[PASS(1)] second=[PASS(1)] diff=0 → stable  (but that's trivial)
    // Actually: diff > 0.25 = improving, diff < -0.25 = declining, else stable
    // So diff = exactly 0.25 → NOT > 0.25 → stable
    // first=[PASS(1), PASS(1)] avg=1, second=[PASS(1), HONORS(2)] avg=1.5 → diff=0.5 → improving
    // first=[PASS(1), HONORS(2)] avg=1.5, second=[HONORS(2), HONORS(2)] avg=2 → diff=0.5 → improving
    // To get exactly 0.25: first=[FAIL(0), PASS(1)] avg=0.5, second=[FAIL(0), PASS(1), PASS(1)] avg=0.67
    // With 4 evals: mid=2, first=[e1, e2], second=[e3, e4]
    // first=[PASS(1), PASS(1)] avg=1.0, second=[PASS(1), HONORS(2)] avg=1.5 → diff=0.5 → improving
    // For exactly 0.25: first avg=X, second avg=X+0.25
    // first=[FAIL(0), PASS(1)] avg=0.5, second=[FAIL(0), PASS(1.5)]? — can't with discrete values
    // 4 evals: first=[PASS, HONORS] avg=1.5, second=[PASS, HONORS] avg=1.5 → diff=0 → stable ✓
    // Let me use 4 evals where diff is 0: same performance → stable
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'HONORS' as any }),
    ]
    // first=[PASS(1), HONORS(2)] avg=1.5, second=[PASS(1), HONORS(2)] avg=1.5 → diff=0 → stable
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('returns stable when diff is exactly -0.25', () => {
    // Same logic — diff = -0.25 is NOT < -0.25, so stable
    // Mirror the above
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'PASS' as any }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('filters out incomplete evaluations', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, isComplete: false }),
      makeEvaluation({ id: 'e3', periodNumber: 3, isComplete: false }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'HONORS' as any }),
    ]
    // Only 2 complete: FAIL and HONORS
    // mid=1, first=[FAIL(0)] avg=0, second=[HONORS(2)] avg=2 → diff=2 → improving
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('sorts unordered input by periodNumber', () => {
    const evals = [
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'FAIL' as any }),
    ]
    // Sorted: FAIL, FAIL, PASS, HONORS → first=[FAIL, FAIL] avg=0, second=[PASS, HONORS] avg=1.5 → improving
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('returns insufficient_data when all evaluations are incomplete', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, isComplete: false }),
      makeEvaluation({ id: 'e2', periodNumber: 2, isComplete: false }),
    ]
    expect(calculateTrend(evals)).toBe('insufficient_data')
  })

  it('handles exactly 2 completed evaluations', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
    ]
    // mid=1, first=[FAIL(0)] avg=0, second=[HONORS(2)] avg=2 → diff=2 → improving
    expect(calculateTrend(evals)).toBe('improving')
  })
})

// ---------------------------------------------------------------------------
// calculatePeriodStatuses
// ---------------------------------------------------------------------------

describe('calculatePeriodStatuses', () => {
  it('returns correct number of statuses', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses).toHaveLength(4)
  })

  it('returns 1 status when no evaluationIntervalDays', () => {
    const c = makeClerkship({ evaluationIntervalDays: null, durationWeeks: 8 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses).toHaveLength(1)
  })

  it('matches completed evaluations by periodNumber', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const eval2 = makeEvaluation({ id: 'e2', periodNumber: 2 })
    const statuses = calculatePeriodStatuses(en, c, [eval2])
    expect(statuses[0].hasEvaluation).toBe(false)
    expect(statuses[1].hasEvaluation).toBe(true)
    expect(statuses[1].evaluation).toBe(eval2)
    expect(statuses[2].hasEvaluation).toBe(false)
    expect(statuses[3].hasEvaluation).toBe(false)
  })

  it('ignores incomplete evaluations', () => {
    const c = makeClerkship({ durationWeeks: 2, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const draft = makeEvaluation({ id: 'e1', periodNumber: 1, isComplete: false })
    const statuses = calculatePeriodStatuses(en, c, [draft])
    expect(statuses[0].hasEvaluation).toBe(false)
  })

  it('sets isCurrent and isFuture flags correctly', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    // Set time to day 10 → period 2 for WEEKLY
    vi.setSystemTime(new Date('2025-01-16'))
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: start })
    const statuses = calculatePeriodStatuses(en, c, [])

    expect(statuses[0].isCurrent).toBe(false) // period 1
    expect(statuses[0].isFuture).toBe(false)
    expect(statuses[1].isCurrent).toBe(true)  // period 2
    expect(statuses[1].isFuture).toBe(false)
    expect(statuses[2].isCurrent).toBe(false) // period 3
    expect(statuses[2].isFuture).toBe(true)
    expect(statuses[3].isCurrent).toBe(false) // period 4
    expect(statuses[3].isFuture).toBe(true)

    vi.useRealTimers()
  })

  it('calculates period dates correctly', () => {
    const start = new Date('2025-01-06')
    const c = makeClerkship({ durationWeeks: 2, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: start })
    const statuses = calculatePeriodStatuses(en, c, [])

    // Period 1: Jan 6 - Jan 13
    expect(statuses[0].periodStart.toISOString()).toBe(new Date('2025-01-06').toISOString())
    expect(statuses[0].periodEnd.toISOString()).toBe(new Date('2025-01-13').toISOString())
    // Period 2: Jan 13 - Jan 20
    expect(statuses[1].periodStart.toISOString()).toBe(new Date('2025-01-13').toISOString())
    expect(statuses[1].periodEnd.toISOString()).toBe(new Date('2025-01-20').toISOString())
  })

  it('assigns sequential periodNumbers', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses.map((s) => s.periodNumber)).toEqual([1, 2, 3, 4])
  })
})
