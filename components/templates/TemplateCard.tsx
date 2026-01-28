'use client'

import { clsx } from 'clsx'
import {
  Stethoscope,
  Activity,
  Scissors,
  Baby,
  Brain,
  Heart,
  Users,
  Siren,
  FileText,
} from 'lucide-react'
import { ClerkshipTemplate } from '@/lib/types'
import { Card } from '@/components/ui/Card'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Activity,
  Scissors,
  Baby,
  Brain,
  Heart,
  Users,
  Siren,
  FileText,
}

interface TemplateCardProps {
  template: ClerkshipTemplate
  isSelected: boolean
  onSelect: () => void
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || FileText
  const itemCount = template.items.length

  return (
    <button
      onClick={onSelect}
      className="text-left w-full"
    >
      <Card
        className={clsx(
          'transition-all cursor-pointer hover:shadow-md',
          isSelected
            ? 'ring-2 ring-medical-primary border-medical-primary'
            : 'hover:border-[rgb(var(--muted))]'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={clsx(
            'p-3 rounded-xl',
            isSelected ? 'bg-medical-primary/10' : 'bg-[rgb(var(--sidebar-background))]'
          )}>
            <Icon className={clsx(
              'w-6 h-6',
              isSelected ? 'text-medical-primary' : 'text-[rgb(var(--muted-foreground))]'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{template.name}</h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))] line-clamp-2">
              {template.description}
            </p>
            <p className="text-xs text-[rgb(var(--muted))] mt-2">
              {itemCount} evaluation criteria
            </p>
          </div>
        </div>
      </Card>
    </button>
  )
}
