import { EvaluationItem, PersonalAttribute } from '@/lib/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateEvaluation(
  items: EvaluationItem[],
  attributes: PersonalAttribute[],
  narrativeText: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const selectedItems = items.filter(item => item.isSelected)
  const selectedAttributes = attributes.filter(attr => attr.isSelected)

  // Check if any evaluation items are selected
  if (selectedItems.length === 0) {
    errors.push('No evaluation criteria selected')
  }

  // Check for conflicting categories
  const hasFailItems = selectedItems.some(item => item.category === 'fail')
  const hasHonorsItems = selectedItems.some(item => item.category === 'honors')

  if (hasFailItems && hasHonorsItems) {
    warnings.push('Both failing and honors criteria selected - please review selections')
  }

  // Check if narrative is provided
  if (narrativeText.trim().length === 0) {
    warnings.push('No narrative context provided')
  } else if (narrativeText.trim().length < 50) {
    warnings.push('Narrative context is brief - consider adding more detail')
  }

  // Check if attributes are selected
  if (selectedAttributes.length === 0) {
    warnings.push('No personal attributes selected')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateReportData(
  studentName: string,
  evaluatorName: string,
  evaluationDate: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!studentName.trim()) {
    errors.push('Student name is required')
  }

  if (!evaluatorName.trim()) {
    errors.push('Evaluator name is required')
  }

  if (!evaluationDate) {
    errors.push('Evaluation date is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
