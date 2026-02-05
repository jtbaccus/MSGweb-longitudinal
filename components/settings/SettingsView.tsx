'use client'

import { useTheme } from 'next-themes'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { useSettingsStore, WORD_COUNT_PRESETS } from '@/lib/stores/settingsStore'
import { WordCountPreset } from '@/lib/types'
import { Sun, Moon, Monitor, Trash2, CheckCircle, XCircle, Ruler } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

type ThemeOption = 'light' | 'dark' | 'system'

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const resetAll = useEvaluationStore(state => state.resetAll)
  const wordCountPreset = useSettingsStore(state => state.wordCountPreset)
  const setWordCountPreset = useSettingsStore(state => state.setWordCountPreset)
  const activePreset = WORD_COUNT_PRESETS.find(p => p.preset === wordCountPreset)!
  const [mounted, setMounted] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    setMounted(true)
    // Check API status
    fetch('/api/generate-narrative', { method: 'OPTIONS' })
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))
  }, [])

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetAll()
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="max-w-2xl">
      <ContentHeader
        title="Settings"
        description="Configure application preferences."
      />

      {/* Theme Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
            Choose how the application looks on your device.
          </p>
          <div className="flex gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={clsx(
                    'flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                    isSelected
                      ? 'bg-medical-primary/10 border-medical-primary text-medical-primary'
                      : 'border-[rgb(var(--card-border))] hover:border-[rgb(var(--muted))]'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Narrative Length */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Narrative Length
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
            Choose how long generated narratives should be.
          </p>

          {/* Preset labels */}
          <div className="flex justify-between mb-2 px-1">
            {WORD_COUNT_PRESETS.map((p) => (
              <button
                key={p.preset}
                onClick={() => setWordCountPreset(p.preset)}
                className={clsx(
                  'text-xs font-medium px-2 py-1 rounded transition-colors',
                  p.preset === wordCountPreset
                    ? 'text-medical-primary bg-medical-primary/10'
                    : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={wordCountPreset}
            onChange={(e) => setWordCountPreset(Number(e.target.value) as WordCountPreset)}
            className="w-full accent-medical-primary cursor-pointer"
          />

          {/* Detail card */}
          <div className="mt-4 p-3 rounded-lg bg-[rgb(var(--card-bg))]/50 border border-[rgb(var(--card-border))]">
            <p className="text-sm font-medium">{activePreset.label}</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{activePreset.description}</p>
            <p className="text-xs text-medical-primary mt-1 font-medium">
              {activePreset.range.minWords}–{activePreset.range.maxWords} words
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {apiStatus === 'checking' && (
              <>
                <div className="spinner" />
                <span className="text-sm">Checking API status...</span>
              </>
            )}
            {apiStatus === 'ok' && (
              <>
                <CheckCircle className="w-5 h-5 text-status-success" />
                <span className="text-sm text-status-success">AI service is available</span>
              </>
            )}
            {apiStatus === 'error' && (
              <>
                <XCircle className="w-5 h-5 text-status-critical" />
                <div>
                  <span className="text-sm text-status-critical">AI service unavailable</span>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    Make sure OPENAI_API_KEY is configured in .env.local
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
            Reset all evaluation data and start fresh. This will clear all selected
            criteria, attributes, narratives, and template selection.
          </p>
          <Button variant="danger" onClick={handleReset}>
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
            <p><span className="font-medium">Medical Student Grader</span></p>
            <p>Version 1.0.0</p>
            <p className="pt-2">
              A tool for medical educators to efficiently evaluate student
              performance and generate professional narrative evaluations using AI.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
