import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NavigationButtons } from '@/components/layout/NavigationButtons'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'

// Mock the stores
vi.mock('@/lib/stores/navigationStore')
vi.mock('@/lib/stores/evaluationStore')

describe('NavigationButtons', () => {
  const setCurrentTabMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render back button on first tab', () => {
    vi.mocked(useNavigationStore).mockReturnValue({
      currentTab: 'templates',
      setCurrentTab: setCurrentTabMock,
    } as any)
    vi.mocked(useEvaluationStore).mockReturnValue(null as any) // currentTemplate is null

    render(<NavigationButtons />)

    const backButton = screen.getByText('Back')
    expect(backButton).toBeDisabled()
    expect(backButton).toHaveClass('invisible')
  })

  it('navigates to next tab', () => {
    vi.mocked(useNavigationStore).mockReturnValue({
      currentTab: 'templates',
      setCurrentTab: setCurrentTabMock,
    } as any)
    vi.mocked(useEvaluationStore).mockReturnValue({ name: 'Template' } as any) // Template selected

    render(<NavigationButtons />)

    const nextButton = screen.getByText('Next')
    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)
    expect(setCurrentTabMock).toHaveBeenCalledWith('evaluation')
  })

  it('navigates to previous tab', () => {
     vi.mocked(useNavigationStore).mockReturnValue({
      currentTab: 'evaluation',
      setCurrentTab: setCurrentTabMock,
    } as any)
    vi.mocked(useEvaluationStore).mockReturnValue({ name: 'Template' } as any)

    render(<NavigationButtons />)

    const backButton = screen.getByText('Back')
    expect(backButton).not.toBeDisabled()

    fireEvent.click(backButton)
    expect(setCurrentTabMock).toHaveBeenCalledWith('templates')
  })

  it('disables next button on templates if no template selected', () => {
     vi.mocked(useNavigationStore).mockReturnValue({
      currentTab: 'templates',
      setCurrentTab: setCurrentTabMock,
    } as any)
    vi.mocked(useEvaluationStore).mockReturnValue(null as any)

    render(<NavigationButtons />)

    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('renders nothing on settings tab', () => {
     vi.mocked(useNavigationStore).mockReturnValue({
      currentTab: 'settings',
      setCurrentTab: setCurrentTabMock,
    } as any)

    const { container } = render(<NavigationButtons />)
    expect(container).toBeEmptyDOMElement()
  })
})
