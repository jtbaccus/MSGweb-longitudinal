'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { NavigationTab } from '@/lib/types'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { Button } from '@/components/ui/Button'

export function NavigationButtons() {
  const { currentTab, setCurrentTab } = useNavigationStore()
  const currentTemplate = useEvaluationStore(state => state.currentTemplate)

  const tabs: NavigationTab[] = [
    'templates',
    'evaluation',
    'attributes',
    'narrative',
    'summary',
    'generate',
    'export',
  ]

  const currentIndex = tabs.indexOf(currentTab as NavigationTab)

  if (currentIndex === -1) return null

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < tabs.length - 1

  const handleNext = () => {
    if (hasNext) {
      setCurrentTab(tabs[currentIndex + 1])
    }
  }

  const handleBack = () => {
    if (hasPrevious) {
      setCurrentTab(tabs[currentIndex - 1])
    }
  }

  const isNextDisabled = (currentTab === 'templates' && !currentTemplate)

  return (
    <div className="flex justify-between items-center pt-6 mt-6 border-t border-[rgb(var(--input-border))]">
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={!hasPrevious}
        className={!hasPrevious ? 'invisible' : ''}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {hasNext ? (
         <Button
          onClick={handleNext}
          disabled={isNextDisabled}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )
}
