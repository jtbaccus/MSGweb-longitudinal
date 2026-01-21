'use client'

import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Button } from '@/components/ui/Button'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'

export function PersonalAttributeView() {
  const { attributes, toggleAttribute, getSelectedAttributes } = useEvaluationStore()
  const selectedAttributes = getSelectedAttributes()

  const handleClearAll = () => {
    attributes.forEach(attr => {
      if (attr.isSelected) {
        toggleAttribute(attr.id)
      }
    })
  }

  return (
    <div className="max-w-4xl">
      <ContentHeader
        title="Personal Attributes"
        description="Select the personal qualities and characteristics that best describe this student."
        action={
          <div className="flex items-center gap-4">
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              {selectedAttributes.length} selected
            </span>
            {selectedAttributes.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {attributes.map((attribute) => (
          <button
            key={attribute.id}
            onClick={() => toggleAttribute(attribute.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all text-left',
              attribute.isSelected
                ? 'bg-medical-primary/10 border-medical-primary/40 text-medical-primary'
                : 'border-[rgb(var(--card-border))] hover:border-[rgb(var(--muted))] hover:bg-[rgb(var(--card-background))]'
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors',
              attribute.isSelected
                ? 'bg-medical-primary border-medical-primary text-white'
                : 'border-[rgb(var(--input-border))]'
            )}>
              {attribute.isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium">{attribute.name}</span>
          </button>
        ))}
      </div>

      {selectedAttributes.length > 0 && (
        <div className="mt-8 p-4 rounded-lg bg-[rgb(var(--sidebar-background))]">
          <h3 className="text-sm font-medium mb-2">Selected Attributes</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            {selectedAttributes.map(attr => attr.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
