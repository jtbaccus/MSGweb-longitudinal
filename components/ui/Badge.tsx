'use client'

import { clsx } from 'clsx'
import { ReactNode } from 'react'
import { PerformanceLevel } from '@/lib/types'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'pass' | 'honors' | 'fail' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]',
    pass: 'pill-pass',
    honors: 'pill-honors',
    fail: 'pill-fail',
    success: 'bg-status-success/15 text-status-success border border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
    error: 'bg-status-critical/15 text-status-critical border border-status-critical/30',
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  )
}

export function PerformanceBadge({ level, size = 'md' }: { level: PerformanceLevel; size?: 'sm' | 'md' }) {
  const labels: Record<PerformanceLevel, string> = {
    fail: 'Fail',
    pass: 'Pass',
    honors: 'Honors',
  }

  return (
    <Badge variant={level} size={size}>
      {labels[level]}
    </Badge>
  )
}
