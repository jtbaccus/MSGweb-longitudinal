'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, UserPlus } from 'lucide-react'

interface AddStudentModalProps {
  open: boolean
  onClose: () => void
  onStudentAdded: () => void
}

export function AddStudentModal({ open, onClose, onStudentAdded }: AddStudentModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [medicalSchoolId, setMedicalSchoolId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          medicalSchoolId: medicalSchoolId.trim() || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create student')
      }
      setSuccess(true)
      onStudentAdded()
      setTimeout(() => handleClose(), 1000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setEmail('')
    setMedicalSchoolId('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-md mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Student
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name"
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@med.edu"
          />
          <Input
            label="Medical School ID (optional)"
            value={medicalSchoolId}
            onChange={(e) => setMedicalSchoolId(e.target.value)}
            placeholder="MS001"
          />

          {error && (
            <p className="text-sm text-status-critical">{error}</p>
          )}
          {success && (
            <p className="text-sm text-status-success">Student created successfully!</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting || success}
            isLoading={isSubmitting}
          >
            Add Student
          </Button>
        </div>
      </div>
    </div>
  )
}
