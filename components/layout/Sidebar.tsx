'use client'

import { clsx } from 'clsx'
import {
  LayoutTemplate,
  ClipboardList,
  User,
  FileText,
  BarChart3,
  Sparkles,
  Download,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  TrendingUp,
  BookOpen,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { LongitudinalNavigationTab } from '@/lib/types'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'

interface NavItem {
  id: LongitudinalNavigationTab
  label: string
  icon: LucideIcon
}

const singleNavItems: NavItem[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardList },
  { id: 'attributes', label: 'Attributes', icon: User },
  { id: 'narrative', label: 'Narrative', icon: FileText },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'generate', label: 'Generate', icon: Sparkles },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const longitudinalNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'mid-course', label: 'Mid-Course', icon: BookOpen },
  { id: 'end-course', label: 'End-Course', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// Tabs that require a student enrollment to be loaded
const enrollmentRequiredTabs = new Set<LongitudinalNavigationTab>([
  'progress', 'mid-course', 'end-course',
])

export function Sidebar() {
  const { currentTab, setCurrentTab } = useNavigationStore()
  const currentTemplate = useEvaluationStore(state => state.currentTemplate)
  const mode = useLongitudinalStore(state => state.mode)
  const currentStudent = useLongitudinalStore(state => state.currentStudent)
  const currentEnrollment = useLongitudinalStore(state => state.currentEnrollment)
  const { data: session } = useSession()

  const isLongitudinal = mode === 'longitudinal'
  const navItems = isLongitudinal ? longitudinalNavItems : singleNavItems

  return (
    <aside className="w-56 sidebar-bg border-r border-[rgb(var(--sidebar-border))] flex flex-col h-full">
      <div className="p-4 border-b border-[rgb(var(--sidebar-border))]">
        <h1 className="text-lg font-semibold text-medical-primary">Medical Student</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          {isLongitudinal ? 'Longitudinal Tracking' : 'Grader'}
        </p>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          // Determine disabled state based on mode
          let isDisabled = false
          let tooltip = ''
          if (isLongitudinal && enrollmentRequiredTabs.has(item.id) && !currentEnrollment) {
            isDisabled = true
            tooltip = 'Select a student enrollment first'
          } else if (!isLongitudinal && item.id !== 'templates' && item.id !== 'settings' && !currentTemplate) {
            isDisabled = true
            tooltip = 'Please select a template first'
          }

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => !isDisabled && setCurrentTab(item.id)}
                disabled={isDisabled}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-medical-primary/10 text-medical-primary'
                    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-background))]',
                  isDisabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
              {isDisabled && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tooltip}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[rgb(var(--foreground))]" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Context footer: template name or student name */}
      {isLongitudinal && currentStudent && (
        <div className="p-4 border-t border-[rgb(var(--sidebar-border))]">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Current Student</p>
          <p className="text-sm font-medium truncate">{currentStudent.name}</p>
        </div>
      )}

      {!isLongitudinal && currentTemplate && (
        <div className="p-4 border-t border-[rgb(var(--sidebar-border))]">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Current Template</p>
          <p className="text-sm font-medium truncate">{currentTemplate.name}</p>
        </div>
      )}

      {session?.user && (
        <div className="p-4 border-t border-[rgb(var(--sidebar-border))]">
          <p className="text-sm font-medium truncate">{session.user.name || session.user.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-2 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-background))] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
