'use client'

import type { SavedEvaluation } from '@/lib/types'

interface PerformanceChartProps {
  evaluations: SavedEvaluation[]
  totalPeriods: number
  midpointPeriod?: number
  intervalDays?: number
}

const LEVEL_Y: Record<string, number> = {
  fail: 180,
  pass: 110,
  honors: 40,
}

const LEVEL_COLOR: Record<string, string> = {
  fail: 'rgb(239, 68, 68)',     // category-fail
  pass: 'rgb(34, 197, 94)',     // category-pass
  honors: 'rgb(168, 85, 247)',  // category-honors
}

export function PerformanceChart({ evaluations, totalPeriods, midpointPeriod }: PerformanceChartProps) {
  const completed = evaluations
    .filter(e => e.isComplete)
    .sort((a, b) => a.periodNumber - b.periodNumber)

  if (completed.length === 0) return null

  const padding = { left: 70, right: 20, top: 20, bottom: 40 }
  const chartWidth = Math.max(400, totalPeriods * 60 + padding.left + padding.right)
  const chartHeight = 240

  const xScale = (period: number) => {
    const range = chartWidth - padding.left - padding.right
    return padding.left + ((period - 1) / Math.max(totalPeriods - 1, 1)) * range
  }

  const points = completed.map(e => ({
    x: xScale(e.periodNumber),
    y: LEVEL_Y[e.performanceLevel] ?? LEVEL_Y.pass,
    level: e.performanceLevel,
    period: e.periodNumber,
  }))

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[400px]"
        role="img"
        aria-label="Performance chart showing evaluation levels over time"
      >
        {/* Y-axis labels and gridlines */}
        {(['Honors', 'Pass', 'Fail'] as const).map((label) => {
          const y = LEVEL_Y[label.toLowerCase()]
          return (
            <g key={label}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[11px] fill-[rgb(var(--muted-foreground))]"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Midpoint reference line */}
        {midpointPeriod && midpointPeriod > 1 && midpointPeriod < totalPeriods && (
          <>
            <line
              x1={xScale(midpointPeriod)}
              y1={padding.top}
              x2={xScale(midpointPeriod)}
              y2={chartHeight - padding.bottom}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="6 3"
            />
            <text
              x={xScale(midpointPeriod)}
              y={padding.top - 4}
              textAnchor="middle"
              className="text-[10px] fill-[rgb(var(--muted-foreground))]"
            >
              Midpoint
            </text>
          </>
        )}

        {/* X-axis period labels */}
        {Array.from({ length: totalPeriods }, (_, i) => i + 1).map((period) => (
          <text
            key={period}
            x={xScale(period)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-[11px] fill-[rgb(var(--muted-foreground))]"
          >
            {period}
          </text>
        ))}

        {/* X-axis label */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 0}
          textAnchor="middle"
          className="text-[11px] fill-[rgb(var(--muted-foreground))]"
        >
          Period
        </text>

        {/* Connecting line */}
        {points.length > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={2}
          />
        )}

        {/* Data points */}
        {points.map((point) => (
          <circle
            key={point.period}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={LEVEL_COLOR[point.level] ?? LEVEL_COLOR.pass}
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  )
}
