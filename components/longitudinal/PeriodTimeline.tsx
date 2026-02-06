'use client'

import { clsx } from 'clsx'
import type { PeriodStatus } from '@/lib/types'

interface PeriodTimelineProps {
  periodStatuses: PeriodStatus[]
  onPeriodClick?: (periodNumber: number) => void
}

export function PeriodTimeline({ periodStatuses, onPeriodClick }: PeriodTimelineProps) {
  if (periodStatuses.length === 0) return null

  const getCircleClasses = (status: PeriodStatus) => {
    if (status.isCurrent) {
      if (status.hasEvaluation) {
        const level = status.evaluation?.performanceLevel
        return clsx(
          'ring-2 ring-medical-primary ring-offset-2 ring-offset-[rgb(var(--background))]',
          level === 'honors' ? 'bg-category-honors' :
          level === 'pass' ? 'bg-category-pass' :
          level === 'fail' ? 'bg-category-fail' : 'bg-medical-primary'
        )
      }
      return 'bg-medical-primary ring-2 ring-medical-primary ring-offset-2 ring-offset-[rgb(var(--background))] animate-pulse'
    }

    if (status.isFuture) {
      return 'bg-[rgb(var(--muted))]'
    }

    // Past period
    if (status.hasEvaluation) {
      const level = status.evaluation?.performanceLevel
      return level === 'honors' ? 'bg-category-honors' :
             level === 'pass' ? 'bg-category-pass' :
             level === 'fail' ? 'bg-category-fail' : 'bg-[rgb(var(--muted))]'
    }

    // Past period, no evaluation = missed
    return 'bg-status-warning'
  }

  const getLineClasses = (status: PeriodStatus, nextStatus: PeriodStatus | undefined) => {
    if (!nextStatus) return ''
    if (status.isFuture || nextStatus.isFuture) return 'bg-[rgb(var(--muted))]'
    return 'bg-medical-primary/40'
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max px-2">
        {periodStatuses.map((status, index) => {
          const nextStatus = periodStatuses[index + 1]
          const tooltipLines = [
            `Period ${status.periodNumber}`,
            `${new Date(status.periodStart).toLocaleDateString()} – ${new Date(status.periodEnd).toLocaleDateString()}`,
          ]
          if (status.hasEvaluation) {
            tooltipLines.push(`${status.evaluation?.performanceLevel?.toUpperCase() ?? 'Evaluated'}`)
          } else if (status.isCurrent) {
            tooltipLines.push('Current period')
          } else if (status.isFuture) {
            tooltipLines.push('Upcoming')
          } else {
            tooltipLines.push('No evaluation')
          }

          return (
            <div key={status.periodNumber} className="flex items-center">
              {/* Period circle + label */}
              <div className="relative group flex flex-col items-center">
                <button
                  onClick={() => onPeriodClick?.(status.periodNumber)}
                  className={clsx(
                    'w-8 h-8 rounded-full transition-all flex items-center justify-center text-xs font-medium',
                    getCircleClasses(status),
                    (status.hasEvaluation || status.isCurrent) ? 'text-white' : 'text-[rgb(var(--muted-foreground))]',
                    onPeriodClick && 'cursor-pointer hover:scale-110'
                  )}
                >
                  {status.periodNumber}
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 px-3 py-2 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tooltipLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[rgb(var(--foreground))]" />
                </div>
              </div>

              {/* Connecting line */}
              {nextStatus && (
                <div className={clsx('w-6 h-0.5', getLineClasses(status, nextStatus))} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
