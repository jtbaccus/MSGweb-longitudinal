import { describe, it, expect } from 'vitest'
import {
  createStudentSchema,
  createClerkshipSchema,
  createRotationSchema,
  createEvaluationSchema,
  generateSummarySchema,
  updateSummarySchema,
} from '@/lib/validations/schemas'

// ---------------------------------------------------------------------------
// createStudentSchema
// ---------------------------------------------------------------------------

describe('createStudentSchema', () => {
  it('accepts valid input with name only', () => {
    const result = createStudentSchema.safeParse({ name: 'Alice' })
    expect(result.success).toBe(true)
  })

  it('accepts valid input with all fields', () => {
    const result = createStudentSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      medicalSchoolId: 'MS-001',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createStudentSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createStudentSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('accepts null email', () => {
    const result = createStudentSchema.safeParse({ name: 'Alice', email: null })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = createStudentSchema.safeParse({ name: 'Alice', email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('accepts null medicalSchoolId', () => {
    const result = createStudentSchema.safeParse({ name: 'Alice', medicalSchoolId: null })
    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// createClerkshipSchema
// ---------------------------------------------------------------------------

describe('createClerkshipSchema', () => {
  const baseClerkship = {
    name: 'Internal Medicine',
    templateId: 'tmpl-1',
    type: 'STANDARD' as const,
    durationWeeks: 8,
  }

  it('accepts valid STANDARD clerkship (no frequency required)', () => {
    const result = createClerkshipSchema.safeParse(baseClerkship)
    expect(result.success).toBe(true)
  })

  it('rejects LONGITUDINAL without evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      type: 'LONGITUDINAL',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('LONGITUDINAL clerkships require evaluationIntervalDays')
    }
  })

  it('accepts LONGITUDINAL with evaluationIntervalDays', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      type: 'LONGITUDINAL',
      evaluationIntervalDays: 7,
    })
    expect(result.success).toBe(true)
  })

  it('rejects midpointWeek >= durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      midpointWeek: 8,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('midpointWeek must be less than durationWeeks')
    }
  })

  it('accepts midpointWeek < durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      midpointWeek: 4,
    })
    expect(result.success).toBe(true)
  })

  it('accepts MULTI_WEEK type', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      type: 'MULTI_WEEK',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type value', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      type: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-positive durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      durationWeeks: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer durationWeeks', () => {
    const result = createClerkshipSchema.safeParse({
      ...baseClerkship,
      durationWeeks: 4.5,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createRotationSchema
// ---------------------------------------------------------------------------

describe('createRotationSchema', () => {
  const baseRotation = {
    clerkshipId: 'c1',
    startDate: '2025-01-06',
    endDate: '2025-03-03',
    academicYear: '2024-2025',
  }

  it('accepts valid rotation (endDate > startDate)', () => {
    const result = createRotationSchema.safeParse(baseRotation)
    expect(result.success).toBe(true)
  })

  it('rejects endDate <= startDate', () => {
    const result = createRotationSchema.safeParse({
      ...baseRotation,
      endDate: '2025-01-06',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('End date must be after start date')
    }
  })

  it('rejects endDate before startDate', () => {
    const result = createRotationSchema.safeParse({
      ...baseRotation,
      endDate: '2024-12-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing clerkshipId', () => {
    const { clerkshipId, ...rest } = baseRotation
    const result = createRotationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects empty academicYear', () => {
    const result = createRotationSchema.safeParse({
      ...baseRotation,
      academicYear: '',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createEvaluationSchema
// ---------------------------------------------------------------------------

describe('createEvaluationSchema', () => {
  const baseEvaluation = {
    evaluatorName: 'Dr. Smith',
    periodNumber: 1,
    evaluationDate: '2025-01-13',
    performanceLevel: 'PASS' as const,
    templateId: 'tmpl-1',
  }

  it('accepts valid evaluation with all required fields', () => {
    const result = createEvaluationSchema.safeParse(baseEvaluation)
    expect(result.success).toBe(true)
  })

  it('rejects missing evaluatorName', () => {
    const { evaluatorName, ...rest } = baseEvaluation
    const result = createEvaluationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects empty evaluatorName', () => {
    const result = createEvaluationSchema.safeParse({
      ...baseEvaluation,
      evaluatorName: '',
    })
    expect(result.success).toBe(false)
  })

  it('defaults selectedCriteriaIds to []', () => {
    const result = createEvaluationSchema.safeParse(baseEvaluation)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.selectedCriteriaIds).toEqual([])
    }
  })

  it('defaults selectedAttributeIds to []', () => {
    const result = createEvaluationSchema.safeParse(baseEvaluation)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.selectedAttributeIds).toEqual([])
    }
  })

  it('rejects invalid performanceLevel', () => {
    const result = createEvaluationSchema.safeParse({
      ...baseEvaluation,
      performanceLevel: 'EXCELLENT',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid performance levels', () => {
    for (const level of ['FAIL', 'PASS', 'HONORS']) {
      const result = createEvaluationSchema.safeParse({
        ...baseEvaluation,
        performanceLevel: level,
      })
      expect(result.success).toBe(true)
    }
  })

  it('accepts optional narrativeContext', () => {
    const result = createEvaluationSchema.safeParse({
      ...baseEvaluation,
      narrativeContext: 'Great student',
    })
    expect(result.success).toBe(true)
  })

  it('accepts null narrativeContext', () => {
    const result = createEvaluationSchema.safeParse({
      ...baseEvaluation,
      narrativeContext: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-positive periodNumber', () => {
    const result = createEvaluationSchema.safeParse({
      ...baseEvaluation,
      periodNumber: 0,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// generateSummarySchema
// ---------------------------------------------------------------------------

describe('generateSummarySchema', () => {
  it('accepts valid input with enrollmentId and type', () => {
    const result = generateSummarySchema.safeParse({
      enrollmentId: 'en1',
      type: 'MID_COURSE',
    })
    expect(result.success).toBe(true)
  })

  it('accepts authorName as optional', () => {
    const result = generateSummarySchema.safeParse({
      enrollmentId: 'en1',
      type: 'END_OF_COURSE',
      authorName: 'Dr. Jones',
    })
    expect(result.success).toBe(true)
  })

  it('accepts without authorName', () => {
    const result = generateSummarySchema.safeParse({
      enrollmentId: 'en1',
      type: 'PROGRESS',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing enrollmentId', () => {
    const result = generateSummarySchema.safeParse({ type: 'MID_COURSE' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = generateSummarySchema.safeParse({
      enrollmentId: 'en1',
      type: 'INVALID_TYPE',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid summary types', () => {
    for (const type of ['MID_COURSE', 'END_OF_COURSE', 'PROGRESS']) {
      const result = generateSummarySchema.safeParse({
        enrollmentId: 'en1',
        type,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// updateSummarySchema
// ---------------------------------------------------------------------------

describe('updateSummarySchema', () => {
  it('accepts all fields as optional', () => {
    const result = updateSummarySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts null values for all fields', () => {
    const result = updateSummarySchema.safeParse({
      strengthsSummary: null,
      growthAreasSummary: null,
      progressNarrative: null,
      editedNarrative: null,
      recommendations: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts string values', () => {
    const result = updateSummarySchema.safeParse({
      strengthsSummary: 'Strong clinical skills',
      editedNarrative: 'Updated narrative',
    })
    expect(result.success).toBe(true)
  })

  it('accepts partial updates', () => {
    const result = updateSummarySchema.safeParse({
      editedNarrative: 'Just updating the narrative',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.editedNarrative).toBe('Just updating the narrative')
    }
  })
})
