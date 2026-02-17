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
// Helpers (same pattern as progress.test.ts)
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
// calculateTotalPeriods — edge cases
// ---------------------------------------------------------------------------

describe('calculateTotalPeriods edge cases', () => {
  it('returns 1 when evaluationIntervalDays is undefined', () => {
    const c = makeClerkship({ evaluationIntervalDays: undefined })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('returns 1 when evaluationIntervalDays is 0 (falsy)', () => {
    const c = makeClerkship({ evaluationIntervalDays: 0 })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('handles very short enrollment: 1 week with 1-day interval = 7 periods', () => {
    const c = makeClerkship({ durationWeeks: 1, evaluationIntervalDays: 1 })
    expect(calculateTotalPeriods(c)).toBe(7)
  })

  it('handles very long enrollment: 52 weeks with 7-day interval = 52 periods', () => {
    const c = makeClerkship({ durationWeeks: 52, evaluationIntervalDays: 7 })
    expect(calculateTotalPeriods(c)).toBe(52)
  })

  it('handles extremely long enrollment: 104 weeks with 28-day interval', () => {
    const c = makeClerkship({ durationWeeks: 104, evaluationIntervalDays: 28 })
    // 104*7 = 728 days / 28 = 26
    expect(calculateTotalPeriods(c)).toBe(26)
  })

  it('returns 1 when interval equals total days exactly', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 28 })
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('returns 1 when interval exceeds total days', () => {
    const c = makeClerkship({ durationWeeks: 2, evaluationIntervalDays: 28 })
    // ceil(14/28) = 1
    expect(calculateTotalPeriods(c)).toBe(1)
  })

  it('handles interval of 365 days with 52 weeks', () => {
    const c = makeClerkship({ durationWeeks: 52, evaluationIntervalDays: 365 })
    // 52*7 = 364 / 365 = 0.997 -> ceil = 1
    expect(calculateTotalPeriods(c)).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// calculateCurrentPeriod — edge cases
// ---------------------------------------------------------------------------

describe('calculateCurrentPeriod edge cases', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 1 when evaluationIntervalDays is undefined', () => {
    const c = makeClerkship({ evaluationIntervalDays: undefined })
    expect(calculateCurrentPeriod(new Date(), c)).toBe(1)
  })

  it('day 0: enrollment start date = today returns period 1', () => {
    vi.useFakeTimers()
    const today = new Date('2025-06-01')
    vi.setSystemTime(today)
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(today, c)).toBe(1)
  })

  it('last day of enrollment returns the last period', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    // 8 weeks = 56 days. Last day = start + 55 days = Mar 2
    const lastDay = new Date('2025-03-02')
    vi.setSystemTime(lastDay)
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    // days elapsed = 55, period = floor(55/7)+1 = 7+1 = 8 = total
    expect(calculateCurrentPeriod(start, c)).toBe(8)
  })

  it('past end date clamps to total periods', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    vi.setSystemTime(new Date('2026-01-01'))
    const c = makeClerkship({ durationWeeks: 8, evaluationIntervalDays: 7 })
    expect(calculateCurrentPeriod(start, c)).toBe(8)
  })

  it('very short enrollment (1 day interval, 1 week): day 3 = period 4', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-06')
    vi.setSystemTime(new Date('2025-01-09')) // 3 days later
    const c = makeClerkship({ durationWeeks: 1, evaluationIntervalDays: 1 })
    expect(calculateCurrentPeriod(start, c)).toBe(4)
  })

  it('very long enrollment (52 weeks) on day 200', () => {
    vi.useFakeTimers()
    const start = new Date('2025-01-01')
    vi.setSystemTime(new Date('2025-07-20'))
    const c = makeClerkship({ durationWeeks: 52, evaluationIntervalDays: 7 })
    // days elapsed = 200, period = floor(200/7)+1 = 28+1 = 29
    expect(calculateCurrentPeriod(start, c)).toBe(29)
  })
})

// ---------------------------------------------------------------------------
// calculateTrend — edge cases
// ---------------------------------------------------------------------------

