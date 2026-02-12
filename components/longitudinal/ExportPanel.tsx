'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, FileText } from 'lucide-react'

interface ExportPanelProps {
  enrollmentId?: string
  rotationId?: string
}

export function ExportPanel({ enrollmentId, rotationId }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExportPDF = async () => {
    if (!enrollmentId) return
    setIsExporting('pdf')
    try {
      const response = await fetch('/api/export-longitudinal-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  const handleCohortExport = async () => {
    if (!rotationId) return
    setIsExporting('cohort')
    try {
      const response = await fetch('/api/export-cohort-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rotationId }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'cohort.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {enrollmentId && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportPDF}
          isLoading={isExporting === 'pdf'}
          disabled={!!isExporting}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          Export Progress PDF
        </Button>
      )}
      {rotationId && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCohortExport}
          isLoading={isExporting === 'cohort'}
          disabled={!!isExporting}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Cohort Report
        </Button>
      )}
    </div>
  )
}
