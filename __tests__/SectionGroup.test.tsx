import { render, screen, fireEvent } from '@testing-library/react'
import { SectionGroup } from '@/components/evaluation/SectionGroup'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EvaluationItem } from '@/lib/types'

// Mock the store
const { mockToggleAllInSection } = vi.hoisted(() => {
  return { mockToggleAllInSection: vi.fn() }
})

vi.mock('@/lib/stores/evaluationStore', () => ({
  useEvaluationStore: (selector: any) => {
    return mockToggleAllInSection
  }
}))

// Mock EvaluationItemCard to simplify
vi.mock('@/components/evaluation/EvaluationItem', () => ({
  EvaluationItemCard: () => <div data-testid="evaluation-item-card">Item</div>
}))

describe('SectionGroup', () => {
  const mockItems: EvaluationItem[] = [
    {
      id: '1',
      name: 'Item 1',
      description: 'Desc 1',
      category: 'fail',
      section: 'Section 1',
      isSelected: false
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without console error for nested buttons', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SectionGroup
        sectionName="Test Section"
        items={mockItems}
        category="fail"
        color="fail"
      />
    )

    // Check if console.error was called with the specific message
    // React's validateDOMNesting warning
    const nestedButtonError = consoleSpy.mock.calls.find(call => {
      const msg = call[0]
      return (
        typeof msg === 'string' &&
        (
          msg.includes('cannot be a descendant of <button>') ||
          msg.includes('validateDOMNesting') ||
          (msg.includes('cannot be a descendant of') && call.some(arg => arg === '<button>' || arg === 'button'))
        )
      )
    })

    if (nestedButtonError) {
        console.log('Detected nested button error:', nestedButtonError)
    }

    expect(nestedButtonError).toBeUndefined()

    consoleSpy.mockRestore()
  })

  it('toggles expansion when header is clicked', () => {
    render(
      <SectionGroup
        sectionName="Test Section"
        items={mockItems}
        category="fail"
        color="fail"
      />
    )

    // Initially expanded (default state is true in component)
    expect(screen.getByTestId('evaluation-item-card')).toBeInTheDocument()

    // Click to collapse
    // We need to find the header. It has "Test Section" text.
    fireEvent.click(screen.getByText('Test Section'))

    // Should be collapsed
    expect(screen.queryByTestId('evaluation-item-card')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(screen.getByText('Test Section'))
    expect(screen.getByTestId('evaluation-item-card')).toBeInTheDocument()
  })

  it('calls toggleAllInSection when Select All is clicked', () => {
     render(
      <SectionGroup
        sectionName="Test Section"
        items={mockItems}
        category="fail"
        color="fail"
      />
    )

    // Click Select All
    fireEvent.click(screen.getByText('Select All'))

    expect(mockToggleAllInSection).toHaveBeenCalledWith('Test Section', 'fail', true)
  })

})
