'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Save, Search, ChevronRight, Check, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import type { Student, StudentEnrollment } from '@/lib/types'

interface SaveToRecordModalProps {
  open: boolean
  onClose: () => void
  studentName: string
  evaluatorName: string
}

type Step = 'student' | 'enrollment' | 'confirm'

export function SaveToRecordModal({ open, onClose, studentName, evaluatorName }: SaveToRecordModalProps) {
  const { currentTemplate, setLongitudinalContext, saveToDatabase } = useEvaluationStore()

  const [step, setStep] = useState<Step>('student')
  const [searchQuery, setSearchQuery] = useState(studentName)
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentEnrollment | null>(null)
  const [periodNumber, setPeriodNumber] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New student inline creation
  const [showCreateStudent, setShowCreateStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState(studentName)
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)

  useEffect(() => {
    if (open) {
      setSearchQuery(studentName)
      setStep('student')
      setSelectedStudent(null)
      setSelectedEnrollment(null)
      setPeriodNumber(1)
      setError(null)
      setShowCreateStudent(false)
      setNewStudentName(studentName)
      setNewStudentEmail('')
    }
  }, [open, studentName])

  // Search students
  useEffect(() => {
    if (!searchQuery.trim() || !open) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/students?search=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          setSearchResults(await response.json())
        }
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, open])

  if (!open) return null

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setSearchResults([])
    // Auto-detect next period from enrollments
    const enrollments = student.enrollments ?? []
    if (enrollments.length > 0) {
      // Try to find enrollment matching current template
      const matching = enrollments.find(e =>
        e.rotation?.clerkship?.templateId === currentTemplate?.id
      )
      if (matching) {
        setSelectedEnrollment(matching)
      }
    }
    setStep('enrollment')
  }

  const handleCreateStudent = async () => {
    if (!newStudentName.trim()) return
    setIsCreatingStudent(true)
    setError(null)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          email: newStudentEmail.trim() || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create student')
      }
      const student: Student = await response.json()
      setSelectedStudent(student)
      setShowCreateStudent(false)
      setStep('enrollment')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsCreatingStudent(false)
    }
  }

  const handleSelectEnrollment = (enrollment: StudentEnrollment) => {
    setSelectedEnrollment(enrollment)
    // Calculate next period number
    const existingEvals = enrollment.evaluations ?? []
    const maxPeriod = existingEvals.reduce((max, e) => Math.max(max, e.periodNumber), 0)
    setPeriodNumber(maxPeriod + 1)
    setStep('confirm')
  }

  const handleSave = async (submit: boolean) => {
    if (!selectedEnrollment) return
    setIsSaving(true)
    setError(null)
    try {
      setLongitudinalContext(selectedEnrollment.id, periodNumber)
      await saveToDatabase({ evaluatorName, submit })
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setStep('student')
    setSelectedStudent(null)
    setSelectedEnrollment(null)
    setError(null)
    onClose()
  }

  const stepLabels: Record<Step, string> = {
    student: '1. Select Student',
    enrollment: '2. Select Enrollment',
    confirm: '3. Confirm & Save',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save to Student Record
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-4 pt-3">
          {(['student', 'enrollment', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />}
              <span className={`text-xs font-medium ${step === s ? 'text-medical-primary' : 'text-[rgb(var(--muted-foreground))]'}`}>
                {stepLabels[s]}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1">
          {/* Step 1: Student */}
          {step === 'student' && (
            <div className="space-y-3">
              {!showCreateStudent ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      autoFocus
                    />
                  </div>
                  {isSearching && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Searching...</p>
                  )}
                  {searchResults.length > 0 && (
                    <div className="border border-[rgb(var(--card-border))] rounded-lg max-h-48 overflow-auto">
                      {searchResults.map(student => (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[rgb(var(--card-background))] transition-colors border-b border-[rgb(var(--card-border))] last:border-b-0"
                        >
                          <p className="font-medium">{student.name}</p>
                          {student.email && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">{student.email}</p>
                          )}
                          {(student.enrollments?.length ?? 0) > 0 && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {student.enrollments!.length} enrollment{student.enrollments!.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery && !isSearching && searchResults.length === 0 && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">No students found.</p>
                  )}
                  <button
                    onClick={() => setShowCreateStudent(true)}
                    className="flex items-center gap-2 text-sm text-medical-primary hover:underline"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Student
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Student Name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student name"
                    autoFocus
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="student@med.edu"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateStudent(false)}>
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateStudent}
                      disabled={!newStudentName.trim() || isCreatingStudent}
                      isLoading={isCreatingStudent}
                    >
                      Create & Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enrollment */}
          {step === 'enrollment' && selectedStudent && (
            <div className="space-y-3">
              <div className="p-2 rounded-lg bg-[rgb(var(--card-background))] mb-3">
                <p className="text-sm font-medium">{selectedStudent.name}</p>
                <button onClick={() => setStep('student')} className="text-xs text-medical-primary hover:underline">
                  Change student
                </button>
              </div>

              {(selectedStudent.enrollments?.length ?? 0) > 0 ? (
                <>
                  <p className="text-sm font-medium">Select an enrollment:</p>
                  <div className="space-y-2">
                    {selectedStudent.enrollments!.map(enrollment => {
                      const isMatch = enrollment.rotation?.clerkship?.templateId === currentTemplate?.id
                      return (
                        <button
                          key={enrollment.id}
                          onClick={() => handleSelectEnrollment(enrollment)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isMatch
                              ? 'border-medical-primary bg-medical-primary/5 hover:bg-medical-primary/10'
                              : 'border-[rgb(var(--card-border))] hover:bg-[rgb(var(--card-background))]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {enrollment.rotation?.clerkship?.name ?? 'Unknown Clerkship'}
                            </span>
                            {isMatch && <Badge size="sm" variant="success">Template match</Badge>}
                            <Badge variant={enrollment.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                              {enrollment.status.toLowerCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                            {new Date(enrollment.startDate).toLocaleDateString()}
                            {enrollment.endDate && (
                              <> &ndash; {new Date(enrollment.endDate).toLocaleDateString()}</>
                            )}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  This student has no enrollments. Enroll them in a rotation from the Longitudinal Dashboard first.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedStudent && selectedEnrollment && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[rgb(var(--card-background))] space-y-2">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Student</p>
                  <p className="text-sm font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Clerkship</p>
                  <p className="text-sm font-medium">
                    {selectedEnrollment.rotation?.clerkship?.name ?? 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Rotation Period</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedEnrollment.startDate).toLocaleDateString()}
                    {selectedEnrollment.endDate && (
                      <> &ndash; {new Date(selectedEnrollment.endDate).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>

              <Input
                label="Period Number"
                type="number"
                value={periodNumber.toString()}
                onChange={(e) => setPeriodNumber(parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-status-critical mt-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          {step === 'confirm' ? (
            <>
              <Button variant="outline" onClick={() => setStep('enrollment')}>Back</Button>
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                isLoading={isSaving}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                isLoading={isSaving}
              >
                <Check className="w-4 h-4 mr-1" />
                Save & Submit
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
        </div>
      </div>
    </div>
  )
}
