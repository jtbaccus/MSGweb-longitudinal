'use client'

import { useState } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, PerformanceBadge } from '@/components/ui/Badge'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Save,
  ClipboardList,
} from 'lucide-react'
import type { ProgressSummary } from '@/lib/types/longitudinal'

export function EndCourseSummaryView() {
  const currentStudent = useLongitudinalStore((s) => s.currentStudent)
  const currentEnrollment = useLongitudinalStore((s) => s.currentEnrollment)
  const currentClerkship = useLongitudinalStore((s) => s.currentClerkship)
  const evaluations = useLongitudinalStore((s) => s.evaluations)
  const summaries = useLongitudinalStore((s) => s.summaries)
  const generateSummary = useLongitudinalStore((s) => s.generateSummary)
  const updateSummary = useLongitudinalStore((s) => s.updateSummary)
  const setCurrentTab = useNavigationStore((s) => s.setCurrentTab)

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedSummary, setGeneratedSummary] = useState<ProgressSummary | null>(null)
  const [editFields, setEditFields] = useState<{
    strengthsSummary: string
    growthAreasSummary: string
    progressNarrative: string
    recommendations: string
  }>({ strengthsSummary: '', growthAreasSummary: '', progressNarrative: '', recommendations: '' })
  const [hasEdits, setHasEdits] = useState(false)

  const completedEvaluations = evaluations.filter((e) => e.isComplete)
  const existingSummary = summaries.find((s) => s.type === 'END_OF_COURSE')
  const activeSummary = generatedSummary || existingSummary

  const initEditFields = (summary: ProgressSummary) => {
    setEditFields({
      strengthsSummary: summary.strengthsSummary || '',
      growthAreasSummary: summary.growthAreasSummary || '',
      progressNarrative: summary.progressNarrative || '',
      recommendations: summary.recommendations || '',
    })
    setHasEdits(false)
  }

  if (!currentStudent || !currentEnrollment || !currentClerkship) {
    return (
      <div className="max-w-3xl">
        <ContentHeader
          title="End-Course Summary"
          description="Select a student enrollment first."
          action={
            <Button variant="outline" onClick={() => setCurrentTab('progress')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Progress
            </Button>
          }
        />
      </div>
    )
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const summary = await generateSummary(currentEnrollment.id, 'END_OF_COURSE')
      setGeneratedSummary(summary)
      initEditFields(summary)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!activeSummary) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await updateSummary(activeSummary.id, editFields)
      setGeneratedSummary(updated)
      setHasEdits(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (field: keyof typeof editFields, value: string) => {
    setEditFields((prev) => ({ ...prev, [field]: value }))
    setHasEdits(true)
  }

  return (
    <div className="max-w-3xl">
      <ContentHeader
        title="End-Course Summary"
        description={`${currentStudent.name} — ${currentClerkship.name}`}
        action={
          <Button variant="outline" onClick={() => setCurrentTab('progress')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Progress
          </Button>
        }
      />

      {/* Evaluations to Include */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Evaluations Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedEvaluations.length === 0 ? (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No completed evaluations available. Complete at least one evaluation before generating a summary.
            </p>
          ) : (
            <div className="space-y-2">
              {completedEvaluations
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-[rgb(var(--card-border))]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-category-pass" />
                      <span className="text-sm font-medium">Period {evaluation.periodNumber}</span>
                      <PerformanceBadge level={evaluation.performanceLevel} size="sm" />
                    </div>
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      {evaluation.evaluatorName}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!activeSummary && (
        <Card className="mb-6">
          <CardContent>
            <div className="text-center py-6">
              <GraduationCap className="w-8 h-8 mx-auto mb-3 text-medical-primary" />
              <p className="font-medium mb-1">Generate End-Course Summary</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                AI will synthesize all {completedEvaluations.length} evaluation{completedEvaluations.length !== 1 ? 's' : ''} into a comprehensive end-of-course narrative with recommendations.
              </p>
              <Button
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={completedEvaluations.length === 0}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-sm text-category-fail">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Display */}
      {activeSummary && (
        <>
          {/* Summary Header */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-medical-primary" />
                  <div>
                    <p className="font-medium">End-Course Summary</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {activeSummary.authorName} &middot; {new Date(activeSummary.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PerformanceBadge level={activeSummary.overallPerformance} size="sm" />
                  <Badge variant="default" size="sm">
                    {activeSummary.evaluationsIncluded.length} eval{activeSummary.evaluationsIncluded.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Sections */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Strengths Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border border-[rgb(var(--input-border))] bg-[rgb(var(--background))] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-medical-primary"
                value={editFields.strengthsSummary}
                onChange={(e) => handleFieldChange('strengthsSummary', e.target.value)}
                placeholder="Strengths summary will appear here..."
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Growth Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border border-[rgb(var(--input-border))] bg-[rgb(var(--background))] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-medical-primary"
                value={editFields.growthAreasSummary}
                onChange={(e) => handleFieldChange('growthAreasSummary', e.target.value)}
                placeholder="Growth areas summary will appear here..."
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Progress Narrative</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-lg border border-[rgb(var(--input-border))] bg-[rgb(var(--background))] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-medical-primary"
                value={editFields.progressNarrative}
                onChange={(e) => handleFieldChange('progressNarrative', e.target.value)}
                placeholder="Progress narrative will appear here..."
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border border-[rgb(var(--input-border))] bg-[rgb(var(--background))] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-medical-primary"
                value={editFields.recommendations}
                onChange={(e) => handleFieldChange('recommendations', e.target.value)}
                placeholder="Forward-looking recommendations will appear here..."
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasEdits}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Edits
            </Button>
            <Button variant="outline" onClick={handleGenerate} isLoading={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
