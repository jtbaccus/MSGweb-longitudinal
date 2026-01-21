'use client'

import { useState } from 'react'
import { ContentHeader } from '@/components/layout/ContentHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { Badge } from '@/components/ui/Badge'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { validateEvaluation } from '@/lib/utils/validation'
import { getPerformanceLevelLabel } from '@/lib/utils/performanceLevel'
import { Sparkles, Copy, RotateCcw, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react'

export function AIGenerationView() {
  const {
    items,
    attributes,
    narrativeText,
    generatedNarrative,
    editedGeneratedNarrative,
    isGenerating,
    generationError,
    currentTemplate,
    setGeneratedNarrative,
    setEditedGeneratedNarrative,
    setIsGenerating,
    setGenerationError,
    getStrengths,
    getSelectedAttributes,
    getPerformanceLevel,
  } = useEvaluationStore()

  const [copied, setCopied] = useState(false)

  const strengths = getStrengths()
  const selectedAttributes = getSelectedAttributes()
  const performanceLevel = getPerformanceLevel()
  const validation = validateEvaluation(items, attributes, narrativeText)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkshipName: currentTemplate?.name || 'Clinical',
          performanceLevel: getPerformanceLevelLabel(performanceLevel),
          strengths: strengths.map(s => s.name),
          attributes: selectedAttributes.map(a => a.name),
          narrativeContext: narrativeText,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate narrative')
      }

      const data = await response.json()
      setGeneratedNarrative(data.narrative)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedGeneratedNarrative)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setEditedGeneratedNarrative(generatedNarrative)
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
        title="AI Narrative Generation"
        description="Generate a professional narrative evaluation using AI based on your selected criteria."
      />

      {/* Validation Warning */}
      {!validation.isValid && (
        <Card className="mb-6 border-status-warning">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-status-warning">Validation Issues</p>
                <ul className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Generation Input Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[rgb(var(--muted-foreground))]">Template</p>
              <p className="font-medium">{currentTemplate.name}</p>
            </div>
            <div>
              <p className="text-[rgb(var(--muted-foreground))]">Performance</p>
              <Badge variant={performanceLevel}>{getPerformanceLevelLabel(performanceLevel)}</Badge>
            </div>
            <div>
              <p className="text-[rgb(var(--muted-foreground))]">Strengths</p>
              <p className="font-medium">{strengths.length} selected</p>
            </div>
            <div>
              <p className="text-[rgb(var(--muted-foreground))]">Attributes</p>
              <p className="font-medium">{selectedAttributes.length} selected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="mb-6">
        <Button
          onClick={handleGenerate}
          disabled={!validation.isValid || isGenerating}
          isLoading={isGenerating}
          size="lg"
          className="w-full"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating Narrative...' : 'Generate Narrative with AI'}
        </Button>
      </div>

      {/* Error Display */}
      {generationError && (
        <Card className="mb-6 border-status-critical">
          <CardContent className="py-4">
            <p className="text-status-critical">{generationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Generated Output */}
      {editedGeneratedNarrative && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-status-success" />
                Generated Narrative
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TextArea
              value={editedGeneratedNarrative}
              onChange={(e) => setEditedGeneratedNarrative(e.target.value)}
              rows={12}
              showCharCount
              className="min-h-[250px]"
            />
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
              You can edit the generated narrative above before copying.
            </p>
          </CardContent>
        </Card>
      )}

      {/* MedHub Link */}
      <div className="mt-6 text-center">
        <a
          href="https://uab.medhub.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-medical-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Open MedHub to submit evaluation
        </a>
      </div>
    </div>
  )
}
