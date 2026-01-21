'use client'

import { ContentHeader } from '@/components/layout/ContentHeader'
import { CategoryColumn } from './CategoryColumn'
import { Button } from '@/components/ui/Button'
import { PerformanceBadge } from '@/components/ui/Badge'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { RotateCcw, LayoutTemplate } from 'lucide-react'

export function EvaluationFormView() {
  const {
    items,
    currentTemplate,
    resetForm,
    getPerformanceLevel,
    getStrengths,
    getAreasForImprovement,
  } = useEvaluationStore()
  const setCurrentTab = useNavigationStore(state => state.setCurrentTab)

  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-medical-primary/10 flex items-center justify-center">
            <LayoutTemplate className="w-8 h-8 text-medical-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Template Selected</h2>
          <p className="text-[rgb(var(--muted-foreground))] mb-6">
            To begin evaluating a student, please select a clerkship template first.
            Templates define the evaluation criteria for each rotation type.
          </p>
          <Button onClick={() => setCurrentTab('templates')}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Select a Template
          </Button>
        </div>
      </div>
    )
  }

  const performanceLevel = getPerformanceLevel()
  const strengths = getStrengths()
  const areasForImprovement = getAreasForImprovement()

  const failItems = items.filter(item => item.category === 'fail')
  const passItems = items.filter(item => item.category === 'pass')
  const honorsItems = items.filter(item => item.category === 'honors')

  return (
    <div className="h-full flex flex-col">
      <ContentHeader
        title="Evaluation Criteria"
        description={`Select the criteria that best describe the student's performance on the ${currentTemplate.name} rotation.`}
        action={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">Overall:</span>
              <PerformanceBadge level={performanceLevel} />
            </div>
            <Button variant="outline" size="sm" onClick={resetForm}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 h-full">
          <CategoryColumn
            title="Fail"
            category="fail"
            items={failItems}
            color="fail"
          />
          <CategoryColumn
            title="Pass"
            category="pass"
            items={passItems}
            color="pass"
          />
          <CategoryColumn
            title="Honors"
            category="honors"
            items={honorsItems}
            color="honors"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[rgb(var(--card-border))] flex gap-8">
        <div>
          <span className="text-sm font-medium text-category-pass">
            {strengths.length} Strengths
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-category-fail">
            {areasForImprovement.length} Areas for Improvement
          </span>
        </div>
      </div>
    </div>
  )
}
