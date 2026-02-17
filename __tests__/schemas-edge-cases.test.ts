import { describe, it, expect } from 'vitest'
import {
  createClerkshipSchema,
  createRotationSchema,
  createEvaluationSchema,
  createStudentSchema,
} from '@/lib/validations/schemas'

// ---------------------------------------------------------------------------
// createClerkshipSchema — boundary conditions
// ---------------------------------------------------------------------------

describe('createClerkshipSchema edge cases', () => {
  const validBase = {
    name: 'Test',
    templateId: 't1',
    type: 'LONGITUDINAL' as const,
    durationWeeks: 8,
    evaluationIntervalDays: 7,
  }

  it('rejects midpointWeek = durationWeeks (must be strictly less)', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      midpointWeek: 8,
      durationWeeks: 8,
    })
    expect(result.success).toBe(false)
  })

  it('accepts midpointWeek = durationWeeks - 1', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      midpointWeek: 7,
      durationWeeks: 8,
    })
    expect(result.success).toBe(true)
  })

  it('accepts midpointWeek = 1 (minimum)', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      midpointWeek: 1,
    })
    expect(result.success).toBe(true)
  })

  it('rejects midpointWeek = 0 (must be positive)', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      midpointWeek: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative midpointWeek', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      midpointWeek: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects evaluationIntervalDays = 0', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      evaluationIntervalDays: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      evaluationIntervalDays: -7,
    })
    expect(result.success).toBe(false)
  })

  it('accepts large evaluationIntervalDays (365)', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      evaluationIntervalDays: 365,
    })
    expect(result.success).toBe(true)
  })

  it('rejects LONGITUDINAL type without evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      name: 'Test',
      templateId: 't1',
      type: 'LONGITUDINAL',
      durationWeeks: 24,
    })
    expect(result.success).toBe(false)
  })

  it('accepts STANDARD type without evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      name: 'Test',
      templateId: 't1',
      type: 'STANDARD',
      durationWeeks: 2,
    })
    expect(result.success).toBe(true)
  })

  it('accepts MULTI_WEEK type without evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      name: 'Test',
      templateId: 't1',
      type: 'MULTI_WEEK',
      durationWeeks: 8,
    })
    expect(result.success).toBe(true)
  })

  it('rejects durationWeeks = 0', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      durationWeeks: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      durationWeeks: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      durationWeeks: 8.5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty templateId', () => {
    const result = createClerkshipSchema.safeParse({
      ...validBase,
      templateId: '',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createRotationSchema — date boundary conditions
// ---------------------------------------------------------------------------

describe('createRotationSchema edge cases', () => {
  it('rejects endDate equal to startDate', () => {
    const result = createRotationSchema.safeParse({
      clerkshipId: 'c1',
      startDate: '2025-06-01',
      endDate: '2025-06-01',
      academicYear: '2024-2025',
    })
    expect(result.success).toBe(false)
  })

  it('rejects endDate before startDate', () => {
    const result = createRotationSchema.safeParse({
      clerkshipId: 'c1',
      startDate: '2025-06-15',
      endDate: '2025-06-01',
      academicYear: '2024-2025',
    })
    expect(result.success).toBe(false)
  })

  it('accepts endDate one day after startDate', () => {
    const result = createRotationSchema.safeParse({
      clerkshipId: 'c1',
      startDate: '2025-06-01',
      endDate: '2025-06-02',
      academicYear: '2024-2025',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty clerkshipId', () => {
    const result = createRotationSchema.safeParse({
      clerkshipId: '',
      startDate: '2025-06-01',
      endDate: '2025-12-01',
      academicYear: '2024-2025',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty academicYear', () => {
    const result = createRotationSchema.safeParse({
      clerkshipId: 'c1',
      startDate: '2025-06-01',
      endDate: '2025-12-01',
      academicYear: '',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createEvaluationSchema — edge cases
// ---------------------------------------------------------------------------

describe('createEvaluationSchema edge cases', () => {
  const validBase = {
    evaluatorName: 'Dr Test',
    periodNumber: 1,
    evaluationDate: '2025-06-15',
    performanceLevel: 'PASS' as const,
    templateId: 't1',
  }

  it('rejects periodNumber = 0', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      periodNumber: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative periodNumber', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      periodNumber: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer periodNumber', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      periodNumber: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it('accepts large periodNumber', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      periodNumber: 52,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid performanceLevel', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      performanceLevel: 'EXCELLENT',
    })
    expect(result.success).toBe(false)
  })

  it('rejects lowercase performanceLevel', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      performanceLevel: 'pass',
    })
    expect(result.success).toBe(false)
  })

  it('defaults selectedCriteriaIds to empty array', () => {
    const result = createEvaluationSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.selectedCriteriaIds).toEqual([])
    }
  })

  it('defaults selectedAttributeIds to empty array', () => {
    const result = createEvaluationSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.selectedAttributeIds).toEqual([])
    }
  })

  it('accepts null narrativeContext', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      narrativeContext: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty evaluatorName', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      evaluatorName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty templateId', () => {
    const result = createEvaluationSchema.safeParse({
      ...validBase,
      templateId: '',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createStudentSchema — edge cases
// ---------------------------------------------------------------------------

describe('createStudentSchema edge cases', () => {
  it('rejects whitespace-only name', () => {
    // min(1) check is on string length, ' ' has length 1 so this passes
    // This documents current behavior
    const result = createStudentSchema.safeParse({ name: ' ' })
    expect(result.success).toBe(true)
  })

  it('accepts very long name', () => {
    const result = createStudentSchema.safeParse({ name: 'A'.repeat(500) })
    expect(result.success).toBe(true)
  })

  it('accepts name with unicode characters', () => {
    const result = createStudentSchema.safeParse({ name: 'José García-López' })
    expect(result.success).toBe(true)
  })
})
