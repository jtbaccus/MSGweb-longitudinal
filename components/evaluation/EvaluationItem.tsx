'use client'

import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { EvaluationItem } from '@/lib/types'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'

interface EvaluationItemCardProps {
  item: EvaluationItem
  color: 'fail' | 'pass' | 'honors'
}

const colorClasses = {
  fail: {
    selected: 'bg-category-fail/10 border-category-fail/40',
    check: 'bg-category-fail text-white',
  },
  pass: {
    selected: 'bg-category-pass/10 border-category-pass/40',
    check: 'bg-category-pass text-white',
  },
  honors: {
    selected: 'bg-category-honors/10 border-category-honors/40',
    check: 'bg-category-honors text-white',
  },
}

export function EvaluationItemCard({ item, color }: EvaluationItemCardProps) {
  const toggleItem = useEvaluationStore(state => state.toggleItem)

  return (
    <button
      onClick={() => toggleItem(item.id)}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:shadow-sm',
        item.isSelected
          ? colorClasses[color].selected
          : 'border-[rgb(var(--card-border))] hover:border-[rgb(var(--muted))]'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors',
          item.isSelected
            ? colorClasses[color].check
            : 'border-[rgb(var(--input-border))]'
        )}>
          {item.isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">{item.name}</p>
        </div>
      </div>
    </button>
  )
}
