'use client'

import { ReactNode } from 'react'

interface ContentHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function ContentHeader({ title, description, action }: ContentHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="mt-1 text-[rgb(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
