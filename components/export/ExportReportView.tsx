'use client'

import { useState } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge, PerformanceBadge } from '@/components/ui/Badge'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { validateReportData } from '@/lib/utils/validation'
import { getPerformanceLevelLabel } from '@/lib/utils/performanceLevel'
import { Download, FileText, AlertCircle } from 'lucide-react'

export function ExportReportView() {
  const {
    currentTemplate,
    editedGeneratedNarrative,
    narrativeText,
    getStrengths,
    getAreasForImprovement,
    getSelectedAttributes,
    getPerformanceLevel,
  } = useEvaluationStore()

  const [studentName, setStudentName] = useState('')
  const [evaluatorName, setEvaluatorName] = useState('')
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const [includeStrengths, setIncludeStrengths] = useState(true)
  const [includeAreasForImprovement, setIncludeAreasForImprovement] = useState(true)
  const [includeAttributes, setIncludeAttributes] = useState(true)
  const [includeNarrative, setIncludeNarrative] = useState(true)
  const [includeGeneratedNarrative, setIncludeGeneratedNarrative] = useState(true)

  const strengths = getStrengths()
  const areasForImprovement = getAreasForImprovement()
  const selectedAttributes = getSelectedAttributes()
  const performanceLevel = getPerformanceLevel()

  const validation = validateReportData(studentName, evaluatorName, evaluationDate)

  const handleExport = async () => {
    if (!validation.isValid) return

    setIsExporting(true)
    setExportError(null)

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          evaluatorName,
          evaluationDate,
          clerkshipName: currentTemplate?.name || 'Clinical Evaluation',
          performanceLevel: getPerformanceLevelLabel(performanceLevel),
          strengths: includeStrengths ? strengths : [],
          areasForImprovement: includeAreasForImprovement ? areasForImprovement : [],
          attributes: includeAttributes ? selectedAttributes : [],
          narrativeText: includeNarrative ? narrativeText : '',
          generatedNarrative: includeGeneratedNarrative ? editedGeneratedNarrative : '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const suggestedFileName = `${studentName.replace(/\s+/g, '_')}_${currentTemplate?.name.replace(/\s+/g, '_') || 'Evaluation'}_Report_${evaluationDate}.pdf`

      // Try to use the File System Access API for "Save As" dialog
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as Window & { showSaveFilePicker: (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: suggestedFileName,
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
      a.download = suggestedFileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'An error occurred')
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
        title="Export Report"
        description="Generate a PDF report of the student evaluation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                error={validation.errors.find(e => e.includes('Student'))}
              />
              <Input
                label="Evaluator Name"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="Enter your name"
                error={validation.errors.find(e => e.includes('Evaluator'))}
              />
              <Input
                label="Evaluation Date"
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Include in Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Strengths ({strengths.length})</span>
                <Toggle isOn={includeStrengths} onToggle={() => setIncludeStrengths(!includeStrengths)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Areas for Improvement ({areasForImprovement.length})</span>
                <Toggle isOn={includeAreasForImprovement} onToggle={() => setIncludeAreasForImprovement(!includeAreasForImprovement)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Personal Attributes ({selectedAttributes.length})</span>
                <Toggle isOn={includeAttributes} onToggle={() => setIncludeAttributes(!includeAttributes)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Narrative Context</span>
                <Toggle isOn={includeNarrative} onToggle={() => setIncludeNarrative(!includeNarrative)} disabled={!narrativeText} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Generated Narrative</span>
                <Toggle isOn={includeGeneratedNarrative} onToggle={() => setIncludeGeneratedNarrative(!includeGeneratedNarrative)} disabled={!editedGeneratedNarrative} />
              </div>
            </CardContent>
          </Card>

          {exportError && (
            <Card className="border-status-critical">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-status-critical">
                  <AlertCircle className="w-5 h-5" />
                  <span>{exportError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleExport}
            disabled={!validation.isValid || isExporting}
            isLoading={isExporting}
            size="lg"
            className="w-full"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
          </Button>
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-[rgb(var(--sidebar-background))] space-y-3">
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Student</p>
                <p className="font-medium">{studentName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Evaluator</p>
                <p className="font-medium">{evaluatorName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                <p className="font-medium">{evaluationDate}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Clerkship</p>
                <p className="font-medium">{currentTemplate.name}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Performance Level</p>
                <PerformanceBadge level={performanceLevel} />
              </div>
            </div>

            <div className="text-sm text-[rgb(var(--muted-foreground))]">
              <p className="font-medium mb-2">Sections to include:</p>
              <ul className="space-y-1">
                {includeStrengths && <li>Strengths ({strengths.length} items)</li>}
                {includeAreasForImprovement && <li>Areas for Improvement ({areasForImprovement.length} items)</li>}
                {includeAttributes && <li>Personal Attributes ({selectedAttributes.length} items)</li>}
                {includeNarrative && narrativeText && <li>Narrative Context</li>}
                {includeGeneratedNarrative && editedGeneratedNarrative && <li>AI Generated Narrative</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
