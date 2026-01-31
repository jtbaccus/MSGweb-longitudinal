import { describe, it, expect } from 'vitest'
import { validateEvaluation, validateReportData } from '@/lib/utils/validation'
import { EvaluationItem, PersonalAttribute } from '@/lib/types'

// Helper to create test items
function createItem(
  id: string,
  category: 'fail' | 'pass' | 'honors',
  isSelected: boolean
): EvaluationItem {
  return {
    id,
    name: `Test Item ${id}`,
    description: `Description for ${id}`,
    category,
    section: 'Test Section',
    isSelected,
  }
}

function createAttribute(id: string, isSelected: boolean): PersonalAttribute {
  return {
    id,
    name: `Attribute ${id}`,
    isSelected,
  }
}

describe('validateEvaluation', () => {
  describe('evaluation items validation', () => {
    it('returns error when no items are selected', () => {
      const items = [
        createItem('1', 'pass', false),
        createItem('2', 'honors', false),
      ]
      const attributes = [createAttribute('1', false)]
      const result = validateEvaluation(items, attributes, '')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('No evaluation criteria selected')
    })

    it('returns valid when items are selected', () => {
      const items = [
        createItem('1', 'pass', true),
        createItem('2', 'honors', false),
      ]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative context here for testing.')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns empty error array when all items are unselected', () => {
      const items: EvaluationItem[] = []
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative.')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('No evaluation criteria selected')
    })
  })

  describe('conflicting categories warning', () => {
    it('warns when both fail and honors items are selected', () => {
      const items = [
        createItem('1', 'fail', true),
        createItem('2', 'honors', true),
        createItem('3', 'pass', false),
      ]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative context here for testing.')

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Both failing and honors criteria selected - please review selections'
      )
    })

    it('does not warn when only fail items selected', () => {
      const items = [
        createItem('1', 'fail', true),
        createItem('2', 'pass', false),
        createItem('3', 'honors', false),
      ]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative context here for testing.')

      expect(result.warnings).not.toContain(
        'Both failing and honors criteria selected - please review selections'
      )
    })

    it('does not warn when only honors items selected', () => {
      const items = [
        createItem('1', 'fail', false),
        createItem('2', 'pass', false),
        createItem('3', 'honors', true),
      ]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative context here for testing.')

      expect(result.warnings).not.toContain(
        'Both failing and honors criteria selected - please review selections'
      )
    })

    it('does not warn when fail and pass selected (no honors)', () => {
      const items = [
        createItem('1', 'fail', true),
        createItem('2', 'pass', true),
        createItem('3', 'honors', false),
      ]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'Some narrative context here for testing.')

      expect(result.warnings).not.toContain(
        'Both failing and honors criteria selected - please review selections'
      )
    })
  })

  describe('narrative text validation', () => {
    it('warns when narrative is empty', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, '')

      expect(result.warnings).toContain('No narrative context provided')
    })

    it('warns when narrative is only whitespace', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, '   \n\t  ')

      expect(result.warnings).toContain('No narrative context provided')
    })

    it('warns when narrative is too short (< 50 chars)', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]

      // 49 characters - exactly under the threshold
      const shortNarrative = 'a'.repeat(49)
      expect(shortNarrative.trim().length).toBe(49)

      const result = validateEvaluation(items, attributes, shortNarrative)
      expect(result.warnings).toContain(
        'Narrative context is brief - consider adding more detail'
      )
    })

    it('does not warn when narrative is exactly 50 chars', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]

      // Exactly 50 characters - at the threshold
      const narrative = 'a'.repeat(50)
      expect(narrative.trim().length).toBe(50)

      const result = validateEvaluation(items, attributes, narrative)
      expect(result.warnings).not.toContain(
        'Narrative context is brief - consider adding more detail'
      )
    })

    it('does not warn when narrative is longer than 50 chars', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]

      // 51 characters - above the threshold
      const narrative = 'a'.repeat(51)
      expect(narrative.trim().length).toBe(51)

      const result = validateEvaluation(items, attributes, narrative)
      expect(result.warnings).not.toContain(
        'Narrative context is brief - consider adding more detail'
      )
      expect(result.warnings).not.toContain('No narrative context provided')
    })
  })

  describe('attributes validation', () => {
    it('warns when no attributes are selected', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [
        createAttribute('1', false),
        createAttribute('2', false),
      ]
      const result = validateEvaluation(items, attributes, 'A sufficiently long narrative context for testing purposes.')

      expect(result.warnings).toContain('No personal attributes selected')
    })

    it('does not warn when attributes are selected', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [
        createAttribute('1', true),
        createAttribute('2', false),
      ]
      const result = validateEvaluation(items, attributes, 'A sufficiently long narrative context for testing purposes.')

      expect(result.warnings).not.toContain('No personal attributes selected')
    })

    it('warns with empty attributes array', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes: PersonalAttribute[] = []
      const result = validateEvaluation(items, attributes, 'A sufficiently long narrative context for testing purposes.')

      expect(result.warnings).toContain('No personal attributes selected')
    })
  })

  describe('multiple warnings', () => {
    it('can return multiple warnings at once', () => {
      const items = [
        createItem('1', 'fail', true),
        createItem('2', 'honors', true),
      ]
      const attributes = [createAttribute('1', false)]
      const result = validateEvaluation(items, attributes, '')

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Both failing and honors criteria selected - please review selections'
      )
      expect(result.warnings).toContain('No narrative context provided')
      expect(result.warnings).toContain('No personal attributes selected')
      expect(result.warnings).toHaveLength(3)
    })
  })

  describe('isValid flag', () => {
    it('is false only when there are errors', () => {
      const items = [createItem('1', 'pass', false)]
      const attributes = [createAttribute('1', false)]
      const result = validateEvaluation(items, attributes, '')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('is true when there are warnings but no errors', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', false)]
      const result = validateEvaluation(items, attributes, '')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('is true when everything is valid', () => {
      const items = [createItem('1', 'pass', true)]
      const attributes = [createAttribute('1', true)]
      const result = validateEvaluation(items, attributes, 'A sufficiently long narrative context for testing purposes.')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })
  })
})

describe('validateReportData', () => {
  describe('student name validation', () => {
    it('returns error when student name is empty', () => {
      const result = validateReportData('', 'Dr. Smith', '2024-01-15')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Student name is required')
    })

    it('returns error when student name is only whitespace', () => {
      const result = validateReportData('   ', 'Dr. Smith', '2024-01-15')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Student name is required')
    })

    it('accepts valid student name', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '2024-01-15')
      expect(result.errors).not.toContain('Student name is required')
    })
  })

  describe('evaluator name validation', () => {
    it('returns error when evaluator name is empty', () => {
      const result = validateReportData('John Doe', '', '2024-01-15')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Evaluator name is required')
    })

    it('returns error when evaluator name is only whitespace', () => {
      const result = validateReportData('John Doe', '  \t  ', '2024-01-15')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Evaluator name is required')
    })

    it('accepts valid evaluator name', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '2024-01-15')
      expect(result.errors).not.toContain('Evaluator name is required')
    })
  })

  describe('evaluation date validation', () => {
    it('returns error when date is empty', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Evaluation date is required')
    })

    it('accepts valid date string', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '2024-01-15')
      expect(result.errors).not.toContain('Evaluation date is required')
    })
  })

  describe('multiple errors', () => {
    it('returns all applicable errors', () => {
      const result = validateReportData('', '', '')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Student name is required')
      expect(result.errors).toContain('Evaluator name is required')
      expect(result.errors).toContain('Evaluation date is required')
      expect(result.errors).toHaveLength(3)
    })
  })

  describe('warnings array', () => {
    it('always returns empty warnings array', () => {
      const result = validateReportData('', '', '')
      expect(result.warnings).toHaveLength(0)
    })

    it('returns empty warnings array even when valid', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '2024-01-15')
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('isValid flag', () => {
    it('is true when all fields are provided', () => {
      const result = validateReportData('John Doe', 'Dr. Smith', '2024-01-15')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('is false when any field is missing', () => {
      expect(validateReportData('', 'Dr. Smith', '2024-01-15').isValid).toBe(false)
      expect(validateReportData('John Doe', '', '2024-01-15').isValid).toBe(false)
      expect(validateReportData('John Doe', 'Dr. Smith', '').isValid).toBe(false)
    })
  })
})
