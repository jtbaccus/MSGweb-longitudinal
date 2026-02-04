'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { EvaluationItem, PerformanceLevel } from '@/lib/types'
import { EvaluationItemCard } from './EvaluationItem'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { clsx } from 'clsx'

interface SectionGroupProps {
  sectionName: string
  items: EvaluationItem[]
  category: PerformanceLevel
  color: 'fail' | 'pass' | 'honors'
}

export function SectionGroup({ sectionName, items, category, color }: SectionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleAllInSection = useEvaluationStore(state => state.toggleAllInSection)

  const selectedCount = items.filter(item => item.isSelected).length
  const allSelected = selectedCount === items.length
  const someSelected = selectedCount > 0 && selectedCount < items.length

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleAllInSection(sectionName, category, !allSelected)
  }

  return (
    <div className="rounded-lg border border-[rgb(var(--card-border))] overflow-hidden">
      <div className="w-full flex items-center justify-between px-3 py-2 bg-[rgb(var(--sidebar-background))] hover:bg-[rgb(var(--card-border))] transition-colors text-left">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-2"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          )}
          <span className="text-sm font-medium">{sectionName}</span>
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            ({selectedCount}/{items.length})
          </span>
        </button>

        <button
          onClick={handleSelectAll}
          className={clsx(
            'text-xs px-2 py-0.5 rounded transition-colors',
            allSelected
              ? 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
              : 'text-medical-primary hover:underline'
          )}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {items.map(item => (
            <EvaluationItemCard key={item.id} item={item} color={color} />
          ))}
        </div>
      )}
    </div>
  )
}
