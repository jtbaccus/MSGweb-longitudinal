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
  type LucideIcon,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { NavigationTab } from '@/lib/types'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'

interface NavItem {
  id: NavigationTab
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardList },
  { id: 'attributes', label: 'Attributes', icon: User },
  { id: 'narrative', label: 'Narrative', icon: FileText },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'generate', label: 'Generate', icon: Sparkles },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { currentTab, setCurrentTab } = useNavigationStore()
  const currentTemplate = useEvaluationStore(state => state.currentTemplate)
  const { data: session } = useSession()

  return (
    <aside className="w-56 sidebar-bg border-r border-[rgb(var(--sidebar-border))] flex flex-col h-full">
      <div className="p-4 border-b border-[rgb(var(--sidebar-border))]">
        <h1 className="text-lg font-semibold text-medical-primary">Medical Student</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">Grader</p>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          const isDisabled = item.id !== 'templates' && item.id !== 'settings' && !currentTemplate

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
                  Please select a template first
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[rgb(var(--foreground))]" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {currentTemplate && (
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
