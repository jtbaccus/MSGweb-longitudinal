'use client'

import { useState } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { ExportPanel } from '@/components/longitudinal/ExportPanel'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, PerformanceBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PeriodTimeline } from '@/components/longitudinal/PeriodTimeline'
import { PerformanceChart } from '@/components/longitudinal/PerformanceChart'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { useNavigationStore } from '@/lib/stores/navigationStore'
import { defaultTemplates } from '@/lib/data/templates'
import { EvaluationDetailModal } from '@/components/longitudinal/EvaluationDetailModal'
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  ClipboardList,
  FileText,
  Plus,
} from 'lucide-react'

const trendConfig = {
  improving: { label: 'Improving', icon: TrendingUp, variant: 'success' as const },
  stable: { label: 'Stable', icon: Minus, variant: 'default' as const },
  declining: { label: 'Declining', icon: TrendingDown, variant: 'warning' as const },
  insufficient_data: { label: 'Insufficient Data', icon: HelpCircle, variant: 'default' as const },
}

export function StudentProgressView() {
  const progressView = useLongitudinalStore(state => state.getProgressView())
  const periodStatuses = useLongitudinalStore(state => state.getPeriodStatuses())
  const setIsInEvaluationFlow = useLongitudinalStore(state => state.setIsInEvaluationFlow)
  const loadTemplate = useEvaluationStore(state => state.loadTemplate)
  const setLongitudinalContext = useEvaluationStore(state => state.setLongitudinalContext)
  const setCurrentTab = useNavigationStore(state => state.setCurrentTab)

  const [viewingEvaluationId, setViewingEvaluationId] = useState<string | null>(null)

  if (!progressView) {
    return (
      <div className="max-w-4xl">
        <ContentHeader
          title="Student Progress"
          description="Select a student enrollment to view progress."
          action={
            <Button variant="outline" onClick={() => setCurrentTab('students')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          }
        />
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--muted-foreground))]" />
              <p className="text-[rgb(var(--muted-foreground))]">
                No enrollment selected. Go to the Students tab and select an enrollment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { student, enrollment, clerkship, evaluations, summaries, currentPeriod, totalPeriods, progressPercentage, performanceTrend } = progressView
  const trend = trendConfig[performanceTrend]
  const TrendIcon = trend.icon

  const handleNewEvaluation = () => {
    const template = defaultTemplates.find(t => t.id === clerkship.templateId)
    if (!template) return
    loadTemplate(template)
    const maxPeriod = evaluations.reduce((max, e) => Math.max(max, e.periodNumber), 0)
    setLongitudinalContext(enrollment.id, maxPeriod + 1)
    setIsInEvaluationFlow(true)
    setCurrentTab('evaluation')
  }

  return (
    <div className="max-w-4xl">
      <ContentHeader
        title={student.name}
        description={`${clerkship.name} — ${enrollment.status.toLowerCase()}`}
        action={
          <Button variant="outline" onClick={() => setCurrentTab('students')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
        }
      />

      {/* Export */}
      <div className="mb-4">
        <ExportPanel enrollmentId={enrollment.id} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Clerkship</p>
            <p className="font-semibold text-sm truncate">{clerkship.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Dates</p>
            <p className="font-semibold text-sm">
              {new Date(enrollment.startDate).toLocaleDateString()}
              {enrollment.endDate && <> &ndash; {new Date(enrollment.endDate).toLocaleDateString()}</>}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Period</p>
            <p className="font-semibold text-sm">{currentPeriod} / {totalPeriods}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Trend</p>
            <Badge variant={trend.variant} size="sm">
              <TrendIcon className="w-3 h-3 mr-1" />
              {trend.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm text-[rgb(var(--muted-foreground))]">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
            <div
              className="h-full bg-medical-primary rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Period Timeline */}
      {periodStatuses.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Evaluation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodTimeline periodStatuses={periodStatuses} />
          </CardContent>
        </Card>
      )}

      {/* Performance Chart */}
      {evaluations.filter(e => e.isComplete).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart
              evaluations={evaluations}
              totalPeriods={totalPeriods}
              midpointPeriod={clerkship.midpointWeek ? Math.ceil(clerkship.midpointWeek / (clerkship.durationWeeks / totalPeriods)) : undefined}
              frequency={clerkship.evaluationFrequency ?? undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Evaluations List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Evaluations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleNewEvaluation}>
            <Plus className="w-4 h-4 mr-1" />
            New Evaluation
          </Button>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">No evaluations yet.</p>
          ) : (
            <div className="space-y-3">
              {evaluations
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="p-3 rounded-lg border border-[rgb(var(--card-border))] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Period {evaluation.periodNumber}</span>
                        <PerformanceBadge level={evaluation.performanceLevel} size="sm" />
                        {evaluation.isDraft && <Badge variant="warning" size="sm">Draft</Badge>}
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        {evaluation.evaluatorName} &middot;{' '}
                        {new Date(evaluation.evaluationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setViewingEvaluationId(evaluation.id)}>View</Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Summaries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaries.length > 0 ? (
            <div className="space-y-3">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-3 rounded-lg border border-[rgb(var(--card-border))]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {summary.type === 'MID_COURSE' ? 'Mid-Course' : summary.type === 'END_OF_COURSE' ? 'End-Course' : 'Progress'} Summary
                    </span>
                    <PerformanceBadge level={summary.overallPerformance} size="sm" />
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {summary.authorName} &middot; {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">No summaries generated yet.</p>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={evaluations.filter(e => e.isComplete).length === 0}
              onClick={() => setCurrentTab('mid-course')}
            >
              Generate Mid-Course
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={evaluations.filter(e => e.isComplete).length === 0}
              onClick={() => setCurrentTab('end-course')}
            >
              Generate End-Course
            </Button>
          </div>
        </CardContent>
      </Card>

      <EvaluationDetailModal
        evaluationId={viewingEvaluationId}
        open={!!viewingEvaluationId}
        onClose={() => setViewingEvaluationId(null)}
        onEdit={(evalId) => {
          setViewingEvaluationId(null)
          const evalData = evaluations.find(e => e.id === evalId)
          if (!evalData) return
          const template = defaultTemplates.find(t => t.id === evalData.templateId)
          if (!template) return
          loadTemplate(template)
          setLongitudinalContext(enrollment.id, evalData.periodNumber)
          setIsInEvaluationFlow(true)
          setCurrentTab('evaluation')
        }}
      />
    </div>
  )
}
