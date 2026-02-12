'use client'

import { ChevronRight } from 'lucide-react'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'

const tabLabels: Record<string, string> = {
  templates: 'Templates',
  evaluation: 'Evaluation',
  attributes: 'Attributes',
  narrative: 'Narrative',
  summary: 'Summary',
  generate: 'Generate',
  export: 'Export',
  settings: 'Settings',
  dashboard: 'Dashboard',
  students: 'Students',
  progress: 'Progress',
  'mid-course': 'Mid-Course Summary',
  'end-course': 'End-Course Summary',
  'admin-clerkships': 'Manage Clerkships',
  'admin-rotations': 'Manage Rotations',
  'admin-enrollments': 'Manage Enrollments',
  'admin-users': 'Manage Users',
}

export function Breadcrumbs() {
  const currentTab = useNavigationStore(state => state.currentTab)
  const mode = useLongitudinalStore(state => state.mode)
  const currentStudent = useLongitudinalStore(state => state.currentStudent)

  const crumbs: { label: string; onClick?: () => void }[] = []

  const isAdmin = currentTab.startsWith('admin-')

  if (isAdmin) {
    crumbs.push({ label: 'Administration' })
  } else if (mode === 'longitudinal') {
    crumbs.push({ label: 'Longitudinal Tracking' })
  } else {
    crumbs.push({ label: 'Single Evaluation' })
  }

  if (
    mode === 'longitudinal' &&
    currentStudent &&
    ['progress', 'mid-course', 'end-course'].includes(currentTab)
  ) {
    crumbs.push({ label: currentStudent.name })
  }

  crumbs.push({ label: tabLabels[currentTab] || currentTab })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {i === crumbs.length - 1 ? (
            <span className="text-[rgb(var(--foreground))] font-medium">{crumb.label}</span>
          ) : (
            <span>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
