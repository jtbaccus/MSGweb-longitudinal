'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, BookOpen } from 'lucide-react'
import { defaultTemplates } from '@/lib/data/templates'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import type { ClerkshipType, EvaluationFrequency } from '@/lib/types'

interface SetupClerkshipModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function SetupClerkshipModal({ open, onClose, onCreated }: SetupClerkshipModalProps) {
  const createClerkship = useLongitudinalStore(state => state.createClerkship)

  const [templateId, setTemplateId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<ClerkshipType>('STANDARD')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [midpointWeek, setMidpointWeek] = useState<string>('')
  const [evaluationFrequency, setEvaluationFrequency] = useState<EvaluationFrequency | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    const template = defaultTemplates.find(t => t.id === id)
    if (template) {
      setName(template.name)
    }
  }

  const isValid = name.trim() && templateId && durationWeeks > 0 &&
    (type !== 'LONGITUDINAL' || evaluationFrequency)

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createClerkship({
        name: name.trim(),
        templateId,
        type,
        durationWeeks,
        midpointWeek: midpointWeek ? parseInt(midpointWeek) : null,
        evaluationFrequency: evaluationFrequency || null,
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
    setTemplateId('')
    setName('')
    setType('STANDARD')
    setDurationWeeks(4)
    setMidpointWeek('')
    setEvaluationFrequency('')
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            New Clerkship
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Select a template...</option>
              {defaultTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Clerkship Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Internal Medicine"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClerkshipType)}
              className="w-full px-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="STANDARD">Standard</option>
              <option value="MULTI_WEEK">Multi-Week</option>
              <option value="LONGITUDINAL">Longitudinal</option>
            </select>
          </div>

          <Input
            label="Duration (weeks)"
            type="number"
            value={durationWeeks.toString()}
            onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 0)}
            min={1}
          />

          <Input
            label="Midpoint Week (optional)"
            type="number"
            value={midpointWeek}
            onChange={(e) => setMidpointWeek(e.target.value)}
            placeholder="e.g. 2"
            min={1}
          />

          {type === 'LONGITUDINAL' && (
            <div>
              <label className="block text-sm font-medium mb-1">Evaluation Frequency</label>
              <select
                value={evaluationFrequency}
                onChange={(e) => setEvaluationFrequency(e.target.value as EvaluationFrequency)}
                className="w-full px-3 py-2 rounded-lg input-bg text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
              >
                <option value="">Select frequency...</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          )}

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
            Create Clerkship
          </Button>
        </div>
      </div>
    </div>
  )
}
