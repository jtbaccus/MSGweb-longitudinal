'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, RotateCw } from 'lucide-react'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'

interface SetupRotationModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function SetupRotationModal({ open, onClose, onCreated }: SetupRotationModalProps) {
  const clerkships = useLongitudinalStore(state => state.clerkships)
  const createRotation = useLongitudinalStore(state => state.createRotation)

  const [clerkshipId, setClerkshipId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const isValid = clerkshipId && startDate && endDate && academicYear.trim() &&
    new Date(endDate) > new Date(startDate)

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createRotation({
        clerkshipId,
        startDate,
        endDate,
        academicYear: academicYear.trim(),
      })
      onCreated()
      handleClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setClerkshipId('')
    setStartDate('')
    setEndDate('')
    setAcademicYear('')
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-md mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RotateCw className="w-5 h-5" />
            New Rotation
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clerkship</label>
            <select
              value={clerkshipId}
              onChange={(e) => setClerkshipId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Select a clerkship...</option>
              {clerkships.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={startDate && endDate && new Date(endDate) <= new Date(startDate) ? 'End date must be after start date' : undefined}
          />

          <Input
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2025-2026"
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
            Create Rotation
          </Button>
        </div>
      </div>
    </div>
  )
}
