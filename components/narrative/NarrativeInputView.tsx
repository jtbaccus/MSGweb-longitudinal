'use client'

import { ContentHeader } from '@/components/layout/ContentHeader'
import { TextArea } from '@/components/ui/TextArea'
import { Card } from '@/components/ui/Card'
import { useEvaluationStore } from '@/lib/stores/evaluationStore'
import { Info } from 'lucide-react'

export function NarrativeInputView() {
  const { narrativeText, setNarrativeText } = useEvaluationStore()

  const placeholderText = `Provide additional context about the student's performance that may not be captured by the evaluation criteria alone.

Examples:
- Specific clinical encounters or cases the student handled well
- Notable improvements during the rotation
- Challenging situations and how the student responded
- Interactions with patients, families, or team members
- Any unique circumstances or contributions`

  return (
    <div className="max-w-3xl">
      <ContentHeader
        title="Narrative Context"
        description="Add free-text observations and context to enhance the AI-generated narrative."
      />

      <Card className="mb-6">
        <div className="flex items-start gap-3 p-4 bg-medical-primary/5 rounded-lg border border-medical-primary/20">
          <Info className="w-5 h-5 text-medical-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-medical-primary mb-1">Tips for effective narratives</p>
            <ul className="text-[rgb(var(--muted-foreground))] space-y-1">
              <li>Be specific with examples when possible</li>
              <li>Focus on observable behaviors and outcomes</li>
              <li>Include both positive observations and areas for growth</li>
              <li>Mention any special circumstances or context</li>
            </ul>
          </div>
        </div>
      </Card>

      <TextArea
        value={narrativeText}
        onChange={(e) => setNarrativeText(e.target.value)}
        placeholder={placeholderText}
        rows={12}
        showCharCount
        className="min-h-[300px]"
      />

      <div className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
        <p>
          This narrative context will be combined with your selected evaluation criteria
          and attributes when generating the AI narrative.
        </p>
      </div>
    </div>
  )
}
