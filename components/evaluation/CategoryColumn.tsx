'use client'

import { clsx } from 'clsx'
import { EvaluationItem, PerformanceLevel } from '@/lib/types'
import { SectionGroup } from './SectionGroup'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'

interface CategoryColumnProps {
  title: string
  category: PerformanceLevel
  items: EvaluationItem[]
  color: 'fail' | 'pass' | 'honors'
}

const colorClasses = {
  fail: {
    header: 'bg-category-fail/10 text-category-fail border-category-fail/30',
    border: 'border-category-fail/20',
  },
  pass: {
    header: 'bg-category-pass/10 text-category-pass border-category-pass/30',
    border: 'border-category-pass/20',
  },
  honors: {
    header: 'bg-category-honors/10 text-category-honors border-category-honors/30',
    border: 'border-category-honors/20',
  },
}

export function CategoryColumn({ title, category, items, color }: CategoryColumnProps) {
  const toggleAllInCategory = useEvaluationStore(state => state.toggleAllInCategory)

  // Group items by section
  const sections = items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, EvaluationItem[]>)

  const selectedCount = items.filter(item => item.isSelected).length
  const allSelected = items.length > 0 && selectedCount === items.length

  const handleSelectAll = () => {
    toggleAllInCategory(category, !allSelected)
  }

  return (
    <div className={clsx(
      'flex flex-col h-full rounded-xl border overflow-hidden',
      colorClasses[color].border
    )}>
      <div className={clsx(
        'px-4 py-3 border-b font-semibold flex items-center justify-between',
        colorClasses[color].header
      )}>
        <div className="flex items-center gap-3">
          <span>{title}</span>
          <button
            onClick={handleSelectAll}
            className={clsx(
              'text-xs px-2 py-0.5 rounded transition-colors font-normal',
              allSelected
                ? 'opacity-70 hover:opacity-100'
                : 'opacity-80 hover:opacity-100 hover:underline'
            )}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <span className="text-sm font-normal opacity-80">
          {selectedCount} / {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-[rgb(var(--card-background))]">
        {Object.entries(sections).map(([sectionName, sectionItems]) => (
          <SectionGroup
            key={sectionName}
            sectionName={sectionName}
            items={sectionItems}
            category={category}
            color={color}
          />
        ))}

        {items.length === 0 && (
          <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
            No criteria in this category
          </p>
        )}
      </div>
    </div>
  )
}
