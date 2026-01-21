'use client'

import { useState } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, PerformanceBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { validateEvaluation } from '@/lib/utils/validation'
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Download } from 'lucide-react'

export function EvaluationSummaryView() {
  const {
    items,
    attributes,
    narrativeText,
    currentTemplate,
    getStrengths,
    getAreasForImprovement,
    getSelectedAttributes,
    getPerformanceLevel,
  } = useEvaluationStore()

  const [isExporting, setIsExporting] = useState(false)

  const strengths = getStrengths()
  const areasForImprovement = getAreasForImprovement()
  const selectedAttributes = getSelectedAttributes()
  const performanceLevel = getPerformanceLevel()
  const validation = validateEvaluation(items, attributes, narrativeText)

  const handleExportStudentSummary = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export-student-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strengths: strengths.map(s => ({ name: s.name })),
          areasForImprovement: areasForImprovement.map(a => ({ name: a.name })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()

      // Try to use the File System Access API for "Save As" dialog
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as Window & { showSaveFilePicker: (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: 'student_feedback.pdf',
            types: [{
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          // User cancelled the save dialog, or API not fully supported
          if ((err as Error).name === 'AbortError') {
            return // User cancelled, don't fall back to auto-download
          }
          // Fall through to regular download for other errors
        }
      }

      // Fallback for browsers without File System Access API
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'student_feedback.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg text-[rgb(var(--muted-foreground))]">
            No template selected
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <ContentHeader
        title="Evaluation Summary"
        description="Review your evaluation before generating the narrative."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStudentSummary}
            isLoading={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Student Summary
          </Button>
        }
      />

      {/* Validation Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-status-success" />
            ) : (
              <XCircle className="w-5 h-5 text-status-critical" />
            )}
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation.errors.length > 0 && (
            <div className="space-y-2 mb-4">
              {validation.errors.map((error, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-status-critical">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="space-y-2">
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-status-warning">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
          {validation.isValid && validation.warnings.length === 0 && (
            <p className="text-sm text-status-success">
              All validation checks passed. Ready to generate narrative.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Overall Performance</p>
            <PerformanceBadge level={performanceLevel} size="md" />
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Template</p>
            <p className="font-semibold">{currentTemplate.name}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Selected Criteria</p>
            <p className="font-semibold">{strengths.length + areasForImprovement.length}</p>
          </div>
        </Card>
      </div>

      {/* Strengths */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-category-pass">
            <TrendingUp className="w-5 h-5" />
            Strengths ({strengths.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map(item => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <Badge variant={item.category} size="sm">{item.category}</Badge>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No strengths selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-category-fail">
            <TrendingDown className="w-5 h-5" />
            Areas for Improvement ({areasForImprovement.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {areasForImprovement.length > 0 ? (
            <ul className="space-y-2">
              {areasForImprovement.map(item => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <Badge variant={item.category} size="sm">{item.category}</Badge>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No areas for improvement
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal Attributes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Attributes ({selectedAttributes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAttributes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedAttributes.map(attr => (
                <Badge key={attr.id} variant="default" size="sm">
                  {attr.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No attributes selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Narrative Context */}
      <Card>
        <CardHeader>
          <CardTitle>Narrative Context</CardTitle>
        </CardHeader>
        <CardContent>
          {narrativeText ? (
            <p className="text-sm whitespace-pre-wrap">{narrativeText}</p>
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
              No narrative context provided
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
