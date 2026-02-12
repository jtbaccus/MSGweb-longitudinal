'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge, PerformanceBadge } from '@/components/ui/Badge'
import { X, ClipboardList, Edit3 } from 'lucide-react'
import { defaultTemplates, defaultPersonalAttributes } from '@/lib/data/templates'
import type { SavedEvaluation } from '@/lib/types'

interface EvaluationDetailModalProps {
  evaluationId: string | null
  open: boolean
  onClose: () => void
  onEdit?: (evaluationId: string) => void
}

export function EvaluationDetailModal({ evaluationId, open, onClose, onEdit }: EvaluationDetailModalProps) {
  const [evaluation, setEvaluation] = useState<SavedEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !evaluationId) {
      setEvaluation(null)
      return
    }
    setIsLoading(true)
    setError(null)
    fetch(`/api/evaluations/${evaluationId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load evaluation')
        }
        return res.json()
      })
      .then(setEvaluation)
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false))
  }, [open, evaluationId])

  if (!open) return null

  const template = evaluation?.templateId
    ? defaultTemplates.find(t => t.id === evaluation.templateId)
    : null

  const selectedCriteria = template
    ? template.items.filter(item => evaluation?.selectedCriteriaIds?.includes(item.id))
    : []

  const selectedAttributes = evaluation?.selectedAttributeIds
    ? defaultPersonalAttributes.filter(attr => evaluation.selectedAttributeIds.includes(attr.id))
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Evaluation Details
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <span className="spinner mr-3" />
              <span className="text-[rgb(var(--muted-foreground))]">Loading evaluation...</span>
            </div>
          )}

          {error && (
            <p className="text-status-critical">{error}</p>
          )}

          {evaluation && !isLoading && (
            <div className="space-y-6">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-[rgb(var(--card-background))]">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Period</p>
                  <p className="text-sm font-medium">Period {evaluation.periodNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(evaluation.evaluationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Evaluator</p>
                  <p className="text-sm font-medium">{evaluation.evaluatorName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Performance</p>
                  <PerformanceBadge level={evaluation.performanceLevel} size="sm" />
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Status</p>
                  <div className="flex gap-1">
                    {evaluation.isDraft && <Badge variant="warning" size="sm">Draft</Badge>}
                    {evaluation.isComplete && <Badge variant="success" size="sm">Complete</Badge>}
                    {!evaluation.isDraft && !evaluation.isComplete && <Badge size="sm">Submitted</Badge>}
                  </div>
                </div>
                {template && (
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Template</p>
                    <p className="text-sm font-medium">{template.name}</p>
                  </div>
                )}
              </div>

              {/* Selected Criteria */}
              {selectedCriteria.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Selected Criteria ({selectedCriteria.length})</h4>
                  <div className="space-y-1">
                    {selectedCriteria.map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-sm p-1.5 rounded bg-[rgb(var(--card-background))]">
                        <Badge variant={item.category} size="sm">
                          {item.category}
                        </Badge>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Attributes */}
              {selectedAttributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Personal Attributes ({selectedAttributes.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAttributes.map(attr => (
                      <Badge key={attr.id} size="sm">{attr.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Context */}
              {evaluation.narrativeContext && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Narrative Context</h4>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] whitespace-pre-wrap p-3 rounded-lg bg-[rgb(var(--card-background))]">
                    {evaluation.narrativeContext}
                  </p>
                </div>
              )}

              {/* Generated Narrative */}
              {evaluation.generatedNarrative && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Generated Narrative</h4>
                  <p className="text-sm whitespace-pre-wrap p-3 rounded-lg bg-[rgb(var(--card-background))]">
                    {evaluation.generatedNarrative}
                  </p>
                </div>
              )}

              {/* Edited Narrative */}
              {evaluation.editedNarrative && evaluation.editedNarrative !== evaluation.generatedNarrative && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Edited Narrative</h4>
                  <p className="text-sm whitespace-pre-wrap p-3 rounded-lg bg-[rgb(var(--card-background))]">
                    {evaluation.editedNarrative}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          {evaluation?.isDraft && onEdit && (
            <Button variant="outline" onClick={() => onEdit(evaluation.id)}>
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
