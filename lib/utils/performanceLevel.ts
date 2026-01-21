import { EvaluationItem, PerformanceLevel } from '@/lib/types'

export function calculatePerformanceLevel(items: EvaluationItem[]): PerformanceLevel {
  if (items.length === 0) {
    return 'pass' // Default when no items
  }

  // Check fail condition: 30% or more of fail criteria selected
  const failItems = items.filter(item => item.category === 'fail')
  const selectedFailItems = failItems.filter(item => item.isSelected)
  if (failItems.length > 0 && selectedFailItems.length / failItems.length >= 0.3) {
    return 'fail'
  }

  // Check honors condition (only considers honors column):
  // 1. At least one honors criteria selected in each section (subtopic)
  // 2. At least 80% of honors criteria selected overall
  const honorsItems = items.filter(item => item.category === 'honors')

  if (honorsItems.length === 0) {
    return 'pass'
  }

  const sections = [...new Set(honorsItems.map(item => item.section))]
  const allSectionsHaveSelection = sections.every(section => {
    const sectionHonorsItems = honorsItems.filter(item => item.section === section)
    return sectionHonorsItems.some(item => item.isSelected)
  })

  const selectedHonorsItems = honorsItems.filter(item => item.isSelected)
  const overallSelectionRate = selectedHonorsItems.length / honorsItems.length

  if (allSectionsHaveSelection && overallSelectionRate >= 0.8) {
    return 'honors'
  }

  return 'pass'
}

export function getPerformanceLevelLabel(level: PerformanceLevel): string {
  switch (level) {
    case 'fail':
      return 'Fail'
    case 'pass':
      return 'Pass'
    case 'honors':
      return 'Honors'
  }
}

export function getPerformanceLevelColor(level: PerformanceLevel): string {
  switch (level) {
    case 'fail':
      return 'text-category-fail'
    case 'pass':
      return 'text-category-pass'
    case 'honors':
      return 'text-category-honors'
  }
}

export function getPerformanceLevelBgColor(level: PerformanceLevel): string {
  switch (level) {
    case 'fail':
      return 'bg-category-fail/10'
    case 'pass':
      return 'bg-category-pass/10'
    case 'honors':
      return 'bg-category-honors/10'
  }
}
