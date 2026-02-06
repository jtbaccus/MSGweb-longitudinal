'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X, Upload, FileText } from 'lucide-react'

interface CSVImportModalProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export function CSVImportModal({ open, onClose, onImportComplete }: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const parsedRows = csvText.trim()
    ? csvText.trim().split('\n').slice(1).filter(line => line.trim())
    : []

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string ?? '')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Import failed')
      }
      const data: ImportResult = await response.json()
      setResult(data)
      onImportComplete()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setCsvText('')
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[rgb(var(--background))] rounded-xl shadow-xl border border-[rgb(var(--card-border))] w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--card-border))]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Students
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1">
          {!result ? (
            <>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                Paste CSV data or upload a file. Expected columns: <code className="text-xs bg-[rgb(var(--muted))] px-1 py-0.5 rounded">name, email, medicalSchoolId</code>
              </p>

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgb(var(--input-border))] cursor-pointer hover:bg-[rgb(var(--card-background))] transition-colors text-sm mb-3">
                <FileText className="w-4 h-4" />
                Upload CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`name,email,medicalSchoolId\nJane Doe,jane@med.edu,MS001\nJohn Smith,john@med.edu,MS002`}
                rows={8}
                className="w-full px-3 py-2 rounded-lg input-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-medical-primary resize-none"
              />

              {parsedRows.length > 0 && (
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  {parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''} detected
                </p>
              )}

              {error && (
                <p className="text-sm text-status-critical mt-2">{error}</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-status-success/10">
                <span className="text-status-success font-semibold text-lg">{result.imported}</span>
                <span className="text-sm">student{result.imported !== 1 ? 's' : ''} imported</span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-status-warning/10">
                  <span className="text-status-warning font-semibold text-lg">{result.skipped}</span>
                  <span className="text-sm">skipped (duplicates)</span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-status-critical/10">
                  <p className="text-sm font-medium text-status-critical mb-1">Errors:</p>
                  <ul className="text-sm text-status-critical space-y-0.5">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[rgb(var(--card-border))]">
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={parsedRows.length === 0}
                isLoading={isImporting}
              >
                Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </div>
      </div>
    </div>
  )
}
