'use client'

import { useEffect } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { Users, RotateCw, ClipboardList, CheckCircle, Calendar, ChevronRight } from 'lucide-react'

export function DashboardView() {
  const {
    clerkships,
    rotations,
    students,
    isLoading,
    error,
    loadClerkships,
    loadRotations,
    loadStudents,
  } = useLongitudinalStore()
  const setCurrentTab = useNavigationStore(state => state.setCurrentTab)

  useEffect(() => {
    loadClerkships()
    loadRotations()
    loadStudents()
  }, [loadClerkships, loadRotations, loadStudents])

  if (isLoading && clerkships.length === 0) {
    return (
      <div className="max-w-4xl">
        <ContentHeader title="Dashboard" description="Overview of longitudinal tracking." />
        <div className="flex items-center justify-center py-12">
          <span className="spinner mr-3" />
          <span className="text-[rgb(var(--muted-foreground))]">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <ContentHeader title="Dashboard" description="Overview of longitudinal tracking." />
        <Card>
          <CardContent>
            <p className="text-status-critical">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Compute quick stats
  const now = new Date()
  const activeRotations = rotations.filter(r => {
    const end = new Date(r.endDate)
    return end >= now
  })
  const totalEnrollments = rotations.reduce(
    (sum, r) => sum + (r.enrollments?.length ?? 0), 0
  )
  const completedEnrollments = rotations.reduce(
    (sum, r) => sum + (r.enrollments?.filter(e => e.status === 'COMPLETED').length ?? 0), 0
  )
  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0

  const stats = [
    { label: 'Active Students', value: students.length, icon: Users },
    { label: 'Active Rotations', value: activeRotations.length, icon: RotateCw },
    { label: 'Total Enrollments', value: totalEnrollments, icon: ClipboardList },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle },
  ]

  return (
    <div className="max-w-4xl">
      <ContentHeader
        title="Dashboard"
        description="Overview of longitudinal tracking."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-medical-primary/10">
                    <Icon className="w-5 h-5 text-medical-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Rotations */}
      <h3 className="text-lg font-semibold mb-4">Active Rotations</h3>
      {activeRotations.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--muted-foreground))]" />
              <p className="text-[rgb(var(--muted-foreground))]">No active rotations found.</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Create clerkships and rotations via the API to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeRotations.map((rotation) => {
            const clerkship = rotation.clerkship ?? clerkships.find(c => c.id === rotation.clerkshipId)
            const enrollmentCount = rotation.enrollments?.length ?? 0
            const completedCount = rotation.enrollments?.filter(e => e.status === 'COMPLETED').length ?? 0
            const pct = enrollmentCount > 0 ? Math.round((completedCount / enrollmentCount) * 100) : 0

            return (
              <Card key={rotation.id} className="cursor-pointer hover:border-medical-primary/50 transition-colors">
                <button
                  onClick={() => setCurrentTab('students')}
                  className="w-full text-left"
                >
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">
                            {clerkship?.name ?? 'Unknown Clerkship'}
                          </h4>
                          <Badge size="sm">{rotation.academicYear}</Badge>
                        </div>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {new Date(rotation.startDate).toLocaleDateString()} &ndash;{' '}
                          {new Date(rotation.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>{enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''}</span>
                          <span className="text-[rgb(var(--muted-foreground))]">{pct}% complete</span>
                        </div>
                        {enrollmentCount > 0 && (
                          <div className="mt-2 h-1.5 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-medical-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-[rgb(var(--muted-foreground))] ml-4 flex-shrink-0" />
                    </div>
                  </CardContent>
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
