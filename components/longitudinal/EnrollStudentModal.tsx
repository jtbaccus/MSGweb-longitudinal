'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, UserCheck, Search } from 'lucide-react'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import type { Student } from '@/lib/types'

interface EnrollStudentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  preselectedStudent?: Student | null
}

export function EnrollStudentModal({ open, onClose, onCreated, preselectedStudent }: EnrollStudentModalProps) {
  const rotations = useLongitudinalStore(state => state.rotations)
  const clerkships = useLongitudinalStore(state => state.clerkships)
  const createEnrollment = useLongitudinalStore(state => state.createEnrollment)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(preselectedStudent ?? null)
  const [rotationId, setRotationId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudent(preselectedStudent)
    }
  }, [preselectedStudent])

  useEffect(() => {
    if (!searchQuery.trim() || selectedStudent) {
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
  }, [searchQuery, selectedStudent])

  // Set default startDate when rotation is selected
  useEffect(() => {
    if (rotationId && !startDate) {
      const rotation = rotations.find(r => r.id === rotationId)
      if (rotation) {
        setStartDate(new Date(rotation.startDate).toISOString().split('T')[0])
      }
    }
  }, [rotationId, startDate, rotations])

  if (!open) return null

  const isValid = selectedStudent && rotationId && startDate

  const handleSubmit = async () => {
    if (!isValid || !selectedStudent) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createEnrollment({
        studentId: selectedStudent.id,
        rotationId,
        startDate,
      })
      onCreated()
      handleClose()
    } catch (err) {
      const message = (err as Error).message
      if (message.includes('409') || message.toLowerCase().includes('already enrolled')) {
        setError('This student is already enrolled in this rotation.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedStudent(preselectedStudent ?? null)
    setRotationId('')
    setStartDate('')
    setError(null)
    onClose()
  }

  const getRotationLabel = (rotation: typeof rotations[number]) => {
    const clerkship = rotation.clerkship ?? clerkships.find(c => c.id === rotation.clerkshipId)
    const start = new Date(rotation.startDate).toLocaleDateString()
    const end = new Date(rotation.endDate).toLocaleDateString()
    return `${clerkship?.name ?? 'Unknown'} - ${rotation.academicYear} (${start} - ${end})`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Enroll Student
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1 space-y-4">
          {/* Student selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-[rgb(var(--card-background))] border border-[rgb(var(--card-border))]">
                <div>
                  <p className="text-sm font-medium">{selectedStudent.name}</p>
                  {selectedStudent.email && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{selectedStudent.email}</p>
                  )}
                </div>
                {!preselectedStudent && (
                  <button
                    onClick={() => { setSelectedStudent(null); setSearchQuery('') }}
                    className="text-xs text-medical-primary hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  />
                </div>
                {isSearching && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-[rgb(var(--card-border))] rounded-lg max-h-32 overflow-auto">
                    {searchResults.map(student => (
                      <button
                        key={student.id}
                        onClick={() => { setSelectedStudent(student); setSearchResults([]) }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[rgb(var(--card-background))] transition-colors"
                      >
                        <p className="font-medium">{student.name}</p>
                        {student.email && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{student.email}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rotation selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Rotation</label>
            <select
              value={rotationId}
              onChange={(e) => setRotationId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Select a rotation...</option>
              {rotations.map(r => (
                <option key={r.id} value={r.id}>{getRotationLabel(r)}</option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {error && (
            <p className="text-sm text-status-critical">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            Enroll Student
          </Button>
        </div>
      </div>
    </div>
  )
}
