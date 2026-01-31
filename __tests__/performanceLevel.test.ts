import { describe, it, expect } from 'vitest'
import {
  calculatePerformanceLevel,
  getPerformanceLevelLabel,
  getPerformanceLevelColor,
  getPerformanceLevelBgColor,
} from '@/lib/utils/performanceLevel'
import { EvaluationItem } from '@/lib/types'

// Helper to create test items
function createItem(
  id: string,
  category: 'fail' | 'pass' | 'honors',
  section: string,
  isSelected: boolean
): EvaluationItem {
  return {
    id,
    name: `Test Item ${id}`,
    description: `Description for ${id}`,
    category,
    section,
    isSelected,
  }
}

describe('calculatePerformanceLevel', () => {
  describe('empty items', () => {
    it('returns pass for empty array', () => {
      expect(calculatePerformanceLevel([])).toBe('pass')
    })
  })

  describe('fail threshold (30%)', () => {
    it('returns pass when no fail items exist', () => {
      const items = [
        createItem('1', 'pass', 'Section A', true),
        createItem('2', 'honors', 'Section A', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns pass when fail items exist but none selected', () => {
      const items = [
        createItem('1', 'fail', 'Section A', false),
        createItem('2', 'fail', 'Section A', false),
        createItem('3', 'fail', 'Section A', false),
        createItem('4', 'pass', 'Section A', true),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns pass when less than 30% of fail items selected (1 of 4 = 25%)', () => {
      const items = [
        createItem('1', 'fail', 'Section A', true),
        createItem('2', 'fail', 'Section A', false),
        createItem('3', 'fail', 'Section A', false),
        createItem('4', 'fail', 'Section A', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns fail when exactly 30% of fail items selected (3 of 10)', () => {
      const failItems = Array.from({ length: 10 }, (_, i) =>
        createItem(`fail-${i}`, 'fail', 'Section A', i < 3)
      )
      expect(calculatePerformanceLevel(failItems)).toBe('fail')
    })

    it('returns fail when more than 30% of fail items selected (4 of 10 = 40%)', () => {
      const failItems = Array.from({ length: 10 }, (_, i) =>
        createItem(`fail-${i}`, 'fail', 'Section A', i < 4)
      )
      expect(calculatePerformanceLevel(failItems)).toBe('fail')
    })

    it('returns fail when 1 of 3 fail items selected (33%)', () => {
      const items = [
        createItem('1', 'fail', 'Section A', true),
        createItem('2', 'fail', 'Section A', false),
        createItem('3', 'fail', 'Section A', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('fail')
    })

    it('returns pass when 2 of 9 fail items selected (22%)', () => {
      const items = Array.from({ length: 9 }, (_, i) =>
        createItem(`fail-${i}`, 'fail', 'Section A', i < 2)
      )
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('fail takes precedence over honors', () => {
      const items = [
        // 3 of 10 fail items selected = 30% = fail
        ...Array.from({ length: 10 }, (_, i) =>
          createItem(`fail-${i}`, 'fail', 'Section A', i < 3)
        ),
        // All honors items selected across sections
        createItem('h1', 'honors', 'Section A', true),
        createItem('h2', 'honors', 'Section B', true),
      ]
      expect(calculatePerformanceLevel(items)).toBe('fail')
    })
  })

  describe('honors threshold (80% + section coverage)', () => {
    it('returns pass when no honors items exist', () => {
      const items = [
        createItem('1', 'pass', 'Section A', true),
        createItem('2', 'pass', 'Section B', true),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns pass when honors items exist but none selected', () => {
      const items = [
        createItem('1', 'honors', 'Section A', false),
        createItem('2', 'honors', 'Section B', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns pass when 80% honors selected but not all sections covered', () => {
      // 4 of 5 = 80%, but Section B has no selection
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section A', true),
        createItem('3', 'honors', 'Section A', true),
        createItem('4', 'honors', 'Section A', true),
        createItem('5', 'honors', 'Section B', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns pass when all sections covered but less than 80% selected', () => {
      // 3 of 5 = 60%, all sections covered
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section A', false),
        createItem('3', 'honors', 'Section B', true),
        createItem('4', 'honors', 'Section B', false),
        createItem('5', 'honors', 'Section C', true),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })

    it('returns honors when exactly 80% selected and all sections covered', () => {
      // 4 of 5 = 80%, all sections covered
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section A', true),
        createItem('3', 'honors', 'Section B', true),
        createItem('4', 'honors', 'Section C', true),
        createItem('5', 'honors', 'Section C', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('honors')
    })

    it('returns honors when more than 80% selected and all sections covered', () => {
      // 5 of 5 = 100%, all sections covered
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section B', true),
        createItem('3', 'honors', 'Section C', true),
        createItem('4', 'honors', 'Section D', true),
        createItem('5', 'honors', 'Section E', true),
      ]
      expect(calculatePerformanceLevel(items)).toBe('honors')
    })

    it('returns honors with 8 of 10 selected (80%) across 3 sections', () => {
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section A', true),
        createItem('3', 'honors', 'Section A', true),
        createItem('4', 'honors', 'Section B', true),
        createItem('5', 'honors', 'Section B', true),
        createItem('6', 'honors', 'Section B', true),
        createItem('7', 'honors', 'Section C', true),
        createItem('8', 'honors', 'Section C', true),
        createItem('9', 'honors', 'Section C', false),
        createItem('10', 'honors', 'Section C', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('honors')
    })

    it('returns pass with 7 of 10 selected (70%) even with all sections covered', () => {
      const items = [
        createItem('1', 'honors', 'Section A', true),
        createItem('2', 'honors', 'Section A', true),
        createItem('3', 'honors', 'Section A', false),
        createItem('4', 'honors', 'Section B', true),
        createItem('5', 'honors', 'Section B', true),
        createItem('6', 'honors', 'Section B', false),
        createItem('7', 'honors', 'Section C', true),
        createItem('8', 'honors', 'Section C', true),
        createItem('9', 'honors', 'Section C', true),
        createItem('10', 'honors', 'Section C', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })
  })

  describe('mixed categories', () => {
    it('ignores pass items when calculating fail/honors', () => {
      const items = [
        createItem('p1', 'pass', 'Section A', true),
        createItem('p2', 'pass', 'Section A', false),
        createItem('h1', 'honors', 'Section A', true),
        createItem('h2', 'honors', 'Section B', true),
      ]
      // 2 of 2 honors = 100%, all sections covered
      expect(calculatePerformanceLevel(items)).toBe('honors')
    })

    it('only counts fail items for fail threshold', () => {
      const items = [
        createItem('f1', 'fail', 'Section A', true),
        createItem('f2', 'fail', 'Section A', false),
        createItem('f3', 'fail', 'Section A', false),
        createItem('p1', 'pass', 'Section A', true),
        createItem('p2', 'pass', 'Section A', true),
        createItem('h1', 'honors', 'Section A', true),
      ]
      // 1 of 3 fail = 33% >= 30% = fail
      expect(calculatePerformanceLevel(items)).toBe('fail')
    })

    it('realistic scenario: honors with mixed items', () => {
      const items = [
        // Fail items - none selected
        createItem('f1', 'fail', 'Section A', false),
        createItem('f2', 'fail', 'Section B', false),
        // Pass items - some selected
        createItem('p1', 'pass', 'Section A', true),
        createItem('p2', 'pass', 'Section B', true),
        // Honors items - 4 of 5 = 80% selected, all sections covered
        createItem('h1', 'honors', 'Section A', true),
        createItem('h2', 'honors', 'Section A', true),
        createItem('h3', 'honors', 'Section B', true),
        createItem('h4', 'honors', 'Section B', true),
        createItem('h5', 'honors', 'Section B', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('honors')
    })

    it('realistic scenario: pass with some honors selected but not enough', () => {
      const items = [
        // Fail items - none selected
        createItem('f1', 'fail', 'Section A', false),
        createItem('f2', 'fail', 'Section B', false),
        // Pass items - some selected
        createItem('p1', 'pass', 'Section A', true),
        createItem('p2', 'pass', 'Section B', true),
        // Honors items - 2 of 5 = 40% selected
        createItem('h1', 'honors', 'Section A', true),
        createItem('h2', 'honors', 'Section A', false),
        createItem('h3', 'honors', 'Section B', true),
        createItem('h4', 'honors', 'Section B', false),
        createItem('h5', 'honors', 'Section B', false),
      ]
      expect(calculatePerformanceLevel(items)).toBe('pass')
    })
  })
})

describe('getPerformanceLevelLabel', () => {
  it('returns "Fail" for fail level', () => {
    expect(getPerformanceLevelLabel('fail')).toBe('Fail')
  })

  it('returns "Pass" for pass level', () => {
    expect(getPerformanceLevelLabel('pass')).toBe('Pass')
  })

  it('returns "Honors" for honors level', () => {
    expect(getPerformanceLevelLabel('honors')).toBe('Honors')
  })
})

describe('getPerformanceLevelColor', () => {
  it('returns correct color class for fail', () => {
    expect(getPerformanceLevelColor('fail')).toBe('text-category-fail')
  })

  it('returns correct color class for pass', () => {
    expect(getPerformanceLevelColor('pass')).toBe('text-category-pass')
  })

  it('returns correct color class for honors', () => {
    expect(getPerformanceLevelColor('honors')).toBe('text-category-honors')
  })
})

describe('getPerformanceLevelBgColor', () => {
  it('returns correct background class for fail', () => {
    expect(getPerformanceLevelBgColor('fail')).toBe('bg-category-fail/10')
  })

  it('returns correct background class for pass', () => {
    expect(getPerformanceLevelBgColor('pass')).toBe('bg-category-pass/10')
  })

  it('returns correct background class for honors', () => {
    expect(getPerformanceLevelBgColor('honors')).toBe('bg-category-honors/10')
  })
})
