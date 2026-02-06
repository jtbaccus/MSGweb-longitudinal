'use client'

import { useEffect, useState, useCallback } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { CSVImportModal } from '@/components/longitudinal/CSVImportModal'
import { Upload, Search, Users, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import type { Student } from '@/lib/types'

export function StudentListView() {
  const {
    students,
    isLoading,
    error,
    loadStudents,
    loadStudentProgress,
  } = useLongitudinalStore()
  const setCurrentTab = useNavigationStore(state => state.setCurrentTab)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    loadStudents(debouncedSearch || undefined)
  }, [debouncedSearch, loadStudents])

  const handleEnrollmentClick = useCallback(async (enrollmentId: string) => {
    await loadStudentProgress(enrollmentId)
    setCurrentTab('progress')
  }, [loadStudentProgress, setCurrentTab])

  const toggleExpand = (studentId: string) => {
    setExpandedStudentId(prev => prev === studentId ? null : studentId)
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success' as const
      case 'COMPLETED': return 'default' as const
      case 'WITHDRAWN': return 'warning' as const
      default: return 'default' as const
    }
  }

  return (
    <div className="max-w-3xl">
      <ContentHeader
        title="Students"
        description="Browse and manage student enrollments."
        action={
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
        <Input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {isLoading && students.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <span className="spinner mr-3" />
          <span className="text-[rgb(var(--muted-foreground))]">Loading students...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-4">
          <CardContent>
            <p className="text-status-critical">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && students.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--muted-foreground))]" />
              <p className="text-[rgb(var(--muted-foreground))]">
                {debouncedSearch ? 'No students match your search.' : 'No students found.'}
              </p>
              {!debouncedSearch && (
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  Import students via CSV or create them through the API.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student list */}
      <div className="space-y-3">
        {students.map((student: Student) => {
          const isExpanded = expandedStudentId === student.id
          const enrollments = student.enrollments ?? []

          return (
            <Card key={student.id}>
              <CardContent>
                <button
                  onClick={() => toggleExpand(student.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{student.name}</h4>
                        {enrollments.length > 0 && (
                          <Badge size="sm">
                            {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                        {student.email && <span>{student.email}</span>}
                        {student.medicalSchoolId && (
                          <span className="text-xs bg-[rgb(var(--muted))] px-1.5 py-0.5 rounded">
                            {student.medicalSchoolId}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronDown className="w-5 h-5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                      : <ChevronRight className="w-5 h-5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                    }
                  </div>
                </button>

                {/* Expanded enrollments */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[rgb(var(--card-border))] space-y-2">
                    {enrollments.length === 0 ? (
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">No enrollments yet.</p>
                    ) : (
                      enrollments.map((enrollment) => (
                        <button
                          key={enrollment.id}
                          onClick={() => handleEnrollmentClick(enrollment.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-[rgb(var(--card-background))] transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {enrollment.rotation?.clerkship?.name ?? 'Rotation'}
                              </span>
                              <Badge variant={statusVariant(enrollment.status)} size="sm">
                                {enrollment.status.toLowerCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                              {new Date(enrollment.startDate).toLocaleDateString()}
                              {enrollment.endDate && (
                                <> &ndash; {new Date(enrollment.endDate).toLocaleDateString()}</>
                              )}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CSVImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImportComplete={() => loadStudents(debouncedSearch || undefined)}
      />
    </div>
  )
}