describe('calculateTrend edge cases', () => {
  it('handles unknown performance level by defaulting to score 1', () => {
    // The code: levelToScore[e.performanceLevel] ?? 1
    // lowercase 'pass' is not in the map (keys are FAIL/PASS/HONORS), defaults to 1
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'pass' }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'pass' }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('exactly 2 evals with same level = stable', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('exactly 3 evals: mid=1, first=[e1], second=[e2,e3]', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'HONORS' as any }),
    ]
    // mid=1, first=[FAIL(0)] avg=0, second=[HONORS(2),HONORS(2)] avg=2, diff=2
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('handles large number of evaluations (20+)', () => {
    const evals = Array.from({ length: 20 }, (_, i) =>
      makeEvaluation({
        id: `e${i}`,
        periodNumber: i + 1,
        performanceLevel: 'PASS' as any,
      })
    )
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('all FAIL evaluations = stable', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'FAIL' as any }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('all HONORS evaluations = stable', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'HONORS' as any }),
    ]
    expect(calculateTrend(evals)).toBe('stable')
  })

  it('mix of complete and incomplete: only 1 complete = insufficient_data', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, isComplete: false }),
      makeEvaluation({ id: 'e3', periodNumber: 3, isComplete: false }),
      makeEvaluation({ id: 'e4', periodNumber: 4, isComplete: false }),
    ]
    expect(calculateTrend(evals)).toBe('insufficient_data')
  })

  it('duplicate periodNumbers are still counted', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 2, performanceLevel: 'HONORS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 2, performanceLevel: 'HONORS' as any }),
    ]
    // sorted: [FAIL,FAIL,HONORS,HONORS], mid=2, first avg=0, second avg=2, diff=2
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('boundary: diff exactly +0.5 is improving', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'PASS' as any }),
    ]
    // first=[FAIL(0),PASS(1)] avg=0.5, second=[PASS(1),PASS(1)] avg=1.0, diff=0.5
    expect(calculateTrend(evals)).toBe('improving')
  })

  it('boundary: diff exactly -0.5 is declining', () => {
    const evals = [
      makeEvaluation({ id: 'e1', periodNumber: 1, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e2', periodNumber: 2, performanceLevel: 'PASS' as any }),
      makeEvaluation({ id: 'e3', periodNumber: 3, performanceLevel: 'FAIL' as any }),
      makeEvaluation({ id: 'e4', periodNumber: 4, performanceLevel: 'PASS' as any }),
    ]
    // first=[PASS(1),PASS(1)] avg=1, second=[FAIL(0),PASS(1)] avg=0.5, diff=-0.5
    expect(calculateTrend(evals)).toBe('declining')
  })
})

// ---------------------------------------------------------------------------
// calculatePeriodStatuses — edge cases
// ---------------------------------------------------------------------------

describe('calculatePeriodStatuses edge cases', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('single period spans entire duration when evaluationIntervalDays is null', () => {
    const c = makeClerkship({ evaluationIntervalDays: null, durationWeeks: 8 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses).toHaveLength(1)
    expect(statuses[0].periodNumber).toBe(1)
    const daysDiff = (statuses[0].periodEnd.getTime() - statuses[0].periodStart.getTime()) / 86400000
    expect(daysDiff).toBe(56)
  })

  it('single status when evaluationIntervalDays is undefined', () => {
    const c = makeClerkship({ evaluationIntervalDays: undefined, durationWeeks: 4 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses).toHaveLength(1)
  })

  it('handles many periods correctly (52 weeks, 7-day interval)', () => {
    const c = makeClerkship({ durationWeeks: 52, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses).toHaveLength(52)
    for (let i = 0; i < 52; i++) {
      expect(statuses[i].periodNumber).toBe(i + 1)
    }
  })

  it('multiple evaluations for different periods are each matched', () => {
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const eval1 = makeEvaluation({ id: 'e1', periodNumber: 1 })
    const eval3 = makeEvaluation({ id: 'e3', periodNumber: 3 })
    const statuses = calculatePeriodStatuses(en, c, [eval1, eval3])
    expect(statuses[0].hasEvaluation).toBe(true)
    expect(statuses[0].evaluation).toBe(eval1)
    expect(statuses[1].hasEvaluation).toBe(false)
    expect(statuses[2].hasEvaluation).toBe(true)
    expect(statuses[2].evaluation).toBe(eval3)
    expect(statuses[3].hasEvaluation).toBe(false)
  })

  it('evaluation for non-existent period is silently ignored', () => {
    const c = makeClerkship({ durationWeeks: 2, evaluationIntervalDays: 7 })
    const en = makeEnrollment()
    const eval5 = makeEvaluation({ id: 'e5', periodNumber: 5 })
    const statuses = calculatePeriodStatuses(en, c, [eval5])
    expect(statuses).toHaveLength(2)
    expect(statuses[0].hasEvaluation).toBe(false)
    expect(statuses[1].hasEvaluation).toBe(false)
  })

  it('future start date: period 1 is current, rest are future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01'))
    const futureStart = new Date('2025-06-01')
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: futureStart })
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses[0].isCurrent).toBe(true)
    expect(statuses[1].isFuture).toBe(true)
    expect(statuses[2].isFuture).toBe(true)
    expect(statuses[3].isFuture).toBe(true)
  })

  it('past end date: last period is current, no future periods', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
    const start = new Date('2025-01-06')
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: start })
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses[3].isCurrent).toBe(true)
    expect(statuses.filter((s) => s.isFuture)).toHaveLength(0)
  })

  it('period dates are contiguous with no gaps', () => {
    const start = new Date('2025-03-01')
    const c = makeClerkship({ durationWeeks: 4, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: start })
    const statuses = calculatePeriodStatuses(en, c, [])
    for (let i = 1; i < statuses.length; i++) {
      expect(statuses[i].periodStart.getTime()).toBe(statuses[i - 1].periodEnd.getTime())
    }
  })

  it('first period starts on enrollment startDate', () => {
    const start = new Date('2025-05-15')
    const c = makeClerkship({ durationWeeks: 2, evaluationIntervalDays: 7 })
    const en = makeEnrollment({ startDate: start })
    const statuses = calculatePeriodStatuses(en, c, [])
    expect(statuses[0].periodStart.toISOString()).toBe(start.toISOString())
  })
})
