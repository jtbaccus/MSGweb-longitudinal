'use client'

import { clsx } from 'clsx'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-[rgb(var(--muted))]'

  const variantStyles = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
    />
  )
}
